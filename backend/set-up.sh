sudo apt update && sudo apt upgrade -y
sudo apt install -y curl build-essential

# Setting Swap Space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo sysctl vm.swappiness=10

sudo cp /etc/fstab /etc/fstab.bak
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# Git Clone
git init FashionFever
cd FashionFever/

git branch -m main
git remote add origin https://github.com/BanYeah/FashionFever.git

## Only Backend Directory
git sparse-checkout init --cone
git sparse-checkout set backend
git pull origin main

# Node.js
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

## Set .env in Backend Directory
# Read .env
ENV_FILE="backend/.env"
if [ -f "$ENV_FILE" ]; then
    API_DOMAIN=$(grep 'API_DOMAIN' $ENV_FILE | cut -d '=' -f2 | sed 's/"//g' | tr -d '\r')
    POSTGRES_DATABASE_NAME=$(grep 'POSTGRES_DATABASE_NAME' $ENV_FILE | cut -d '=' -f2 | sed 's/"//g' | tr -d '\r')
    POSTGRES_USER=$(grep 'POSTGRES_USER' $ENV_FILE | cut -d '=' -f2 | sed 's/"//g' | tr -d '\r')
    POSTGRES_PASSWORD=$(grep 'POSTGRES_PASSWORD' $ENV_FILE | cut -d '=' -f2 | sed 's/"//g' | tr -d '\r')
else
    echo "Error: Not found file, $ENV_FILE."
    exit 1
fi

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$POSTGRES_USER') THEN
        CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE $POSTGRES_DATABASE_NAME' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DATABASE_NAME')\gexec

ALTER DATABASE $POSTGRES_DATABASE_NAME OWNER TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DATABASE_NAME TO $POSTGRES_USER;

\c $POSTGRES_DATABASE_NAME
GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
ALTER SCHEMA public OWNER TO $POSTGRES_USER;
EOF

# Redis
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install -y redis

sudo systemctl enable redis-server
sudo systemctl start redis-server

# Nginx
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d $API_DOMAIN
## Enter email address & Agree the Terms of Service

sudo vim /etc/nginx/sites-available/default
# server {
#     server_name $API_DOMAIN;

#     location / {
#         proxy_pass http://localhost:8080;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
        
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }

#     # SSL Setting Code by Certbot
# }
## Modify the location as shown above.
sudo systemctl restart nginx

# Backend Build and Deploy
cd backend
npm install
npm run migration:run
npm run build

sudo npm install -g pm2
pm2 start dist/main.js --name "backend"

## Check Log
# pm2 logs

## Auto-restart in reboot
# pm2 startup
## [PM2] To setup the Startup Script, copy/paste the following command:
# pm2 save