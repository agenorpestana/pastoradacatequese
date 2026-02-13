
#!/bin/bash

# CORES
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== INSTALADOR AUTOMÁTICO - PASTORAL DA CATEQUESE ===${NC}"
echo "Este script irá configurar todo o ambiente em um Ubuntu 24.04."
echo ""

# 1. COLETA DE DADOS
read -p "Digite o domínio (ex: catequese.minhaparoquia.com): " DOMAIN
read -p "Digite o repositório GitHub (ex: https://github.com/usuario/repo.git): " GIT_REPO
read -s -p "Crie uma senha para o Banco de Dados MySQL: " DB_PASS
echo ""
read -p "Digite sua Chave de API do Google Gemini (para IA): " GEMINI_KEY

# 2. ATUALIZAÇÃO DO SISTEMA
echo -e "${GREEN}Atualizando o sistema...${NC}"
apt-get update && apt-get upgrade -y

# 3. INSTALAÇÃO DE DEPENDÊNCIAS
echo -e "${GREEN}Instalando Nginx, MySQL, Git, Certbot...${NC}"
apt-get install -y nginx mysql-server git curl certbot python3-certbot-nginx

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar PM2 (Gerenciador de Processos)
npm install -g pm2

# 4. CONFIGURAÇÃO DO MYSQL
echo -e "${GREEN}Configurando Banco de Dados...${NC}"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS';"
mysql -u root -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS catequese_db;"
mysql -u root -p"$DB_PASS" -e "CREATE USER IF NOT EXISTS 'catequese_user'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -u root -p"$DB_PASS" -e "GRANT ALL PRIVILEGES ON catequese_db.* TO 'catequese_user'@'localhost';"
mysql -u root -p"$DB_PASS" -e "FLUSH PRIVILEGES;"

# 5. CLONAGEM DO PROJETO
echo -e "${GREEN}Baixando a aplicação...${NC}"
mkdir -p /var/www/catequese
cd /var/www/catequese
# Limpar se já existir
rm -rf ./*
git clone $GIT_REPO .

# 6. SETUP DO BACKEND
echo -e "${GREEN}Configurando Backend (API)...${NC}"
cd /var/www/catequese/server
npm install

# Criar .env do Backend
echo "DB_HOST=localhost" > .env
echo "DB_USER=catequese_user" >> .env
echo "DB_PASSWORD=$DB_PASS" >> .env
echo "DB_NAME=catequese_db" >> .env
echo "PORT=3000" >> .env
echo "API_KEY=$GEMINI_KEY" >> .env

# Criar Tabelas
mysql -u root -p"$DB_PASS" catequese_db < schema.sql

# Iniciar Backend com PM2
pm2 delete catequese-api 2>/dev/null
pm2 start index.js --name "catequese-api"
pm2 save
pm2 startup

# 7. SETUP DO FRONTEND
echo -e "${GREEN}Construindo Frontend (React)...${NC}"
cd /var/www/catequese
# Criar .env do Frontend (apontando para a própria API na mesma origem)
echo "VITE_API_URL=https://$DOMAIN/api" > .env
echo "VITE_GOOGLE_API_KEY=$GEMINI_KEY" >> .env 

npm install
npm run build

# Mover build para pasta pública
mkdir -p /var/www/html/catequese
cp -r dist/* /var/www/html/catequese/

# 8. CONFIGURAÇÃO DO NGINX
echo -e "${GREEN}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/catequese <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    root /var/www/html/catequese;
    index index.html;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend Reverse Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/catequese /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default 2>/dev/null
nginx -t
systemctl restart nginx

# 9. SSL COM CERTBOT
echo -e "${GREEN}Configurando SSL (HTTPS)...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect

echo -e "${BLUE}=== INSTALAÇÃO CONCLUÍDA! ===${NC}"
echo "Acesse: https://$DOMAIN"
echo "Usuário Admin Padrão: admin@catequese.com / admin123"
