#!/bin/bash
set -e

dnf update -y
dnf install -y git nodejs npm

APP_DIR="/opt/unir-app"
rm -rf "$APP_DIR"
git clone https://github.com/KevinJ0/unir-app-f0550.git "$APP_DIR"
cd "$APP_DIR"

npm install --omit=dev

cat << 'EOF' > "$APP_DIR/.env"
PORT=80
DB_HOST=ha-db-mysql.cdumuqk8ebmu.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=ha_app_user
DB_PASSWORD=
DB_NAME=ha_database
DATABASE_URL=
DEMO_MODE=false
EOF

cat << 'EOF' > /etc/systemd/system/unir-app.service
[Unit]
Description=CloudOps Web Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/unir-app
ExecStart=/usr/bin/node /opt/unir-app/server.js
Restart=always
RestartSec=5
Environment=PORT=80
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable unir-app
systemctl start unir-app
