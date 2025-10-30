@echo off
REM Script de setup inicial do CardFlow para Windows

echo 🚀 Iniciando setup do CardFlow...

REM 1. Verificar Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker não encontrado. Instale o Docker primeiro.
    exit /b 1
)

echo ✅ Docker instalado

REM 2. Criar arquivos .env se não existirem
if not exist backend\.env (
    echo 📝 Criando backend\.env...
    copy backend\.env.example backend\.env
)

if not exist voice-ia-service\.env (
    echo 📝 Criando voice-ia-service\.env...
    copy voice-ia-service\.env.example voice-ia-service\.env
)

REM 3. Gerar chave Laravel
echo 🔑 Gerando chave do Laravel...
cd backend
php artisan key:generate --ansi
cd ..

REM 4. Iniciar containers Docker
echo 🐳 Iniciando containers Docker...
docker-compose up -d

REM 5. Aguardar serviços iniciarem
echo ⏳ Aguardando serviços iniciarem...
timeout /t 10 /nobreak

REM 6. Executar migrations
echo 📊 Executando migrations...
docker-compose exec -T backend php artisan migrate --force

REM 7. Limpar cache
echo 🧹 Limpando cache...
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache

REM 8. Criar usuário de teste
echo 👤 Criando usuário de teste...
docker-compose exec -T backend php artisan tinker --execute="\App\Models\User::factory()->create(['email'=>'admin@cardflow.com','password'=>bcrypt('password')])"

echo.
echo ✅ Setup concluído!
echo.
echo 📍 Serviços disponíveis:
echo    - Backend API: http://localhost/api
echo    - Swagger Docs: http://localhost/api/documentation
echo    - Voice IA API: http://localhost/voice-api
echo    - PostgreSQL: localhost:5432
echo    - Redis: localhost:6379
echo.
echo 👤 Usuário de teste:
echo    Email: admin@cardflow.com
echo    Senha: password
echo.
echo 🎉 CardFlow está pronto para uso!
pause
