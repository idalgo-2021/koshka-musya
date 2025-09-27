package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository interface {
	FindUserByUsername(ctx context.Context, username string) (*models.User, error)
	FindUserByID(ctx context.Context, userId uuid.UUID) (*models.User, error)
	RegisterUser(ctx context.Context, user *models.User) error
}

type AuthService struct {
	Repo       UserRepository
	JWTService *JWTService
}

func NewAuthService(cfg *config.Config, repo UserRepository) (*AuthService, error) {

	if cfg.JWTSecretKey == "" {
		return nil, models.ErrSecretKeyJwt
	}

	if cfg.JWTAccessTokenLifetime <= 0 || cfg.JWTRefreshTokenLifetime <= 0 {
		return nil, models.ErrJwtLifetime
	}

	jwtService := NewJWTService(cfg.JWTSecretKey, cfg.JWTAccessTokenLifetime, cfg.JWTRefreshTokenLifetime)

	return &AuthService{
		Repo:       repo,
		JWTService: jwtService,
	}, nil
}

func hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to generate hash from password: %w", err)
	}
	return string(hashedPassword), nil
}

func (s *AuthService) GenerateToken(ctx context.Context, dto GenerateTokenRequest) (*GenerateTokenResponse, error) {
	log := logger.GetLoggerFromCtx(ctx)

	if err := dto.Validate(); err != nil {
		return nil, err
	}

	user, err := s.Repo.FindUserByUsername(ctx, dto.Username)
	if err != nil {
		if errors.Is(err, models.ErrUserNotFound) {
			return nil, models.ErrInvalidCredentials
		}
		return nil, fmt.Errorf("failed to find user by username: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(dto.Password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			log.Info(ctx, "Password mismatch for user", zap.String("username", dto.Username))
		} else {
			log.Error(ctx, "Error comparing password hash", zap.Error(err), zap.String("username", dto.Username))
		}
		return nil, models.ErrInvalidCredentials
	}

	accessToken, refreshToken, err := s.JWTService.GenerateTokens(user)
	if err != nil {
		err = fmt.Errorf("failed to generate JWT tokens for user %s: %w", user.ID.String(), err)
		log.Error(ctx, err.Error())
		return nil, err
	}

	return &GenerateTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil

}

func (s *AuthService) ValidateToken(ctx context.Context, dto ValidateTokenRequest) (*ValidatedUserDTO, error) {

	user, claims, err := s.validateTokenAndGetUser(ctx, dto.AccessToken)
	if err != nil {
		return nil, err
	}

	response := &ValidatedUserDTO{
		UserID:   user.ID.String(),
		Username: user.Username,
		RoleID:   claims.RoleID,
	}

	return response, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, dto RefreshTokenRequest) (*RefreshTokenResponse, error) {
	log := logger.GetLoggerFromCtx(ctx)

	user, _, err := s.validateTokenAndGetUser(ctx, dto.RefreshToken)
	if err != nil {
		return nil, err
	}

	newAccessToken, newRefreshToken, err := s.JWTService.GenerateTokens(user)
	if err != nil {
		err = fmt.Errorf("failed to generate new token pair during refresh for user %s: %w", user.ID.String(), err)
		log.Error(ctx, err.Error())
		return nil, err
	}

	return &RefreshTokenResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) validateTokenAndGetUser(ctx context.Context, token string) (*models.User, *JWTClaims, error) {
	claims, err := s.claimsFromToken(ctx, token)
	if err != nil {
		return nil, nil, err
	}

	user, err := s.getUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get user from token claims: %w", err)
	}

	return user, claims, nil
}

func (s *AuthService) RegisterUser(ctx context.Context, dto RegisterUserRequest) error {
	log := logger.GetLoggerFromCtx(ctx)

	if err := dto.Validate(); err != nil {
		return err
	}

	hashedPassword, err := hashPassword(dto.Password)
	if err != nil {
		log.Error(ctx, "Failed to hash user password", zap.Error(err))
		return fmt.Errorf("failed to hash password during registration: %w", err)
	}

	user := &models.User{
		ID:           uuid.New(),
		Username:     dto.Username,
		Email:        dto.Email,
		PasswordHash: hashedPassword,
		RoleID:       models.GuestRoleID,
	}

	err = s.Repo.RegisterUser(ctx, user)
	if err != nil {
		if errors.Is(err, models.ErrUserExists) || errors.Is(err, models.ErrEmailExists) {
			return err
		}
		return fmt.Errorf("failed to register user in repository: %w", err)
	}

	log.Info(ctx, "User registered successfully",
		zap.String("user_id", user.ID.String()),
		zap.String("username", user.Username),
	)

	return nil
}

func (s *AuthService) getUserByID(ctx context.Context, userIDStr string) (*models.User, error) {
	log := logger.GetLoggerFromCtx(ctx)

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Warn(ctx,
			"Token validation failed: user_id claim is not a valid UUID",
			zap.String("user_id_claim", userIDStr),
		)
		return nil, models.ErrInvalidToken
	}

	user, err := s.Repo.FindUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, models.ErrUserNotFound) {
			return nil, models.ErrInvalidToken
		}
		return nil, fmt.Errorf("repository error while finding user by id: %w", err)
	}

	return user, nil
}
