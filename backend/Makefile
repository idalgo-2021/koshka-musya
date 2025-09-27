BINARY_NAME=koshka-musya-app
MAIN_FILE=./cmd/main/main.go
SWAGGER_DIR=./api/swagger
SWAG_CMD=swag

.PHONY: all swagger build run clean

all: build

swagger:
	@echo ">> Generating Swagger documentation..."
	$(SWAG_CMD) init -g $(MAIN_FILE) --output $(SWAGGER_DIR)

build: swagger
	@echo ">> Building application..."
	go build -o ./bin/$(BINARY_NAME) $(MAIN_FILE)

run: swagger
	@echo ">> Running application..."
	go run $(MAIN_FILE)

clean:
	@echo ">> Cleaning up..."
	rm -f ./bin/$(BINARY_NAME)
	rm -rf $(SWAGGER_DIR)
