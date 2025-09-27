ENV_FILE_PATH := ./backend/.env

COMPOSE_FLAGS = --env-file $(ENV_FILE_PATH)

# =============================================================================
# ОСНОВНЫЕ КОМАНДЫ DOCKER COMPOSE
# =============================================================================

## build: Собрать или пересобрать образы сервисов
build:
	docker compose $(COMPOSE_FLAGS) build

## up: Запустить все сервисы в фоновом режиме
up:
	docker compose $(COMPOSE_FLAGS) up -d

## down: Остановить и удалить все сервисы
down:
	docker compose $(COMPOSE_FLAGS) down

## logs: Показать логи всех сервисов
logs:
	docker compose $(COMPOSE_FLAGS) logs -f

## ps: Показать статус запущенных сервисов
ps:
	docker compose $(COMPOSE_FLAGS) ps

## restart: Перезапустить все сервисы
restart: down up


# =============================================================================
# КОМАНДЫ ДЛЯ ЛОКАЛЬНОЙ ОТЛАДКИ (СЦЕНАРИЙ С IDE)
# =============================================================================

# Используем docker-compose.db.yaml
COMPOSE_DB_FILE = -f docker-compose.db.yaml

## db-up: Запустить ТОЛЬКО базу данных для локальной отладки
db-up:
	docker compose $(COMPOSE_DB_FILE) $(COMPOSE_FLAGS) up -d

## db-down: Остановить контейнер с базой данных для отладки
db-down:
	docker compose $(COMPOSE_DB_FILE) $(COMPOSE_FLAGS) down

## db-logs: Показать логи базы данных для отладки
db-logs:
	docker compose $(COMPOSE_DB_FILE) $(COMPOSE_FLAGS) logs -f


# =============================================================================
# КОМАНДЫ ОЧИСТКИ
# =============================================================================

## prune: Удалить все остановленные контейнеры, неиспользуемые сети и образы
prune:
	docker system prune -af

## clean: Полностью остановить окружение и УДАЛИТЬ ДАННЫЕ БАЗЫ ДАННЫХ
clean:
	docker compose $(COMPOSE_FLAGS) down -v
	sudo rm -rf ./_data/pgdata
	@echo "All containers stopped and database data removed."


# =============================================================================
# СПРАВКА
# =============================================================================

## help: Показать эту справку
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: build up down logs ps restart db-up db-down db-logs prune clean help