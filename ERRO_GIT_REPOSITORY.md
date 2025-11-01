# 🔧 SOLUÇÃO RÁPIDA - Erro "not a git repository"

## ❌ Erro que você está vendo:

```bash
ubuntu@ip-172-31-42-107:~$ ./deploy-ec2.sh
fatal: not a git repository (or any of the parent directories): .git
```

## ✅ Solução Imediata:

### Opção 1: Clonar o repositório primeiro

```bash
# 1. Voltar para home
cd ~

# 2. Clonar o repositório
git clone https://github.com/Shelby3344/cardflow.git

# 3. Entrar no diretório
cd cardflow

# 4. Dar permissão e executar
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

---

### Opção 2: Usar script de instalação inicial

**Do Windows, copie o novo script:**
```powershell
scp -i "sua-chave.pem" install-inicial.sh ubuntu@18.217.114.196:~/
```

**No servidor, execute:**
```bash
chmod +x install-inicial.sh
./install-inicial.sh
```

O script vai:
- ✅ Instalar Docker e Docker Compose
- ✅ Clonar o repositório
- ✅ Configurar permissões
- ✅ Preparar tudo para o deploy

Depois execute:
```bash
cd cardflow
./deploy-ec2.sh
```

---

### Opção 3: Instalação completa em um comando

**Do Windows:**
```powershell
# 1. Enviar script de instalação
scp -i "sua-chave.pem" install-inicial.sh ubuntu@18.217.114.196:~/

# 2. Executar remotamente
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 "chmod +x install-inicial.sh && ./install-inicial.sh"
```

---

## 🎯 Passo a Passo Completo

### 1️⃣ Primeira Instalação (servidor novo)

```bash
# No servidor EC2
cd ~
curl -O https://raw.githubusercontent.com/Shelby3344/cardflow/main/install-inicial.sh
chmod +x install-inicial.sh
./install-inicial.sh
```

### 2️⃣ Fazer Deploy

```bash
cd /home/ubuntu/cardflow
./deploy-ec2.sh
```

### 3️⃣ Testar

Abrir: http://18.217.114.196:3000

---

## 📋 Checklist Rápido

- [ ] Docker instalado? → `docker --version`
- [ ] Docker Compose instalado? → `docker-compose --version`
- [ ] Repositório clonado? → `ls -la /home/ubuntu/cardflow`
- [ ] Está no diretório certo? → `pwd` (deve mostrar `/home/ubuntu/cardflow`)
- [ ] Script tem permissão? → `ls -la deploy-ec2.sh` (deve ter `x`)

---

## 🚀 Comando Único (Recomendado)

Se quiser fazer tudo de uma vez, do Windows:

```powershell
# Cria e executa instalação completa
ssh -i "sua-chave.pem" ubuntu@18.217.114.196 @"
cd ~
git clone https://github.com/Shelby3344/cardflow.git 2>/dev/null || (cd cardflow && git pull)
cd cardflow
chmod +x *.sh
./deploy-ec2.sh
"@
```

---

## 💡 Explicação do Erro

O erro acontece porque:
1. ❌ Você executou `./deploy-ec2.sh` no diretório `~` (home)
2. ❌ O script tenta fazer `git pull` mas não está em um repositório Git
3. ❌ O repositório não foi clonado ainda

**Solução**: Clonar o repositório primeiro, depois executar o script dentro dele.

---

## ⚠️ Se o Docker der erro de permissão

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
exit

# Conectar novamente
ssh -i "sua-chave.pem" ubuntu@18.217.114.196
```

---

**Execute a Opção 1 acima e seu problema estará resolvido! 🎉**
