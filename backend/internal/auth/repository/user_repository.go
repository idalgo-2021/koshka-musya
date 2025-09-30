package repository

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"
	"go.uber.org/zap"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	log := logger.GetLoggerFromCtx(ctx)

	var user models.User

	query := `
		SELECT 
			u.id, 
			u.username,
			u.email,
			u.password_hash,
			u.role_id,
			u.created_at
		FROM users u
		WHERE u.username = $1
	`
	err := r.db.QueryRow(ctx, query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.RoleID,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx,
				"User not found by username",
				zap.String("username", username),
			)
			return nil, models.ErrUserNotFound
		}

		log.Error(ctx,
			"Database query error on FindUserByUsername",
			zap.Error(err),
			zap.String("username", username),
		)
		return nil, models.ErrDataBaseQuery
	}

	return &user, nil
}

func (r *UserRepository) FindUserByID(ctx context.Context, userId uuid.UUID) (*models.User, error) {
	log := logger.GetLoggerFromCtx(ctx)

	var user models.User

	query := `
		SELECT 
			u.id, 
			u.username,
			u.email,
			u.password_hash,
			u.role_id,
			u.created_at
		FROM users u
		WHERE u.id = $1
	`
	err := r.db.QueryRow(ctx, query, userId).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.RoleID,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Info(ctx,
				"User not found by ID",
				zap.String("user_id", userId.String()),
			)
			return nil, models.ErrUserNotFound
		}

		log.Error(ctx,
			"Database query error on FindUserByID",
			zap.Error(err),
			zap.String("user_id", userId.String()),
		)
		return nil, models.ErrDataBaseQuery
	}

	return &user, nil
}

func (r *UserRepository) RegisterUser(ctx context.Context, user *models.User) error {
	log := logger.GetLoggerFromCtx(ctx)

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Error(ctx, "Failed to begin transaction", zap.Error(err))
		return models.ErrDataBaseQuery
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		} else {
			_ = tx.Commit(ctx)
		}
	}()

	userQuery := `
	    INSERT INTO users (id, username, email, password_hash, role_id)
	    VALUES ($1, $2, $3, $4, $5)
	`
	_, err = tx.Exec(ctx, userQuery,
		user.ID,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.RoleID,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			if strings.Contains(pgErr.ConstraintName, "users_username_key") {
				log.Info(ctx, "Attempt to register user with existing username", zap.String("username", user.Username))
				return models.ErrUserExists
			}
			if strings.Contains(pgErr.ConstraintName, "users_email_key") {
				log.Info(ctx, "Attempt to register user with existing email", zap.String("email", user.Email))
				return models.ErrEmailExists
			}
		}
		log.Error(ctx, "DB error on user insert", zap.Error(err), zap.String("user_id", user.ID.String()), zap.String("username", user.Username))
		return models.ErrDataBaseQuery
	}

	profileQuery := `
	    INSERT INTO user_profiles (user_id)
	    VALUES ($1)
	`
	_, err = tx.Exec(ctx, profileQuery, user.ID)
	if err != nil {
		log.Error(ctx, "DB error on profile insert", zap.Error(err), zap.String("user_id", user.ID.String()))
		return models.ErrDataBaseQuery
	}

	return nil
}
