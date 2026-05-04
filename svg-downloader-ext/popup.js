'use strict';

// ─── Shape definitions ────────────────────────────────────────────────────────
const SHAPES = [
  { id:'square',       label:'Square',      draw:(c,s)=>drawRoundedRect(c,s,s*0.12) },
  { id:'squircle',     label:'Squircle',    draw:(c,s)=>drawRoundedRect(c,s,s*0.32) },
  { id:'circle',       label:'Circle',      draw:(c,s)=>{ c.arc(0,0,s/2,0,Math.PI*2); } },
  { id:'triangle',     label:'Triangle',    draw:(c,s)=>drawPolygon(c,s,3,-Math.PI/2) },
  { id:'roundedtri',   label:'Round Tri',   draw:(c,s)=>drawRoundedPoly(c,s,3,-Math.PI/2,s*0.12) },
  { id:'pentagon',     label:'Pentagon',    draw:(c,s)=>drawPolygon(c,s,5,-Math.PI/2) },
  { id:'hexagon',      label:'Hexagon',     draw:(c,s)=>drawPolygon(c,s,6,0) },
  { id:'heptagon',     label:'Heptagon',    draw:(c,s)=>drawPolygon(c,s,7,-Math.PI/2) },
  { id:'octagon',      label:'Octagon',     draw:(c,s)=>drawPolygon(c,s,8,Math.PI/8) },
  { id:'diamond',      label:'Diamond',     draw:(c,s)=>drawPolygon(c,s,4,0) },
  { id:'star',         label:'Star',        draw:(c,s)=>drawStar(c,s,5) },
  { id:'shield',       label:'Shield',      draw:(c,s)=>drawShield(c,s) },
  { id:'bookmark',     label:'Bookmark',    draw:(c,s)=>drawBookmark(c,s) },
  { id:'seal',         label:'Seal',        draw:(c,s)=>drawStar(c,s,12,0.82) },
  { id:'cross',        label:'Cross',       draw:(c,s)=>drawCross(c,s) },
];

let selectedShape = 'squircle';

// ─── Shape drawing helpers ────────────────────────────────────────────────────
function drawPolygon(ctx, size, sides, startAngle=0) {
  const r = size / 2;
  ctx.moveTo(Math.cos(startAngle)*r, Math.sin(startAngle)*r);
  for (let i=1; i<=sides; i++) {
    const a = startAngle + (i * Math.PI*2/sides);
    ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  ctx.closePath();
}

function drawRoundedRect(ctx, size, radius) {
  const h = size/2;
  ctx.moveTo(-h+radius, -h);
  ctx.lineTo(h-radius, -h);
  ctx.arcTo(h,-h, h,-h+radius, radius);
  ctx.lineTo(h, h-radius);
  ctx.arcTo(h,h, h-radius,h, radius);
  ctx.lineTo(-h+radius, h);
  ctx.arcTo(-h,h, -h,h-radius, radius);
  ctx.lineTo(-h, -h+radius);
  ctx.arcTo(-h,-h, -h+radius,-h, radius);
  ctx.closePath();
}

function drawRoundedPoly(ctx, size, sides, startAngle, radius) {
  const r = size/2 * 0.9;
  const pts = [];
  for (let i=0; i<sides; i++) {
    const a = startAngle + (i * Math.PI*2/sides);
    pts.push([Math.cos(a)*r, Math.sin(a)*r]);
  }
  ctx.moveTo((pts[0][0]+pts[pts.length-1][0])/2, (pts[0][1]+pts[pts.length-1][1])/2);
  for (let i=0; i<pts.length; i++) {
    const curr = pts[i], next = pts[(i+1)%pts.length];
    const midX = (curr[0]+next[0])/2, midY = (curr[1]+next[1])/2;
    ctx.quadraticCurveTo(curr[0], curr[1], midX, midY);
  }
  ctx.closePath();
}

function drawStar(ctx, size, points, innerRatio=0.45) {
  const outerR = size/2;
  const innerR = outerR * innerRatio;
  const step = Math.PI/points;
  ctx.moveTo(0, -outerR);
  for (let i=0; i<points*2; i++) {
    const r = i%2===0 ? outerR : innerR;
    const a = i*step - Math.PI/2;
    ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  ctx.closePath();
}

function drawShield(ctx, size) {
  const h = size/2;
  ctx.moveTo(0, -h);
  ctx.lineTo(h*0.85, -h*0.6);
  ctx.lineTo(h*0.85, h*0.1);
  ctx.quadraticCurveTo(h*0.85, h*0.7, 0, h);
  ctx.quadraticCurveTo(-h*0.85, h*0.7, -h*0.85, h*0.1);
  ctx.lineTo(-h*0.85, -h*0.6);
  ctx.closePath();
}

function drawBookmark(ctx, size) {
  const h = size/2;
  ctx.moveTo(-h*0.75, -h);
  ctx.lineTo(h*0.75, -h);
  ctx.lineTo(h*0.75, h*0.7);
  ctx.lineTo(0, h);
  ctx.lineTo(-h*0.75, h*0.7);
  ctx.closePath();
}

function drawCross(ctx, size) {
  const h = size/2, t = h*0.32;
  ctx.moveTo(-t,-h); ctx.lineTo(t,-h);
  ctx.lineTo(t,-t); ctx.lineTo(h,-t);
  ctx.lineTo(h,t);  ctx.lineTo(t,t);
  ctx.lineTo(t,h);  ctx.lineTo(-t,h);
  ctx.lineTo(-t,t); ctx.lineTo(-h,t);
  ctx.lineTo(-h,-t);ctx.lineTo(-t,-t);
  ctx.closePath();
}

// ─── Build shape picker ───────────────────────────────────────────────────────
function buildShapePicker() {
  const grid = document.getElementById('shapeGrid');
  grid.innerHTML = '';
  SHAPES.forEach(shape => {
    const btn = document.createElement('button');
    btn.className = 'shape-btn' + (shape.id===selectedShape?' active':'');
    btn.title = shape.label;
    // mini canvas preview
    const mc = document.createElement('canvas');
    mc.width = 36; mc.height = 36;
    const cx = mc.getContext('2d');
    cx.translate(18,18);
    cx.beginPath();
    shape.draw(cx, 30);
    cx.fillStyle = shape.id===selectedShape ? '#7c6aff' : '#3a3a50';
    cx.fill();
    const lbl = document.createElement('span');
    lbl.textContent = shape.label;
    btn.appendChild(mc);
    btn.appendChild(lbl);
    btn.addEventListener('click', ()=>{
      selectedShape = shape.id;
      document.querySelectorAll('.shape-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      // re-tint all mini canvases
      document.querySelectorAll('.shape-btn').forEach((b,i)=>{
        const bc = b.querySelector('canvas');
        const bx = bc.getContext('2d');
        bx.clearRect(0,0,36,36);
        bx.save(); bx.translate(18,18); bx.beginPath();
        SHAPES[i].draw(bx,30);
        bx.fillStyle = SHAPES[i].id===selectedShape ? '#7c6aff' : '#3a3a50';
        bx.fill(); bx.restore();
      });
      updatePreview();
    });
    grid.appendChild(btn);
  });
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const svgInput       = document.getElementById('svgInput');
const clearBtn       = document.getElementById('clearBtn');
const previewBox     = document.getElementById('previewBox');
const filenameDisplay= document.getElementById('filenameDisplay');
const colorPicker    = document.getElementById('colorPicker');
const colorHex       = document.getElementById('colorHex');
const colorEnabled   = document.getElementById('colorEnabled');
const resetColor     = document.getElementById('resetColor');
const sizeW          = document.getElementById('sizeW');
const sizeH          = document.getElementById('sizeH');
const sizeEnabled    = document.getElementById('sizeEnabled');
const lockAR         = document.getElementById('lockAR');
const presetBtns     = document.querySelectorAll('.preset-btn');
const downloadSvg    = document.getElementById('downloadSvg');
const downloadPng    = document.getElementById('downloadPng');
const toast          = document.getElementById('toast');
// bg
const bgEnabled      = document.getElementById('bgEnabled');
const bgPadding      = document.getElementById('bgPadding');
const bgPaddingVal   = document.getElementById('bgPaddingVal');
const bgRotation     = document.getElementById('bgRotation');
const bgRotationVal  = document.getElementById('bgRotationVal');
const bgColor1       = document.getElementById('bgColor1');
const bgHex1         = document.getElementById('bgHex1');
const bgGradient     = document.getElementById('bgGradient');
const bgColor2Row    = document.getElementById('bgColor2Row');
const bgColor2       = document.getElementById('bgColor2');
const bgHex2         = document.getElementById('bgHex2');
const bgOpacity      = document.getElementById('bgOpacity');
const bgOpacityVal   = document.getElementById('bgOpacityVal');
const strokeEnabled  = document.getElementById('strokeEnabled');
const strokeColor    = document.getElementById('strokeColor');
const strokeHex      = document.getElementById('strokeHex');
const strokeWidth    = document.getElementById('strokeWidth');
const strokeWidthVal = document.getElementById('strokeWidthVal');
const shadowEnabled  = document.getElementById('shadowEnabled');
const shadowColor    = document.getElementById('shadowColor');
const shadowHex      = document.getElementById('shadowHex');
const shadowBlur     = document.getElementById('shadowBlur');
const shadowBlurVal  = document.getElementById('shadowBlurVal');
const shadowOffset   = document.getElementById('shadowOffset');
const shadowOffsetVal= document.getElementById('shadowOffsetVal');
const shadowOpacity  = document.getElementById('shadowOpacity');
const shadowOpacityVal=document.getElementById('shadowOpacityVal');

// ─── State ────────────────────────────────────────────────────────────────────
let parsedSvg = null;
let aspectRatio = 1;
let ignoreNextSize = false;

// ─── Tabs ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
  });
});

// ─── Slider displays ──────────────────────────────────────────────────────────
function wireSlider(el, valEl, suffix='', cb) {
  el.addEventListener('input',()=>{ valEl.textContent=el.value+suffix; if(cb)cb(); updatePreview(); });
}
wireSlider(bgPadding,   bgPaddingVal,  '');
wireSlider(bgRotation,  bgRotationVal, '°');
wireSlider(bgOpacity,   bgOpacityVal,  '%');
wireSlider(strokeWidth, strokeWidthVal,'');
wireSlider(shadowBlur,  shadowBlurVal, '');
wireSlider(shadowOffset,shadowOffsetVal,'');
wireSlider(shadowOpacity,shadowOpacityVal,'%');

// ─── Color sync helpers ───────────────────────────────────────────────────────
function wireColorPair(picker, hex) {
  picker.addEventListener('input',()=>{ hex.value=picker.value; updatePreview(); });
  hex.addEventListener('input',()=>{ if(/^#[0-9a-fA-F]{6}$/.test(hex.value)){picker.value=hex.value; updatePreview();}});
}
wireColorPair(colorPicker, colorHex);
wireColorPair(bgColor1, bgHex1);
wireColorPair(bgColor2, bgHex2);
wireColorPair(strokeColor, strokeHex);
wireColorPair(shadowColor, shadowHex);

// gradient toggle
bgGradient.addEventListener('change',()=>{
  bgColor2Row.style.opacity = bgGradient.checked?'1':'0.35';
  bgColor2Row.style.pointerEvents = bgGradient.checked?'auto':'none';
  updatePreview();
});

// all other toggles
[colorEnabled,bgEnabled,strokeEnabled,shadowEnabled].forEach(t=>t.addEventListener('change',updatePreview));
resetColor.addEventListener('click',()=>{ colorEnabled.checked=false; colorPicker.value='#ffffff'; colorHex.value='#ffffff'; updatePreview(); });

// ─── Utilities ────────────────────────────────────────────────────────────────
function detectFilename(s) {
  try {
    const doc = new DOMParser().parseFromString(s,'image/svg+xml');
    const el = doc.querySelector('svg'); if(!el) return 'icon';
    const cls = el.getAttribute('class')||'';
    const m = cls.match(/(?:lucide-|icon-|ic-|svg-)([a-z0-9-]+)/i);
    if(m) return m[1];
    const id = el.getAttribute('id'); if(id&&id.trim()) return id.trim().replace(/\s+/g,'-');
    const lbl = el.getAttribute('aria-label'); if(lbl&&lbl.trim()) return lbl.trim().toLowerCase().replace(/\s+/g,'-');
    const title = el.querySelector('title'); if(title&&title.textContent.trim()) return title.textContent.trim().toLowerCase().replace(/\s+/g,'-');
    return 'icon';
  } catch{ return 'icon'; }
}

function getOriginalSize(s) {
  try {
    const doc = new DOMParser().parseFromString(s,'image/svg+xml');
    const el = doc.querySelector('svg'); if(!el) return {w:24,h:24};
    let w=parseFloat(el.getAttribute('width')), h=parseFloat(el.getAttribute('height'));
    if(!w||!h){ const vb=el.getAttribute('viewBox'); if(vb){const p=vb.trim().split(/[\s,]+/); if(p.length===4){w=parseFloat(p[2]);h=parseFloat(p[3]);}}}
    return {w:w||24,h:h||24};
  } catch{ return {w:24,h:24}; }
}

function applyIconMods(svgString) {
  const doc = new DOMParser().parseFromString(svgString,'image/svg+xml');
  const el = doc.querySelector('svg'); if(!el) return svgString;
  if(colorEnabled.checked){
    const hex=colorHex.value;
    doc.querySelectorAll('*').forEach(n=>{
      ['stroke','fill','color'].forEach(a=>{ if(n.getAttribute(a)==='currentColor') n.setAttribute(a,hex); });
      const st=n.getAttribute('style')||''; if(st.includes('currentColor')) n.setAttribute('style',st.replace(/currentColor/g,hex));
    });
    el.style.color=hex;
  }
  if(sizeEnabled.checked){
    const w=parseInt(sizeW.value)||null, h=parseInt(sizeH.value)||null;
    if(w) el.setAttribute('width',w); if(h) el.setAttribute('height',h);
  }
  return new XMLSerializer().serializeToString(doc.documentElement);
}

// ─── Composite canvas render ──────────────────────────────────────────────────
// Returns a Promise<canvas> with bg shape + icon rendered
function renderComposite(canvasSize) {
  return new Promise((resolve, reject)=>{
    if(!parsedSvg) return reject('no svg');
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize; canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    const padding = parseInt(bgPadding.value);
    const rotation = parseInt(bgRotation.value) * Math.PI/180;
    const opacity = parseInt(bgOpacity.value)/100;
    const doGradient = bgGradient.checked;
    const col1 = bgColor1.value, col2 = bgColor2.value;
    const doStroke = strokeEnabled.checked;
    const sCol = strokeColor.value, sW = parseInt(strokeWidth.value);
    const doShadow = shadowEnabled.checked;
    const shCol = shadowColor.value, shBlur=parseInt(shadowBlur.value);
    const shOff=parseInt(shadowOffset.value), shOp=parseInt(shadowOpacity.value)/100;
    const doBackground = bgEnabled.checked;

    const cx = canvasSize/2, cy = canvasSize/2;

    // ─ Draw background shape
    if(doBackground) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // shadow
      if(doShadow) {
        const rgba = hexToRgba(shCol, shOp);
        ctx.shadowColor = rgba;
        ctx.shadowBlur = shBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = shOff;
      }

      // fill
      const shapeSize = canvasSize * 0.96;
      ctx.beginPath();
      const shapeObj = SHAPES.find(s=>s.id===selectedShape);
      if(shapeObj) shapeObj.draw(ctx, shapeSize);

      if(doGradient) {
        const grad = ctx.createLinearGradient(0,-shapeSize/2,0,shapeSize/2);
        grad.addColorStop(0, hexToRgba(col1, opacity));
        grad.addColorStop(1, hexToRgba(col2, opacity));
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = hexToRgba(col1, opacity);
      }
      ctx.fill();

      // stroke (no shadow)
      if(doStroke && sW>0) {
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = sCol;
        ctx.lineWidth = sW;
        ctx.beginPath();
        if(shapeObj) shapeObj.draw(ctx, shapeSize);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ─ Draw SVG icon centered
    const modSvg = applyIconMods(parsedSvg);
    const orig = getOriginalSize(parsedSvg);
    const iconArea = canvasSize - padding*2;
    const iconDoc = new DOMParser().parseFromString(modSvg,'image/svg+xml');
    const iconEl = iconDoc.querySelector('svg');
    iconEl.setAttribute('width', iconArea);
    iconEl.setAttribute('height', iconArea);
    const finalSvg = new XMLSerializer().serializeToString(iconEl);
    const blob = new Blob([finalSvg],{type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = ()=>{
      ctx.drawImage(img, padding, padding, iconArea, iconArea);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = ()=>{ URL.revokeObjectURL(url); reject('img load fail'); };
    img.src = url;
  });
}

function hexToRgba(hex, alpha=1) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Preview update ───────────────────────────────────────────────────────────
function updatePreview() {
  const raw = svgInput.value.trim();
  if(!raw) {
    parsedSvg=null;
    previewBox.innerHTML='<span class="preview-hint">Paste SVG above to preview</span>';
    filenameDisplay.textContent='—';
    downloadSvg.disabled=true; downloadPng.disabled=true;
    return;
  }
  const doc = new DOMParser().parseFromString(raw,'image/svg+xml');
  if(doc.querySelector('parsererror')) {
    previewBox.innerHTML='<span class="preview-hint" style="color:#ff6a6a">Invalid SVG</span>';
    parsedSvg=null; downloadSvg.disabled=true; downloadPng.disabled=true; return;
  }
  parsedSvg=raw;
  const orig=getOriginalSize(raw); aspectRatio=orig.w/orig.h;
  if(!sizeEnabled.checked){sizeW.placeholder=orig.w; sizeH.placeholder=orig.h;}
  filenameDisplay.textContent=detectFilename(raw)+'.svg / .png';
  downloadSvg.disabled=false; downloadPng.disabled=false;

  // Render preview at 110px
  const previewSize = bgEnabled.checked ? 100 : 80;
  renderComposite(previewSize).then(canvas=>{
    previewBox.innerHTML='';
    canvas.style.animation='pop-in .22s cubic-bezier(.34,1.56,.64,1) both';
    previewBox.appendChild(canvas);
  }).catch(()=>{
    // fallback: show raw svg
    previewBox.innerHTML='';
    const tmp=document.createElement('div');
    tmp.innerHTML=applyIconMods(raw);
    const svgEl=tmp.querySelector('svg');
    if(svgEl){svgEl.style.maxWidth='80px';svgEl.style.maxHeight='80px';svgEl.removeAttribute('width');svgEl.removeAttribute('height');previewBox.appendChild(svgEl);}
  });
}

// ─── Input events ─────────────────────────────────────────────────────────────
svgInput.addEventListener('input', updatePreview);
clearBtn.addEventListener('click',()=>{svgInput.value='';updatePreview();});

presetBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const s=parseInt(btn.dataset.size);
    sizeEnabled.checked=true; sizeW.value=s; sizeH.value=s;
    presetBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    updatePreview();
  });
});
sizeW.addEventListener('input',()=>{
  if(lockAR.checked&&!ignoreNextSize){const w=parseFloat(sizeW.value);if(w){ignoreNextSize=true;sizeH.value=Math.round(w/aspectRatio);ignoreNextSize=false;}}
  presetBtns.forEach(b=>b.classList.remove('active')); updatePreview();
});
sizeH.addEventListener('input',()=>{
  if(lockAR.checked&&!ignoreNextSize){const h=parseFloat(sizeH.value);if(h){ignoreNextSize=true;sizeW.value=Math.round(h*aspectRatio);ignoreNextSize=false;}}
  presetBtns.forEach(b=>b.classList.remove('active')); updatePreview();
});
sizeEnabled.addEventListener('change',updatePreview);

// ─── Build SVG output with background ────────────────────────────────────────
function buildFinalSvg() {
  if(!parsedSvg) return null;
  const exportSize = sizeEnabled.checked ? (parseInt(sizeW.value)||256) : 256;
  const padding = parseInt(bgPadding.value);
  const rotation = parseInt(bgRotation.value);
  const opacity = parseInt(bgOpacity.value)/100;
  const doGradient = bgGradient.checked;
  const col1 = bgColor1.value, col2 = bgColor2.value;
  const doStroke = strokeEnabled.checked;
  const sCol = strokeColor.value, sW = parseInt(strokeWidth.value);
  const doShadow = shadowEnabled.checked;
  const shCol = shadowColor.value, shBlur=parseInt(shadowBlur.value);
  const shOff=parseInt(shadowOffset.value), shOp=parseInt(shadowOpacity.value)/100;
  const doBackground = bgEnabled.checked;

  // Get shape path
  const canvas = document.createElement('canvas');
  canvas.width=exportSize; canvas.height=exportSize;
  const ctx=canvas.getContext('2d');
  ctx.translate(exportSize/2,exportSize/2);
  const shapeSize=exportSize*0.96;
  const shapeObj=SHAPES.find(s=>s.id===selectedShape);
  ctx.beginPath(); if(shapeObj) shapeObj.draw(ctx,shapeSize);
  const path2d = ctx; // we'll use SVG polygon/path directly

  // Build the icon SVG part
  const modSvg = applyIconMods(parsedSvg);
  const iconDoc = new DOMParser().parseFromString(modSvg,'image/svg+xml');
  const iconEl = iconDoc.querySelector('svg');
  const iconSize = exportSize - padding*2;
  iconEl.setAttribute('width',iconSize); iconEl.setAttribute('height',iconSize);
  const iconContent = new XMLSerializer().serializeToString(iconEl);

  // Build shape SVG polygon points
  const shapePoints = getShapePoints(selectedShape, exportSize);

  let fillDef, fillAttr;
  if(doGradient){
    fillDef=`<defs><linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col1}" stop-opacity="${opacity}"/><stop offset="100%" stop-color="${col2}" stop-opacity="${opacity}"/></linearGradient></defs>`;
    fillAttr='fill="url(#bg-grad)"';
  } else {
    fillDef='';
    fillAttr=`fill="${col1}" fill-opacity="${opacity}"`;
  }

  let shadowFilter='', filterAttr='';
  if(doShadow){
    const shRgba=`rgba(${parseInt(shCol.slice(1,3),16)},${parseInt(shCol.slice(3,5),16)},${parseInt(shCol.slice(5,7),16)},${shOp})`;
    shadowFilter=`<filter id="shf" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="${shOff}" stdDeviation="${shBlur/2}" flood-color="${shRgba}"/></filter>`;
    filterAttr='filter="url(#shf)"';
  }

  const strokeAttr=doStroke&&sW>0 ? `stroke="${sCol}" stroke-width="${sW}"` : 'stroke="none"';

  const bgShape = doBackground ? `
    <g transform="rotate(${rotation},${exportSize/2},${exportSize/2})" ${filterAttr}>
      ${shapePoints ? `<path d="${shapePoints}" ${fillAttr} ${strokeAttr}/>` : ''}
    </g>` : '';

  const out=`<svg xmlns="http://www.w3.org/2000/svg" width="${exportSize}" height="${exportSize}" viewBox="0 0 ${exportSize} ${exportSize}">
  <defs>
    ${doGradient?`<linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col1}" stop-opacity="${opacity}"/><stop offset="100%" stop-color="${col2}" stop-opacity="${opacity}"/></linearGradient>`:''}
    ${doShadow?`<filter id="shf" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="${shOff}" stdDeviation="${shBlur/2}" flood-color="${shCol}" flood-opacity="${shOp}"/></filter>`:''}
  </defs>
  ${doBackground?`<g transform="rotate(${rotation},${exportSize/2},${exportSize/2})" ${doShadow?'filter="url(#shf)"':''}>
    <path d="${shapePoints||''}" ${fillAttr} ${strokeAttr}/>
  </g>`:''}
  <g transform="translate(${padding},${padding})" width="${iconSize}" height="${iconSize}">
    ${iconContent}
  </g>
</svg>`;
  return out;
}

// Build SVG path string for a shape centered at exportSize/2
function getShapePoints(shapeId, size) {
  const cx=size/2, cy=size/2, r=size/2*0.96;
  function polyPts(sides,startAngle=0){
    let d='';
    for(let i=0;i<sides;i++){
      const a=startAngle+(i*Math.PI*2/sides);
      d+=(i===0?'M':'L')+((cx+Math.cos(a)*r).toFixed(2))+','+(cy+Math.sin(a)*r).toFixed(2);
    }
    return d+'Z';
  }
  switch(shapeId){
    case 'square':    return roundedRectPath(cx-r,cy-r,r*2,r*2,r*0.12);
    case 'squircle':  return roundedRectPath(cx-r,cy-r,r*2,r*2,r*0.32);
    case 'circle':    return `M${cx+r},${cy} A${r},${r} 0 1,1 ${cx-r},${cy} A${r},${r} 0 1,1 ${cx+r},${cy}`;
    case 'triangle':  return polyPts(3,-Math.PI/2);
    case 'pentagon':  return polyPts(5,-Math.PI/2);
    case 'hexagon':   return polyPts(6,0);
    case 'heptagon':  return polyPts(7,-Math.PI/2);
    case 'octagon':   return polyPts(8,Math.PI/8);
    case 'diamond':   return polyPts(4,0);
    case 'star':      return starPath(cx,cy,r,r*0.45,5);
    case 'seal':      return starPath(cx,cy,r,r*0.82,12);
    case 'shield':    return shieldPath(cx,cy,r);
    case 'bookmark':  return bookmarkPath(cx,cy,r);
    case 'cross':     return crossPath(cx,cy,r);
    case 'roundedtri':return roundedTriPath(cx,cy,r);
    default: return polyPts(6,0);
  }
}

function roundedRectPath(x,y,w,h,rx) {
  return `M${x+rx},${y} L${x+w-rx},${y} Q${x+w},${y} ${x+w},${y+rx} L${x+w},${y+h-rx} Q${x+w},${y+h} ${x+w-rx},${y+h} L${x+rx},${y+h} Q${x},${y+h} ${x},${y+h-rx} L${x},${y+rx} Q${x},${y} ${x+rx},${y} Z`;
}

function starPath(cx,cy,outerR,innerR,points){
  const step=Math.PI/points; let d='';
  for(let i=0;i<points*2;i++){
    const r=i%2===0?outerR:innerR;
    const a=i*step-Math.PI/2;
    d+=(i===0?'M':'L')+(cx+Math.cos(a)*r).toFixed(2)+','+(cy+Math.sin(a)*r).toFixed(2);
  }
  return d+'Z';
}

function shieldPath(cx,cy,r){
  return `M${cx},${cy-r} L${(cx+r*0.85).toFixed(2)},${(cy-r*0.6).toFixed(2)} L${(cx+r*0.85).toFixed(2)},${(cy+r*0.1).toFixed(2)} Q${(cx+r*0.85).toFixed(2)},${(cy+r*0.7).toFixed(2)} ${cx},${cy+r} Q${(cx-r*0.85).toFixed(2)},${(cy+r*0.7).toFixed(2)} ${(cx-r*0.85).toFixed(2)},${(cy+r*0.1).toFixed(2)} L${(cx-r*0.85).toFixed(2)},${(cy-r*0.6).toFixed(2)} Z`;
}

function bookmarkPath(cx,cy,r){
  const l=cx-r*0.75, ri=cx+r*0.75, t=cy-r, b=cy+r*0.7;
  return `M${l},${t} L${ri},${t} L${ri},${b} L${cx},${cy+r} L${l},${b} Z`;
}

function crossPath(cx,cy,r){
  const t=r*0.32;
  return `M${cx-t},${cy-r} L${cx+t},${cy-r} L${cx+t},${cy-t} L${cx+r},${cy-t} L${cx+r},${cy+t} L${cx+t},${cy+t} L${cx+t},${cy+r} L${cx-t},${cy+r} L${cx-t},${cy+t} L${cx-r},${cy+t} L${cx-r},${cy-t} L${cx-t},${cy-t} Z`;
}

function roundedTriPath(cx,cy,r) {
  const pts=[];
  for(let i=0;i<3;i++){const a=-Math.PI/2+(i*Math.PI*2/3); pts.push([cx+Math.cos(a)*r*0.9,cy+Math.sin(a)*r*0.9]);}
  let d=`M${((pts[0][0]+pts[2][0])/2).toFixed(2)},${((pts[0][1]+pts[2][1])/2).toFixed(2)}`;
  for(let i=0;i<3;i++){
    const curr=pts[i],next=pts[(i+1)%3];
    d+=` Q${curr[0].toFixed(2)},${curr[1].toFixed(2)} ${((curr[0]+next[0])/2).toFixed(2)},${((curr[1]+next[1])/2).toFixed(2)}`;
  }
  return d+'Z';
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg,type=''){
  toast.textContent=msg; toast.className='toast show '+type;
  setTimeout(()=>{ toast.className='toast'; },2200);
}

// ─── Downloads ────────────────────────────────────────────────────────────────
downloadSvg.addEventListener('click',()=>{
  if(!parsedSvg) return;
  try {
    const out = buildFinalSvg();
    const blob = new Blob([out],{type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const name = detectFilename(parsedSvg)+'.svg';
    chrome.downloads.download({url,filename:name,saveAs:false},()=>{ URL.revokeObjectURL(url); showToast('✓ Saved '+name,'success'); });
  } catch(e){ showToast('Error: '+e.message,'error'); }
});

downloadPng.addEventListener('click',()=>{
  if(!parsedSvg) return;
  const exportSize = sizeEnabled.checked ? (parseInt(sizeW.value)||256) : 256;
  renderComposite(exportSize).then(canvas=>{
    const pngUrl=canvas.toDataURL('image/png');
    const name=detectFilename(parsedSvg)+'.png';
    chrome.downloads.download({url:pngUrl,filename:name,saveAs:false},()=>{
      showToast('✓ Saved '+name+' ('+exportSize+'×'+exportSize+')','success');
    });
  }).catch(e=>showToast('Export failed: '+e,'error'));
});

// ─── Init ─────────────────────────────────────────────────────────────────────
downloadSvg.disabled=true;
downloadPng.disabled=true;
buildShapePicker();