#!/usr/bin/env node
/**
 * mobile-audit — kerapian UI per halaman lewat Moli (CDP, default :9222).
 *
 * Pembagian alat di repo ini:
 *   - browser-gate (brave :9359) → invarian tata letak: kolom, overflow, gutter,
 *     tap target, scroller bersarang, bilah fixed. Angka di 390 & 1440px.
 *   - mobile-audit (moli :9222) → lapisan yang TIDAK diukur gerbang dan butuh
 *     DOM hidup: hierarki font, teks <12px, kontras AA (komposit alpha),
 *     ukuran target, bilah fixed keluar kolom. Ini "mata" scan senior-fe-mobile.
 *
 * Moli tak mendukung Emulation (viewport default ~500px, kolom app 430px tetap
 * berlaku). Karena itu overflow di sini bukan pengganti angka 390px gerbang.
 *
 * Pakai:
 *   node scripts/mobile-audit.mjs --role merchant
 *   node scripts/mobile-audit.mjs --route /customer/home --route /customer/search
 *   node scripts/mobile-audit.mjs --role all --json
 *
 * Env: MOLI_CDP (http://127.0.0.1:9222), AUDIT_BASE (http://localhost:5173).
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CDP = process.env.MOLI_CDP || 'http://127.0.0.1:9222'
const BASE = process.env.AUDIT_BASE || 'http://localhost:5173'

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f, d) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d
}
const routesArg = argv.reduce((a, x, i) => (argv[i - 1] === '--route' ? [...a, x] : a), [])

const ROLES = {
  customer: { base: '/customer', table: 'customerRoutes' },
  merchant: { base: '/merchant', table: 'merchantRoutes' },
  courier: { base: '/courier', table: 'courierRoutes' },
  web: { base: '', table: 'webRoutes' },
}

/** Baca tabel rute dari sumber (sama seperti browser-gate — satu sumber). */
function routesFromSource(role) {
  const src = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8')
  const m = ROLES[role]
  const mm = src.match(new RegExp(`const ${m.table}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\]`))
  if (!mm) throw new Error(`tabel ${m.table} tidak ketemu di src/App.tsx`)
  return [...mm[1].matchAll(/\[\s*'([^']+)'/g)].map((x) => m.base + x[1])
}

const roleOf = (url) => (url.match(/\/(customer|merchant|courier)(?:\/|$)/) || [])[1] || 'web'

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.seq = 0
    this.pend = new Map()
    this.h = new Set()
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data)
      if (m.id && this.pend.has(m.id)) {
        const { res, rej } = this.pend.get(m.id)
        this.pend.delete(m.id)
        m.error ? rej(new Error(m.error.message)) : res(m.result)
      } else if (m.method) for (const f of this.h) f(m)
    }
  }
  static async connect() {
    const list = await (await fetch(`${CDP}/json/list`)).json()
    const page = list.find((t) => t.type === 'page')
    if (!page) throw new Error('tidak ada tab page di moli')
    const ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
      ws.onopen = res
      ws.onerror = () => rej(new Error('websocket CDP gagal'))
    })
    return new Cdp(ws)
  }
  send(method, params = {}) {
    const id = ++this.seq
    return new Promise((res, rej) => {
      this.pend.set(id, { res, rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  on(f) {
    this.h.add(f)
    return () => this.h.delete(f)
  }
  once(method, to = 10000) {
    return new Promise((res) => {
      const off = this.on((m) => {
        if (m.method !== method) return
        off()
        clearTimeout(t)
        res(true)
      })
      const t = setTimeout(() => {
        off()
        res(false)
      }, to)
    })
  }
}

const evaluate = async (cdp, expression) => {
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval gagal')
  return r.result.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Seed sesi demo per peran (authGate) + tolak modal pasang, sama seperti gate. */
const SEED = (role) => `(() => {
  const key='persist:sa7tein'
  const raw=JSON.parse(localStorage.getItem(key)||'{}')
  raw.auth=JSON.stringify({user:null,isAuthenticated:true,role:${JSON.stringify(role)},isLoading:false})
  raw._persist=JSON.stringify({version:5,rehydrated:true})
  localStorage.setItem(key,JSON.stringify(raw))
  localStorage.setItem('sa7tein:install-prompt-dismissed','1')
  return 'ok'
})()`

const AUDIT = `(() => {
  const vis=e=>{const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0)return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0};
  const box=e=>{const b=e.getBoundingClientRect();return{w:Math.round(b.width),h:Math.round(b.height)}};
  const lab=e=>(e.getAttribute('aria-label')||e.innerText||e.className||e.tagName).trim().replace(/\\s+/g,' ').slice(0,34);
  const doc=document.documentElement;
  const tm=parseFloat(getComputedStyle(doc).getPropertyValue('--touch-min'))||44;
  const shell=document.querySelector('.app-shell')||document.querySelector('div[class*="-screen"]')||document.querySelector('div[class*="-page"]')||document.body.firstElementChild;
  const sr=shell?shell.getBoundingClientRect():{width:0,x:0};
  const ctrls=[...document.querySelectorAll('button,input:not([type=hidden]),select,textarea,a[href],[role=button],[role=tab],[role=radio]')].filter(vis).filter(e=>!e.closest('[aria-hidden=true]')).filter(e=>!(e.className&&/leaflet-/.test(String(e.className))));
  const small=ctrls.map(e=>({l:lab(e),...box(e)})).filter(b=>b.w<tm||b.h<tm);
  const fixed=[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).position==='fixed'&&vis(e)).map(e=>({l:lab(e),...box(e),x:Math.round(e.getBoundingClientRect().x)})).filter(f=>f.w>=200);
  const leaves=[...document.querySelectorAll('body *')].filter(e=>!e.children.length&&vis(e)&&(e.textContent||'').trim());
  const tiny=leaves.filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({t:(e.textContent||'').trim().slice(0,22),fs:Math.round(parseFloat(getComputedStyle(e).fontSize)*10)/10}));
  const rgb=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(',').map(Number);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
  const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b)};
  const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
  const hasImg=e=>{let n=e;while(n){if(getComputedStyle(n).backgroundImage!=='none')return true;n=n.parentElement}return false};
  const bgOf=e=>{let cur={r:255,g:255,b:255,a:1};const ch=[];let n=e;while(n){const c=rgb(getComputedStyle(n).backgroundColor);if(c&&c.a>0)ch.push(c);n=n.parentElement}for(let i=ch.length-1;i>=0;i--)cur=over(ch[i],cur);return cur};
  const ratio=(a,b)=>{const l1=lum(a),l2=lum(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);return(hi+0.05)/(lo+0.05)};
  const low=leaves.filter(e=>!hasImg(e)).map(e=>{const fs=parseFloat(getComputedStyle(e).fontSize);const col=rgb(getComputedStyle(e).color);if(!col||col.a===0)return null;const bg=bgOf(e);const cr=ratio(over(col,bg),bg);const large=fs>=24||(fs>=18.66&&parseInt(getComputedStyle(e).fontWeight)>=700);const min=large?3:4.5;return cr<min?{t:(e.textContent||'').trim().slice(0,24),cls:String(e.className).slice(0,40),fs:Math.round(fs*10)/10,cr:Math.round(cr*100)/100,bg:'#'+[bg.r,bg.g,bg.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}:null}).filter(Boolean);
  return {url:location.pathname,vw:innerWidth,shell:Math.round(sr.width),overflow:doc.scrollWidth-doc.clientWidth,
    small:small.slice(0,12), fixedOut:fixed.filter(f=>f.x<sr.x-2||f.x+f.w>sr.x+sr.width+2),
    tiny:tiny.slice(0,12), low:low.slice(0,14)};
})()`

async function main() {
  const roleArg = val('--role', 'customer')
  const urls = routesArg.length
    ? routesArg
    : (roleArg === 'all' ? Object.keys(ROLES) : [roleArg]).flatMap((r) => routesFromSource(r))

  const cdp = await Cdp.connect()
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')

  const out = []
  let seededRole = null
  for (const url of urls) {
    const abs = url.startsWith('http') ? url : BASE + url
    const m = abs.replace(BASE, '')
    const r = roleOf(abs)
    if (r !== seededRole) {
      // localStorage per-origin: cukup buka halaman mana pun di origin yang sama
      // untuk menulis sesi, lalu rute yang diaudit membacanya saat mount.
      await cdp.send('Page.navigate', { url: `${BASE}/` })
      await sleep(300)
      await evaluate(cdp, SEED(`/${r}`)).catch(() => {})
      seededRole = r
    }
    let row
    try {
      const loaded = cdp.once('Page.loadEventFired', 12000)
      await cdp.send('Page.navigate', { url: abs })
      await loaded
      await sleep(700)
      row = await evaluate(cdp, AUDIT)
    } catch (e) {
      row = { url: m, error: String(e).slice(0, 100) }
    }
    out.push(row)

    if (!has('--json')) {
      if (row.error) {
        console.log(`FAIL ${row.url}  ${row.error}`)
        continue
      }
      const flag = (row.overflow ? ` overflow=${row.overflow}` : '') + (row.fixedOut.length ? ` fixedOut=${row.fixedOut.length}` : '')
      console.log(`\n${row.url}  shell=${row.shell} vw=${row.vw}${flag || ' · layout ok'}`)
      for (const s of row.small) console.log(`  TAP  ${s.w}x${s.h}  "${s.l}"`)
      for (const t of row.tiny) console.log(`  TINY ${t.fs}px  "${t.t}"`)
      for (const c of row.low) console.log(`  LOW  ${c.cr}:1  ${c.fs}px  "${c.t}"  (${c.cls || '?'} bg ${c.bg})`)
      if (!row.small.length && !row.tiny.length && !row.low.length && !row.overflow && !row.fixedOut.length) console.log('  bersih')
    }
  }

  cdp.ws.close()
  if (has('--json')) console.log(JSON.stringify(out, null, 1))
  process.exit(0)
}

main().catch((e) => {
  console.error(`mobile-audit gagal: ${e.message}`)
  process.exit(2)
})
