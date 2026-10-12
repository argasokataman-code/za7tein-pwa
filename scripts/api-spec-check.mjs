// E2E verification of docs/design/flows/API-SPEC.md against the live Supabase BE.
//
// Read-only: SELECTs only. One intentional rejected write (customer INSERT chat_messages)
// used to prove the documented 403. Serial + throttled, no parallelism (no DoS).
//
// Usage:
//   node scripts/api-spec-check.mjs            # verifies docs/design/flows/API-SPEC.md
//   node scripts/api-spec-check.mjs path.md    # custom spec file
//
// Env overrides (defaults are the demo project + demo accounts documented in AGENTS.md):
//   SBE_URL, SBE_ANON, SBE_PASSWORD
//
// Exit code 1 if any FAIL.

import fs from 'node:fs'

const DOC = process.argv[2] || 'docs/design/flows/API-SPEC.md'
const U = process.env.SBE_URL || 'https://dwzxtnfesmpobnepilhl.supabase.co'
const K = process.env.SBE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3enh0bmZlc21wb2JuZXBpbGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTk4NjgsImV4cCI6MjEwMzE3NTg2OH0.HFHrFYuq3l6B4mcqJy13-Loat0-36KenQ8feBCKWqAE'
const PW = process.env.SBE_PASSWORD || 'demo1234'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let pass = 0, fail = 0, info = 0
const R = []
const ok = (m) => { pass++; R.push('OK   ' + m) }
const bad = (m) => { fail++; R.push('FAIL ' + m) }
const note = (m) => { info++; R.push('INFO ' + m) }

async function login (email) {
  const r = await fetch(`${U}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: K, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PW })
  })
  const j = await r.json().catch(() => ({}))
  return j.access_token || null
}
async function get (path, token) {
  const r = await fetch(`${U}/rest/v1/${path}`, { headers: { apikey: K, Authorization: `Bearer ${token || K}` } })
  const text = await r.text()
  let body; try { body = JSON.parse(text) } catch { body = text }
  return { status: r.status, body }
}
const keysOf = (body) => (Array.isArray(body) && body[0] ? Object.keys(body[0]).sort() : null)

// Documented column sets, §2.1 (must match live exactly).
const COLS = {
  users: 'id,auth_user_id,role,email,phone,verified,status,auth_provider,created_at,name,dob,gender,avatar',
  customers: 'id,user_id,name,risk_flag,created_at,avatar,status',
  customer_risk_flags: 'id,customer_id,reason,by_operator_id,at',
  addresses: 'id,user_id,label,address,latitude,longitude,is_default,zone_id,zone_code,created_at,name,building,floor,unit,notes,city,full_address',
  merchants: 'id,user_id,store_name,store_phone,store_address,latitude,longitude,description,photo,delivery_config,tenant_status,deposit_jod,deposit_status,created_at,store_status,rating_avg,rating_count,open_time,close_time,owner,owner_phone,city,tier,is_active_hijazi,is_active_syimali,cod_issues,approved_at,status_reason',
  menus: 'id,merchant_id,name,description,price_jod,available,image,stock,category,created_at,cook_minutes,discount_percent,is_popular,calories',
  menu_variants: 'id,menu_id,name,required,max_select,options,created_at',
  couriers: 'id,user_id,merchant_id,name,availability,latitude,longitude,last_seen_at,photo,vehicle,created_at,phone,phone_verified,active_order_count',
  orders: 'id,code,status,customer_id,merchant_id,delivery_address_id,batch_id,courier_id,sub_total_jod,delivery_fee_jod,platform_fee_jod,tip_jod,promo_amount_jod,total_jod,total_idr,zone_id,zone_code,promo_id,payment_method,payment_status,paid_at,hold_status,created_at,placed_at,cancel_reason,cancel_by,order_note,otp,otp_verified,cook_minutes',
  checkpoints: 'id,order_id,kind,latitude,longitude,proof_photo,note,at',
  deposits: 'id,merchant_id,kind,amount_jod,status,verified_by,verified_at,created_at',
  merchant_credits: 'id,merchant_id,balance_jod,rebate_tier,rebate_period,rebate_amount_jod,rebate_paid_at,non_withdrawable,updated_at',
  merchant_credit_events: 'id,merchant_id,event,amount_jod,at',
  cashback_tiers: 'id,tier,min_volume_jod,pct,threshold_orders,amount_jod',
  chats: 'id,order_id,last_message,last_at,created_at',
  chat_messages: 'id,chat_id,sender_id,channel,body,at,read_at',
  notifications: 'id,user_id,kind,title,body,sound,read,created_at,audience',
  rating_reviews: 'id,order_id,customer_id,merchant_id,menu_id,rating,review,window_closes_at,edited_at,deleted_at,created_at',
  zones: 'id,code,name,polygon,created_at',
  roles: 'id,key,name,permissions',
  operators: 'id,user_id,role_id,active,created_by,created_at',
  platform_switches: 'key,enabled,updated_at,updated_by',
  wallets: 'id,user_id,balance_jod,reserved_balance_jod,updated_at'
}
const EMPTY_DOC = ['order_items', 'batches', 'wallet_ledgers', 'wallet_holds', 'topups', 'cashouts', 'fees', 'taxes', 'exchange_rates', 'protection_fund', 'chat_participants', 'disputes', 'dispute_appeals', 'review_replies', 'audit_logs', 'tax_reports', 'platform_profit', 'phone_verifications', 'push_subscriptions']
const ABSENT_DOC = ['incident_resolutions', 'liabilities']

async function main () {
  if (!fs.existsSync(DOC)) { console.error('spec file not found: ' + DOC); process.exit(2) }
  const cs = await login('cs@sa7tein.app')
  const courier = await login('courier@sa7tein.app')
  const merchant = await login('merchant@sa7tein.app')
  const customer = await login('customer@sa7tein.app')
  R.push(`# spec=${DOC} tokens: cs=${!!cs} courier=${!!courier} merchant=${!!merchant} customer=${!!customer}`)
  if (!cs) { console.error('login failed — check SBE_URL / SBE_PASSWORD'); process.exit(2) }

  // 1. documented non-empty tables: exact column set
  R.push('\n## 1. Kolom tabel berisi (§2.1 vs live)')
  for (const [t, docCols] of Object.entries(COLS)) {
    const { status, body } = await get(`${t}?select=*&limit=1`, cs); await sleep(40)
    if (status !== 200) { bad(`${t}: HTTP ${status}`); continue }
    const live = keysOf(body)
    if (!live) { note(`${t}: 0 baris (tak bisa dibanding)`); continue }
    const want = docCols.split(',').sort()
    const miss = want.filter((c) => !live.includes(c))
    const extra = live.filter((c) => !want.includes(c))
    if (!miss.length && !extra.length) ok(`${t}: ${live.length} kolom persis`)
    else bad(`${t}: kurang=[${miss}] lebih=[${extra}] (doc ${want.length} vs live ${live.length})`)
  }

  // 1b. "(N)" labels in §2.1 vs live count
  R.push('\n## 1b. Label "(N)" di §2.1 vs jumlah kolom live')
  {
    const md = fs.readFileSync(DOC, 'utf8')
    const re = /^([a-z_]+) \((\d+)\)/gm
    let m
    while ((m = re.exec(md))) {
      const [, t, label] = m
      const { status, body } = await get(`${t}?select=*&limit=1`, cs); await sleep(40)
      const live = status === 200 && Array.isArray(body) && body[0] ? Object.keys(body[0]).length : null
      if (live === null) { note(`${t}: label (${label}), live tak bisa dihitung (kosong)`); continue }
      if (live === Number(label)) ok(`${t}: (${label}) = live ${live}`)
      else bad(`${t}: dokumen tulis (${label}), live ${live}`)
    }
  }

  // 2. documented empty tables
  R.push('\n## 2. Tabel "kosong" (§2.2)')
  let emptyConfirmed = 0
  for (const t of EMPTY_DOC) {
    const { status, body } = await get(`${t}?select=*&limit=1`, cs); await sleep(40)
    if (status !== 200) bad(`${t}: HTTP ${status} (doc bilang ada)`)
    else if (Array.isArray(body) && body.length === 0) { emptyConfirmed++; ok(`${t}: ada & kosong`) }
    else bad(`${t}: doc bilang kosong tapi ada ${Array.isArray(body) ? body.length : '?'} baris`)
  }
  note(`kosong terkonfirmasi: ${emptyConfirmed}/${EMPTY_DOC.length}`)

  // 3. documented absent tables
  R.push('\n## 3. Tabel "absen" (§2.3)')
  for (const t of ABSENT_DOC) {
    const { status, body } = await get(`${t}?select=*&limit=1`, cs); await sleep(40)
    if (status === 404 && body && body.code === 'PGRST205') ok(`${t}: 404 PGRST205`)
    else bad(`${t}: doc bilang 404, live HTTP ${status}`)
  }

  // 4. FK embeddings (§2.5, corrected)
  R.push('\n## 4. Relasi FK (§2.5)')
  const fk = (from, to, col) => [`${from}?select=id,${to}(${col})&limit=1`, 200]
  const rels = [
    fk('orders', 'merchants', 'store_name'), fk('orders', 'couriers', 'name'),
    fk('orders', 'addresses', 'id'), fk('orders', 'zones', 'code'), fk('orders', 'batches', 'id'),
    fk('orders', 'chats', 'id'), fk('orders', 'disputes', 'id'), fk('orders', 'order_items', 'id'), fk('orders', 'rating_reviews', 'id'),
    fk('merchants', 'menus', 'name'), fk('menus', 'menu_variants', 'name'), fk('merchants', 'couriers', 'name'),
    fk('merchants', 'deposits', 'id'), fk('merchants', 'merchant_credits', 'id'), fk('merchant_credits', 'merchants', 'store_name'),
    fk('merchant_credit_events', 'merchants', 'store_name'),
    fk('merchants', 'users', 'email'), fk('couriers', 'users', 'email'),
    fk('chats', 'chat_messages', 'body'), fk('chats', 'chat_participants', 'user_id'),
    fk('rating_reviews', 'review_replies', 'id'), fk('roles', 'operators', 'id'),
    fk('users', 'addresses', 'id'), fk('users', 'wallets', 'id'), fk('users', 'notifications', 'id'),
    fk('users', 'push_subscriptions', 'id'), fk('users', 'chat_messages', 'body'),
    fk('checkpoints', 'orders', 'code'), fk('addresses', 'zones', 'code'),
    fk('orders', 'customers', 'name'), fk('customers', 'users', 'email'),
    fk('customer_risk_flags', 'customers', 'name'), fk('customer_risk_flags', 'users', 'email'),
    fk('dispute_appeals', 'disputes', 'id'),
    ['operators?select=id,users!operators_user_id_fkey(email)&limit=1', 200],
    ['operators?select=id,creator:users!operators_created_by_fkey(email)&limit=1', 200],
    // §2.5: these relations deliberately do NOT exist
    ['orders?select=id,users(email)&limit=1', 400],
    ['merchant_credits?select=id,merchant_credit_events(event)&limit=1', 400]
  ]
  for (const [path, want] of rels) {
    const { status, body } = await get(path, cs); await sleep(40)
    const label = path.replace(/&limit=1$/, '').slice(0, 66)
    if (status === want) ok(`${label}  (HTTP ${status})`)
    else bad(`${label}: HTTP ${status}, dokumen bilang ${want} ${(body && body.message || '').slice(0, 50)}`)
  }

  // 5. documented client queries (must work)
  R.push('\n## 5. Query klien yang didokumentasikan')
  const queries = [
    ['merchants?select=*&order=id.asc', cs], ['merchants?select=*&id=eq.1&limit=1', cs],
    ['menus?select=*&merchant_id=eq.1&order=id.asc', cs], ['menus?select=*&id=eq.9&limit=1', cs],
    ['menu_variants?select=*&menu_id=eq.9', cs], ['users?select=email,phone&id=eq.1&limit=1', cs],
    ['addresses?select=*&user_id=eq.13&order=is_default.desc,id.asc', cs],
    ['push_subscriptions?select=id,endpoint,p256dh,auth,created_at&user_id=eq.1&order=id.desc&limit=1', cs],
    ['merchants?select=latitude,longitude&id=eq.1&limit=1', cs],
    ['merchants?select=store_name,store_phone,store_address,photo,open_time,close_time,delivery_config&id=eq.1&limit=1', cs],
    ['merchants?select=id,store_status&id=eq.1&limit=1', cs],
    ['couriers?select=*&merchant_id=eq.1&order=id.asc', cs],
    ['wallets?select=user_id,balance_jod,reserved_balance_jod&user_id=eq.13&limit=1', cs],
    ['merchant_credits?select=*&merchant_id=eq.1&limit=1', cs],
    ['merchant_credit_events?select=id,event,amount_jod,at&merchant_id=eq.1&order=id.desc', cs],
    ['zones?select=*&order=id.asc', cs], ['roles?select=*&order=id.asc', cs], ['operators?select=*&order=id.asc', cs],
    ['platform_switches?select=key,enabled', cs],
    ['notifications?select=id,kind,title,body,read,created_at&audience=in.(customer,all)&order=created_at.desc&limit=50', cs],
    ['orders?select=id,code,status,customer_id,merchant_id,total_jod,payment_method,zone_code,created_at,placed_at,courier_id&merchant_id=eq.1&order=created_at.desc', merchant],
    ['orders?select=id,code,status,customer_id,merchant_id,total_jod,payment_method,zone_code,created_at,placed_at,courier_id&courier_id=eq.1&order=created_at.desc', courier],
    ['orders?select=id,code,status&id=eq.796&limit=1', customer],
    ['chats?select=id&order_id=eq.796&limit=1', cs],
    ['chat_messages?select=id,sender_id,body,at&chat_id=eq.7&order=id.asc&limit=100', cs],
    ['rating_reviews?select=*&limit=1', cs],
    ['users?select=id,auth_user_id&limit=1', cs],
    ['customers?select=*&limit=2', cs],
    ['customer_risk_flags?select=*&limit=2', cs],
    ['platform_switches?select=key,enabled', customer]
  ]
  for (const [q, tok] of queries) {
    const { status, body } = await get(q, tok); await sleep(40)
    if (status === 200) ok(q.slice(0, 70))
    else bad(`${q.slice(0, 70)}: HTTP ${status} ${(body && body.message || '').slice(0, 70)}`)
  }

  // 6. negative / RLS claims
  R.push('\n## 6. Klaim negatif & RLS')
  {
    const r = await fetch(`${U}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: { apikey: K, Authorization: `Bearer ${customer}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ chat_id: 7, sender_id: 1, body: 'api-spec-check probe (expected reject)', channel: 'courier-customer' })
    })
    await sleep(60)
    if (r.status === 403 || r.status === 401) ok(`customer INSERT chat_messages ditolak: HTTP ${r.status}`)
    else bad(`customer INSERT chat_messages TIDAK ditolak: HTTP ${r.status} (doc bilang 403)`)
  }
  {
    const r = await fetch(`${U}/rest/v1/customer_risk_flags`, {
      method: 'POST',
      headers: { apikey: K, Authorization: `Bearer ${customer}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ customer_id: 1, reason: 'api-spec-check probe (expected reject)', by_operator_id: 1 })
    })
    await sleep(60)
    if (r.status === 403 || r.status === 401) ok(`customer INSERT customer_risk_flags ditolak: HTTP ${r.status} (§5.11 hak CS)`)
    else bad(`customer INSERT customer_risk_flags TIDAK ditolak: HTTP ${r.status} (doc bilang hanya CS)`)
  }
  for (const [who, tok] of [['courier', courier], ['merchant', merchant], ['customer', customer]]) {
    const { status, body } = await get('orders?select=id,otp,otp_verified&limit=2', tok); await sleep(40)
    const leaked = Array.isArray(body) && body.some((x) => x.otp)
    if (status === 200 && leaked) note(`${who} BISA baca orders.otp (§5.5.1 benar): ${JSON.stringify(body[0])}`)
    else if (status === 200) note(`${who}: 200 tapi otp kosong (§5.5.1 perlu dicek)`)
    else note(`${who}: HTTP ${status} (doc bilang bisa baca otp)`)
  }
  {
    const r = await fetch(`${U}/rest/v1/`, { headers: { apikey: K, Authorization: `Bearer ${cs}` } }); await sleep(40)
    if (r.status === 401) ok('OpenAPI PostgREST root 401 (butuh service_role) — klaim §2.2 benar')
    else bad(`OpenAPI root HTTP ${r.status}`)
  }

  // 7. real enum values (informational; §11 lists the canonical contract enums)
  R.push('\n## 7. Enum nyata')
  for (const [col, path] of [
    ['orders.status', 'orders?select=status'], ['orders.payment_method', 'orders?select=payment_method'],
    ['orders.hold_status', 'orders?select=hold_status'], ['checkpoints.kind', 'checkpoints?select=kind'],
    ['users.role', 'users?select=role'], ['users.auth_provider', 'users?select=auth_provider'],
    ['merchants.tenant_status', 'merchants?select=tenant_status'], ['merchants.store_status', 'merchants?select=store_status'],
    ['merchants.deposit_status', 'merchants?select=deposit_status'], ['couriers.availability', 'couriers?select=availability'],
    ['deposits.kind', 'deposits?select=kind'], ['deposits.status', 'deposits?select=status'],
    ['chat_messages.channel', 'chat_messages?select=channel'], ['platform_switches.key', 'platform_switches?select=key'],
    ['cashback_tiers.tier', 'cashback_tiers?select=tier'], ['rating_reviews.rating', 'rating_reviews?select=rating']
  ]) {
    const c = col.split('.')[1]
    const { status, body } = await get(path, cs); await sleep(40)
    if (status !== 200) { bad(`${col}: HTTP ${status}`); continue }
    note(`${col} = ${[...new Set((body || []).map((r) => r[c]))].sort().map((v) => JSON.stringify(v)).join(', ')}`)
  }

  // 8. gateway draft absent
  R.push('\n## 8. Gateway draft (api.sa7tein.app)')
  try {
    const r = await fetch('https://api.sa7tein.app/openapi.yaml', { redirect: 'manual' })
    if (r.status >= 400) ok(`api.sa7tein.app/openapi.yaml -> HTTP ${r.status} (belum deploy, sesuai §0)`)
    else note(`api.sa7tein.app/openapi.yaml -> HTTP ${r.status} (doc bilang belum dideploy)`)
  } catch (e) {
    ok(`api.sa7tein.app tidak resolve (${String(e.message).slice(0, 60)}) — sesuai §0`)
  }

  R.push(`\n===== HASIL: ${pass} OK, ${fail} FAIL, ${info} INFO =====`)
  console.log(R.join('\n'))
  if (fail) process.exitCode = 1
}

main().catch((e) => { console.error('HARNESS ERROR', e); process.exit(2) })
