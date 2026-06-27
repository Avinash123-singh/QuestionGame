#!/bin/bash
# Make game live on internet (free Cloudflare tunnel)
set -e
cd "$(dirname "$0")/.."

echo "🔨 Rebuilding..."
docker compose up --build -d

echo "🌐 Starting public tunnel..."
docker compose --profile live up -d tunnel

echo "⏳ Waiting for tunnel URL..."
sleep 5
docker logs fakeanswer-tunnel 2>&1 | grep -o 'https://[^ ]*\.trycloudflare\.com' | head -1 || docker logs fakeanswer-tunnel 2>&1 | tail -5

echo ""
echo "📱 Local:  http://localhost:3000"
IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
[ -n "$IP" ] && echo "📱 Same WiFi: http://$IP:3000"
echo ""
echo "Tunnel URL upar hai — kisi bhi phone/PC se kholo!"
