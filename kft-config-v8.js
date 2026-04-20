#!/usr/bin/env node
// KFT Content Gen V11.8 — Neural Configuration Interface
// Design: Premium Glassmorphism / Bento Grid / Aurora
// Inspired by github.com/nextlevelbuilder/ui-ux-pro-max-skill
// Need help? Contact: https://t.me/KFT_OFM

import http from 'http';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.CONFIG_PORT || 4747;
const APIS_PATH = path.join(__dirname, 'apis.json');
const LOG_PATH  = path.join(__dirname, 'logs', 'config-server.log');

const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_PATH, line + '\n');
  } catch(e) {}
}

function readApis() {
  try { return JSON.parse(fs.readFileSync(APIS_PATH, 'utf-8')); }
  catch(e) { 
    log(`Error reading apis.json: ${e.message}`);
    return {}; 
  }
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KFT Content Gen V11.8 — Neural Interface</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: #030305;
  --bg-elevated: #0a0a10;
  --surface: rgba(255,255,255,0.02);
  --surface-hover: rgba(255,255,255,0.04);
  --border: rgba(255,255,255,0.06);
  --border-hover: rgba(255,255,255,0.12);
  --accent: #00f0ff;
  --accent-warm: #ff4d00;
  --accent-purple: #7c3aed;
  --text: #ffffff;
  --text-secondary: rgba(255,255,255,0.65);
  --text-muted: rgba(255,255,255,0.4);
  --radius: 16px;
  --radius-sm: 10px;
  --radius-lg: 24px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
  overflow-x: hidden;
  position: relative;
}

/* Subtle noise texture */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

/* Ambient glow orbs */
.ambient {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}
.ambient-1 { top: -200px; left: -100px; background: var(--accent); }
.ambient-2 { bottom: -200px; right: -100px; background: var(--accent-warm); }

.container {
  position: relative;
  z-index: 2;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 24px;
}

/* Hero */
.hero {
  margin-bottom: 64px;
  position: relative;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(0,240,255,0.08);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 24px;
  font-family: 'JetBrains Mono', monospace;
}
.badge::before {
  content: '';
  width: 6px; height: 6px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--accent);
  animation: pulse-dot 2.5s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.5;transform:scale(.8)}
}

h1 {
  font-size: clamp(52px, 10vw, 84px);
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 1;
  margin-bottom: 12px;
  background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  max-width: 480px;
  line-height: 1.5;
}

/* Bento Grid */
.bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.bento-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
  position: relative;
  overflow: hidden;
}
.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.bento-card:hover::before { opacity: 1; }
.bento-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  background: var(--surface-hover);
}

.bento-card.wide { grid-column: span 2; }

.card-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 16px;
  background: rgba(0,240,255,0.08);
  border: 1px solid rgba(0,240,255,0.15);
  color: var(--accent);
}

.bento-card h3 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: var(--text);
}
.bento-card p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}
.bento-card code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent);
  background: rgba(0,240,255,0.06);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(0,240,255,0.1);
}

/* Sections (Glass Cards) */
.section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px;
  margin-bottom: 24px;
  position: relative;
  backdrop-filter: blur(20px);
}
.section::after {
  content: '';
  position: absolute;
  top: 0; left: 40px; right: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}
.section-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,240,255,0.04));
  border: 1px solid rgba(0,240,255,0.2);
  font-size: 20px;
  color: var(--accent);
}
.section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text);
}
.section-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.field { margin-bottom: 24px; }
.field-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.field-label .req {
  color: var(--accent-warm);
  font-size: 9px;
}

input, select, textarea {
  width: 100%;
  padding: 14px 18px;
  background: rgba(0,0,0,0.35);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  transition: all 0.3s ease;
  outline: none;
}
input:hover, select:hover, textarea:hover {
  border-color: rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.4);
}
input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0,240,255,0.08), 0 0 20px rgba(0,240,255,0.05);
}
input::placeholder, textarea::placeholder {
  color: rgba(255,255,255,0.25);
  font-family: 'JetBrains Mono', monospace;
}
textarea {
  min-height: 160px;
  resize: vertical;
  line-height: 1.7;
}

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 640px) { 
  .row { grid-template-columns: 1fr; } 
  .bento { grid-template-columns: 1fr; } 
  .bento-card.wide { grid-column: span 1; } 
}

/* Provider selection */
.provider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.prov-btn {
  position: relative;
  padding: 20px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
}
.prov-btn:hover {
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.03);
}
.prov-btn.active.poyo {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(0,240,255,0.02));
  color: var(--accent);
  box-shadow: 0 0 30px rgba(0,240,255,0.1);
}
.prov-btn.active.evolink {
  border-color: #a3e635;
  background: linear-gradient(135deg, rgba(163,230,53,0.1), rgba(163,230,53,0.02));
  color: #a3e635;
  box-shadow: 0 0 30px rgba(163,230,53,0.1);
}
.prov-icon { font-size: 22px; }
.prov-name { font-size: 12px; font-weight: 700; letter-spacing: 1px; }
.prov-model { font-size: 10px; opacity: 0.8; font-family: 'JetBrains Mono', monospace; }

.prov-info {
  margin-top: 16px;
  padding: 14px;
  background: rgba(0,0,0,0.25);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--accent);
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Save Button */
.save-wrap { margin-top: 8px; }
.save-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(90deg, var(--accent), var(--accent-purple), var(--accent));
  background-size: 200% 100%;
  border: none;
  border-radius: var(--radius-sm);
  color: #000;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  animation: gradientMove 4s ease infinite;
}
@keyframes gradientMove {
  0%,100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
.save-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}
.save-btn:hover::before { left: 100%; }
.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 40px rgba(0,240,255,0.2);
}

.status {
  margin-top: 16px;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  display: none;
  backdrop-filter: blur(10px);
}
.status.ok {
  display: block;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.25);
  color: #4ade80;
}
.status.err {
  display: block;
  background: rgba(248,113,113,0.08);
  border: 1px solid rgba(248,113,113,0.25);
  color: #f87171;
}

/* Footer */
.footer {
  text-align: center;
  padding: 60px 24px;
  border-top: 1px solid var(--border);
  margin-top: 40px;
}
.footer p {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}
.footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
}
.footer a:hover { border-bottom-color: var(--accent); }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-fade { animation: fadeUp 0.6s ease forwards; opacity: 0; }
.anim-d1 { animation-delay: 0.1s; }
.anim-d2 { animation-delay: 0.2s; }
.anim-d3 { animation-delay: 0.3s; }
</style>
</head>
<body>

<div class="ambient ambient-1"></div>
<div class="ambient ambient-2"></div>

<div class="container">
  
  <div class="hero anim-fade">
    <div class="badge">● Live Interface</div>
    <h1>KFT</h1>
    <p class="subtitle">Content Generator V11.6 — Neural Image Synthesis System. Forensic pose analysis, zero-omission background extraction, multi-provider generation.</p>
  </div>

  <div class="bento anim-fade anim-d1">
    <div class="bento-card wide">
      <div class="card-icon">▶</div>
      <h3>Execution</h3>
      <p>Launch dashboard with <code>node batch-processor.js</code> after completing neural link configuration below.</p>
    </div>
    <div class="bento-card">
      <div class="card-icon" style="background:rgba(163,230,53,0.08);border-color:rgba(163,230,53,0.15);color:#a3e635;">◉</div>
      <h3>Persistence</h3>
      <p>Generated images persist in <code>images/sfw</code> and <code>images/nsfw</code> locally.</p>
    </div>
    <div class="bento-card">
      <div class="card-icon" style="background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.15);color:#f59e0b;">◈</div>
      <h3>Status</h3>
      <p>Real-time NocoDB updates with large smooth Unicode indicators at 300ms refresh rate.</p>
    </div>
  </div>

  <form id="cfg-form">
    
    <!-- NocoDB -->
    <div class="section anim-fade anim-d2">
      <div class="section-header">
        <div class="section-icon">◉</div>
        <div>
          <div class="section-title">NocoDB Neural Link</div>
          <div class="section-sub">Database synchronization parameters</div>
        </div>
      </div>
      
      <div class="field">
        <div class="field-label">Base URL <span class="req">Required</span></div>
        <input type="text" id="noco-url" placeholder="http://localhost:8080">
      </div>
      
      <div class="row">
        <div class="field">
          <div class="field-label">Base ID <span class="req">Required</span></div>
          <input type="text" id="noco-base">
        </div>
        <div class="field">
          <div class="field-label">Table ID <span class="req">Required</span></div>
          <input type="text" id="noco-table">
        </div>
      </div>
      
      <div class="field">
        <div class="field-label">API Token <span class="req">Required</span></div>
        <input type="password" id="noco-token" placeholder="xc-token-...">
      </div>
    </div>

    <!-- API Keys -->
    <div class="section anim-fade anim-d2">
      <div class="section-header">
        <div class="section-icon" style="background:linear-gradient(135deg,rgba(255,77,0,0.12),rgba(255,77,0,0.04));border-color:rgba(255,77,0,0.2);color:#ff6b35;">◈</div>
        <div>
          <div class="section-title">API Neural Keys</div>
          <div class="section-sub">Authentication credentials & provider selection</div>
        </div>
      </div>
      
      <div class="row">
        <div class="field">
          <div class="field-label">Poyo.ai Key</div>
          <input type="password" id="key-poyo" placeholder="sk-...">
        </div>
        <div class="field">
          <div class="field-label">Evolink.ai Key</div>
          <input type="password" id="key-evo" placeholder="sk-...">
        </div>
      </div>
      
      <div class="field">
        <div class="field-label">SFW Provider</div>
        <div class="provider-grid">
          <button type="button" onclick="setProvider('poyo')" id="btn-poyo" class="prov-btn active poyo">
            <span class="prov-icon">⚡</span>
            <span class="prov-name">POYO</span>
            <span class="prov-model">nano-banana-2-new-edit</span>
          </button>
          <button type="button" onclick="setProvider('evolink')" id="btn-evolink" class="prov-btn">
            <span class="prov-icon">✦</span>
            <span class="prov-name">EVOLINK</span>
            <span class="prov-model">nano-banana-pro-beta</span>
          </button>
        </div>
        <div class="prov-info" id="provider-info">
          <strong style="color:var(--accent);">● POYO ACTIVE</strong> — 8 credits/generation via Gemini Vision. NSFW always routes through Evolink regardless of SFW selection.
        </div>
      </div>
    </div>

    <!-- Hosting -->
    <div class="section anim-fade anim-d3">
      <div class="section-header">
        <div class="section-icon" style="background:linear-gradient(135deg,rgba(163,230,53,0.12),rgba(163,230,53,0.04));border-color:rgba(163,230,53,0.2);color:#a3e635;">▣</div>
        <div>
          <div class="section-title">Image Hosting Matrix</div>
          <div class="section-sub">Fallback chain for large reference images</div>
        </div>
      </div>
      <div class="field">
        <div class="field-label">FreeImage API Key</div>
        <input type="password" id="key-freeimage" value="6d207e02198a847aa98d0a2a901485a5">
      </div>
    </div>

    <!-- Prompts -->
    <div class="section anim-fade anim-d3">
      <div class="section-header">
        <div class="section-icon" style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(124,58,237,0.04));border-color:rgba(124,58,237,0.2);color:#a78bfa;">◉</div>
        <div>
          <div class="section-title">Vision Neural Prompts</div>
          <div class="section-sub">Scene analysis protocols for Image B processing</div>
        </div>
      </div>
      
      <div class="field">
        <div class="field-label">SFW Vision Prompt</div>
        <textarea id="prompt-grok" placeholder="Enter forensic scene analysis protocol..."></textarea>
      </div>
      
      <div class="field">
        <div class="field-label">NSFW Vision Prompt</div>
        <textarea id="prompt-nsfw" placeholder="Enter unrestricted scene analysis protocol..."></textarea>
      </div>
    </div>

    <!-- Save -->
    <div class="section anim-fade anim-d3" style="text-align:center;">
      <div class="save-wrap">
        <button type="submit" class="save-btn">Initialize Neural Configuration</button>
        <div class="status" id="status"></div>
      </div>
    </div>

  </form>

  <div class="footer">
    <p><strong style="color:var(--text-secondary);letter-spacing:2px;text-transform:uppercase;font-size:11px;">KFT Content Gen V11.8</strong></p>
    <p style="margin-top:8px;">Neural Image Synthesis System — <a href="https://t.me/KFT_OFM" target="_blank">https://t.me/KFT_OFM</a></p>
  </div>

</div>

<script>
const $ = id => document.getElementById(id);
let currentProvider = 'poyo';

function setProvider(p) {
  currentProvider = p;
  $('btn-poyo').className = 'prov-btn' + (p === 'poyo' ? ' active poyo' : '');
  $('btn-evolink').className = 'prov-btn' + (p === 'evolink' ? ' active evolink' : '');
  
  if (p === 'evolink') {
    $('provider-info').innerHTML = '<strong style="color:#a3e635;">● EVOLINK ACTIVE</strong> — nano-banana-pro-beta model selected. Optimized for professional outputs. NSFW routes through doubao-seedream-4.5.';
    $('provider-info').style.borderLeftColor = '#a3e635';
  } else {
    $('provider-info').innerHTML = '<strong style="color:var(--accent);">● POYO ACTIVE</strong> — 8 credits/generation via Gemini Vision. NSFW always routes through Evolink regardless of SFW selection.';
    $('provider-info').style.borderLeftColor = 'var(--accent)';
  }
}

fetch('/api/config')
  .then(r => r.json())
  .then(c => {
    if (c.nocodb) {
      $('noco-url').value = c.nocodb.baseUrl || '';
      $('noco-base').value = c.nocodb.baseId || '';
      $('noco-table').value = c.nocodb.tableId || '';
      $('noco-token').value = c.nocodb.apiToken || '';
    }
    if (c.apiKeys) {
      $('key-poyo').value = c.apiKeys.poyo || '';
      $('key-evo').value = c.apiKeys.evolink || '';
      $('key-freeimage').value = c.apiKeys.freeimage || '6d207e02198a847aa98d0a2a901485a5';
    }
    if (c.sfw_provider) setProvider(c.sfw_provider);
    if (c.prompts) {
      $('prompt-grok').value = c.prompts.grok_meta || '';
      $('prompt-nsfw').value = c.prompts.nsfw || '';
    }
  })
  .catch(e => console.error('Config load error:', e));

$('cfg-form').onsubmit = async (e) => {
  e.preventDefault();
  const s = $('status');
  s.className = 'status';
  s.style.display = 'none';
  
  if (!$('noco-url').value.trim() || !$('noco-base').value.trim() || 
      !$('noco-table').value.trim() || !$('noco-token').value.trim()) {
    s.textContent = '✕ Please complete all required NocoDB fields';
    s.className = 'status err';
    s.style.display = 'block';
    return;
  }

  const cfg = {
    nocodb: {
      baseUrl: $('noco-url').value.trim(),
      baseId: $('noco-base').value.trim(),
      tableId: $('noco-table').value.trim(),
      apiToken: $('noco-token').value.trim()
    },
    sfw_provider: currentProvider,
    apiKeys: {
      poyo: $('key-poyo').value.trim(),
      evolink: $('key-evo').value.trim(),
      freeimage: $('key-freeimage').value.trim()
    },
    imageHosting: { 
      mode: 'datauri', 
      enabled: true, 
      fallbackChain: ['datauri', 'freeimage'] 
    },
    prompts: {
      grok_meta: $('prompt-grok').value.trim(),
      nsfw: $('prompt-nsfw').value.trim()
    }
  };

  try {
    const r = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    
    if (r.ok) {
      s.textContent = '✓ Neural configuration initialized. Restart batch processor to apply.';
      s.className = 'status ok';
    } else {
      const err = await r.json();
      s.textContent = '✕ Sync failed: ' + (err.error || 'HTTP ' + r.status);
      s.className = 'status err';
    }
  } catch (err) {
    s.textContent = '✕ Neural link error: ' + err.message;
    s.className = 'status err';
  }
  
  s.style.display = 'block';
  setTimeout(() => { s.style.display = 'none'; }, 6000);
};
</script>

</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
  } else if (req.method === 'GET' && req.url === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try { res.end(JSON.stringify(readApis())); }
    catch(e) { res.end(JSON.stringify({ error: e.message })); }
  } else if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const cfg = JSON.parse(body);
        if (!cfg.nocodb?.baseUrl || !cfg.nocodb?.baseId || !cfg.nocodb?.tableId || !cfg.nocodb?.apiToken) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing required NocoDB neural link parameters' }));
          return;
        }
        fs.writeFileSync(APIS_PATH, JSON.stringify(cfg, null, 2));
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true }));
        log(`Neural configuration synchronized`);
      } catch(e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
        log(`Configuration sync error: ${e.message}`);
      }
    });
  } else if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'operational', 
      version: '11.6.0', 
      timestamp: Date.now(),
      neural_link: 'active'
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`KFT Neural Interface V11.8 initialized on port ${PORT}`);
  console.log(`\n▲ KFT Content Gen V11.8 — Neural Interface Active`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Support: https://t.me/KFT_OFM\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log(`CRITICAL: Port ${PORT} occupied by another process`);
    console.error(`\n▲ PORT ${PORT} OCCUPIED`);
    console.error(`   Run: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    log(`Neural interface error: ${err.message}`);
    console.error(`Interface error: ${err.message}`);
  }
});

process.on('uncaughtException', (err) => {
  log(`Uncaught neural exception: ${err.message}`);
  console.error('Uncaught exception:', err);
  process.exit(1);
});

