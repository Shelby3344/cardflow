FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev || npm install --omit=dev

# Copiar código do projeto
COPY . .

# Expor porta
EXPOSE 3001

# Variáveis de ambiente (sobrescritas no docker-compose)
ENV NODE_ENV=production

# Comando de execução
CMD ["npm", "start"]
