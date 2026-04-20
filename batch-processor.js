#!/usr/bin/env node
// ============================================================================
// KFT CONTENT GEN V11.8 — CORRECTIF MANUS
// Corrections : Modèle Poyo, Résolution, Modèle Vision, Erreurs de syntaxe.
// Need help? Contact: https://t.me/KFT_OFM
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APIS_PATH = join(__dirname, 'apis.json');
const IMG_DIR_SFW = join(__dirname, 'images', 'sfw');
const IMG_DIR_NSFW = join(__dirname, 'images', 'nsfw');

[IMG_DIR_SFW, IMG_DIR_NSFW].forEach(d => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

const TERM = {
  START: '▶', VISION: '◉', PROMPT: '◎', GENERATE: '▷',
  SUCCESS: '✓', ERROR: '✕', WARNING: '◈', PAUSE: '▮▮',
  UPLOAD: '◉', DOWNLOAD: '▼'
};

const ANIM = {
  SPINNER_DOTS:    ['⣷','⣯','⣟','⡿','⢿','⣻','⣽','⣾'],
  BAR_L: '▕',
  BAR_R: '▏',
  BLOCKS: ['▏','▎','▍','▌','▋','▊','▉','█'],
  EMPTY: '░',
  OK:    '✓',
  ERR:   '✕',
  WARN:  '⚠',
  INFO:  'ℹ',
  TIMER: '◷',
  UP:    '▲',
  DOWN:  '▼'
};

const SPINNER_SPEED = 300;

let screen, headerBox, statsBox, jobsBox, logsBox;
let blessed;

try {
  blessed = (await import('blessed')).default;
} catch (e) {
  console.error('ERROR: blessed not found. Run: npm install');
  process.exit(1);
}

screen = blessed.screen({ smartCSR: true, title: 'KFT Content Gen V11.8', dockBorders: true });

headerBox = blessed.box({
  top: 0, left: 0, width: '100%', height: '8%',
  content: '{center}{cyan-fg}KFT CONTENT GEN V11.8{/cyan-fg}{/center}\n{center}{gray-fg}Need help? https://t.me/KFT_OFM{/gray-fg}{/center}',
  tags: true, style: { fg: 'white', bg: 'black' }
});

statsBox = blessed.box({
  top: '8%', left: 0, width: '35%', height: '17%',
  label: ' {bold} STATS{/bold} ', tags: true,
  border: { type: 'line' }, style: { border: { fg: 'cyan' }, fg: 'white' }
});

jobsBox = blessed.box({
  top: '8%', left: '35%', width: '65%', height: '17%',
  label: ' {bold} ACTIVE JOBS{/bold} ', tags: true,
  border: { type: 'line' }, style: { border: { fg: 'yellow' }, fg: 'white' },
  scrollable: true, alwaysScroll: true
});

logsBox = blessed.log({
  top: '25%', left: 0, width: '100%', height: '75%',
  label: ' {bold}LOGS  Q:Quit  P:Pause  C:Clear{/bold} ',
  tags: true,
  border: { type: 'line' }, style: { border: { fg: 'green' }, fg: 'white' },
  scrollable: true, alwaysScroll: true,
  scrollbar: { ch: ' ', track: { bg: 'cyan' }, style: { inverse: true } },
  mouse: true
});

screen.append(headerBox); screen.append(statsBox); screen.append(jobsBox); screen.append(logsBox);

let stats = { active: 0, success: 0, failed: 0 };
const activeJobs = new Map();
let isPaused = false;

function addLog(text, color = 'white') {
  const time = new Date().toLocaleTimeString('fr-FR');
  let t = String(text ?? '');
  if (t.includes('base64,')) { const i = t.indexOf('base64,'); t = t.substring(0, i+7)+'[...]'; }
  logsBox.log(`{${color}-fg}[${time}]{/${color}-fg} ${t}`);
  screen.render();
}

function updateDashboard() {
    statsBox.setContent(
      `> {cyan-fg}Active:{/cyan-fg} ${stats.active}\n` +
      `✓ {green-fg}Success:{/green-fg} ${stats.success}\n` +
      `✗ {red-fg}Failed:{/red-fg}  ${stats.failed}`
    );
    let jc = '';
    if (activeJobs.size === 0) { jc = ` {gray-fg}! No active jobs{/gray-fg}`; }
    else {
      for (const [id, j] of activeJobs) {
        jc += ` ${j.stageGlyph || '▶'} {cyan-fg}#${id}{/cyan-fg} ${String(j.step || '...').substring(0, 45)}\n`;
      }
    }
    jobsBox.setContent(jc);
    screen.render();
}
setInterval(updateDashboard, 300);

screen.key(['q','C-c'], () => process.exit(0));
screen.key(['c','C'], () => { logsBox.clear(); addLog(`✓ Logs cleared`, 'yellow'); });
screen.key(['p','P'], () => { isPaused = !isPaused; addLog(isPaused ? `▮▮ PAUSED` : `▶ RESUMED`, 'yellow'); });

function loadCFG() {
  try {
    const raw = readFileSync(APIS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    addLog(`✗ [Config] ${e.message}`, 'red');
    return null;
  }
}

const POYO_BASE = 'https://api.poyo.ai';
const POYO_HDR = c => ({ 'Authorization': `Bearer ${c.apiKeys?.poyo||''}`, 'Content-Type': 'application/json' });

async function analyzeImage(cfg, imageUrl, prompt) {
  const safeLog = imageUrl.startsWith('data:') ? `[DATA:URI ${(imageUrl.length/1024).toFixed(0)}KB]` : imageUrl;
  addLog(`@ [Vision] Analyzing ${safeLog}`, 'cyan');
  let b64, mime;
  if (imageUrl.startsWith('data:')) {
    const m = imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
    if (!m) throw new Error('[Vision] Malformed Data URI');
    mime = m[1]; b64 = m[2];
  } else {
    const r = await fetch(imageUrl, { signal: AbortSignal.timeout(45000) });
    if (!r.ok) throw new Error(`[Vision] HTTP ${r.status}`);
    b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
    mime = r.headers.get('content-type') || 'image/jpeg';
  }
  const reqBody = {
    contents: [{ role: 'user', parts: [
      { inline_data: { mime_type: mime, data: b64 } },
      { text: prompt }
    ]}],
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.2 }
  };
  const resp = await fetch(`${POYO_BASE}/v1beta/models/gemini-3-pro:generateContent`, {
    method: 'POST', headers: POYO_HDR(cfg), body: JSON.stringify(reqBody),
    signal: AbortSignal.timeout(90000)
  });
  const respText = await resp.text();
  let data;
  try { data = JSON.parse(respText); } catch { throw new Error(`Non-JSON response (${resp.status})`); }
  if (data.code && Number(data.code) >= 400) {
    const errMsg = data.error?.message || data.message || `Poyo error ${data.code}`;
    throw new Error(`Poyo error ${data.code}: ${errMsg}`);
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text?.trim()) throw new Error('No text in response');
  const cleanedText = text.trim().replace(/```json/g, '').replace(/```/g, '');
  addLog(`✓ [Vision] OK ${cleanedText.length} chars`, 'green');
  return cleanedText;
}

async function generateImages(cfg, record) {
    const totalImages = Number(record.nombre_images) || 1;
    addLog(`▶ [Parallel] Starting ${totalImages} image(s)...`);
    const promises = [];
    for (let i = 0; i < totalImages; i++) {
        promises.push(poyoOneImage(cfg, record, i, totalImages));
    }
    const results = await Promise.allSettled(promises);
    const successfulUrls = results.filter(r => r.status === 'fulfilled').map(r => r.value.urls).flat();
    if (successfulUrls.length === 0) {
        const firstError = results.find(r => r.status === 'rejected');
        throw new Error(`[GENERATE] 0 images recovered (/${totalImages}) – All generation tasks failed. Check Poyo credits, model params, or API status.`);
    }
    return successfulUrls;
}

async function poyoOneImage(cfg, record, imageIndex, totalImages) {
  const { prompt_final, resolution_finale, aspect_ratio, image_de_reference } = record;
  const quality = (resolution_finale || '1K').toUpperCase();
  addLog(`▶ [Poyo] Submitting ${imageIndex + 1}/${totalImages}...`);
  const body = {
      model: 'nano-banana-2-new-edit',
      input: {
          prompt: prompt_final,
          resolution: quality,
          size: aspect_ratio,
          n: 1,
          image_urls: image_de_reference ? [image_de_reference[0].url] : []
      }
  };
  addLog(`i [Poyo] Submit body: ${JSON.stringify(body).substring(0, 500)}...`, 'gray');
  const submitResp = await fetch(`${POYO_BASE}/api/generate/submit`, {
    method: 'POST', headers: POYO_HDR(cfg),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  });
  const submitData = await submitResp.json();
  if (!submitResp.ok) {
    const msg = submitData?.error?.message || JSON.stringify(submitData);
    throw new Error(`[Poyo:Submit] ${msg}`);
  }
  const taskId = submitData.data?.task_id;
  if (!taskId) throw new Error(`[Poyo:Submit] No task_id`);

  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const pollResp = await fetch(`${POYO_BASE}/api/generate/status/${taskId}`, { headers: POYO_HDR(cfg) });
    const pollData = await pollResp.json();
    const d = pollData.data || {};
    if (d.status === 'finished') {
      const urls = (d.files || []).map(f => f?.file_url).filter(Boolean);
      if (!urls.length) throw new Error(`[Poyo] Finished with no URL`);
      addLog(`✓ [Img#${imageIndex + 1}] OK`, 'green');
      return { taskId, urls };
    }
    if (d.status === 'failed') {
      throw new Error(`[Poyo:Task] ${d.error_message || 'Unknown error'}`);
    }
  }
}

async function processRecord(record) {
    const cfg = loadCFG();
    if (!cfg) return;

    const recordId = record.Id;
    activeJobs.set(recordId, { step: 'Starting...', stageGlyph: '▶' });
    stats.active++;
    updateDashboard();

    try {
        // 1. Vision Analysis
        if (record.image_a_analyser && record.prompt_vision) {
            const visionResult = await analyzeImage(cfg, record.image_a_analyser[0].url, record.prompt_vision);
            record.prompt_final = visionResult; // Use vision result as the final prompt
        }

        // 2. Image Generation
        const generatedUrls = await generateImages(cfg, record);

        // 3. Success
        addLog(`✓ SUCCESS [Record #${recordId}]`, 'green');
        stats.success++;

    } catch (e) {
        addLog(`✗ FAIL [Record #${recordId}]: ${e.message}`, 'red');
        stats.failed++;
    } finally {
        stats.active--;
        activeJobs.delete(recordId);
        updateDashboard();
    }
}

// Mock record for testing
const mockRecord = {
    Id: 1,
    nombre_images: 1,
    prompt_vision: '{"scene_type": "Clean Commercial Interior", "lighting_dynamics": {"source": "Bright, multi-directional LED refrigerator lighting", "skin_interaction": "Subtle, cool-toned highlights on skin surfaces facing the light source, with soft, diffused shadows in recessed areas. No harsh glare or over-exposure."},"camera_and_composition": {"angle": "Slightly low-angle, looking up towards the subject", "shot_type": "Medium close-up, framing from the waist up", "focus_and_dof": "Sharp focus on the subject's face and upper body, with a gentle background blur (shallow depth of field)."},"subject_details": {"pose_and_action": "Leaning slightly forward, one hand resting on the open refrigerator door, the other hand holding a clear glass bottle. A relaxed, natural posture.", "clothing_and_style": "Simple, casual attire such as a plain t-shirt or light sweater. The fabric should show realistic folds and wrinkles.", "expression_and_mood": "A neutral to slightly curious expression. The overall mood is calm, everyday, and authentic."},"object_and_environment": {"key_objects": ["A clear glass bottle with a simple label, held by the subject.", "A modern, well-stocked refrigerator with organized shelves and interior lighting."],"background_elements": "The background is the interior of the refrigerator, filled with various food items like fresh vegetables, fruits, and beverage containers. The items should be recognizable but not overly detailed, contributing to a realistic, cluttered-but-clean environment."}}',
    resolution_finale: '1K',
    aspect_ratio: '3:4',
    image_a_analyser: [{ url: 'https://i.imgur.com/5d3b6qC.jpeg' }],
    image_de_reference: [{ url: 'https://i.imgur.com/ref.jpeg' }]
};

addLog('i [Config] SFW | 1 img | aspect_ratio=3:4 | resolution=1K');
processRecord(mockRecord);

