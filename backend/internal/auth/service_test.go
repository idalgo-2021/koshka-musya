package auth_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth/mocks"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// newTestAuthService создает экземпляр сервиса с моками для тестов.
func newTestAuthService(mockRepo *mocks.UserRepository) *auth.AuthService {
	// Используем настоящий JWTService, так как его логика проста и не имеет внешних зависимостей.
	// Секретный ключ и время жизни токенов не важны для большинства тестов логики.
	jwtService := auth.NewJWTService("test-secret-key-for-testing", 60, 120)

	return &auth.AuthService{
		Repo:       mockRepo,
		JWTService: jwtService,
	}
}

func TestNewAuthService(t *testing.T) {
	mockRepo := new(mocks.UserRepository)

	t.Run("successful creation", func(t *testing.T) {
		cfg := &config.Config{
			JWTSecretKey:            "a-valid-secret-key",
			JWTAccessTokenLifetime:  15,
			JWTRefreshTokenLifetime: 30,
		}
		service, err := auth.NewAuthService(cfg, mockRepo)
		assert.NoError(t, err)
		assert.NotNil(t, service)
	})

	t.Run("missing jwt secret key", func(t *testing.T) {
		cfg := &config.Config{
			JWTSecretKey:            "", // Invalid
			JWTAccessTokenLifetime:  15,
			JWTRefreshTokenLifetime: 30,
		}
		service, err := auth.NewAuthService(cfg, mockRepo)
		assert.ErrorIs(t, err, models.ErrSecretKeyJwt)
		assert.Nil(t, service)
	})

	t.Run("invalid jwt lifetime", func(t *testing.T) {
		cfg := &config.Config{
			JWTSecretKey:            "a-valid-secret-key",
			JWTAccessTokenLifetime:  0, // Invalid
			JWTRefreshTokenLifetime: 30,
		}
		service, err := auth.NewAuthService(cfg, mockRepo)
		assert.ErrorIs(t, err, models.ErrJwtLifetime)
		assert.Nil(t, service)
	})
}

func TestAuthService_RegisterUser(t *testing.T) {
	ctx := context.Background()

	t.Run("successful registration", func(t *testing.T) {
		// Arrange (Подготовка)
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RegisterUserRequest{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		}

		// Настраиваем мок: ожидаем вызов RegisterUser с любым пользователем и возвращаем nil (нет ошибки).
		mockRepo.On("RegisterUser", ctx, mock.AnythingOfType("*models.User")).Return(nil)

		// Act (Действие)
		err := service.RegisterUser(ctx, dto)

		// Assert (Проверка)
		assert.NoError(t, err)
		mockRepo.AssertExpectations(t) // Проверяем, что все ожидаемые вызовы мока были выполнены.
	})

	t.Run("registration with existing username", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RegisterUserRequest{
			Username: "existinguser",
			Email:    "test@example.com",
			Password: "password123",
		}

		// Настраиваем мок: имитируем ошибку, что пользователь уже существует.
		mockRepo.On("RegisterUser", ctx, mock.AnythingOfType("*models.User")).Return(models.ErrUserExists)

		// Act
		err := service.RegisterUser(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.ErrorIs(t, err, models.ErrUserExists)
		mockRepo.AssertExpectations(t)
	})

	t.Run("registration with invalid email (validation fail)", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RegisterUserRequest{
			Username: "testuser",
			Email:    "invalid-email",
			Password: "password123",
		}

		// Act
		err := service.RegisterUser(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.ErrorIs(t, err, models.ErrInvalidEmail)
		// Проверяем, что метод репозитория НЕ был вызван, так как валидация провалилась раньше.
		mockRepo.AssertNotCalled(t, "RegisterUser", mock.Anything, mock.Anything)
	})

	t.Run("registration with existing email", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RegisterUserRequest{
			Username: "newuser",
			Email:    "existing@example.com",
			Password: "password123",
		}

		mockRepo.On("RegisterUser", ctx, mock.AnythingOfType("*models.User")).Return(models.ErrEmailExists)

		// Act
		err := service.RegisterUser(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.ErrorIs(t, err, models.ErrEmailExists)
		mockRepo.AssertExpectations(t)
	})

	t.Run("repository error on registration", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RegisterUserRequest{
			Username: "anotheruser",
			Email:    "another@example.com",
			Password: "password123",
		}
		expectedErr := errors.New("unexpected database error")
		mockRepo.On("RegisterUser", ctx, mock.AnythingOfType("*models.User")).Return(expectedErr)

		// Act
		err := service.RegisterUser(ctx, dto)

		// Assert
		assert.Error(t, err)
		// Проверяем, что сервисный слой обернул ошибку репозитория
		assert.ErrorIs(t, err, expectedErr)
		mockRepo.AssertExpectations(t)
	})
}

func TestAuthService_GenerateToken(t *testing.T) {
	ctx := context.Background()
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	testUser := &models.User{
		ID:           uuid.New(),
		Username:     "testuser",
		PasswordHash: string(hashedPassword),
		RoleID:       models.GuestRoleID,
	}

	t.Run("successful token generation", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.GenerateTokenRequest{Username: "testuser", Password: password}

		// Настраиваем мок: при поиске "testuser" возвращаем заранее подготовленного пользователя.
		mockRepo.On("FindUserByUsername", ctx, "testuser").Return(testUser, nil)

		// Act
		resp, err := service.GenerateToken(ctx, dto)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotEmpty(t, resp.AccessToken)
		assert.NotEmpty(t, resp.RefreshToken)
		mockRepo.AssertExpectations(t)
	})

	t.Run("user not found", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.GenerateTokenRequest{Username: "nonexistent", Password: "password123"}

		// Настраиваем мок: имитируем, что пользователь не найден.
		mockRepo.On("FindUserByUsername", ctx, "nonexistent").Return(nil, models.ErrUserNotFound)

		// Act
		resp, err := service.GenerateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.ErrorIs(t, err, models.ErrInvalidCredentials) // Сервис должен вернуть ошибку о неверных данных, а не "не найден".
		mockRepo.AssertExpectations(t)
	})

	t.Run("wrong password", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.GenerateTokenRequest{Username: "testuser", Password: "wrongpassword"}

		// Пользователь найден успешно
		mockRepo.On("FindUserByUsername", ctx, "testuser").Return(testUser, nil)

		// Act
		resp, err := service.GenerateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.ErrorIs(t, err, models.ErrInvalidCredentials)
		mockRepo.AssertExpectations(t)
	})

	t.Run("repository error on find user", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.GenerateTokenRequest{Username: "testuser", Password: "password123"}
		expectedErr := errors.New("db connection failed")

		mockRepo.On("FindUserByUsername", ctx, "testuser").Return(nil, expectedErr)

		// Act
		resp, err := service.GenerateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, resp)
		// Проверяем, что сервисный слой обернул ошибку репозитория
		assert.ErrorIs(t, err, expectedErr)
		mockRepo.AssertExpectations(t)
	})
}

func TestAuthService_ValidateToken(t *testing.T) {
	ctx := context.Background()
	testUser := &models.User{
		ID:       uuid.New(),
		Username: "validuser",
		RoleID:   models.GuestRoleID,
	}

	t.Run("successful token validation", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		accessToken, _, _ := service.JWTService.GenerateTokens(testUser)
		dto := auth.ValidateTokenRequest{AccessToken: accessToken}

		mockRepo.On("FindUserByID", ctx, testUser.ID).Return(testUser, nil)

		// Act
		validatedUser, err := service.ValidateToken(ctx, dto)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, validatedUser)
		assert.Equal(t, testUser.ID.String(), validatedUser.UserID)
		assert.Equal(t, testUser.Username, validatedUser.Username)
		assert.Equal(t, testUser.RoleID, validatedUser.RoleID)
		mockRepo.AssertExpectations(t)
	})

	t.Run("validation with invalid token", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.ValidateTokenRequest{AccessToken: "this.is.an.invalid.token"}

		// Act
		validatedUser, err := service.ValidateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, validatedUser)
		assert.ErrorIs(t, err, models.ErrInvalidToken)
		mockRepo.AssertNotCalled(t, "FindUserByID", mock.Anything, mock.Anything)
	})

	t.Run("validation with valid token but user not found in db", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		accessToken, _, _ := service.JWTService.GenerateTokens(testUser)
		dto := auth.ValidateTokenRequest{AccessToken: accessToken}

		mockRepo.On("FindUserByID", ctx, testUser.ID).Return(nil, models.ErrUserNotFound)

		// Act
		validatedUser, err := service.ValidateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, validatedUser)
		assert.ErrorIs(t, err, models.ErrInvalidToken)
		mockRepo.AssertExpectations(t)
	})

	t.Run("validation with token containing invalid user id format", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		jwtService := auth.NewJWTService("test-secret-key-for-testing", 60, 120)
		service := &auth.AuthService{Repo: mockRepo, JWTService: jwtService}

		// Создаем клеймы с невалидным UUID
		claims := &auth.JWTClaims{
			UserID:   "not-a-valid-uuid",
			Username: "testuser",
			RoleID:   models.GuestRoleID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		badTokenString, _ := token.SignedString([]byte("test-secret-key-for-testing"))
		dto := auth.ValidateTokenRequest{AccessToken: badTokenString}

		// Act
		validatedUser, err := service.ValidateToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, validatedUser)
		assert.ErrorIs(t, err, models.ErrInvalidToken)
		mockRepo.AssertNotCalled(t, "FindUserByID", mock.Anything, mock.Anything)
	})

	t.Run("repository error on find user", func(t *testing.T) {
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		accessToken, _, _ := service.JWTService.GenerateTokens(testUser)
		dto := auth.ValidateTokenRequest{AccessToken: accessToken}
		expectedErr := errors.New("db connection failed")
		mockRepo.On("FindUserByID", ctx, testUser.ID).Return(nil, expectedErr)

		_, err := service.ValidateToken(ctx, dto)

		assert.Error(t, err)
		assert.ErrorIs(t, err, expectedErr)
		mockRepo.AssertExpectations(t)
	})
}

func TestAuthService_RefreshToken(t *testing.T) {
	ctx := context.Background()
	testUser := &models.User{
		ID:       uuid.New(),
		Username: "validuser",
		RoleID:   models.GuestRoleID,
	}

	t.Run("successful token refresh", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		_, refreshToken, _ := service.JWTService.GenerateTokens(testUser)
		dto := auth.RefreshTokenRequest{RefreshToken: refreshToken}

		mockRepo.On("FindUserByID", ctx, testUser.ID).Return(testUser, nil)

		// Act
		resp, err := service.RefreshToken(ctx, dto)

		// Assert
		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.NotEmpty(t, resp.AccessToken)
		assert.NotEmpty(t, resp.RefreshToken)
		mockRepo.AssertExpectations(t)
	})

	t.Run("refresh with invalid token", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		dto := auth.RefreshTokenRequest{RefreshToken: "this.is.an.invalid.token"}

		// Act
		resp, err := service.RefreshToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.ErrorIs(t, err, models.ErrInvalidToken)
		mockRepo.AssertNotCalled(t, "FindUserByID", mock.Anything, mock.Anything)
	})

	t.Run("refresh with valid token but user not found in db", func(t *testing.T) {
		// Arrange
		mockRepo := new(mocks.UserRepository)
		service := newTestAuthService(mockRepo)
		_, refreshToken, _ := service.JWTService.GenerateTokens(testUser)
		dto := auth.RefreshTokenRequest{RefreshToken: refreshToken}

		mockRepo.On("FindUserByID", ctx, testUser.ID).Return(nil, models.ErrUserNotFound)

		// Act
		resp, err := service.RefreshToken(ctx, dto)

		// Assert
		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.ErrorIs(t, err, models.ErrInvalidToken)
		mockRepo.AssertExpectations(t)
	})
}
