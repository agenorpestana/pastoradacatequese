
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Gerenciador de Instalação Multi-SaaS ===${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor, execute como root (sudo ./deploy_multi.sh)${NC}"
  exit
fi

# ==========================================
# 0. Menu Principal: Ação
# ==========================================
echo -e "${BLUE}O que você deseja fazer?${NC}"
echo "1) Instalar ou Atualizar um Sistema"
echo "2) Desinstalar um Sistema existente"
read ACTION_CHOICE

# ==========================================
# 1. Seleção do Sistema (Comum para ambas as ações)
# ==========================================
echo -e "${YELLOW}Selecione o Sistema:${NC}"
echo "1) Opa Suite Dashboard"
echo "2) Unity Score SaaS"
echo "3) Pastoral da Catequese"
read SYSTEM_CHOICE

case $SYSTEM_CHOICE in
  1)
    SYSTEM_NAME="Opa Suite Dashboard"
    APP_PORT=3000
    PM2_PREFIX="opa-dash-api"
    DEFAULT_DB_NAME="opadashboard"
    DEFAULT_DB_USER="opadash"
    IS_CATEQUESE=0
    ;;
  2)
    SYSTEM_NAME="Unity Score SaaS"
    APP_PORT=3001
    PM2_PREFIX="unity-score-api"
    DEFAULT_DB_NAME="unity_saas"
    DEFAULT_DB_USER="unity_user"
    IS_CATEQUESE=0
    ;;
  3)
    SYSTEM_NAME="Pastoral da Catequese"
    APP_PORT=3002
    PM2_PREFIX="catequese-api"
    DEFAULT_DB_NAME="catequese_db"
    DEFAULT_DB_USER="catequese_user"
    IS_CATEQUESE=1
    ;;
  *)
    echo -e "${RED}Opção inválida.${NC}"
    exit 1
    ;;
esac

# ==========================================
# LÓGICA DE DESINSTALAÇÃO
# ==========================================
if [ "$ACTION_CHOICE" -eq 2 ]; then
    echo -e "${RED}=== MODO DE DESINSTALAÇÃO ===${NC}"
    echo -e "${YELLOW}Digite o domínio do sistema que deseja remover (ex: app.seudominio.com):${NC}"
    read DOMAIN

    if [ -z "$DOMAIN" ]; then
      echo -e "${RED}Domínio é obrigatório para localizar a instalação.${NC}"
      exit 1
    fi

    APP_DIR="/var/www/$DOMAIN"
    
    # Recalcula o nome do PM2 baseado na lógica de instalação
    SAFE_DOMAIN_SUFFIX=$(echo $DOMAIN | tr '.' '-')
    PM2_NAME="${PM2_PREFIX}-${SAFE_DOMAIN_SUFFIX}"

    echo -e "${RED}ATENÇÃO: Você está prestes a remover:${NC}"
    echo -e "Sistema: $SYSTEM_NAME"
    echo -e "Domínio: $DOMAIN"
    echo -e "Diretório: $APP_DIR"
    echo -e "Processo PM2: $PM2_NAME"
    echo ""
    echo -e "${YELLOW}Tem certeza que deseja prosseguir? (s/n)${NC}"
    read CONFIRM

    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        echo "Operação cancelada."
        exit 0
    fi

    echo -e "${YELLOW}1. Parando e removendo processo PM2...${NC}"
    pm2 delete "$PM2_NAME" 2>/dev/null || echo "Processo PM2 não encontrado ou já removido."
    pm2 save

    echo -e "${YELLOW}2. Removendo configurações do Nginx...${NC}"
    rm -f "/etc/nginx/sites-available/$DOMAIN"
    rm -f "/etc/nginx/sites-enabled/$DOMAIN"
    systemctl reload nginx

    echo -e "${YELLOW}3. Removendo Certificado SSL (se existir)...${NC}"
    certbot delete --cert-name "$DOMAIN" --non-interactive 2>/dev/null || echo "Certificado não encontrado."

    echo -e "${YELLOW}4. Removendo arquivos da aplicação...${NC}"
    if [ -d "$APP_DIR" ]; then
        rm -rf "$APP_DIR"
        echo "Diretório $APP_DIR removido."
    else
        echo "Diretório não encontrado."
    fi

    echo -e "${YELLOW}5. Banco de Dados${NC}"
    echo -e "${RED}Deseja EXCLUIR algum Banco de Dados? (s/n)${NC}"
    read DB_CONFIRM

    if [ "$DB_CONFIRM" == "s" ] || [ "$DB_CONFIRM" == "S" ]; then
        echo -e "${YELLOW}Digite o NOME EXATO do banco de dados que deseja excluir (Padrão sugerido: ${DEFAULT_DB_NAME}):${NC}"
        read DB_TO_DELETE

        if [ -z "$DB_TO_DELETE" ]; then
            echo -e "${RED}Nome do banco não informado. Operação de banco cancelada.${NC}"
        else
            echo -e "${RED}CONFIRMAÇÃO FINAL: Todos os dados de '$DB_TO_DELETE' serão perdidos. Digite 'DELETAR' para confirmar:${NC}"
            read FINAL_CONFIRM
            
            if [ "$FINAL_CONFIRM" == "DELETAR" ]; then
                echo -e "Digite a senha do usuário root do MySQL:"
                read -s DB_ROOT_PASS
                echo ""
                
                mysql -u root -p"$DB_ROOT_PASS" -e "DROP DATABASE IF EXISTS \`${DB_TO_DELETE}\`;" 2>/dev/null
                
                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}Banco de dados '$DB_TO_DELETE' removido com sucesso.${NC}"
                else
                    echo -e "${RED}Erro ao remover banco (senha incorreta ou nome inválido).${NC}"
                fi
            else
                echo "Exclusão do banco cancelada."
            fi
        fi
    else
        echo "Banco de dados mantido."
    fi

    echo -e "${GREEN}=== Desinstalação Concluída! ===${NC}"
    exit 0
fi

# ==========================================
# LÓGICA DE INSTALAÇÃO / ATUALIZAÇÃO (Código Original Modificado)
# ==========================================

echo -e "${GREEN}>> Selecionado: $SYSTEM_NAME${NC}"
echo ""

# 2. Coleta de Dados do Domínio e Porta
echo -e "${YELLOW}Digite o domínio ou subdomínio para este sistema (ex: app.seudominio.com):${NC}"
read DOMAIN

if [ -z "$DOMAIN" ]; then
  echo -e "${RED}Domínio é obrigatório.${NC}"
  exit 1
fi

# Personalização da Porta (Para rodar múltiplos sistemas ou domínios diferentes)
echo -e "${YELLOW}Porta da Aplicação (Padrão: $APP_PORT) [Enter para manter]:${NC}"
read CUSTOM_PORT

if [ ! -z "$CUSTOM_PORT" ]; then
    if [[ "$CUSTOM_PORT" =~ ^[0-9]+$ ]]; then
        APP_PORT=$CUSTOM_PORT
        echo -e "${GREEN}>> Porta definida para: $APP_PORT${NC}"
    else
        echo -e "${RED}>> Entrada inválida. Mantendo porta padrão: $APP_PORT${NC}"
    fi
fi

# Tornar o nome do PM2 único baseando-se no domínio
SAFE_DOMAIN_SUFFIX=$(echo $DOMAIN | tr '.' '-')
PM2_NAME="${PM2_PREFIX}-${SAFE_DOMAIN_SUFFIX}"
echo -e "${GREEN}>> ID do Processo PM2: $PM2_NAME${NC}"

APP_DIR="/var/www/$DOMAIN"
IS_UPDATE=0

# Verifica se é uma atualização ou instalação nova
if [ -d "$APP_DIR/.git" ]; then
    echo -e "${GREEN}Instalação existente detectada em $APP_DIR.${NC}"
    echo -e "${GREEN}Modo de ATUALIZAÇÃO ativado.${NC}"
    IS_UPDATE=1
else
    echo -e "${GREEN}Nenhuma instalação encontrada em $APP_DIR.${NC}"
    echo -e "${GREEN}Modo de NOVA INSTALAÇÃO ativado.${NC}"
fi

# 3. Dados de Conexão
CHECK_ENV_FILE="$APP_DIR/.env"
if [ "$IS_CATEQUESE" -eq 1 ]; then CHECK_ENV_FILE="$APP_DIR/server/.env"; fi

# Lógica alterada: Para o Catequese, SEMPRE pede credenciais para permitir correção de erro 500
if [ $IS_UPDATE -eq 0 ] || [ ! -f "$CHECK_ENV_FILE" ] || [ "$IS_CATEQUESE" -eq 1 ]; then
    if [ "$IS_CATEQUESE" -eq 1 ] && [ $IS_UPDATE -eq 1 ]; then
        echo -e "${YELLOW}ATENÇÃO: Reinsira as credenciais do banco para garantir a conexão correta.${NC}"
    fi

    if [ $IS_UPDATE -eq 0 ]; then
        echo -e "${YELLOW}Digite a URL do repositório GitHub:${NC}"
        read REPO_URL
    fi

    echo -e "${YELLOW}Configuração do Banco de Dados MySQL:${NC}"
    echo -e "Nome do Banco de Dados [${DEFAULT_DB_NAME}]:"
    read DB_NAME
    
    echo -e "Usuário do Banco [${DEFAULT_DB_USER}]:"
    read DB_USER
    
    echo -e "Senha do Banco:"
    read -s DB_PASSWORD
    echo

    if [ "$IS_CATEQUESE" -eq 1 ]; then
        echo -e "Chave API Google Gemini (Opcional, enter para manter a atual se existir):"
        read GEMINI_KEY
    fi
fi

# GARANTIR VARIÁVEIS DE BANCO DE DADOS
DB_NAME=${DB_NAME:-$DEFAULT_DB_NAME}
DB_USER=${DB_USER:-$DEFAULT_DB_USER}

# 4. Pacotes do Sistema
echo -e "${GREEN}Verificando pacotes do sistema...${NC}"
apt update
apt install -y nginx certbot python3-certbot-nginx curl git mysql-server build-essential

# Node.js check (Versão 20 LTS)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# PM2 check
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 5. Configuração do MySQL
if [ ! -z "$DB_PASSWORD" ]; then
    echo -e "${GREEN}Configurando MySQL para $SYSTEM_NAME...${NC}"
    # Cria o banco se não existir
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
    
    # Cria usuário FORÇANDO mysql_native_password para compatibilidade com Node.js
    # Usando aspas simples dentro do comando SQL para evitar erro de sintaxe
    mysql -u root -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
    # Se já existir, altera a senha e o plugin
    mysql -u root -e "ALTER USER '${DB_USER}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
    
    # Dá permissões
    mysql -u root -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
    mysql -u root -e "FLUSH PRIVILEGES;"
fi

# 6. Gerenciamento do Código Fonte
mkdir -p $APP_DIR

if [ $IS_UPDATE -eq 1 ]; then
    # ATUALIZAÇÃO
    echo -e "${YELLOW}Atualizando código fonte (git pull)...${NC}"
    cd $APP_DIR
    git reset --hard
    git pull
else
    # INSTALAÇÃO NOVA
    if [ "$(ls -A $APP_DIR)" ]; then
       echo -e "${RED}O diretório $APP_DIR não está vazio. Limpando...${NC}"
       rm -rf $APP_DIR/*
       rm -rf $APP_DIR/.* 2>/dev/null
    fi

    echo -e "${YELLOW}Clonando repositório...${NC}"
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 7. Configuração Específica e Build

if [ "$IS_CATEQUESE" -eq 1 ]; then
    # --- LÓGICA ESPECÍFICA PARA PASTORAL DA CATEQUESE ---
    echo -e "${GREEN}Configurando Pastoral da Catequese...${NC}"
    
    # 7.1 Backend Setup
    cd "$APP_DIR/server"
    echo "Instalando dependências do Backend..."
    npm install || { echo -e "${RED}Falha ao instalar dependências do Backend${NC}"; exit 1; }

    # Criar/Atualizar .env do Backend
    if [ ! -z "$DB_PASSWORD" ]; then
        echo "DB_HOST=localhost" > .env
        echo "DB_USER=${DB_USER}" >> .env
        # Importante: Aspas para proteger caracteres especiais
        echo "DB_PASSWORD=\"${DB_PASSWORD}\"" >> .env
        echo "DB_NAME=${DB_NAME}" >> .env
        echo "PORT=${APP_PORT}" >> .env
        if [ ! -z "$GEMINI_KEY" ]; then 
            echo "API_KEY=\"$GEMINI_KEY\"" >> .env
        else
            # Preservar chave antiga se não informada na atualização
            OLD_KEY=$(grep API_KEY .env.old 2>/dev/null | cut -d= -f2)
            if [ ! -z "$OLD_KEY" ]; then echo "API_KEY=$OLD_KEY" >> .env; fi
        fi
    fi

    # Rodar Schema (Criação de Tabelas)
    if [ -f "schema.sql" ]; then
        echo "Atualizando estrutura do Banco de Dados (${DB_NAME})..."
        if [ ! -z "$DB_PASSWORD" ]; then
            mysql -u root -p"${DB_PASSWORD}" "${DB_NAME}" < schema.sql || echo "Erro ao rodar schema (senha root?). Tentando sem senha..."
        else
            mysql -u root "${DB_NAME}" < schema.sql
        fi
    fi

    # 7.2 Frontend Setup
    cd "$APP_DIR"
    echo "Instalando dependências do Frontend..."
    rm -f package-lock.json
    npm install || { echo -e "${RED}Falha ao instalar dependências do Frontend${NC}"; exit 1; }

    # Criar .env do Frontend
    # Garante https:// e remove barra no final se houver para evitar duplicidade //
    CLEAN_DOMAIN=$(echo $DOMAIN | sed 's:/*$::')
    echo "VITE_API_URL=https://${CLEAN_DOMAIN}/api" > .env
    if [ ! -z "$GEMINI_KEY" ]; then echo "VITE_GOOGLE_API_KEY=\"$GEMINI_KEY\"" >> .env; fi

    echo "Compilando Frontend (Build)..."
    npm run build || { echo -e "${RED}Falha no Build do Frontend${NC}"; exit 1; }

    PM2_START_DIR="$APP_DIR/server"
    PM2_SCRIPT="index.js"

else
    # --- LÓGICA GENÉRICA (Opa / Unity) ---
    cd $APP_DIR
    
    # Criar .env na raiz
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cat > .env <<EOL
PORT=${APP_PORT}
DB_HOST=localhost
DB_USER=${DB_USER}
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME=${DB_NAME}
NODE_ENV=production
EOL

    echo -e "${GREEN}Instalando dependências e compilando...${NC}"
    npm install || { echo -e "${RED}Falha ao instalar dependências${NC}"; exit 1; }
    npm run build || { echo -e "${RED}Falha no Build${NC}"; exit 1; }

    PM2_START_DIR="$APP_DIR"
    PM2_SCRIPT="server.js"
fi

# Verifica se a pasta dist foi criada
if [ ! -d "$APP_DIR/dist" ] && [ ! -d "$APP_DIR/build" ]; then
    echo -e "${RED}Erro Crítico: Pasta 'dist' ou 'build' não encontrada após build.${NC}"
    exit 1
fi

# 8. Gerenciamento de Processos (PM2)
echo -e "${GREEN}Reiniciando Backend ($PM2_NAME) na porta $APP_PORT...${NC}"
pm2 delete $PM2_NAME 2>/dev/null

# Inicia o processo no diretório correto
cd $PM2_START_DIR
PORT=$APP_PORT pm2 start "$PM2_SCRIPT" --name "$PM2_NAME" --update-env
pm2 save

# 9. Nginx e SSL
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
WEB_ROOT="$APP_DIR/dist"
if [ ! -d "$WEB_ROOT" ] && [ -d "$APP_DIR/build" ]; then WEB_ROOT="$APP_DIR/build"; fi

if [ -f "$NGINX_CONF" ]; then
    # ATUALIZAÇÃO DE CONFIGURAÇÃO EXISTENTE
    echo -e "${GREEN}Verificando configuração Nginx existente...${NC}"
    
    # Verifica se client_max_body_size já existe
    if grep -q "client_max_body_size" "$NGINX_CONF"; then
        echo -e "${YELLOW}Atualizando limite de upload para 200M...${NC}"
        sed -i "s/client_max_body_size .*/client_max_body_size 200M;/g" "$NGINX_CONF"
    else
        echo -e "${YELLOW}Injetando limite de upload de 200M...${NC}"
        # Inserir logo após a abertura do bloco server
        sed -i "/server {/a \    client_max_body_size 200M;" "$NGINX_CONF"
    fi
    
    # Atualiza a porta do proxy_pass se tiver mudado
    echo -e "${YELLOW}Atualizando porta do proxy para $APP_PORT...${NC}"
    sed -i "s/proxy_pass http:\/\/localhost:[0-9]*;/proxy_pass http:\/\/localhost:$APP_PORT;/g" "$NGINX_CONF"
    
    nginx -t
    systemctl restart nginx
else
    # NOVA CONFIGURAÇÃO
    echo -e "${GREEN}Criando nova configuração Nginx para porta $APP_PORT...${NC}"
    cat > $NGINX_CONF <<EOL
server {
    listen 80;
    server_name $DOMAIN;
    root $WEB_ROOT;
    index index.html;

    # Aumentar tamanho máximo de upload para Galeria/Biblioteca
    client_max_body_size 200M;

    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
EOL
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    [ -f /etc/nginx/sites-enabled/default ] && rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    echo -e "${YELLOW}Configurando SSL (Let's Encrypt)...${NC}"
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect
fi

echo -e "${GREEN}=== Processo Concluído! ===${NC}"
echo -e "Sistema: $SYSTEM_NAME"
echo -e "URL: https://$DOMAIN"
echo -e "Porta Interna: $APP_PORT"
echo -e "Processo PM2: $PM2_NAME"
