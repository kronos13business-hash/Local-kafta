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
