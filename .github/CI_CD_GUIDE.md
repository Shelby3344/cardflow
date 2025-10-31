# 🚀 CI/CD - Guia de Configuração

## 📋 Visão Geral

O CardFlow possui pipelines automatizados de CI/CD configurados via GitHub Actions:

- **CI (Integração Contínua)**: Testes, linting, análise de código
- **CodeQL**: Análise de segurança automatizada (SAST)
- **Dependabot**: Atualizações automáticas de dependências
- **Preview Deployments**: Ambientes de preview para PRs (opcional)

## 🔧 Workflows Configurados

### 1. CI - Tests & Code Quality (`.github/workflows/ci.yml`)

Executa automaticamente em:
- Push para `master`, `main`, `develop`
- Pull Requests para estas branches

**Jobs:**

#### Backend Tests
- ✅ PHPStan (Level 6) - Análise estática
- ✅ Laravel Pint - Code style (PSR-12)
- ✅ PHPUnit - Testes unitários e de integração
- 📊 Coverage report para Codecov

**Serviços:**
- PostgreSQL 16 (banco de testes)
- Redis 7 (cache/sessions)

#### Frontend Tests
- ✅ TypeScript compiler check
- ✅ ESLint - Linting
- ✅ Build production bundle
- 🧪 Tests (Jest/Vitest - se configurado)

#### Security Audit
- 🔒 Composer audit (PHP dependencies)
- 🔒 NPM audit (JS dependencies)

#### Docker Build
- 🐳 Build backend image (multi-stage)
- 🐳 Build frontend image (multi-stage)
- 📝 Validate docker-compose.yml

### 2. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

Executa automaticamente em:
- Push para `master`, `main`
- Pull Requests
- Semanalmente (segunda-feira 00:00 UTC)

**Linguagens analisadas:**
- PHP (backend)
- JavaScript/TypeScript (frontend)

**Queries:**
- Security vulnerabilities (SQL injection, XSS, etc.)
- Code quality issues
- Best practices violations

### 3. Dependabot (`.github/dependabot.yml`)

Atualizações automáticas semanais (segunda 09:00):
- Composer dependencies (backend)
- NPM dependencies (frontend + voice-service)
- Docker base images
- GitHub Actions versions

**Configurações:**
- Máx 5 PRs abertos por ecosistema
- Ignora major updates de Laravel, Next.js, React
- Labels automáticos por tipo de dependência

### 4. Preview Deployments (`.github/workflows/preview.yml`)

⚠️ **Requer configuração adicional!**

Cria ambientes de preview para cada PR.

**Provedores suportados:**
- Vercel (frontend)
- Railway (full-stack)
- Fly.io (Docker)
- Netlify (frontend)

## 🚀 Configuração Inicial

### Passo 1: Ativar Workflows

Os workflows são ativados automaticamente ao fazer push para o repositório.

### Passo 2: Configurar Secrets (Opcional)

Para funcionalidades avançadas, adicione secrets no GitHub:

**Settings → Secrets and variables → Actions → New repository secret**

```bash
# Para Codecov (cobertura de código)
CODECOV_TOKEN=your_codecov_token

# Para Preview Deployments (escolha um)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Ou Railway
RAILWAY_TOKEN=your_railway_token
```

### Passo 3: Habilitar GitHub Actions Permissions

**Settings → Actions → General:**

- ✅ Allow all actions and reusable workflows
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### Passo 4: Configurar Branch Protection (Recomendado)

**Settings → Branches → Add rule**

Para branch `master`:

- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass:
  - `Backend - PHPStan, Pint & Tests`
  - `Docker - Build & Validate`
  - `CodeQL / Analyze (php)`
  - `CodeQL / Analyze (javascript-typescript)`
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict who can push to matching branches

## 📊 Badges para README

Adicione badges para mostrar status dos workflows:

```markdown
![CI](https://github.com/seu-usuario/cardflow/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/seu-usuario/cardflow/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/seu-usuario/cardflow/branch/master/graph/badge.svg)](https://codecov.io/gh/seu-usuario/cardflow)
```

## 🧪 Testar Workflows Localmente

### Opção 1: Act (GitHub Actions local runner)

```bash
# Instalar Act
# Windows (Chocolatey)
choco install act-cli

# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Executar workflow CI
act -j backend-tests

# Executar todos os jobs
act push
```

### Opção 2: Validar sintaxe YAML

```bash
# Instalar yamllint
pip install yamllint

# Validar workflows
yamllint .github/workflows/

# Ou usar GitHub CLI
gh workflow view ci.yml
```

## 📝 Convenções de Commit

Para melhor integração com CI/CD, use commits semânticos:

```bash
# Features
feat(auth): add OAuth2 login
feat(deck): implement card import from CSV

# Bug fixes
fix(api): resolve N+1 query in DeckController
fix(ui): correct gradient CSS in dashboard

# Refactoring
refactor(models): add type hints for PHPStan L6
refactor(controllers): extract deck statistics logic

# Documentation
docs(readme): add installation instructions
docs(api): update Swagger annotations

# Tests
test(deck): add unit tests for duplicate method
test(integration): add API endpoint tests

# CI/CD
chore(ci): add PHPStan to GitHub Actions
chore(docker): optimize multi-stage build

# Dependencies
chore(deps): bump laravel/framework to 11.x
chore(deps): update next to 15.0.5
```

## 🔍 Debugging Workflows

### Ver logs no GitHub

1. Vá para **Actions** tab
2. Clique no workflow com falha
3. Clique no job específico
4. Expanda os steps para ver logs

### Problemas Comuns

#### ❌ PHPStan memory limit

```yaml
# Solução: Aumentar memory limit
run: vendor/bin/phpstan analyse --memory-limit=1G
```

#### ❌ Composer dependencies conflict

```yaml
# Solução: Usar --no-dev e limpar cache
run: |
  composer clear-cache
  composer install --prefer-dist --no-dev --no-progress
```

#### ❌ Frontend build timeout

```yaml
# Solução: Aumentar Node memory
env:
  NODE_OPTIONS: "--max_old_space_size=4096"
```

#### ❌ Docker build cache miss

```yaml
# Solução: Configurar cache do buildx
uses: docker/build-push-action@v5
with:
  cache-from: type=gha
  cache-to: type=gha,mode=max
```

## 📈 Melhorias Futuras

- [ ] Adicionar testes E2E (Cypress/Playwright)
- [ ] Deploy automatizado para staging/production
- [ ] Performance benchmarks no CI
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Container scanning (Trivy/Snyk)
- [ ] SBOM generation (Software Bill of Materials)
- [ ] Release automation (semantic-release)

## 🤝 Contribuindo

Ao contribuir, certifique-se de que:

1. ✅ Todos os checks do CI passam
2. ✅ Code coverage não diminui
3. ✅ PHPStan Level 6 passa sem erros
4. ✅ Laravel Pint aplicado (`vendor/bin/pint`)
5. ✅ TypeScript compila sem erros
6. ✅ Commit messages seguem convenção semântica

## 📞 Suporte

- GitHub Issues: [Issues](https://github.com/seu-usuario/cardflow/issues)
- GitHub Discussions: [Discussions](https://github.com/seu-usuario/cardflow/discussions)
- Documentation: [README.md](../README.md)
