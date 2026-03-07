# First, Set up Backend

## Set .env in Frontend Directory

# Frontend Build and Deploy
cd frontend
npm install
npm run build

# Nginx
sudo vim /etc/nginx/sites-available/default
# server {
#     server_name $DOMAIN;

#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }

#     # SSL Setting Code by Certbot
# }
## Modify the location as shown above.
sudo systemctl restart nginx

pm2 start npm --name "frontend" -- start
pm2 save