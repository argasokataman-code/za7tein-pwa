/* Sa7tein Ops — interaksi mock.
 *
 * Dua hal saja:
 *   1. dropdown bergaya Sa7tein (bukan <select> peramban)
 *   2. dialog validasi/konfirmasi bergaya Sa7tein (bukan alert/confirm peramban)
 *
 * Tidak ada penyimpanan. Tombol hanya menunjukkan keadaan desain.
 */
(() => {
  'use strict'

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

  /* ── Dropdown ─────────────────────────────────────────────────────────── */

  function closeAllSelects(except = null) {
    $$('.select.is-open').forEach((root) => {
      if (root === except) return
      root.classList.remove('is-open')
      $('.select-trigger', root)?.setAttribute('aria-expanded', 'false')
    })
  }

  function initSelect(root) {
    const trigger = $('.select-trigger', root)
    const menu = $('.select-menu', root)
    const valueEl = $('[data-select-value]', root)
    const hidden = $('input[type="hidden"]', root)
    const options = $$('[role="option"]', menu)
    if (!trigger || !menu || options.length === 0) return

    // `label for` yang menunjuk <button> memicu klik ganda di sebagian peramban:
    // klik pertama membuka, klik label menutup lagi. Pindahkan ke aria-labelledby.
    const label = root.parentElement?.querySelector(':scope > label')
    if (label && label.htmlFor === trigger.id) {
      if (!label.id) label.id = `${trigger.id}-label`
      label.htmlFor = ''
      trigger.setAttribute('aria-labelledby', label.id)
    }

    options.forEach((option) => { option.tabIndex = -1 })

    let active = options.findIndex((option) => option.getAttribute('aria-selected') === 'true')
    if (active < 0) {
      active = 0
      options[0].setAttribute('aria-selected', 'true')
    }

    const setValue = (option) => {
      options.forEach((item) => item.setAttribute('aria-selected', String(item === option)))
      const value = option.dataset.value ?? text(option.textContent)
      if (valueEl) valueEl.textContent = text(option.textContent)
      if (hidden) hidden.value = value
      root.dataset.value = value
      trigger.classList.remove('is-invalid')
      root.dispatchEvent(new CustomEvent('selectchange', { bubbles: true, detail: { value } }))
    }

    const open = () => {
      closeAllSelects(root)
      root.classList.add('is-open')
      trigger.setAttribute('aria-expanded', 'true')
      const selected = options.findIndex((option) => option.getAttribute('aria-selected') === 'true')
      active = selected < 0 ? 0 : selected
      options[active].focus()
    }

    const close = (focusTrigger = false) => {
      root.classList.remove('is-open')
      trigger.setAttribute('aria-expanded', 'false')
      if (focusTrigger) trigger.focus()
    }

    trigger.addEventListener('click', () => {
      if (root.classList.contains('is-open')) close(true)
      else open()
    })

    trigger.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        open()
      }
    })

    options.forEach((option) => {
      option.addEventListener('click', () => {
        setValue(option)
        close(true)
      })
    })

    menu.addEventListener('keydown', (event) => {
      const index = options.indexOf(document.activeElement)
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const next = event.key === 'ArrowDown'
          ? (index + 1) % options.length
          : (index - 1 + options.length) % options.length
        options[next].focus()
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        options[event.key === 'Home' ? 0 : options.length - 1].focus()
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setValue(options[index] ?? options[0])
        close(true)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
      } else if (event.key === 'Tab') {
        close(false)
      }
    })

    root._closeSelect = () => close(false)
    setValue(options.find((option) => option.getAttribute('aria-selected') === 'true') ?? options[0])
  }

  $$('.select').forEach(initSelect)

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.select')) {
      $$('.select.is-open').forEach((root) => root._closeSelect?.())
    }
  })

  /* ── Dialog ───────────────────────────────────────────────────────────── */

  const ICONS = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  }

  const TOAST_META = {
    success: { label: 'Berhasil', icon: 'check' },
    info: { label: 'Info', icon: 'info' },
    warning: { label: 'Perlu perhatian', icon: 'alert' },
    danger: { label: 'Gagal', icon: 'x' }
  }

  let dialog
  let elements
  let currentAction = null

  function buildDialog() {
    dialog = document.createElement('dialog')
    dialog.className = 'ops-dialog'
    dialog.setAttribute('aria-labelledby', 'ops-dialog-title')
    dialog.setAttribute('aria-describedby', 'ops-dialog-message')
    dialog.innerHTML = `
      <div class="dialog-head">
        <span class="dialog-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"></svg></span>
        <div class="dialog-copy">
          <p class="dialog-kicker"></p>
          <h2 class="dialog-title" id="ops-dialog-title"></h2>
        </div>
        <button class="dialog-x" type="button" data-dialog-close aria-label="Tutup dialog">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="dialog-body">
        <p class="dialog-message" id="ops-dialog-message"></p>
        <div class="dialog-detail" hidden></div>
        <ul class="dialog-list"></ul>
      </div>
      <div class="dialog-actions">
        <button class="btn btn-ghost" type="button" data-dialog-close data-dialog-cancel>Tutup</button>
        <button class="btn btn-primary" type="button" data-dialog-action></button>
      </div>
    `
    document.body.appendChild(dialog)

    elements = {
      icon: $('.dialog-icon svg', dialog),
      kicker: $('.dialog-kicker', dialog),
      title: $('.dialog-title', dialog),
      message: $('.dialog-message', dialog),
      detail: $('.dialog-detail', dialog),
      list: $('.dialog-list', dialog),
      action: $('[data-dialog-action]', dialog),
      cancel: $('[data-dialog-cancel]', dialog),
      close: $('.dialog-x', dialog)
    }

    $$('[data-dialog-close]', dialog).forEach((button) => {
      button.addEventListener('click', () => dialog.close())
    })

    elements.action.addEventListener('click', () => {
      const action = currentAction
      currentAction = null
      if (action) action()
    })

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close()
    })

    dialog.addEventListener('close', () => {
      currentAction = null
      document.body.classList.remove('dialog-open')
    })
  }

  function showDialog(config) {
    if (!dialog) buildDialog()

    const tone = config.tone || 'primary'
    const icon = tone === 'danger' || tone === 'warning' ? 'alert' : tone === 'success' ? 'check' : 'info'

    dialog.dataset.tone = tone
    elements.icon.innerHTML = ICONS[icon]
    elements.kicker.textContent = config.kicker || 'Konfirmasi'
    elements.title.textContent = config.title || ''
    elements.message.textContent = config.message || ''

    elements.detail.hidden = !config.detail
    elements.detail.textContent = config.detail || ''

    elements.list.innerHTML = ''
    ;(config.items || []).forEach((item) => {
      const li = document.createElement('li')
      li.textContent = item
      elements.list.appendChild(li)
    })

    elements.action.textContent = config.actionLabel || ''
    elements.action.classList.toggle('is-hidden', !config.actionLabel)
    elements.cancel.textContent = config.actionLabel ? 'Batal' : 'Tutup'

    currentAction = config.onAction || null

    if (!dialog.open) dialog.showModal()
    document.body.classList.add('dialog-open')

    if (config.actionLabel) elements.cancel.focus()
    else elements.close.focus()
  }

  /* ── Toast ────────────────────────────────────────────────────────────── */

  let toastRegion = null

  function showToast(config = {}) {
    const tone = TOAST_META[config.tone] ? config.tone : 'info'
    const meta = TOAST_META[tone]
    const duration = Math.max(1800, Number(config.duration) || 5200)

    if (!toastRegion) {
      toastRegion = document.createElement('div')
      toastRegion.className = 'toast-region'
      toastRegion.setAttribute('aria-live', 'polite')
      toastRegion.setAttribute('aria-label', 'Notifikasi tindakan')
      document.body.appendChild(toastRegion)
    }

    const toast = document.createElement('div')
    toast.className = 'ops-toast'
    toast.dataset.tone = tone
    toast.setAttribute('role', tone === 'danger' ? 'alert' : 'status')
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"></svg></span>
      <span class="toast-copy">
        <span class="toast-kicker"></span>
        <strong class="toast-title"></strong>
        <span class="toast-message"></span>
      </span>
      <button class="toast-x" type="button" aria-label="Tutup notifikasi">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <span class="toast-progress" aria-hidden="true"></span>
    `

    toast.querySelector('.toast-icon svg').innerHTML = ICONS[meta.icon]
    toast.querySelector('.toast-kicker').textContent = config.kicker || meta.label
    toast.querySelector('.toast-title').textContent = config.title || meta.label
    toast.querySelector('.toast-message').textContent = config.message || ''
    toast.querySelector('.toast-message').hidden = !config.message
    toast.style.setProperty('--toast-duration', `${duration}ms`)

    let timer
    const dismiss = () => {
      if (toast.classList.contains('is-leaving')) return
      clearTimeout(timer)
      toast.classList.add('is-leaving')
      window.setTimeout(() => toast.remove(), 180)
    }

    toast.querySelector('.toast-x').addEventListener('click', dismiss)
    toast.addEventListener('mouseenter', () => {
      clearTimeout(timer)
      toast.querySelector('.toast-progress').style.animationPlayState = 'paused'
    })
    toast.addEventListener('mouseleave', () => {
      toast.querySelector('.toast-progress').style.animationPlayState = 'running'
      timer = window.setTimeout(dismiss, 1600)
    })

    const oldest = $$('.ops-toast', toastRegion)
    if (oldest.length >= 3) oldest[0].remove()

    toastRegion.appendChild(toast)
    timer = window.setTimeout(dismiss, duration)
  }

  /* ── Validasi + konfirmasi tindakan ────────────────────────────────────── */

  function contextName(button) {
    const scope = button.closest('tr')
      || button.closest('.tag-card')
      || button.closest('.review-row')
      || button.closest('.detail-card')
      || button.closest('.rule-item')
      || button.closest('.panel')
    if (!scope) return ''

    const selectors = [
      '.merchant-cell strong',
      '.cell-title',
      '.tag-label',
      '.review-main strong',
      '.detail-code',
      '.risk-name strong',
      '.panel-title'
    ]
    for (const selector of selectors) {
      const el = $(selector, scope)
      if (el && text(el.textContent)) return text(el.textContent)
    }
    const firstCell = $('td', scope)
    return firstCell ? text(firstCell.textContent) : ''
  }

  function invalidFields(button) {
    const scope = button.closest('.panel, .detail-card')
    if (!scope) return []

    $$('.is-invalid', scope).forEach((field) => field.classList.remove('is-invalid'))

    const invalid = []
    $$('[data-required]', scope).forEach((field) => {
      const value = text(field.value)
      const min = field.dataset.min
      let reason = ''

      if (!value) reason = 'wajib diisi'
      else if (min !== undefined && Number(value) < Number(min)) reason = `minimal ${min}`

      if (!reason) return

      const label = field.dataset.label
        || (field.id ? text($(`label[for="${field.id}"]`)?.textContent) : '')
        || 'Field'

      invalid.push({ field, label, reason })

      const selectRoot = field.closest('.select')
      if (selectRoot) $('.select-trigger', selectRoot)?.classList.add('is-invalid')
      else field.classList.add('is-invalid')
    })

    return invalid
  }

  function actionCopy(button) {
    const label = text(button.textContent)
    const key = label.toLowerCase()
    const name = contextName(button)
    const who = name ? ` ${name}` : ''
    const isTag = Boolean(button.closest('.tag-card'))

    if (key.startsWith('suspend')) {
      return {
        tone: 'danger',
        title: `Suspend${who}?`,
        message: 'Merchant tidak bisa menerima order baru sampai diaktifkan kembali.',
        detail: name ? `Merchant: ${name}` : '',
        actionLabel: 'Suspend',
        success: `${name || 'Merchant'} disuspend.`
      }
    }

    if (key.startsWith('aktifkan')) {
      return {
        title: `Aktifkan${who}?`,
        message: 'Merchant bisa menerima order baru lagi setelah diaktifkan.',
        detail: name ? `Merchant: ${name}` : '',
        actionLabel: 'Aktifkan',
        success: `${name || 'Merchant'} aktif kembali.`
      }
    }

    if (key === 'beri sp' || key === 'sp' || key.startsWith('terbitkan sp')) {
      return {
        tone: 'warning',
        title: `Terbitkan SP${who}?`,
        message: 'SP mengikuti rule yang berlaku dan langsung tercatat di audit trail.',
        detail: name ? `Pihak: ${name}` : '',
        actionLabel: 'Terbitkan SP',
        success: `SP${who} tercatat.`
      }
    }

    if (key.startsWith('setujui')) {
      return {
        title: `Setujui${who}?`,
        message: isTag
          ? 'Tag ini akan tampil di pencarian merchant.'
          : 'Pendaftaran akan disetujui dan tenant bisa mulai beroperasi.',
        detail: name ? `${isTag ? 'Tag' : 'Antrean'}: ${name}` : '',
        actionLabel: 'Setujui',
        success: `${name || 'Data'} disetujui.`
      }
    }

    if (key.startsWith('tolak')) {
      return {
        tone: 'danger',
        title: `Tolak${who}?`,
        message: isTag
          ? 'Tag tidak akan tampil di pencarian. Merchant bisa memperbaiki labelnya.'
          : 'Pihak terkait akan menerima alasan penolakan dan bisa memperbaiki datanya.',
        detail: name ? `${isTag ? 'Tag' : 'Antrean'}: ${name}` : '',
        actionLabel: 'Tolak',
        success: `${name || 'Data'} ditolak.`
      }
    }

    if (key.startsWith('selesaikan')) {
      return {
        title: `Selesaikan${who}?`,
        message: 'Kompensasi dan punishment mengikuti rule. Keputusan tidak bisa diubah setelah dikirim.',
        detail: name ? `Insiden: ${name}` : '',
        actionLabel: 'Selesaikan',
        success: `Insiden${who} ditutup.`
      }
    }

    if (key.startsWith('terima')) {
      return {
        title: `Terima alasan${who}?`,
        message: 'Alasan reject diterima. Kurir tetap dilepas dari assignment ini.',
        detail: name ? `Kurir: ${name}` : '',
        actionLabel: 'Terima',
        success: `Alasan reject${who} diterima.`
      }
    }

    if (key.startsWith('dispute')) {
      return {
        tone: 'warning',
        title: `Bawa${who} ke sengketa?`,
        message: 'Sengketa membuka peninjauan bukti dari kedua pihak sebelum putusan.',
        detail: name ? `Kurir: ${name}` : '',
        actionLabel: 'Bawa ke sengketa',
        success: `Reject${who} dibawa ke sengketa.`
      }
    }

    if (key.startsWith('cabut')) {
      return {
        tone: 'danger',
        title: `Cabut SP${who}?`,
        message: 'SP tidak berlaku lagi, tetapi riwayatnya tetap tersimpan di audit trail.',
        detail: name ? `Pihak: ${name}` : '',
        actionLabel: 'Cabut',
        success: `SP${who} dicabut.`
      }
    }

    if (key.startsWith('edit')) {
      return {
        title: `Edit${who}?`,
        message: 'Editor memakai field yang sama dengan form. Perubahan menaikkan versi dan tercatat di audit trail.',
        detail: name ? `Baris: ${name}` : '',
        actionLabel: 'Buka editor',
        success: `Editor${who} siap (mock).`
      }
    }

    if (key.startsWith('ekspor')) {
      return {
        title: 'Ekspor ledger?',
        message: 'File ekspor mengikuti filter yang aktif dan tercatat di audit trail.',
        detail: 'Format: CSV · append-only',
        actionLabel: 'Ekspor',
        success: 'File ekspor disiapkan (mock).'
      }
    }

    if (key === 'terbitkan rule') {
      return {
        title: 'Terbitkan rule?',
        message: 'Rule baru langsung aktif untuk order berikutnya. Order lama tetap memakai snapshot rule saat dibuat.',
        detail: name ? `Rule: ${name}` : '',
        actionLabel: 'Terbitkan rule',
        success: 'Rule diterbitkan dan masuk katalog.'
      }
    }

    return {
      tone: 'primary',
      title: `${label || 'Simpan perubahan'}?`,
      message: button.dataset.confirmMessage
        || 'Perubahan langsung berlaku dan tercatat di audit trail.',
      detail: button.dataset.confirmDetail || '',
      actionLabel: label || 'Lanjutkan',
      success: `${label || 'Perubahan'} tercatat di audit trail (mock).`
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button.btn, button.mini-btn')
    if (!button || button.closest('.ops-dialog') || button.hasAttribute('data-plain')) return

    event.preventDefault()

    const invalid = button.hasAttribute('data-skip-validation') ? [] : invalidFields(button)
    if (invalid.length) {
      showDialog({
        tone: 'warning',
        kicker: 'Validasi',
        title: 'Data belum lengkap',
        message: 'Lengkapi field berikut sebelum melanjutkan.',
        items: invalid.map((item) => `${item.label} · ${item.reason}`),
        actionLabel: '',
        onAction: null
      })
      return
    }

    const copy = actionCopy(button)
    showDialog({
      ...copy,
      kicker: copy.tone === 'danger' ? 'Tindakan berdampak' : 'Konfirmasi',
      onAction: () => {
        if (dialog?.open) dialog.close()
        showToast({
          tone: 'success',
          kicker: 'Selesai',
          title: 'Tindakan dicatat',
          message: copy.success
        })
      }
    })
  })

  /* ── Notifikasi ───────────────────────────────────────────────────────── */

  function updateNotifCount() {
    const panel = $('.notif-panel')
    if (!panel) return

    const unread = $$('.notif-row.is-unread', panel).length
    $$('[data-notif-unread]').forEach((el) => { el.textContent = String(unread) })
    $$('[data-notif-count="unread"]').forEach((el) => { el.textContent = String(unread) })
    $$('[data-notif-all]').forEach((button) => { button.disabled = unread === 0 })
  }

  function applyNotifFilter(value) {
    const panel = $('.notif-panel')
    if (!panel) return

    $$('[data-notif-filter]', panel).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.notifFilter === value)
    })

    let visible = 0
    $$('.notif-group', panel).forEach((group) => {
      let groupVisible = 0
      $$('.notif-row', group).forEach((row) => {
        const unread = row.classList.contains('is-unread')
        const needsAction = row.dataset.notifAction === 'true'
        const category = row.dataset.notifCategory || ''
        const show = value === 'all'
          || (value === 'unread' && unread)
          || (value === 'action' && needsAction)
          || (value === category)
        row.hidden = !show
        if (show) groupVisible += 1
      })
      group.hidden = groupVisible === 0
      visible += groupVisible
    })

    const empty = $('.notif-empty', panel)
    if (empty) empty.hidden = visible > 0
  }

  function initBellPopover() {
    const bell = $('.bell')
    if (!bell || bell.tagName !== 'BUTTON') return

    const pop = document.createElement('div')
    pop.className = 'notif-pop'
    pop.id = 'ops-notif-pop'
    pop.hidden = true
    pop.setAttribute('role', 'dialog')
    pop.setAttribute('aria-label', 'Notifikasi')
    pop.innerHTML = `
      <div class="notif-pop-head">
        <p class="notif-pop-title">Notifikasi <span class="notif-pop-count">4 baru</span></p>
        <button class="notif-pop-x" type="button" aria-label="Tutup notifikasi">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="notif-pop-list">
        <a class="notif-pop-item" href="ops-notifications.html#notif-8841">
          <span class="notif-ico danger"><svg class="icon"><use href="#i-gavel"/></svg></span>
          <span class="notif-pop-copy"><strong>Buyer membuka sengketa order #8841</strong><span>Bukti belum lengkap · 2 menit lalu</span></span>
          <span class="notif-pop-dot"></span>
        </a>
        <a class="notif-pop-item" href="ops-notifications.html#notif-kewajiban">
          <span class="notif-ico warn"><svg class="icon"><use href="#i-scale"/></svg></span>
          <span class="notif-pop-copy"><strong>3 merchant lewat batas settlement</strong><span>Kewajiban · 18 menit lalu</span></span>
          <span class="notif-pop-dot"></span>
        </a>
        <a class="notif-pop-item" href="ops-notifications.html#notif-onboarding">
          <span class="notif-ico warn"><svg class="icon"><use href="#i-badge-check"/></svg></span>
          <span class="notif-pop-copy"><strong>Pendaftaran merchant menunggu review</strong><span>Onboarding · 41 menit lalu</span></span>
          <span class="notif-pop-dot"></span>
        </a>
      </div>
      <a class="notif-pop-all" href="ops-notifications.html">Lihat semua notifikasi<svg class="icon"><use href="#i-arrow"/></svg></a>
    `
    document.body.appendChild(pop)
    bell.setAttribute('aria-controls', pop.id)

    const close = (restoreFocus = false) => {
      if (pop.hidden) return
      pop.hidden = true
      bell.setAttribute('aria-expanded', 'false')
      if (restoreFocus && pop.contains(document.activeElement)) bell.focus()
    }

    const open = () => {
      const rect = bell.getBoundingClientRect()
      pop.style.top = `${Math.round(rect.bottom + 10)}px`
      pop.style.right = `${Math.max(16, Math.round(innerWidth - rect.right))}px`
      pop.hidden = false
      bell.setAttribute('aria-expanded', 'true')
      $('.notif-pop-x', pop)?.focus()
    }

    bell.addEventListener('click', () => {
      if (pop.hidden) open()
      else close(true)
    })

    $('.notif-pop-x', pop).addEventListener('click', () => close(true))
    pop.addEventListener('click', (event) => {
      if (event.target.closest('a')) close(false)
    })

    document.addEventListener('click', (event) => {
      if (pop.hidden) return
      if (event.target.closest('.notif-pop') || event.target.closest('.bell')) return
      close(false)
    })

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || pop.hidden) return
      event.preventDefault()
      close(true)
    })

    window.addEventListener('resize', () => close(false))
    window.addEventListener('scroll', () => close(false), { passive: true })
  }

  function initAccountMenu() {
    const account = $('.account')
    if (!account) return

    const pop = document.createElement('div')
    pop.className = 'account-pop'
    pop.id = 'ops-account-pop'
    pop.hidden = true
    pop.setAttribute('role', 'dialog')
    pop.setAttribute('aria-label', 'Menu akun')
    pop.innerHTML = `
      <div class="account-pop-head">
        <span class="avatar">AO</span>
        <span>
          <span class="account-pop-name">Admin Ops</span>
          <span class="account-pop-role">Operator · Cloudflare Access (mock)</span>
        </span>
      </div>
      <div class="account-pop-list">
        <a class="account-pop-item" href="ops-notifications.html">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.95 18 12.35 18 8A6 6 0 0 0 6 8c0 4.35-1.41 5.95-2.74 7.33"/></svg>
          Preferensi notifikasi
        </a>
        <a class="account-pop-item" href="ops-settings.html">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/></svg>
          Aturan platform
        </a>
      </div>
      <div class="account-pop-sep"></div>
      <button class="account-pop-item danger" type="button" data-account-logout>
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
        Keluar
      </button>
    `
    document.body.appendChild(pop)
    account.setAttribute('aria-controls', pop.id)

    const close = (restoreFocus = false) => {
      if (pop.hidden) return
      pop.hidden = true
      account.setAttribute('aria-expanded', 'false')
      if (restoreFocus && pop.contains(document.activeElement)) account.focus()
    }

    const open = () => {
      const rect = account.getBoundingClientRect()
      pop.style.top = `${Math.round(rect.bottom + 8)}px`
      pop.style.right = `${Math.max(16, Math.round(innerWidth - rect.right))}px`
      pop.hidden = false
      account.setAttribute('aria-expanded', 'true')
      $('.account-pop-item', pop)?.focus()
    }

    account.addEventListener('click', () => {
      if (pop.hidden) open()
      else close(true)
    })

    pop.addEventListener('click', (event) => {
      if (event.target.closest('a')) close(false)
    })

    $('[data-account-logout]', pop).addEventListener('click', () => {
      close(false)
      showDialog({
        tone: 'warning',
        kicker: 'Sesi',
        title: 'Keluar dari panel ops?',
        message: 'Sesi Cloudflare Access (mock) akan ditutup. Data demo tidak berubah.',
        actionLabel: 'Keluar',
        onAction: () => {
          dialog?.close()
          window.location.href = 'ops-login.html?keluar=1'
        }
      })
    })

    document.addEventListener('click', (event) => {
      if (pop.hidden) return
      if (event.target.closest('.account-pop') || event.target.closest('.account')) return
      close(false)
    })

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || pop.hidden) return
      event.preventDefault()
      close(true)
    })

    window.addEventListener('resize', () => close(false))
    window.addEventListener('scroll', () => close(false), { passive: true })
  }

  function initLogin() {
    const form = $('.login-form')
    if (!form) return

    const email = $('#login-email', form)
    const password = $('#login-password', form)
    const submit = $('.login-submit', form)

    const setError = (input, message) => {
      const field = input.closest('.login-field')
      const error = $('.login-error', field)
      input.classList.toggle('is-invalid', Boolean(message))
      input.setAttribute('aria-invalid', message ? 'true' : 'false')
      error.textContent = message || ''
      error.hidden = !message
    }

    const clearError = (input) => setError(input, '')

    email?.addEventListener('input', () => clearError(email))
    password?.addEventListener('input', () => clearError(password))

    $('.login-reveal', form)?.addEventListener('click', (event) => {
      const button = event.currentTarget
      const show = password.type === 'password'
      password.type = show ? 'text' : 'password'
      button.setAttribute('aria-pressed', String(show))
      button.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi')
      password.focus()
    })

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      const emailValue = text(email.value)
      const passwordValue = password.value
      let valid = true

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        setError(email, 'Masukkan email yang valid.')
        valid = false
      }

      if (passwordValue.length < 6) {
        setError(password, 'Kata sandi minimal 6 karakter.')
        valid = false
      }

      if (!valid) {
        $('.login-error:not([hidden])', form)?.closest('.login-field')?.querySelector('input')?.focus()
        return
      }

      submit.disabled = true
      submit.textContent = 'Memeriksa...'
      form.setAttribute('aria-busy', 'true')

      window.setTimeout(() => {
        window.location.href = 'ops-dashboard.html'
      }, 650)
    })

    if (new URLSearchParams(window.location.search).get('keluar') === '1') {
      showToast({
        tone: 'info',
        kicker: 'Sesi',
        title: 'Anda sudah keluar',
        message: 'Sesi demo ditutup. Masuk lagi untuk melanjutkan.',
        duration: 6400
      })
    }
  }

  function initNotifications() {
    const panel = $('.notif-panel')
    if (!panel) return

    updateNotifCount()
    applyNotifFilter('all')

    document.addEventListener('click', (event) => {
      const filter = event.target.closest('[data-notif-filter]')
      if (filter) {
        applyNotifFilter(filter.dataset.notifFilter)
        return
      }

      const read = event.target.closest('[data-notif-read]')
      if (read) {
        const row = read.closest('.notif-row')
        if (!row || !row.classList.contains('is-unread')) return
        row.classList.remove('is-unread')
        const title = text($('.notif-main strong', row)?.textContent) || 'Notifikasi'
        updateNotifCount()
        const value = $('.notif-filters .is-active')?.dataset.notifFilter || 'all'
        applyNotifFilter(value)
        showToast({
          tone: 'success',
          kicker: 'Notifikasi',
          title: 'Ditandai dibaca',
          message: `${title} tidak lagi masuk hitungan belum dibaca.`
        })
        return
      }

      const all = event.target.closest('[data-notif-all]')
      if (all) {
        const unread = $$('.notif-row.is-unread', panel)
        if (unread.length === 0) {
          showToast({
            tone: 'info',
            kicker: 'Notifikasi',
            title: 'Semua sudah dibaca',
            message: 'Tidak ada notifikasi baru untuk ditandai.'
          })
          return
        }
        unread.forEach((row) => row.classList.remove('is-unread'))
        updateNotifCount()
        applyNotifFilter('all')
        showToast({
          tone: 'success',
          kicker: 'Notifikasi',
          title: 'Semua ditandai dibaca',
          message: `${unread.length} notifikasi dipindahkan dari antrean belum dibaca.`
        })
      }
    })
  }

  document.addEventListener('input', (event) => {
    const field = event.target.closest('[data-required]')
    if (!field) return
    field.classList.remove('is-invalid')
    field.closest('.select')?.querySelector('.select-trigger')?.classList.remove('is-invalid')
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllSelects()
  })

  initBellPopover()
  initAccountMenu()
  initLogin()
  initNotifications()
})()
