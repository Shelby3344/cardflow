#!/bin/bash

# ========================================
# Script de Diagnóstico - CardFlow
# ========================================

echo "=========================================="
echo "🔍 Diagnóstico do Sistema"
echo "=========================================="
echo ""

cd /home/ubuntu/cardflow 2>/dev/null || cd ~/cardflow

# 1. Status dos containers
echo "📊 Status dos Containers:"
echo "----------------------------------------"
docker-compose ps
echo ""

# 2. Verificar container Redis especificamente
echo "🔴 Logs do Redis (últimas 50 linhas):"
echo "----------------------------------------"
docker-compose logs --tail=50 redis
echo ""

# 3. Verificar portas em uso
echo "🔌 Portas em Uso:"
echo "----------------------------------------"
sudo ss -tulpn | grep -E ':(80|3000|5432|6379|3001)\s'
echo ""

# 4. Verificar espaço em disco
echo "💾 Espaço em Disco:"
echo "----------------------------------------"
df -h
echo ""

# 5. Verificar memória
echo "🧠 Memória:"
echo "----------------------------------------"
free -h
echo ""

# 6. Verificar volumes Docker
echo "📦 Volumes Docker:"
echo "----------------------------------------"
docker volume ls | grep cardflow
echo ""

# 7. Verificar rede Docker
echo "🌐 Rede Docker:"
echo "----------------------------------------"
docker network ls | grep cardflow
echo ""

# 8. Tentar reiniciar Redis
echo "🔄 Tentando reiniciar Redis..."
echo "----------------------------------------"
docker-compose restart redis
sleep 5
echo ""

# 9. Verificar novamente
echo "✅ Status Após Reinicialização:"
echo "----------------------------------------"
docker-compose ps
echo ""

# 10. Testar conectividade
echo "🧪 Testando Serviços:"
echo "----------------------------------------"
echo -n "Backend: "
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "Falhou"
echo ""
echo -n "Frontend: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Falhou"
echo ""
echo -n "Voice IA: "
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "Falhou"
echo ""

echo ""
echo "=========================================="
echo "📋 Resumo"
echo "=========================================="
RUNNING=$(docker-compose ps | grep -c "Up")
TOTAL=7
echo "Containers rodando: $RUNNING de $TOTAL"
echo ""

if [ $RUNNING -eq $TOTAL ]; then
    echo "✅ Todos os containers estão rodando!"
    echo ""
    echo "🌐 URLs de acesso:"
    echo "   Frontend: http://$(curl -s ifconfig.me):3000"
    echo "   Backend:  http://$(curl -s ifconfig.me)/api"
    echo ""
else
    echo "⚠️  Alguns containers não estão rodando."
    echo ""
    echo "💡 Próximos passos:"
    echo "   1. Verifique os logs acima"
    echo "   2. Execute: docker-compose down"
    echo "   3. Execute: docker-compose up -d"
    echo ""
fi
