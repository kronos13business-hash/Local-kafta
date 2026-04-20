#!/bin/bash
# KFT Content Gen V11.6 — Bulletproof Setup
# Installs + Starts config server automatically (no systemd required)
# Need help? Contact: https://t.me/KFT_OFM

set -e

cd "$(dirname "$0")"
INSTALL_DIR="$(pwd)"
NODE_BIN=$(which node 2>/dev/null || echo "")
HAS_SYSTEMD=false

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
  command -v systemctl &>/dev/null && HAS_SYSTEMD=true
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
else
  OS="linux"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           KFT CONTENT GEN V11.6 - Setup                          ║"
echo "║           OS: ${OS}                                                ║"
echo "║                                                                  ║"
echo "║           Need help? https://t.me/KFT_OFM                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ========== 1. CHECK NODE.JS ==========
if [ -z "$NODE_BIN" ]; then
  echo "  [X] ERROR: Node.js not found in PATH"
  echo "     Install from: https://nodejs.org/ (v18+ required)"
  exit 1
fi

NODE_VER=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt 18 ]; then
  echo "  [X] ERROR: Node.js v18+ required (found $(node --version))"
  exit 1
fi

echo "  [OK] Node.js $(node --version) | $INSTALL_DIR"
echo ""

# ========== 2. INSTALL DEPS ==========
echo "  [+] Installing dependencies..."
if [ ! -d "node_modules" ]; then
  npm install --silent
  echo "  [OK] Dependencies installed"
else
  echo "  [OK] node_modules already exists"
fi
echo ""

# ========== 3. CREATE DIRECTORIES ==========
echo "  [+] Creating directories..."
mkdir -p "$INSTALL_DIR/images/sfw" "$INSTALL_DIR/images/nsfw" "$INSTALL_DIR/logs"
echo "  [OK] images/sfw"
echo "  [OK] images/nsfw"
echo "  [OK] logs"
echo ""

# ========== 4. CREATE DEFAULT CONFIG ==========
echo "  [+] Checking apis.json..."
if [ -f "$INSTALL_DIR/apis.json" ]; then
  node -e "JSON.parse(require('fs').readFileSync('apis.json','utf-8'))" 2>/dev/null \
    && echo "  [OK] Valid apis.json found" \
    || { echo "  [!] Invalid JSON — recreating..."; rm -f "$INSTALL_DIR/apis.json"; }
fi

if [ ! -f "$INSTALL_DIR/apis.json" ]; then
  cat > "$INSTALL_DIR/apis.json" << 'JSON'
{
  "nocodb": { "baseUrl": "", "baseId": "", "tableId": "", "apiToken": "" },
  "sfw_provider": "poyo",
  "apiKeys": { "poyo": "", "evolink": "", "freeimage": "6d207e02198a847aa98d0a2a901485a5" },
  "imageHosting": { "mode": "datauri", "enabled": true, "fallbackChain": ["datauri","freeimage"] },
  "prompts": { "grok_meta": "", "nsfw": "" }
}
JSON
  echo "  [OK] Default apis.json created"
fi
echo ""

# ========== 5. FIX PERMISSIONS ==========
chmod +x "$INSTALL_DIR/batch-processor.js" 2>/dev/null || true
chmod +x "$INSTALL_DIR/kft-config-v8.js" 2>/dev/null || true

# ========== 6. KILL OLD PROCESSES ==========
echo "  [+] Cleaning old processes on port 4747..."
pkill -f "kft-config-v8.js" 2>/dev/null || true
sleep 1

# ========== 7. START CONFIG SERVER ==========
echo "  [+] Starting Config Server (port 4747)..."

nohup "$NODE_BIN" "$INSTALL_DIR/kft-config-v8.js" > "$INSTALL_DIR/logs/config.log" 2>&1 &
CONFIG_PID=$!
echo $CONFIG_PID > "$INSTALL_DIR/.config.pid"

PORT_READY=false
HEALTH_URL="http://localhost:4747/api/health"

echo -n "  [.] Waiting for server to respond"
for i in {1..20}; do
  sleep 1
  if curl -s "$HEALTH_URL" > /dev/null 2>&1; then
    PORT_READY=true
    break
  fi
  if ! kill -0 $CONFIG_PID 2>/dev/null; then
    echo ""
    echo "  [X] Config server crashed during startup!"
    echo "  [i] Last logs:"
    tail -n 10 "$INSTALL_DIR/logs/config.log" 2>/dev/null || echo "  (no logs)"
    exit 1
  fi
  echo -n "."
done
echo ""

if [ "$PORT_READY" = false ]; then
  echo ""
  echo "  [X] Config server did not respond on port 4747"
  echo "  [i] Logs:"
  tail -n 15 "$INSTALL_DIR/logs/config.log" 2>/dev/null || echo "  (no logs)"
  kill $CONFIG_PID 2>/dev/null || true
  rm -f "$INSTALL_DIR/.config.pid"
  exit 1
fi

echo "  [OK] Config Server is RUNNING (PID: $CONFIG_PID)"
echo ""

# ========== 8. OPTIONAL SYSTEMD ==========
if [ "$HAS_SYSTEMD" = true ] && [ "$OS" = "linux" ]; then
  echo "  [+] Setting up systemd services (optional)..."
  
  SYSTEMD_DIR="$HOME/.config/systemd/user"
  mkdir -p "$SYSTEMD_DIR"

  cat > "$SYSTEMD_DIR/kft-config.service" << SVC
[Unit]
Description=KFT Config Server V11.6
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_BIN $INSTALL_DIR/kft-config-v8.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
SVC

  cat > "$SYSTEMD_DIR/kft-batch.service" << SVC
[Unit]
Description=KFT Batch Processor V11.6
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_BIN $INSTALL_DIR/batch-processor.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
SVC

  systemctl --user daemon-reload 2>/dev/null || true
  systemctl --user enable kft-config.service 2>/dev/null || true
  systemctl --user enable kft-batch.service 2>/dev/null || true
  echo "  [OK] Systemd services installed"
fi

# ========== 9. CREATE HELPER SCRIPTS ==========
cat > "$INSTALL_DIR/run.sh" << 'EOF'
#!/bin/bash
# KFT V11.6 - Start Dashboard (Config server must be running)
cd "$(dirname "$0")"

if ! curl -s http://localhost:4747/api/health > /dev/null 2>&1; then
  echo "[+] Config server not running, starting it..."
  nohup "$(which node)" kft-config-v8.js > logs/config.log 2>&1 &
  sleep 3
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              KFT CONTENT GEN V11.6                               ║"
echo "║              Need help? https://t.me/KFT_OFM                     ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "  [+] Config UI:      http://localhost:4747"
echo "  [+] Dashboard:       Starting now..."
echo ""
echo "  Controls: Q=Quit  P=Pause  C=Clear logs"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
node batch-processor.js
EOF
chmod +x "$INSTALL_DIR/run.sh"

cat > "$INSTALL_DIR/stop.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "[+] Stopping KFT..."
pkill -f "kft-config-v8.js" 2>/dev/null || true
pkill -f "batch-processor.js" 2>/dev/null || true
rm -f .config.pid
sleep 1
echo "[OK] Stopped"
EOF
chmod +x "$INSTALL_DIR/stop.sh"

# ========== 10. FINAL MESSAGE ==========
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    [OK] SETUP COMPLETE                            ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║                                                                  ║"
echo "║  [+] Config Web UI:  http://localhost:4747  <-- OPEN THIS NOW    ║"
echo "║                                                                  ║"
echo "║  [i] NEXT STEPS:                                                 ║"
echo "║     1. Open http://localhost:4747 in your browser                ║"
echo "║     2. Fill your NocoDB + API keys                               ║"
echo "║     3. Click Save                                                ║"
echo "║     4. Then run:  ./run.sh                                       ║"
echo "║                                                                  ║"
echo "║  [+] Images saved to:                                            ║"
echo "║     $INSTALL_DIR/images/sfw"
echo "║     $INSTALL_DIR/images/nsfw"
echo "║                                                                  ║"
echo "║  [+] To stop config server:  ./stop.sh                           ║"
echo "║                                                                  ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║  [i] Need help? https://t.me/KFT_OFM                             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
