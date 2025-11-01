#!/bin/bash

# ========================================
# Script de Instalação Inicial - CardFlow EC2
# Execute este script primeiro no servidor novo
# ========================================

set -e

echo "=========================================="
echo "📦 Instalação Inicial - CardFlow"
echo "=========================================="
echo ""

# Atualizar sistema
echo "🔄 Atualizando sistema..."
sudo apt-get update -qq

# Instalar dependências básicas
echo "📦 Instalando dependências..."
sudo apt-get install -y -qq git curl wget

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "🐳 Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker instalado!"
else
    echo "✅ Docker já instalado"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado!"
else
    echo "✅ Docker Compose já instalado"
fi

# Verificar se o repositório já foi clonado
if [ -d "/home/ubuntu/cardflow" ]; then
    echo ""
    echo "⚠️  Diretório /home/ubuntu/cardflow já existe!"
    read -p "Deseja remover e clonar novamente? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🗑️  Removendo diretório antigo..."
        rm -rf /home/ubuntu/cardflow
    else
        echo "✅ Mantendo diretório existente"
        cd /home/ubuntu/cardflow
        git pull origin main
        echo ""
        echo "=========================================="
        echo "✅ Instalação concluída!"
        echo "=========================================="
        echo ""
        echo "🚀 Próximo passo: Execute o deploy"
        echo "   cd /home/ubuntu/cardflow"
        echo "   ./deploy-ec2.sh"
        exit 0
    fi
fi

# Clonar repositório
echo ""
echo "📥 Clonando repositório..."
cd /home/ubuntu
git clone https://github.com/Shelby3344/cardflow.git

# Entrar no diretório
cd cardflow

# Dar permissão de execução aos scripts
echo "🔧 Configurando permissões..."
chmod +x *.sh 2>/dev/null || true

echo ""
echo "=========================================="
echo "✅ Instalação concluída!"
echo "=========================================="
echo ""
echo "🚀 Próximo passo: Execute o deploy"
echo "   cd /home/ubuntu/cardflow"
echo "   ./deploy-ec2.sh"
echo ""
echo "💡 Dica: Se o Docker der erro de permissão,"
echo "   faça logout e login novamente:"
echo "   exit"
echo "   ssh -i sua-chave.pem ubuntu@IP"
echo ""
