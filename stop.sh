#!/bin/bash
cd "$(dirname "$0")"
echo "[+] Stopping KFT..."
pkill -f "kft-config-v8.js" 2>/dev/null || true
pkill -f "batch-processor.js" 2>/dev/null || true
rm -f .config.pid
sleep 1
echo "[OK] Stopped"
