# Makefile para CardFlow

.PHONY: help setup up down restart logs shell-backend shell-voice migrate fresh seed test clean

help: ## Mostrar ajuda
	@echo "CardFlow - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Configurar projeto pela primeira vez
	@echo "🚀 Configurando CardFlow..."
	@cp backend/.env.example backend/.env || true
	@cp voice-ia-service/.env.example voice-ia-service/.env || true
	@cd backend && php artisan key:generate
	@docker-compose up -d
	@sleep 10
	@docker-compose exec backend php artisan migrate --force
	@echo "✅ Setup concluído!"

up: ## Iniciar todos os containers
	docker-compose up -d

down: ## Parar todos os containers
	docker-compose down

restart: ## Reiniciar todos os containers
	docker-compose restart

logs: ## Ver logs de todos os serviços
	docker-compose logs -f

logs-backend: ## Ver logs do backend
	docker-compose logs -f backend

logs-voice: ## Ver logs do microserviço de voz
	docker-compose logs -f voice-ia

shell-backend: ## Acessar shell do backend
	docker-compose exec backend bash

shell-voice: ## Acessar shell do microserviço de voz
	docker-compose exec voice-ia sh

migrate: ## Executar migrations
	docker-compose exec backend php artisan migrate

fresh: ## Resetar banco de dados e recriar
	docker-compose exec backend php artisan migrate:fresh --seed

seed: ## Popular banco com dados de teste
	docker-compose exec backend php artisan db:seed

test: ## Executar testes
	docker-compose exec backend php artisan test

clean: ## Limpar containers, volumes e cache
	docker-compose down -v
	rm -rf backend/vendor backend/storage/framework/cache/*
	rm -rf voice-ia-service/node_modules

cache-clear: ## Limpar cache do Laravel
	docker-compose exec backend php artisan cache:clear
	docker-compose exec backend php artisan config:clear
	docker-compose exec backend php artisan route:clear

swagger: ## Gerar documentação Swagger
	docker-compose exec backend php artisan l5-swagger:generate
