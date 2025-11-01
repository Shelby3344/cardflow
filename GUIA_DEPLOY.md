# 🚀 Guia de Deploy - CardFlow EC2

## 📋 Scripts Disponíveis

### 1. **deploy.ps1** (Windows - RECOMENDADO)
Script PowerShell que automatiza todo o processo de deploy.

```powershell
# Deploy completo (primeira vez ou mudanças grandes)
.\deploy.ps1 -KeyPath "C:\caminho\para\sua-chave.pem"

# Deploy rápido (apenas atualizar código)
.\deploy.ps1 -KeyPath "C:\caminho\para\sua-chave.pem" -Quick
```

**O que faz:**
- ✅ Faz commit e push do código
- ✅ Copia arquivos necessários para o servidor
- ✅ Executa o deploy automaticamente
- ✅ Mostra URLs de acesso

---

### 2. **deploy-ec2.sh** (Servidor)
Script completo de deploy no servidor EC2.

```bash
# No servidor EC2
cd /home/ubuntu/cardflow
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

**O que faz:**
- ✅ Atualiza código do repositório
- ✅ Configura todos os arquivos .env
- ✅ Cria diretórios necessários
- ✅ Para containers antigos
- ✅ Reconstrói e inicia containers
- ✅ Executa migrations
- ✅ Limpa cache
- ✅ Testa conectividade

---

### 3. **quick-deploy.sh** (Servidor)
Deploy rápido sem reconstruir tudo.

```bash
# No servidor EC2
cd /home/ubuntu/cardflow
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**O que faz:**
- ✅ Atualiza código
- ✅ Reinicia containers
- ✅ Limpa cache Laravel

---

## 🎯 Quando Usar Cada Script

### Use `deploy.ps1` (Windows):
- ✅ **Sempre que possível** - É o mais fácil!
- ✅ Quando fizer alterações no código
- ✅ Para deploy completo ou rápido

### Use `deploy-ec2.sh` (Servidor):
- ✅ **Primeira instalação** no servidor
- ✅ Quando mudar configurações de ambiente
- ✅ Quando adicionar novos serviços
- ✅ Quando tiver problemas com containers

### Use `quick-deploy.sh` (Servidor):
- ✅ Apenas atualizar código rapidamente
- ✅ Quando não mudou configurações
- ✅ Para pequenas correções

---

## 📝 Passo a Passo Completo

### Primeira Vez (Deploy Inicial):

1. **No Windows:**
   ```powershell
   cd C:\Users\zucks\Documents\cardflow
   .\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem"
   ```

2. **Aguardar conclusão** (5-10 minutos)

3. **Testar:**
   - Abrir: http://18.217.114.196:3000
   - Criar conta de teste

---

### Atualizações Futuras:

**Opção 1: Deploy Automático (Recomendado)**
```powershell
# Do Windows
.\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem" -Quick
```

**Opção 2: Deploy Manual**
```bash
# 1. Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@18.217.114.196

# 2. Executar deploy
cd /home/ubuntu/cardflow
./quick-deploy.sh
```

---

## 🔧 Comandos Úteis no Servidor

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Reiniciar um serviço específico
docker-compose restart backend
docker-compose restart frontend

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Limpar cache Laravel
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear

# Executar migrations
docker-compose exec backend php artisan migrate

# Acessar container backend
docker-compose exec backend bash

# Ver uso de recursos
docker stats
```

---

## 🐛 Solução de Problemas

### Erro: "No space left on device"
```bash
# Limpar containers antigos
docker system prune -a --volumes

# Verificar espaço
df -h
```

### Erro: "Port already in use"
```bash
# Ver o que está usando a porta
sudo lsof -i :80
sudo lsof -i :3000

# Parar tudo e reiniciar
docker-compose down
docker-compose up -d
```

### Frontend não carrega
```bash
# Recriar container frontend
docker-compose up -d --build --force-recreate frontend
docker-compose logs -f frontend
```

### Backend dá erro 500
```bash
# Ver logs
docker-compose logs backend

# Limpar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear

# Verificar .env
docker-compose exec backend cat .env
```

### Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do banco
docker-compose logs postgres

# Resetar banco (CUIDADO: apaga tudo)
docker-compose down -v
docker-compose up -d
```

---

## 📊 Monitoramento

### Ver status de todos os serviços:
```bash
docker-compose ps
```

### Ver logs de erro:
```bash
# Backend
docker-compose logs backend | grep -i error

# Frontend
docker-compose logs frontend | grep -i error

# Nginx
docker-compose logs nginx | grep -i error
```

### Ver uso de recursos:
```bash
# Memória e CPU
docker stats

# Espaço em disco
df -h

# Logs do sistema
sudo journalctl -u docker -f
```

---

## 🔐 Segurança

### Trocar senhas (Recomendado):
1. Editar `backend/.env`: trocar `DB_PASSWORD`
2. Editar `.env`: trocar `DB_PASSWORD`
3. Gerar novo `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
4. Fazer deploy completo:
   ```bash
   docker-compose down -v
   ./deploy-ec2.sh
   ```

---

## 📚 Referências

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Laravel Deployment](https://laravel.com/docs/11.x/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## 💡 Dicas

1. **Sempre faça backup** antes de deploy em produção
2. **Teste localmente** com `docker-compose up` antes de fazer deploy
3. **Use deploy rápido** para pequenas mudanças
4. **Use deploy completo** quando mudar dependências ou configurações
5. **Monitore os logs** após cada deploy
6. **Configure SSL/HTTPS** para produção real
7. **Use variáveis de ambiente** para dados sensíveis
8. **Mantenha o Git atualizado** com suas mudanças

---

## ✅ Checklist de Deploy

- [ ] Código commitado e pushed
- [ ] Arquivo .env configurado corretamente
- [ ] Chave SSH disponível
- [ ] Servidor EC2 acessível
- [ ] Docker e Docker Compose instalados no servidor
- [ ] Portas 80, 3000 abertas no Security Group
- [ ] Executar script de deploy
- [ ] Verificar logs
- [ ] Testar todas as URLs
- [ ] Criar usuário de teste
- [ ] Verificar funcionalidades principais

---

**Pronto! Agora você tem um processo completo de deploy automatizado! 🚀**
