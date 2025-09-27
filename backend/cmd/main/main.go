package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth"
	authRepo "github.com/ostrovok-hackathon-2025/koshka-musya/internal/auth/repository"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/storage/imagekit"
	appLogger "github.com/ostrovok-hackathon-2025/koshka-musya/pkg/logger"

	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/secret_guest"
	sgRepo "github.com/ostrovok-hackathon-2025/koshka-musya/internal/secret_guest/repository"

	"github.com/joho/godotenv"
	_ "github.com/ostrovok-hackathon-2025/koshka-musya/api/swagger"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/config"
	"github.com/ostrovok-hackathon-2025/koshka-musya/internal/gateway"
	"github.com/ostrovok-hackathon-2025/koshka-musya/pkg/db"
	"go.uber.org/zap"
)

const (
	serviceName = "koshka-musya"
)

// @title  Secret Guest API
// @version 1.0
// @description This is the API for the Secret Guest application.
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and a JWT token.
func main() {

	// Base logger
	bootstrapLogger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("failed to initialize zap logger: %v", err)
	}
	defer bootstrapLogger.Sync()

	if err := godotenv.Load(); err != nil {
		bootstrapLogger.Warn(".env file not found or cannot be read, relying on environment variables")
	}

	cfg, err := config.New()
	if err != nil {
		bootstrapLogger.Fatal("failed to load application configuration", zap.Error(err))
	}
	bootstrapLogger.Info("Configuration loaded")

	// Main context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pgCfg := db.PostgresConfig{
		Host:     cfg.PostgresHost,
		Port:     cfg.PostgresPort,
		User:     cfg.PostgresUser,
		Password: cfg.PostgresPassword,
		DBName:   cfg.PostgresDB,
	}
	pgPool, err := db.NewPostgresPool(ctx, pgCfg)
	if err != nil {
		bootstrapLogger.Fatal("failed to connect to Postgres", zap.Error(err))
	}
	defer pgPool.Close()
	bootstrapLogger.Info("Database connection pool established")

	// STORAGE PROVIDER
	strgCfg := imagekit.StorageConfig{
		PublicKey:   cfg.ImagekitPublicKey,
		PrivateKey:  cfg.ImagekitPrivateKey,
		UrlEndpoint: cfg.ImagekitUrlEndpoint,
		UploadURL:   cfg.ImagekitUploadURL,
	}
	fileStorage, err := imagekit.NewStorageProvider(ctx, strgCfg)
	if err != nil {
		bootstrapLogger.Fatal("failed to create file storage provider", zap.Error(err))
	}
	bootstrapLogger.Info("File storage provider created")

	// AUTH
	userRepository := authRepo.NewUserRepository(pgPool)
	authService, err := auth.NewAuthService(cfg, userRepository)
	if err != nil {
		bootstrapLogger.Fatal("failed to create auth service", zap.Error(err))
	}
	authHandlers := auth.NewAuthHandlers(authService)
	bootstrapLogger.Info("Auth services  services created")

	// SECRET_GUEST
	secretGuestRepository := sgRepo.NewListingRepository(pgPool)
	secretGuestService := secret_guest.NewSecretGuestService(cfg, secretGuestRepository, fileStorage)
	secretGuestHandler := secret_guest.NewSecretGuestHandler(secretGuestService, cfg)
	bootstrapLogger.Info("SecretGuest services created")

	// Customs logger(adding serviceName and requestID in log)
	requestLogger := appLogger.New(bootstrapLogger, serviceName)
	ctx = context.WithValue(ctx, appLogger.LoggerKey, requestLogger)

	// GATEWAY
	gtw, err := gateway.New(ctx, cfg, authHandlers, secretGuestHandler)
	if err != nil {
		bootstrapLogger.Fatal("failed to init gateway", zap.Error(err))
	}

	// APP start
	graceCh := make(chan os.Signal, 1)
	signal.Notify(graceCh, syscall.SIGINT, syscall.SIGTERM)

	runLogger := appLogger.GetLoggerFromCtx(ctx)

	go func() {
		runLogger.Info(ctx, "Starting gateway server...", zap.String("address", cfg.HTTPServerAddress+":"+strconv.Itoa(cfg.HTTPServerPort)))
		if err := gtw.Run(ctx); err != nil {
			runLogger.Error(ctx, "gateway server stopped with error", zap.Error(err))
		}
		cancel()
	}()

	<-graceCh
	runLogger.Info(ctx, "Shutting down gracefully...")

	// Дожидаемся завершения всех фоновых задач, запущенных сервисом
	secretGuestService.Wait()
	runLogger.Info(ctx, "All background tasks finished.")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := gtw.Shutdown(shutdownCtx); err != nil {
		runLogger.Error(ctx, "failed to shutdown gateway gracefully", zap.Error(err))
	} else {
		runLogger.Info(ctx, "Shutdown completed.")
	}
}
