# 🚀 ATUALIZAÇÃO RÁPIDA - CardFlow

## 📦 NO WINDOWS (Sua Máquina)

```powershell
# Executar script de preparação
cd "c:\Users\zucks\OneDrive\Área de Trabalho\fg\cardflow"
.\send-to-vps.ps1 -VpsHost "SEU_IP_OU_DOMINIO" -VpsUser "SEU_USUARIO"

# Exemplo:
.\send-to-vps.ps1 -VpsHost "192.168.1.100" -VpsUser "ubuntu"
```

Isso vai:
- ✅ Criar pacote .zip com código atualizado
- ✅ Mostrar instruções de envio
- ✅ Gerar script para executar na VPS

---

## 🖥️ NA VPS (Servidor)

### Conectar via SSH:
```bash
ssh usuario@seu-servidor.com
```

### Opção A: Script Automático (Recomendado)
```bash
cd /var/www/cardflow
bash ~/update-vps.sh
```

### Opção B: Manual (Passo a Passo)
```bash
# 1. Ir para diretório do projeto
cd /var/www/cardflow

# 2. Backup do banco
docker-compose exec postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Parar tudo
docker-compose down

# 4. Extrair atualização
unzip -o ~/cardflow-update.zip -d /tmp/cardflow-new
rsync -av --exclude='.env' /tmp/cardflow-new/ ./

# 5. Rebuild e iniciar
docker-compose build --no-cache
docker-compose up -d

# 6. Migrations
docker-compose exec backend php artisan migrate --force

# 7. Otimizar
docker-compose exec backend php artisan optimize

# 8. Verificar
docker-compose ps
docker-compose logs -f
```

---

## ✅ Verificação

```bash
# Ver se tudo está rodando
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar API
curl http://localhost:8000/api/health

# Testar Frontend
curl http://localhost:3000
```

---

## 🆘 Se der problema (Rollback)

```bash
# Parar tudo
docker-compose down

# Restaurar backup
cat backup_YYYYMMDD_HHMMSS.sql | docker-compose exec -T postgres psql -U cardflow cardflow

# Iniciar novamente
docker-compose up -d
```

---

## 📝 Checklist Rápido

- [ ] Backup criado ✓
- [ ] Código enviado ✓
- [ ] Containers parados ✓
- [ ] Rebuild feito ✓
- [ ] Migrations executadas ✓
- [ ] Tudo funcionando ✓

---

## 🔗 Links Úteis

- Frontend: http://seu-dominio.com
- Backend API: http://seu-dominio.com/api
- Documentação: http://seu-dominio.com/api/documentation
