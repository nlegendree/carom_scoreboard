// Harnais de rendu statique aux trois formats (Playwright headless, DPR 1) — écrit pour la
// Story 11.1, sauvegardé dans le dépôt à la création de la fiche 11.2 (2026-09-16) pour que
// les stories 11.2 à 11.4 le réutilisent. Hors build, non testé. Playwright vient du serveur
// MCP global (chemin absolu ci-dessous, Node 24 via nvm) ; Chromium dans ~/Library/Caches/ms-playwright.
// Usage (depuis 1score/, `npm run dev` lancé, URL ajustée au port affiché) :
//   node scripts/render-static.cjs <outDir> [WxH ...] [--url http://localhost:5175/] [--override fichier.css] [--focus]
//   (`--url` par défaut : http://localhost:5174/)
//
// Story 11.2 — propositions au rendu SANS toucher au code :
//   --override <fichier.css>  injecte le fichier par `page.addStyleTag` sur chaque page, avant la
//                             première capture. Un `:root { --radius-key: 0px }` injecté en fin de
//                             <head> gagne sur le `@theme` de main.css (même spécificité, source
//                             postérieure) : les utilitaires Tailwind lisent la variable en `var()`.
//   --focus                   ajoute deux captures avec l'anneau `:focus-visible` forcé au clavier
//                             (Tab jusqu'à une tuile de l'accueil, puis jusqu'à VALIDER de la pop-up
//                             de décision) — la souris et le `pointerdown` ne déclenchent pas
//                             `:focus-visible`, seul le clavier le fait.
const { chromium } = require('/Users/nathanlegendre/.nvm/versions/node/v24.13.0/lib/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright')
const path = require('path')
const fs = require('fs')

const argv = process.argv.slice(2)
const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? null : argv[i + 1] }
const URL = opt('--url') || 'http://localhost:5174/'
const overrideFile = opt('--override')
const overrideCss = overrideFile ? fs.readFileSync(overrideFile, 'utf8') : null
const withFocus = argv.includes('--focus')
const positional = argv.filter((a, i) => !a.startsWith('--') && !['--url', '--override'].includes(argv[i - 1]))
const outDir = positional[0]
const formats = (positional.slice(1).length ? positional.slice(1) : ['1920x1080', '1180x733', '1133x744'])
fs.mkdirSync(outDir, { recursive: true })

const AUDIT = `(() => {
  const out = { fs: {}, overflow: [], small: [] }
  const roles = {
    tagline: '[data-testid="home-tagline"]', jds: '[data-testid="jds-title"]', tile: '[data-testid="tile-title"]',
    sidebar: '[data-testid="sidebar-label"]', badge: '[data-testid="soon-badge"]', setupTitle: '[data-testid="setup-mode-label"]',
    setupCta: '[data-testid="change-ball-button"]', start: '[data-testid="confirm-button"]', nameValue: '[data-testid="name-value"]',
    score: '[data-testid="score"]', reprise: '[data-testid="reprise-number"]', clock: '[data-testid="shot-clock-value"]',
    panelName: '[data-testid="panel-name"]', stats: '[data-testid="panel-stats"]', minus: '[data-testid="score-minus"]',
    iconLabel: '[data-testid="icon-action-label"]', digit: '[data-testid="digit-5"]', keyA: '[data-testid="key-A"]',
    promptTitle: '[data-testid="prompt-title"]', sumName: '[data-testid="summary-name"]', sumPoints: '[data-testid="summary-points"]',
    passTurn: '[data-testid="pass-turn-button"]', series: '[data-testid="entry-value"], [data-testid="series-value"], [data-testid="for-n"]',
  }
  for (const [k, sel] of Object.entries(roles)) {
    const e = document.querySelector(sel); if (!e) continue
    const r = e.getBoundingClientRect()
    out.fs[k] = getComputedStyle(e).fontSize.replace('px','') + 'px ' + Math.round(r.width) + 'x' + Math.round(r.height)
  }
  // Débordement : tout élément à texte propre dont le contenu dépasse sa boîte ou celle de son parent.
  const all = document.querySelectorAll('body *')
  for (const e of all) {
    if (!e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
    const r = e.getBoundingClientRect(); if (r.width === 0) continue
    const p = e.parentElement.getBoundingClientRect()
    const over = (e.scrollWidth > Math.ceil(r.width) + 1) || (r.right > p.right + 1) || (r.left < p.left - 1) || (r.bottom > p.bottom + 1)
    if (over) out.overflow.push({ t: e.textContent.trim().slice(0, 24), w: Math.round(r.width), sw: e.scrollWidth, pw: Math.round(p.width), pr: Math.round(p.right - r.right), pb: Math.round(p.bottom - r.bottom) })
  }
  // Cibles < 90 px parmi les boutons hors touches de clavier.
  for (const b of document.querySelectorAll('button')) {
    const r = b.getBoundingClientRect(); if (r.width === 0) continue
    if (/key-|digit-|backspace|clear-button/.test(b.dataset.testid || '')) continue
    if (r.width < 90 || r.height < 90) out.small.push({ t: (b.dataset.testid || b.textContent.trim()).slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) })
  }
  const keys = [...document.querySelectorAll('[data-testid^="key-"]')].slice(0, 1).map(k => { const r = k.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) })
  if (keys.length) out.alphaKey = keys[0]
  const digit = document.querySelector('[data-testid="digit-5"]'); if (digit) { const r = digit.getBoundingClientRect(); out.digitKey = Math.round(r.width) + 'x' + Math.round(r.height) }
  return out
})()`

async function press(page, testid) {
  await page.dispatchEvent(`[data-testid="${testid}"]`, 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
  await page.waitForTimeout(80)
}

// Ouvre l'app et injecte la surcharge (s'il y en a une) AVANT toute capture. L'app est une SPA :
// le <style> injecté survit à toute la navigation d'un même contexte.
async function open(page) {
  await page.goto(URL); await page.waitForSelector('[data-testid="home-tagline"]')
  if (overrideCss) await page.addStyleTag({ content: overrideCss })
  // Saira est en `font-display: block` : attendre les fontes AVANT toute capture ou mesure,
  // surcharge ou non (revue de la 11.2) — sinon texte invisible ou police système à l'audit.
  await page.evaluate(() => document.fonts.ready)
}

// Tab jusqu'à ce que l'élément visé porte le focus (au plus `max` frappes), puis capture.
async function focusShot(page, tag, name, testid, report, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    const id = await page.evaluate(() => document.activeElement && document.activeElement.dataset.testid)
    if (id === testid) { await page.waitForTimeout(80); await shot(page, tag, name, report); return }
  }
  console.warn('focus non atteint :', testid)
}

async function shot(page, tag, name, report) {
  const file = path.join(outDir, `${name}-${tag}.png`)
  await page.screenshot({ path: file })
  const audit = await page.evaluate(AUDIT)
  report.push({ screen: name, ...audit })
}

;(async () => {
  const browser = await chromium.launch()
  const results = {}
  for (const f of formats) {
    const [w, h] = f.split('x').map(Number)
    const report = []
    // Parcours A : JDS (libre) → paramétrage → scoreboard → saisie → sortie → récap
    let ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    let page = await ctx.newPage()
    await open(page)
    await shot(page, f, '01-accueil', report)
    if (withFocus) await focusShot(page, f, '01b-accueil-focus', 'category-series', report)
    await press(page, 'category-series'); await page.waitForSelector('[data-testid="jds-title"]')
    await shot(page, f, '02-jds', report)
    await press(page, 'mode-libre'); await page.waitForSelector('[data-testid="setup-header"]')
    await shot(page, f, '03-parametrage-vide', report)
    await page.dispatchEvent('[data-testid="player-card-left"] [data-testid="name-field"]', 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
    await page.waitForSelector('[data-testid="alpha-keyboard-sheet"]')
    for (const c of ['M', 'I', 'C', 'H', 'E', 'L']) await press(page, `key-${c}`)
    await shot(page, f, '04-popup-clavier-alpha', report)
    await press(page, 'sheet-confirm')
    await page.dispatchEvent('[data-testid="player-card-left"] [data-testid="distance-field"]', 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
    await page.waitForSelector('[data-testid="numeric-pad-dock"]')
    await press(page, 'digit-3'); await press(page, 'digit-0')
    await shot(page, f, '05-popup-pave-numerique', report)
    await press(page, 'dock-confirm')
    await page.dispatchEvent('[data-testid="player-card-right"] [data-testid="name-field"]', 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
    await page.waitForSelector('[data-testid="alpha-keyboard-sheet"]')
    for (const c of ['J', 'E', 'A', 'N']) await press(page, `key-${c}`)
    await press(page, 'key-space')
    for (const c of ['P', 'I', 'E', 'R', 'R', 'E']) await press(page, `key-${c}`)
    await press(page, 'sheet-confirm')
    await page.dispatchEvent('[data-testid="player-card-right"] [data-testid="distance-field"]', 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
    await page.waitForSelector('[data-testid="numeric-pad-dock"]')
    await press(page, 'digit-2'); await press(page, 'digit-5'); await press(page, 'dock-confirm')
    await shot(page, f, '06-parametrage-rempli', report)
    await press(page, 'confirm-button'); await page.waitForSelector('[data-testid="score"]')
    await shot(page, f, '07-scoreboard-jds', report)
    await press(page, 'add-points-button'); await page.waitForSelector('[data-testid="score-entry-dock"]')
    await press(page, 'digit-1'); await press(page, 'digit-2')
    await shot(page, f, '08-popup-saisie-serie', report)
    await press(page, 'entry-confirm-button'); await page.waitForTimeout(150)
    await press(page, 'add-points-button'); await press(page, 'digit-7'); await press(page, 'entry-confirm-button'); await page.waitForTimeout(150)
    await press(page, 'add-points-button'); await press(page, 'digit-1'); await press(page, 'digit-5'); await press(page, 'entry-confirm-button'); await page.waitForTimeout(150)
    await shot(page, f, '09-scoreboard-jds-en-partie', report)
    await page.dispatchEvent('[data-testid="action-bar"] [data-testid="exit-button"]', 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
    await page.waitForSelector('[data-testid="prompt-modal"]')
    await shot(page, f, '10-popup-decision', report)
    if (withFocus) await focusShot(page, f, '10b-popup-decision-focus', 'prompt-primary', report)
    await press(page, 'prompt-primary'); await page.waitForSelector('[data-testid="game-summary"]')
    await shot(page, f, '11-recap', report)
    await ctx.close()
    // Parcours B : 3 Bandes → scoreboard avec chrono
    ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    page = await ctx.newPage()
    await open(page)
    await press(page, 'category-3bandes'); await page.waitForSelector('[data-testid="setup-header"]')
    for (const side of ['left', 'right']) {
      await page.dispatchEvent(`[data-testid="player-card-${side}"] [data-testid="distance-field"]`, 'pointerdown', { pointerId: 1, isPrimary: true, bubbles: true })
      await page.waitForSelector('[data-testid="numeric-pad-dock"]')
      await press(page, 'digit-1'); await press(page, 'digit-5'); await press(page, 'dock-confirm')
    }
    await press(page, 'confirm-button'); await page.waitForSelector('[data-testid="shot-clock-value"]')
    for (let i = 0; i < 3; i++) { await press(page, 'plus-one-button') }
    await page.waitForTimeout(1200)
    await shot(page, f, '12-scoreboard-3bandes', report)
    await ctx.close()
    results[f] = report
  }
  await browser.close()
  fs.writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(results, null, 1))
  console.log('done', Object.keys(results))
})().catch(e => { console.error(e); process.exit(1) })
