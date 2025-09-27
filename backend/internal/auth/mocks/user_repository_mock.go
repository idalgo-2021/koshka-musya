package mocks

import (
	"context"

	"github.com/google/uuid"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/models"
	"github.com/stretchr/testify/mock"
)

// UserRepository is a mock for the UserRepository interface
type UserRepository struct {
	mock.Mock
}

func (m *UserRepository) FindUserByUsername(ctx context.Context, username string) (*models.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *UserRepository) FindUserByID(ctx context.Context, userId uuid.UUID) (*models.User, error) {
	args := m.Called(ctx, userId)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *UserRepository) RegisterUser(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}
