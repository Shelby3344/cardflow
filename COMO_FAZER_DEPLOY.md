# 🚀 Como Fazer Deploy no EC2

## Método Mais Fácil (Recomendado)

Basta executar no PowerShell:

```powershell
.\deploy-simples.ps1
```

O script vai:
1. ✅ Procurar sua chave SSH automaticamente
2. ✅ Perguntar qual tipo de deploy você quer
3. ✅ Fazer commit e push do código
4. ✅ Executar o deploy no servidor
5. ✅ Mostrar as URLs de acesso

---

## Tipos de Deploy

### 1️⃣ Deploy Completo
- **Quando usar**: Primeira vez ou mudanças grandes
- **O que faz**: Reconstrói tudo do zero
- **Tempo**: ~5-10 minutos

### 2️⃣ Deploy Rápido
- **Quando usar**: Pequenas mudanças no código
- **O que faz**: Atualiza e reinicia serviços
- **Tempo**: ~1-2 minutos

### 3️⃣ Atualizar NextAuth
- **Quando usar**: Erro 500 no NextAuth
- **O que faz**: Corrige configurações do NextAuth
- **Tempo**: ~30 segundos

---

## Exemplo de Uso

```powershell
PS C:\Users\zucks\Documents\cardflow> .\deploy-simples.ps1

==========================================
🚀 Deploy CardFlow - Assistente
==========================================

✅ Usando chave SSH: C:\Users\zucks\.ssh\cardflow.pem

Escolha o tipo de deploy:
  [1] Deploy Completo (primeira vez ou mudanças grandes)
  [2] Deploy Rápido (apenas atualizar código)
  [3] Apenas atualizar NextAuth (corrigir erro 500)

Digite sua escolha (1, 2 ou 3): 2

📦 Preparando deploy...
📝 Verificando mudanças no Git...
   ✅ Código enviado para o repositório

📤 Enviando scripts para o servidor...

🚀 Executando deploy no servidor...
==========================================

[... saída do deploy ...]

==========================================
✅ Deploy concluído com sucesso!
==========================================

🌐 URLs de acesso:
   Frontend:  http://18.217.114.196:3000
   Backend:   http://18.217.114.196/api
   API Docs:  http://18.217.114.196/api/documentation

Deseja abrir o navegador? (S/n): S
```

---

## Se Não Encontrar a Chave SSH

O script vai pedir:

```
🔑 Chave SSH não encontrada automaticamente.

Digite o caminho completo da sua chave .pem: C:\caminho\para\sua-chave.pem
```

---

## Outros Métodos

### Método 2: Script com parâmetros
```powershell
.\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem"
.\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem" -Quick
```

### Método 3: Direto no servidor
```bash
# 1. Conectar
ssh -i "sua-chave.pem" ubuntu@18.217.114.196

# 2. Executar deploy
cd /home/ubuntu/cardflow
./deploy-ec2.sh      # Deploy completo
# ou
./quick-deploy.sh    # Deploy rápido
```

---

## Solução de Problemas

### Erro: "Permission denied (publickey)"
- Verifique se a chave SSH está correta
- Verifique se tem permissões: `icacls "sua-chave.pem" /inheritance:r /grant:r "$env:USERNAME:R"`

### Erro: "Connection timeout"
- Verifique se o Security Group permite SSH (porta 22)
- Verifique se o servidor está ligado

### Erro: "docker-compose: command not found"
- Execute primeiro o script de instalação:
  ```bash
  ssh -i "sua-chave.pem" ubuntu@18.217.114.196
  cd /home/ubuntu/cardflow
  ./setup-ec2.sh
  ```

---

## Próximos Passos Após Deploy

1. ✅ Abrir: http://18.217.114.196:3000
2. ✅ Criar conta de teste
3. ✅ Testar funcionalidades
4. ✅ Verificar logs se necessário

---

## Comandos Úteis

```powershell
# Ver logs do servidor
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "cd /home/ubuntu/cardflow && docker-compose logs -f"

# Conectar no servidor
ssh -i "sua-chave.pem" ubuntu@18.217.114.196

# Ver status dos containers
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "docker-compose -f /home/ubuntu/cardflow/docker-compose.yml ps"
```

---

## Documentação Completa

- 📖 [GUIA_DEPLOY.md](GUIA_DEPLOY.md) - Guia completo de deploy
- ⚡ [COMANDOS_DEPLOY.md](COMANDOS_DEPLOY.md) - Referência rápida de comandos
- 🔧 [SOLUCAO_ERROS.md](SOLUCAO_ERROS.md) - Soluções para problemas comuns

---

**Pronto! Agora é só executar `.\deploy-simples.ps1` e começar a usar! 🎉**
