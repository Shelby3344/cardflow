# ✅ Checklist de Deploy - CardFlow

## 🎯 Antes do Deploy

- [ ] Código testado localmente
- [ ] Todas as alterações commitadas
- [ ] Variáveis de ambiente conferidas
- [ ] Chave SSH disponível e acessível
- [ ] Servidor EC2 ligado e acessível
- [ ] Security Group com portas abertas (22, 80, 3000)

---

## 🚀 Durante o Deploy

- [ ] Executar `.\deploy-simples.ps1`
- [ ] Escolher tipo de deploy correto
- [ ] Aguardar conclusão (sem erros)
- [ ] Verificar mensagem de sucesso

---

## 🧪 Após o Deploy

### Testes Básicos
- [ ] Frontend carrega: http://18.217.114.196:3000
- [ ] Página de login aparece
- [ ] Tema dark está aplicado
- [ ] Não há erros no console do navegador

### Testes de API
- [ ] Backend responde: http://18.217.114.196/api/health
- [ ] Voice IA responde: http://18.217.114.196/voice-api/health
- [ ] API Docs carrega: http://18.217.114.196/api/documentation

### Testes de Funcionalidade
- [ ] Consegue acessar página de registro
- [ ] Formulário de registro aparece
- [ ] Não há erro 500 do NextAuth
- [ ] Campos do formulário funcionam

### Teste de Registro (Opcional)
- [ ] Criar conta de teste
- [ ] Recebe confirmação de sucesso
- [ ] Consegue fazer login
- [ ] Dashboard carrega após login

---

## 🔍 Verificações de Segurança

- [ ] Variáveis sensíveis não estão no código
- [ ] Senhas fortes configuradas (.env)
- [ ] NEXTAUTH_SECRET está configurado
- [ ] APP_KEY está configurado
- [ ] Banco de dados tem senha forte

---

## 📊 Monitoramento

### Ver Status dos Containers
```bash
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "docker-compose -f /home/ubuntu/cardflow/docker-compose.yml ps"
```

**Resultado esperado:**
```
✅ backend       - Up (healthy)
✅ frontend      - Up (healthy)
✅ nginx         - Up (healthy)
✅ postgres      - Up (healthy)
✅ redis         - Up (healthy)
✅ voice-ia      - Up (healthy)
✅ queue-worker  - Up
```

### Ver Logs
```bash
# Backend
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "docker-compose -f /home/ubuntu/cardflow/docker-compose.yml logs --tail=50 backend"

# Frontend
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "docker-compose -f /home/ubuntu/cardflow/docker-compose.yml logs --tail=50 frontend"
```

**Buscar por:**
- ❌ ERROR
- ❌ FATAL
- ❌ Exception
- ✅ Server started
- ✅ Ready in

---

## 🐛 Se Algo Der Errado

### Erro 500 no NextAuth
- [ ] Executar: `.\deploy-simples.ps1` → Opção 3
- [ ] Verificar se NEXTAUTH_SECRET está configurado
- [ ] Ver logs do frontend

### Frontend não carrega
- [ ] Verificar se container está rodando
- [ ] Ver logs: `docker-compose logs frontend`
- [ ] Reiniciar: `docker-compose restart frontend`
- [ ] Rebuild: `docker-compose up -d --build frontend`

### Backend dá erro
- [ ] Ver logs: `docker-compose logs backend`
- [ ] Verificar .env está correto
- [ ] Limpar cache: `docker-compose exec backend php artisan cache:clear`
- [ ] Verificar conexão com banco

### Banco não conecta
- [ ] Verificar senha no .env e backend/.env
- [ ] Ver status: `docker-compose ps postgres`
- [ ] Ver logs: `docker-compose logs postgres`
- [ ] Resetar (se necessário): `docker-compose down -v && docker-compose up -d`

---

## 📈 Métricas de Sucesso

### Performance
- [ ] Frontend carrega em < 3 segundos
- [ ] API responde em < 500ms
- [ ] Sem memory leaks (usar `docker stats`)

### Disponibilidade
- [ ] Todos os 7 containers rodando
- [ ] Health checks passando
- [ ] Sem restarts frequentes

### Funcionalidade
- [ ] Todas as páginas acessíveis
- [ ] Registro e login funcionando
- [ ] Dashboard carrega corretamente
- [ ] APIs respondendo

---

## 🎉 Deploy Bem-Sucedido!

Se todos os itens acima estiverem ✅, seu deploy foi um sucesso!

### Próximos Passos:
1. **Criar primeiro usuário admin**
2. **Testar todas as funcionalidades**
3. **Configurar SSL/HTTPS** (produção)
4. **Configurar backups automáticos**
5. **Monitorar logs regularmente**
6. **Documentar qualquer customização**

---

## 📝 Notas

**Data do Deploy**: ___/___/_____

**Tipo de Deploy**: [ ] Completo  [ ] Rápido  [ ] NextAuth

**Versão Deployada**: _______________

**Problemas Encontrados**: 
_____________________________________
_____________________________________

**Tempo Total**: _______ minutos

**Testado Por**: _____________________

**Status Final**: [ ] ✅ Sucesso  [ ] ⚠️ Com Ressalvas  [ ] ❌ Falhou

---

## 🔗 Links de Referência

- [COMO_FAZER_DEPLOY.md](COMO_FAZER_DEPLOY.md) - Como fazer deploy
- [GUIA_DEPLOY.md](GUIA_DEPLOY.md) - Guia completo
- [COMANDOS_DEPLOY.md](COMANDOS_DEPLOY.md) - Comandos úteis
- [SOLUCAO_ERROS.md](SOLUCAO_ERROS.md) - Solução de problemas

---

**💡 Dica**: Imprima este checklist ou mantenha aberto durante o deploy!
