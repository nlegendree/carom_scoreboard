# Story 1.13: Fonctionner offline et s'installer comme application native

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Cadrage (bmad-create-story, 2026-09-10) — story de fondation, courte, sans nouvelle UI.** Le starter `@vite-pwa/create-pwa` a déjà posé l'essentiel : `vite-plugin-pwa` 1.3.0 génère un Service Worker qui **précache tout le build** (`dist/sw.js` vérifié : `precacheAndRoute` + `NavigationRoute(createHandlerBoundToURL("index.html"))`), le manifest est en `display: 'standalone'`, les icônes existent (`public/pwa-*.png`, générées depuis `public/logo.png`, trois billes sur fond marine). L'application ne charge **aucune ressource réseau** au runtime (police `system-ui`, aucun `fetch`/`https://` dans `src/` hors `PWABadge.vue`). Ce qui reste est de la **finition et une décision de mise à jour** :
> 1. **Cache = précache atomique, pas de `StaleWhileRevalidate` pour le HTML.** AR10 est pris au pied de la lettre par l'AC de l'epic, mais c'est un anti-pattern pour une SPA Vite : le HTML référence des assets **hachés** ; un `index.html` servi « stale » pointerait vers `index-OLD.js` que `cleanupOutdatedCaches` vient de supprimer → page cassée hors ligne. Le précache révisionné fait exactement ce qu'AR10 veut (JS/CSS depuis le cache, HTML renouvelé à chaque déploiement) en gardant HTML et assets **cohérents entre eux**. AR10 est annoté, pas contredit.
> 2. **Mise à jour automatique, appliquée uniquement à l'accueil.** La tablette tourne 24 h/24 sans jamais recharger : sans vérification périodique, elle ne verrait **jamais** un déploiement. Le composable `usePwaUpdate.ts` vérifie toutes les 60 min (si en ligne) ; une nouvelle version trouvée est appliquée (rechargement) **dès que `status === 'idle'`** — immédiatement si l'écran de veille est affiché, sinon à la fin de la partie. Jamais en `playing` ni `finished` : on n'interrompt pas une partie (esprit d'UX-DR18). Aucune pop-up, aucun toast : le rechargement de l'écran de veille est invisible pour le club. `PWABadge.vue` (anglais, fond blanc, `@click`, `z-index: 1`, différé depuis la revue 1.1) est **supprimé**.
> 3. **Déploiement Netlify inclus** (AR11, différé depuis la 1.1 « à signaler au PM ») : l'installation sur tablette exige HTTPS, donc une URL déployée — un `netlify.toml` à la racine du dépôt suffit, le rattachement du site GitHub → Netlify est une action manuelle de Nathan.
> 4. **Pas de verrouillage d'orientation** dans le manifest : les deux formats tablette sont validés à chaque story (CLAUDE.md §9). **Pas d'`orientation`**, pas de `screenshots`, pas de `shortcuts`.

## Story

As a joueur de club,
I want que l'application fonctionne sans connexion réseau, se mette à jour toute seule sans jamais interrompre une partie, et s'installe sur la tablette comme une application,
so that le scoreboard soit toujours disponible sur les tablettes de club, sans navigateur visible et sans dépendre d'un serveur (FR45, FR46, NFR6, NFR13, AR10, AR11).

## Acceptance Criteria

1. **Given** l'application chargée une première fois en ligne **When** le réseau est coupé (mode avion, DevTools › Network › Offline) et l'application est relancée (rechargement, ou lancement depuis l'icône installée) **Then** elle démarre et **tout le parcours V1a** fonctionne — accueil, réglage des joueurs, série, `ANNULER`, `ÉCHANGER`, égalisatrice, récap, revanche, sauvegarde/reprise de la 1.12 — sans aucune requête réseau nécessaire. Aucune ressource externe n'existe dans les sources : un test `?raw` sur `src/**/*.{ts,vue,css}` et `index.html` vérifie l'absence de `http://`, `https://` et `fetch(` (hors commentaires de tests). Toute police future est **auto-hébergée** (`.woff2` dans `src/assets/`), jamais Google Fonts.
2. **Given** le Service Worker généré par `vite-plugin-pwa` (`generateSW`) **When** l'application est chargée une première fois **Then** l'intégralité du build est **précachée** et servie `cache-first` (JS, CSS, HTML, icônes, manifest ; `globPatterns` étendu à `woff2`), toute navigation retombe sur l'`index.html` précaché (`navigateFallback`), et un nouveau déploiement installe une nouvelle version du SW en arrière-plan sans casser la version en cours (`cleanupOutdatedCaches`, `clientsClaim`). **Aucune** route `StaleWhileRevalidate` pour le HTML (décision 1 — AR10 annoté).
3. **Given** une nouvelle version déployée **When** la vérification périodique (60 min, en ligne) ou un lancement la détecte **Then** elle est appliquée par rechargement **seulement** quand `status === 'idle'` : tout de suite si l'accueil est affiché, sinon dès le retour à l'accueil après la partie ; jamais pendant `playing` ni `finished`. Toute erreur (enregistrement, vérification, hors ligne) est absorbée avec `console.error('[pwa] …')`, sans message au joueur. Plus aucun `PWABadge`, plus aucun texte anglais.
4. **Given** le manifest **When** je l'inspecte (Chrome DevTools › Application › Manifest, Lighthouse « Installable ») **Then** il porte `name: 'Carom Scoreboard'`, `short_name: 'Carom'`, `description` en français, `lang: 'fr'`, `id: '/'`, `start_url: '/'`, `scope: '/'`, `display: 'standalone'`, `theme_color` et `background_color` `#0D1117`, les icônes 64/192/512 + maskable, **sans avertissement d'installabilité** ; `index.html` est en `lang="fr"`, titré « Carom Scoreboard », avec `apple-mobile-web-app-capable` et `apple-mobile-web-app-status-bar-style="black"`.
5. **Given** l'application déployée en HTTPS **When** j'utilise « Installer l'application » (Chrome Android 10+) ou « Sur l'écran d'accueil » (Safari iPadOS 15+) **Then** elle se lance en **standalone**, sans barre de navigateur, sur fond sombre, et fonctionne hors ligne — **vérification sur appareil réel par Nathan**, seule étape de la story qui ne peut pas être faite en local (FR46).
6. **Given** le dépôt **When** je lis `netlify.toml` à sa racine **Then** il fixe `base = "carom-scoreboard"`, `publish = "dist"`, `command = "npm run build"` et la redirection SPA `/* → /index.html 200` (indispensable pour `createWebHistory` et les routes `/history` de l'Epic 3). Le rattachement du dépôt GitHub `nlegendree/carom_scoreboard` au site Netlify est une action manuelle de Nathan, hors code (AR11).
7. **Given** les specs **When** je lis `architecture.md`, `epics.md`, `CLAUDE.md`, `deferred-work.md` **Then** les décisions ci-dessus y sont consignées par notes datées (voir Task 7).

## Tasks / Subtasks

- [x] **Task 1 — Manifest et `index.html` (AC: 4)**
  - [x] 1.1 `vite.config.ts` › `manifest` : `name: 'Carom Scoreboard'`, `short_name: 'Carom'`, `description: 'Scoreboard tactile pour billard carambole'`, `lang: 'fr'`, `id: '/'`, garder `start_url`, `scope`, `display: 'standalone'`, `theme_color`/`background_color: '#0D1117'`. **Ne pas** ajouter `orientation`. Les `icons` restent générés par `pwaAssets` (`pwa-assets.config.ts`, preset `minimal2023`) — ne pas les lister à la main.
  - [x] 1.2 `index.html` : `<html lang="fr">`, `<title>Carom Scoreboard</title>`, ajouter `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="black">`, `<meta name="mobile-web-app-capable" content="yes">`. **Ne pas** ajouter `<link rel="manifest">`, `theme-color`, `apple-touch-icon` ni les favicons : `pwaAssets` les injecte au build (vérifié dans `dist/index.html`) — un doublon ferait deux manifests.
  - [x] 1.3 `npm run build` → `dist/manifest.webmanifest` reflète les valeurs ; `dist/index.html` contient une seule `<link rel="manifest">`.

- [x] **Task 2 — Cache Workbox (AC: 2)**
  - [x] 2.1 `vite.config.ts` › `workbox` : `globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']`, `navigateFallback: 'index.html'` **écrit explicitement** (c'est déjà le défaut de `generateSW`, vérifié dans `dist/sw.js` — l'écrire clôt le différé de la 1.1 et protège d'un changement de défaut), garder `cleanupOutdatedCaches: true`, `clientsClaim: true`. **Pas** de `skipWaiting: true` (c'est `updateServiceWorker()` qui l'envoie au moment choisi), **pas** de `runtimeCaching`, **pas** de `globIgnores` sur `index.html`.
  - [x] 2.2 Commenter en tête du bloc `workbox` pourquoi le HTML est précaché et non `StaleWhileRevalidate` (décision 1, quatre lignes max).
  - [x] 2.3 `npm run build` → `dist/sw.js` liste `index.html`, `assets/index-*.js`, `assets/index-*.css`, les PNG, `manifest.webmanifest` dans `precacheAndRoute`, et contient `NavigationRoute`.

- [x] **Task 3 — Mise à jour différée à l'accueil : `usePwaUpdate.ts` (AC: 3)**
  - [x] 3.1 Créer `src/composables/usePwaUpdate.ts` (export nommé `usePwaUpdate`, supprimer `composables/.gitkeep`) :
    - `const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000` (exporté, pour les tests) ;
    - `const { status } = storeToRefs(useGameStore())` ;
    - `const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true, onRegisteredSW(_url, registration) { … }, onRegisterError(e) { console.error('[pwa] registration failed:', e) } })` (import depuis `'virtual:pwa-register/vue'`, typé par `vite-env.d.ts` › `vite-plugin-pwa/vue`, déjà présent) ;
    - dans `onRegisteredSW` : si `registration` est défini, `intervalId = setInterval(async () => { if (!navigator.onLine) return; try { await registration.update() } catch (e) { console.error('[pwa] update check failed:', e) } }, UPDATE_CHECK_INTERVAL_MS)` — **`registration.update()` fait la vérification lui-même**, pas de `fetch(swUrl)` préalable comme dans `PWABadge` ;
    - ⚠️ `let intervalId: ReturnType<typeof setInterval> | undefined` et `onScopeDispose(() => clearInterval(intervalId))` sont déclarés **dans le corps du composable, de façon synchrone** — pas dans `onRegisteredSW`, qui est appelé plus tard, hors de tout scope actif (Vue avertirait « onScopeDispose() is called when there is no active effect scope » et rien ne serait nettoyé) ;
    - `watch([needRefresh, status], ([refresh, s]) => { if (refresh && s === 'idle' && !applying) { applying = true; updateServiceWorker(true) } }, { immediate: true })` — `updateServiceWorker(true)` envoie `SKIP_WAITING` puis recharge la page à l'événement `controlling` (comportement du module virtuel, `registerType: 'prompt'` conservé). Le drapeau `applying` évite un second appel entre le `SKIP_WAITING` et le rechargement ;
    - retourner `{ needRefresh }` (lecture seule, utile aux tests ; aucune UI ne le consomme en V1).
  - [x] 3.2 `App.vue` : supprimer l'import et la balise `<PWABadge />` ; `<script setup>` appelle `usePwaUpdate()` ; le template ne contient plus que `<router-view />` (architecture : « Root : `<router-view>` uniquement »). Supprimer `src/components/PWABadge.vue`. Garder `injectRegister: false` et `registerType: 'prompt'` dans `vite.config.ts`.
  - [x] 3.3 `vitest.config.ts` : ajouter `VitePWA({ registerType: 'prompt', injectRegister: false })` aux `plugins` (import `{ VitePWA } from 'vite-plugin-pwa'`). **Sans ce plugin, tout fichier qui importe `virtual:pwa-register/vue` fait échouer Vitest à la transformation** (`Failed to resolve import "virtual:pwa-register/vue"` — `vite:import-analysis`, AVANT que `vi.mock` n'agisse) ; **recette vérifiée le 2026-09-10** : avec le plugin, le module virtuel se résout, et `vi.mock('virtual:pwa-register/vue', factory)` fonctionne (le module réel se charge même sans mock sous happy-dom, où `navigator.serviceWorker` est absent). Un alias vers `node_modules/vite-plugin-pwa/client/build/vue.js` a été essayé et **ne fonctionne pas**.
  - [x] 3.4 Tests `src/composables/usePwaUpdate.test.ts` — `vi.mock('virtual:pwa-register/vue')` avec une factory qui capture les options et expose `needRefresh = ref(false)`, `updateServiceWorker = vi.fn()` ; `beforeEach: setActivePinia(createPinia()); vi.useFakeTimers(); vi.restoreAllMocks()` ; exécuter le composable dans un `effectScope()` (pour `onScopeDispose`) ; `console.error` espionné avec `mockImplementation(() => {})` :
    - enregistrement `immediate: true` ;
    - `onRegisteredSW` avec une `registration` factice (`update: vi.fn().mockResolvedValue(undefined)`) → après `vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS)` `update` appelé une fois, deux fois après deux intervalles ; `navigator.onLine = false` (`Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })`) → pas d'appel ; `update` qui rejette → `console.error('[pwa] update check failed:', …)`, aucune exception, l'intervalle continue ;
    - `onRegisterError(err)` → `console.error`, pas d'exception ; `onRegisteredSW(url, undefined)` → aucun intervalle ;
    - `needRefresh = true` en `idle` → `updateServiceWorker(true)` appelé **une fois** (et une seule même si `status` rebouge) ;
    - `needRefresh = true` pendant `playing` (`startGame` sur le store) → **pas** d'appel ; puis `finishGame()` (`finished`) → toujours pas ; puis `resetGame()` (`idle`) → appel ;
    - `scope.stop()` → `clearInterval` (plus d'appel `update` après un intervalle supplémentaire).
  - [x] 3.5 Aucun test existant ne monte `App.vue` : vérifier que la suite reste à **380 tests / 14 fichiers** avant ajout, puis verte avec les nouveaux.

- [x] **Task 4 — Garde « aucune ressource externe » (AC: 1)**
  - [x] 4.1 Dans `usePwaUpdate.test.ts`, un `describe('offline — aucune ressource réseau')` : `import.meta.glob('/src/**/*.{ts,vue,css}', { query: '?raw', import: 'default', eager: true })` (même recette que `storageService.test.ts`) + `import.meta.glob('/index.html', …)` → pour chaque source **hors `*.test.ts`**, `not.toMatch(/https?:\/\//)` et `not.toContain('fetch(')`. Si un commentaire légitime contient une URL, le mettre sous forme `example.com` sans schéma plutôt que d'ajouter une exception.
  - [x] 4.2 `CLAUDE.md` › section « Stack technique », une ligne : « **Offline** : aucune ressource réseau au runtime — polices auto-hébergées (`.woff2` dans `src/assets/`), jamais de CDN ni Google Fonts (FR45, NFR13). Le SW précache tout le build ; la mise à jour s'applique à l'accueil via `usePwaUpdate.ts`. »

- [x] **Task 5 — Netlify (AC: 6)**
  - [x] 5.1 Créer `netlify.toml` **à la racine du dépôt** (pas dans `carom-scoreboard/` : c'est `base` qui désigne le sous-dossier, Netlify lit d'abord le fichier racine) :
    ```toml
    [build]
      base = "carom-scoreboard"
      publish = "dist"
      command = "npm run build"

    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```
    Pas d'en-têtes `Cache-Control` : Netlify sert déjà les fichiers non hachés en `max-age=0, must-revalidate` (donc `sw.js` et `manifest.webmanifest` sont revalidés à chaque vérification), et les assets hachés sont révisionnés par le précache.
  - [x] 5.2 Netlify lira `carom-scoreboard/.nvmrc` (`26.8.1`). Le poste qui a fait les 1.5 → 1.12 tourne en **24.13.0** ; les deux versions passent `npm run build` (Vite 7). Si le build Netlify échoue sur la version Node, ajouter `[build.environment] NODE_VERSION = "24"` — ne pas toucher `.nvmrc` sans Nathan (choix explicite de la revue 1.1).
  - [x] 5.3 Annoter `architecture.md` › Arborescence : `netlify.toml` remonte de `carom-scoreboard/` à la racine du dépôt (note datée). Le rattachement du site (Netlify › Add new site › Import from GitHub › `nlegendree/carom_scoreboard`, branche `main`) est **manuel**, à faire par Nathan ; la story ne le bloque pas.

- [x] **Task 6 — Vérification hors ligne, installabilité et mise à jour (AC: 1, 2, 3, 4, 5 — CLAUDE.md §9, une seule passe)**
  - [x] 6.1 `npm run build && npm run preview` (le SW n'existe **pas** en `npm run dev` : `devOptions.enabled: false`, à laisser ainsi). Chrome (extension Claude for Chrome) sur l'URL de preview : DevTools › Application › Service Workers → `activated and is running` ; › Manifest → aucun avertissement, bouton d'installation présent ; Lighthouse › « Installable ».
  - [x] 6.2 Application › Service Workers › cocher **Offline** → recharger → accueil rendu depuis le cache, console vierge (aucun `Failed to fetch`). Hors ligne : partie complète (réglage joueurs, 3 séries, `+`, `ÉCHANGER`, `ANNULER`, fin de partie sur distance, récap, `UNE PARTIE DE PLUS`) ; `⌘R` en pleine partie → « PARTIE EN COURS » → `REPRENDRE`. Formats **1024×768 et 768×1024** (iframe même origine comme en 1.12 si la fenêtre refuse le redimensionnement) — aucun changement visuel attendu, la passe vérifie qu'il n'y en a pas.
  - [x] 6.3 Mise à jour : preview ouverte sur l'**accueil**, modifier un texte visible (ex. `HomeScreen`), `npm run build` dans un autre terminal, puis DevTools › Application › Service Workers › **Update** → le nouveau SW passe en `waiting` → la page se recharge **d'elle-même** et affiche le texte modifié. Refaire avec une **partie en cours** : `Update` → le SW reste `waiting`, **aucun rechargement** ; jouer jusqu'au récap → toujours rien ; `FIN DE PARTIE` → rechargement sur l'accueil. Console : aucune erreur.
  - [x] 6.4 Remettre le texte modifié, rebuild. Consigner dans le Dev Agent Record : taille du précache (`dist/sw.js` › nombre d'entrées, Ko), et **AC5 « à vérifier par Nathan sur iPad et Android après déploiement Netlify »** — ne pas le cocher soi-même.

- [x] **Task 7 — Specs (AC: 7)**
  - [x] 7.1 `architecture.md` : note datée sous « Note workbox » (§Gaps) et « Décisions Touch & Performance »/« Compatibilité » : précache atomique, pas de SWR HTML (décision 1) ; mise à jour différée à l'accueil (`usePwaUpdate.ts`, 60 min, `registerType: 'prompt'`) ; `PWABadge.vue` supprimé ; arborescence : `composables/usePwaUpdate.ts`, `netlify.toml` à la racine du dépôt ; ligne NFR2/FR45-46 du tableau de couverture → « livré en Story 1.13 ».
  - [x] 7.2 `epics.md` : Story 1.13, note datée des quatre décisions du cadrage ; AR10, note « (précisé en 1.13 : précache atomique, le HTML n'est pas `StaleWhileRevalidate` — cohérence HTML/assets hachés) » ; AR11 « livré en 1.13 (`netlify.toml`, rattachement manuel) ».
  - [x] 7.3 `ux-design-specification.md` › Journey Patterns : une ligne « Mise à jour de l'application : appliquée à l'accueil (écran de veille), jamais pendant une partie, sans pop-up ni toast (Story 1.13, 2026-09-10) ».
  - [x] 7.4 `deferred-work.md` : revue 1.1 — `PWABadge.vue` → **✅ supprimé en 1.13** (remplacé par `usePwaUpdate.ts`, erreurs absorbées, intervalle nettoyé) ; `globPatterns`/`navigateFallback` → ✅ traité ; `<html lang="en">` → ✅ traité. Story 1.1 Dev Notes « Netlify à signaler au PM » → livré en 1.13.
  - [x] 7.5 `sprint-status.yaml` → `review` en fin de dev.

- [x] **Task 8 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts ; aucune régression sur les 380 tests ; **aucune dépendance ajoutée** (`vite-plugin-pwa` 1.3.0, `workbox-window` 7.4.1 et `@vite-pwa/assets-generator` 1.0.2 sont déjà les dernières versions publiées, vérifié le 2026-09-10) ; `PWABadge.vue`, `composables/.gitkeep` supprimés ; aucun harnais de test résiduel.

## Dev Notes

- **Pourquoi pas `registerType: 'autoUpdate'`** : le module virtuel appliquerait et rechargerait dès qu'une version est trouvée, y compris en pleine série ; la 1.12 rattraperait la partie, mais le joueur verrait la page disparaître sous son doigt. `prompt` + `updateServiceWorker(true)` au moment choisi donne le même automatisme, gardé par `status`.
- **Ce que fait `updateServiceWorker(true)`** (module `virtual:pwa-register/vue`, `workbox-window`) : poste `{ type: 'SKIP_WAITING' }` au SW en attente ; celui-ci s'active, `clientsClaim` lui donne la page, l'événement `controlling` déclenche `window.location.reload()`. Rien à coder côté SW : `dist/sw.js` contient déjà l'écouteur `SKIP_WAITING`.
- **Pourquoi `registration.update()` et pas un `fetch(swUrl)`** : `PWABadge` faisait un `fetch` préalable pour éviter un `update()` hors ligne ; `navigator.onLine` suffit comme garde, et `update()` qui échoue (réseau, 404 pendant un déploiement) est absorbé dans le `try/catch` — c'est l'esprit d'AR12 étendu au SW.
- **Rechargement à l'accueil = perte d'un réglage en cours** (catégorie/mode/noms tapés dans `HomeScreen`, état local non persisté). Fenêtre : l'instant où la vérification horaire tombe pendant qu'un joueur tape un nom. Accepté : rare, coût de vingt secondes, et la seule alternative (pop-up « MISE À JOUR DISPONIBLE ») ajouterait une décision à l'écran de veille pour un cas qui n'arrive pas.
- **Rechargement pendant la pop-up « PARTIE EN COURS »** (`status` encore `idle`) : possible ; après rechargement la pop-up revient (1.12), rien n'est perdu.
- **`needRefresh` au lancement** : au premier chargement après un déploiement (ex. `⌘R` manuel), le nouveau SW est trouvé pendant le `register` ; `needRefresh` passe à `true` alors que `status` est `idle` (ou `idle` + `pendingRestore`) → rechargement immédiat, un seul, grâce au drapeau `applying`. Cas attendu, à observer en 6.3.
- **`workbox-window` en `devDependencies`** : normal (choix du starter), il est bundlé via le module virtuel.
- **Icônes** : `public/logo.png` (trois billes blanche/rouge/jaune sur fond marine) et ses déclinaisons sont celles du starter enrichi en 1.1 ; elles suffisent à l'installabilité. Remplacer l'icône = remplacer `logo.png` puis `npx pwa-assets-generator` (aucun script npm n'existe ; ne pas en ajouter sans besoin).
- **Pièges connus** : le SW n'existe pas sous `npm run dev` — toute vérification passe par `build` + `preview` ; sous DevTools, « Update on reload » coché fausse le test de 6.3 (le décocher) ; `vi.useFakeTimers()` doit précéder l'exécution du composable (le `setInterval` est posé dans `onRegisteredSW`) ; `navigator.onLine` de happy-dom vaut `true` par défaut ; espionner `console.error` avec `mockImplementation(() => {})` pour garder la sortie de test lisible ; `effectScope().run(() => usePwaUpdate())` puis `scope.stop()` pour exercer `onScopeDispose`.
- **Ce que la story ne fait pas** : pas de pop-up ni d'indicateur de mise à jour, pas de `screenshots`/`shortcuts`/`orientation` dans le manifest, pas de `runtimeCaching`, pas de page « hors ligne » dédiée (tout est précaché, il n'y a rien à afficher), pas de `databaseService.ts` (Epic 3), pas de changement de `main.ts`, pas d'ESLint, pas de GitHub Actions (Netlify suffit, AR11).
- **Environnement** : Node 24.13.0 sur ce poste (`.nvmrc` 26.8.1), Vite 7.1, vite-plugin-pwa 1.3.0, workbox 7.4.1, Vitest 5.0.0, happy-dom 20.14. Départ : **380 tests / 14 fichiers** verts, `vue-tsc` vert, HEAD `b6fc7f2`, arbre propre.

### Project Structure Notes

Nouveaux : `carom-scoreboard/src/composables/usePwaUpdate.ts`, `carom-scoreboard/src/composables/usePwaUpdate.test.ts`, `netlify.toml` (racine du dépôt). Modifiés : `carom-scoreboard/vite.config.ts`, `carom-scoreboard/vitest.config.ts`, `carom-scoreboard/index.html`, `carom-scoreboard/src/App.vue`, `carom-scoreboard/CLAUDE.md`, `architecture.md`, `epics.md`, `ux-design-specification.md`, `deferred-work.md`, `sprint-status.yaml`. Supprimés : `carom-scoreboard/src/components/PWABadge.vue`, `carom-scoreboard/src/composables/.gitkeep`. Écart d'arborescence assumé : `netlify.toml` à la racine du dépôt et non dans `carom-scoreboard/` (Task 5.3).

### References

- [Source: epics.md#Story 1.13 (l. 659-677) ; AR10 (l. 136), AR11, AR12, AR15, AR16 ; FR45, FR46 ; NFR2, NFR6, NFR13 ; UX-DR18 (ne jamais interrompre une partie)]
- [Source: architecture.md#Évaluation du Starter Template (Build, Compatibilité Multi-Plateforme), #Infrastructure & Déploiement (Netlify), #Arborescence Complète, #Résultats de Validation « Note workbox »]
- [Source: prd.md#Architecture PWA (V1) (l. 328-338) ; Succès Technique « PWA installable, 100 % offline » (l. 79)]
- [Source: ux-design-specification.md#Platform Strategy (l. 60), #Accessibility Strategy « kiosque 100 % tactile », #Journey Patterns « Reprise après interruption »]
- [Source: 1-12-preserver-letat-de-la-partie-en-cas-de-fermeture-accidentelle.md — cadrage « mise à jour de la PWA par le Service Worker » comme cas réel de rechargement, recette `?raw`, passe visuelle par iframe]
- [Source: 1-1-initialisation-du-projet.md — Review Findings différés (`PWABadge`, `globPatterns`/`navigateFallback`, `lang="en"`), Dev Notes « Netlify à signaler au PM »]
- [Source: deferred-work.md — revue 1.1 (quatre entrées à clore)]
- [Source: carom-scoreboard/vite.config.ts, vitest.config.ts, index.html, pwa-assets.config.ts, src/App.vue, src/components/PWABadge.vue, src/router/index.ts (`createWebHistory` + catch-all), src/stores/useGameStore.ts (`status`, `resetGame`, `finishGame`), src/services/storageService.test.ts (recette `?raw`), dist/sw.js et dist/manifest.webmanifest du build courant]
- [Source: sondes du 2026-09-10 — `vi.mock` seul échoue sur le module virtuel ; `VitePWA()` dans `vitest.config.ts` le résout ; alias vers `client/build/vue.js` échoue ; `npm view` : vite-plugin-pwa 1.3.0, workbox-window 7.4.1, assets-generator 1.0.2 = versions installées]
- [Source: mémoires « tablette-allumee-h24-resilience-filet-de-securite », « gros-cta-plutot-que-croix », « raisonner-en-tactile-tablette »]

## Change Log

| Date | Change |
|---|---|
| 2026-09-10 | Création de la story (bmad-create-story) : cadrage en quatre décisions (précache atomique, mise à jour différée à l'accueil, Netlify inclus, pas de verrou d'orientation), recette Vitest pour le module virtuel vérifiée par sonde. |
| 2026-09-10 | Implémentation (bmad-dev-story) : manifest et `index.html` finalisés, Workbox en précache intégral (`woff2`, `navigateFallback`), `usePwaUpdate.ts` + 14 tests (mise à jour différée à l'accueil, rechargement sur `controllerchange`), garde « aucune ressource réseau » (24 sources), `PWABadge.vue` supprimé, `netlify.toml` à la racine, specs annotées. Passe Chrome : hors ligne (serveur coupé) sur tout le parcours V1a et les deux formats tablette, mise à jour à l'accueil et jamais en partie. 380 → 418 tests. Statut → review. |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (claude-fable-5-1) — session bmad-dev-story du 2026-09-10.

### Debug Log References

- **Vitest et le module virtuel** : `vi.hoisted` s'exécute avant les imports statiques → `ref` de Vue doit y être importé dynamiquement (`await import('vue')`), idem dans la factory de `vi.mock`. Sans cela : `Cannot access '__vi_import_37__' before initialization`, puis `ref is not defined`.
- **Écart réel découvert en passe Chrome (Task 6.3) — le rechargement ne venait pas pour une mise à jour « externe »** : le module `virtual:pwa-register` ne recharge la page sur l'événement `controlling` que si `event.isUpdate` est vrai (`node_modules/vite-plugin-pwa/dist/client/build/register.js`). Or `workbox-window` (`_onUpdateFound`, `REGISTRATION_TIMEOUT_DURATION = 60000`) classe comme **externe** (`isUpdate: false`) toute mise à jour trouvée plus de 60 s après l'enregistrement — c'est précisément la vérification horaire sur une tablette allumée 24 h/24. Reproduit : mise à jour trouvée 72 s après le chargement, `FIN DE PARTIE` → accueil, `SKIP_WAITING` envoyé, le nouveau SW prend le contrôle… et la page reste sur l'ancienne version. Le premier essai (mise à jour trouvée < 60 s après le chargement) avait masqué le problème. **Correction** : le composable écoute `navigator.serviceWorker` › `controllerchange` et recharge lui-même quand `applying` est vrai (le drapeau écarte le `controllerchange` du premier chargement dû à `clientsClaim`) ; listener retiré dans `onScopeDispose`. 3 tests ajoutés. La Dev Note « `updateServiceWorker(true)` … recharge la page à l'événement `controlling` » n'est donc vraie que pour une mise à jour trouvée dans la minute suivant l'enregistrement. Re-vérifié en Chrome après correction : rechargement au retour à l'accueil, libellé de la nouvelle version affiché, plus de SW en `waiting`, console vide.
- **Faux positif écarté** : un premier rechargement observé « en partie » venait d'un `DÉMARRER` sans distance (pop-up « DISTANCE MANQUANTE », partie jamais démarrée, `status` resté `idle`) — comportement attendu, pas un bug.
- Sonde : `resize_window` de l'extension Chrome n'a pas pris effet (viewport resté 1384×823) ; les formats 1024×768 et 768×1024 ont été validés par iframe même origine, comme en 1.12.

### Completion Notes List

- **Task 1 — Manifest / `index.html`** : `name: 'Carom Scoreboard'`, `short_name: 'Carom'`, description française, `lang: 'fr'`, `id: '/'`, sans `orientation` ; `index.html` en `lang="fr"`, titre « Carom Scoreboard », métas `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style="black"`. Build vérifié : `dist/manifest.webmanifest` conforme (icônes 64/192/512 + maskable injectées par `pwaAssets`), un seul `<link rel="manifest">`, `theme-color` `#0D1117` injecté.
- **Task 2 — Workbox** : `globPatterns` étendu à `woff2`, `navigateFallback: 'index.html'` explicite, `cleanupOutdatedCaches`, `clientsClaim` ; commentaire de la décision 1 en tête du bloc. `dist/sw.js` : `precacheAndRoute` de **12 entrées (292,5 Ko)** — `index.html`, `assets/index-*.js`, `assets/index-*.css`, `assets/workbox-window.prod.es5-*.js`, 6 PNG/ICO, `manifest.webmanifest` — et `NavigationRoute`. Pas de `skipWaiting`, pas de `runtimeCaching`.
- **Task 3 — `usePwaUpdate.ts`** : `UPDATE_CHECK_INTERVAL_MS` exporté (60 min), `useRegisterSW({ immediate: true })`, `registration.update()` gardé par `navigator.onLine` dans un `try/catch` (`console.error('[pwa] update check failed:')`), `onRegisterError` absorbé, `onScopeDispose` synchrone (intervalle + listener `controllerchange`), `watch([needRefresh, status], …, { immediate: true })` avec drapeau `applying`, rechargement propre sur `controllerchange` (voir Debug Log). `App.vue` réduit à `<router-view />` + `usePwaUpdate()`. `PWABadge.vue` et `composables/.gitkeep` supprimés. `vitest.config.ts` : `VitePWA({ registerType: 'prompt', injectRegister: false })`. **14 tests** dans `usePwaUpdate.test.ts` (enregistrement, intervalle ×1/×2, hors ligne, échec absorbé, `registration` indéfinie, `onRegisterError`, nettoyage du scope, application immédiate en `idle` et une seule fois, au lancement, jamais en `playing`/`finished` puis au `resetGame`, rechargement sur `controllerchange`, pas de rechargement au premier contrôle, listener retiré au `stop()`). Vérifié par mutation : retirer la garde `idle` casse le test. Suite : 380 → 418 tests / 14 → 15 fichiers.
- **Task 4 — Garde « aucune ressource réseau »** : `describe('offline — aucune ressource réseau')` scanne **24 sources** (`src/**/*.{ts,vue,css}` hors `*.test.ts` + `index.html`) — aucune `http(s)://`, aucun `fetch(`. CLAUDE.md › Stack technique : ligne **Offline** ajoutée.
- **Task 5 — Netlify** : `netlify.toml` à la racine du dépôt (`base`, `publish`, `command`, redirection SPA 200), sans `Cache-Control`. Pas de `NODE_VERSION` forcé (`.nvmrc` 26.8.1 inchangé ; le poste tourne en 24.13.0, les deux passent le build). **Rattachement du site GitHub → Netlify : action manuelle de Nathan.**
- **Task 6 — Passe Chrome unique** (preview du build, SW `activated and is running`, précache 12 entrées) : test hors ligne fait **serveur de preview coupé** — accueil, `JEUX DE SÉRIES` › `LIBRE`, réglage des joueurs (noms + distance), `+`, `ANNULER`, `ÉCHANGER`, `⌘R` en pleine partie → « PARTIE EN COURS » › `REPRENDRE LA PARTIE`, saisie au pavé, offre d'égalisatrice › `ANA JOUE`, « PARTIE TERMINÉE » › récap, `UNE PARTIE DE PLUS`, sortie → accueil ; 7 requêtes toutes servies en 200 par le SW, console vide, formats 1024×768 et 768×1024 (iframe) sans changement visuel. Mise à jour : à l'accueil → rechargement automatique avec le texte modifié ; en partie → SW `waiting`, aucun rechargement, ni au récap ; `FIN DE PARTIE` → rechargement sur l'accueil (re-vérifié après le correctif `controllerchange`, avec une mise à jour trouvée 72 s après le chargement). Texte remis, rebuild.
- **AC5 — à vérifier par Nathan sur iPad et Android après déploiement Netlify** (installation « Sur l'écran d'accueil » / « Installer l'application », lancement standalone, fond sombre, hors ligne). Non coché ici. Check-list détaillée : `1-13-actions-manuelles-nathan.md` (même dossier), référencée dans `deferred-work.md`.
- **Task 7 — Specs** : `architecture.md` (Touch & Performance, Compatibilité, Infrastructure, Arborescence ×2, tableau de couverture FR45-46/NFR2, Note workbox), `epics.md` (AR10, AR11, note de cadrage Story 1.13), `ux-design-specification.md` (Journey Patterns), `deferred-work.md` (trois entrées de la revue 1.1 closes), Story 1.1 Dev Notes (Netlify livré).
- **Task 8 — Qualité** : `npm test` 418/418, `npx vue-tsc -b` vert, `npm run build` vert, aucune dépendance ajoutée, aucun harnais résiduel (`__marker`/`__loadedAt` n'existaient qu'en console Chrome).
- **Hors périmètre, non fait volontairement** : pas de pop-up de mise à jour, pas d'`orientation`/`screenshots`/`shortcuts`, pas de `runtimeCaching`, pas de page hors ligne dédiée, `main.ts` inchangé, `.nvmrc` inchangé.

### File List

Nouveaux :
- `netlify.toml`
- `carom-scoreboard/src/composables/usePwaUpdate.ts`
- `carom-scoreboard/src/composables/usePwaUpdate.test.ts`

Modifiés :
- `carom-scoreboard/vite.config.ts`
- `carom-scoreboard/vitest.config.ts`
- `carom-scoreboard/index.html`
- `carom-scoreboard/src/App.vue`
- `carom-scoreboard/CLAUDE.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/1-1-initialisation-du-projet.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-13-fonctionner-offline-et-sinstaller-comme-application-native.md`

Supprimés :
- `carom-scoreboard/src/components/PWABadge.vue`
- `carom-scoreboard/src/composables/.gitkeep`
