# Базовый образ
FROM golang:1.24-alpine AS builder

# Устанавливаем рабочую директорию.
WORKDIR /app

# Копируем файлы управления зависимостями
COPY go.mod go.sum ./
RUN go mod download
RUN go mod verify

COPY cmd/ ./cmd/
COPY internal/ ./internal/
COPY pkg/ ./pkg/
COPY migrations/ ./migrations/
COPY api/ ./api/

# Сборка приложения
# -o /app/main - куда положить скомпилированный бинарник.
# CGO_ENABLED=0 - статическая линковка, чтобы не зависеть от системных библиотек.
# -ldflags="-w -s" - уменьшает размер бинарника.
RUN CGO_ENABLED=0 GOOS=linux go build -a -ldflags="-w -s" -o /app/main ./cmd/main/main.go

# Второй stage (минимальный образ)
FROM alpine:latest

WORKDIR /app

# Копируем бинарник из предыдущего stage
COPY --from=builder /app/main .

# Копируем файлы миграций
COPY --from=builder /app/migrations ./migrations

# RUN apk add --no-cache ca-certificates

# Указываем порт
EXPOSE 9000

# Точка входа
ENTRYPOINT ["/app/main"]
