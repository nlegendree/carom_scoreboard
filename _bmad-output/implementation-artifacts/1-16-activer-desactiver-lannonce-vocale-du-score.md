# Story 1.16: Activer/désactiver l'annonce vocale du score

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **⏸️ Reportée (décision de Nathan, 2026-09-10) — pas prioritaire, « du peanut », à faire plus tard.** La story est prête (`ready-for-dev`) mais ne bloque rien : la 1.17 et l'Epic 2 peuvent passer devant.

> **Cadrage (bmad-create-story, 2026-09-10, tranché par Nathan le jour même) — première story « réglage » du produit, et première sortie audio.** L'epic ne donne que deux AC (annonce après chaque série validée, silence quand c'est coupé) et un composable nommé : `useSpeech.ts` (AR13, Web Speech API). Cinq décisions :
> 1. **Le réglage est un picto dans la barre basse, au même niveau que la sortie et RECOMMENCER** (décision de Nathan). Il occupe la **colonne centrale de la barre** (`w-1/5`, aujourd'hui vide), à place **fixe** : la colonne des pictos alternants ne peut pas en accueillir un troisième en portrait (3 × 90 px + 2 × 16 px + marge de 32 px = 334 px pour 307 px de colonne, mesures 1.15). Glyphe : **une personne qui parle** (tête + bulle, Lucide `speech`), barré d'une diagonale quand l'annonce est coupée. Pas de route ni de modale de réglages (AR6) : un bouton à deux états.
> 2. **Le réglage appartient à la tablette, pas à la partie.** Persisté dans `localStorage` sous sa **propre clé** (`1score:settings`), via `storageService.ts` (AR12), dans un **nouveau store `useSettingsStore`** (AR7 : un store par domaine ; ajouté à la liste de l'architecture). Il ne rentre **pas** dans `GameState` : pas un état de partie, pas annulable par `ANNULER`, pas jeté par `resetGame`, pas de `GAME_STORAGE_VERSION` à incrémenter. **Défaut : désactivé** (Nathan).
> 3. **L'annonce est un effet de bord du store, pas de la vue.** `useSpeech()` (appelé une fois dans `App.vue`, comme `usePwaUpdate()`) s'abonne aux actions du store par `$onAction` et parle après **`validateScoreInput` seulement** — la série saisie au pavé, par `VALIDER` ou par l'auto-validation à 3 s. **`passTurn` (main rendue sans marquer) reste muet** (Nathan). Un pilotage déporté (UX-DR23) ou un test qui appelle le store directement déclenche donc l'annonce aussi ; `ANNULER`, `−`/`+`, `ÉCHANGER`, RECOMMENCER, revanche et reprise après fermeture ne parlent **jamais**.
> 4. **Ce qui est dit** : le **nom** du joueur qui vient de jouer et sa **série** telle qu'enregistrée (plafonnée à la distance restante, 1.10) — « Michel, douze. » (`lang: 'fr-FR'`). **Pas de total** (Nathan). Rien d'autre : pas de reprise, pas de « pour n » (3 Bandes, Epic 2), pas de fin de partie (FR44, V2+).
> 5. **Cible : Android** (Nathan). Chrome Android (≥ M71) refuse `speak()` sans activation utilisateur, mais l'activation est *collante* : le premier tap de la session suffit, y compris pour l'auto-validation à 3 s (timer). **Aucune confirmation vocale à l'activation** n'est donc nécessaire. iOS/iPadOS, qui exige un geste par `speak()` et où un `setTimeout` casse la chaîne, n'est **pas** visé par cette story : si l'iPad reste muet sur l'auto-validation, c'est consigné, pas corrigé. Autres contraintes vérifiées le 2026-09-10 qui dictent l'implémentation : (a) **`speechSynthesis` n'existe pas dans happy-dom** et `lib.dom.d.ts` le déclare toujours présent — même garde `typeof` que `useHaptics` ; (b) **Chrome desktop n'a que des voix françaises distantes** (réseau) : la passe Chrome entend une voix Google, la réalité hors ligne (Google TTS sur Android) se vérifie sur appareil ; (c) Chrome Android exige `utterance.lang` explicite et retourne des `lang` en `fr_FR` (souligné) ; (d) un utterance sans référence conservée peut être ramassé par le GC avant la fin (Chrome).

## Story

As a joueur,
I want activer ou désactiver, d'un picto visible pendant la partie, l'annonce vocale de chaque série validée,
so that je peux entendre mon score sans regarder l'écran — ou jouer en silence — et que la tablette s'en souvienne d'une partie à l'autre (FR42, AR13).

## Acceptance Criteria

### Le réglage

1. **Given** une partie en cours **When** j'observe la barre basse **Then** un **picto VOIX** occupe la **colonne centrale** de la barre (`w-1/5`, alignée sur la console), **centré**, à place fixe — il ne change pas de côté, contrairement au CTA et aux pictos de sortie/RECOMMENCER. Même style que ces pictos (`PICTO_BUTTON_CLASSES` : `bg-white/10`, `≥ 90×90 px`, `rounded-2xl`, `@pointerdown`), glyphe inline (SVG, aucune ressource réseau) d'**une personne qui parle** (tête + bulle, Lucide `speech`, `h-8 w-8`) ; quand l'annonce est **coupée**, le même glyphe est **barré** d'une diagonale — le signal est la présence du trait, pas une teinte (UX-DR14, UX-DR22). Le bouton porte `aria-pressed` (`true`/`false`) et `aria-label="Annonce vocale"`.
2. **Given** le picto VOIX **When** je le tape **Then** l'état bascule immédiatement (glyphe et `aria-pressed`), via l'action Pinia `toggleVoice()` de `useSettingsStore` (AR17) — jamais une mutation directe. Rien d'autre ne change : ni tour, ni score, ni pile d'annulation (`canUndo` inchangé), ni pop-up. **Rien n'est prononcé** à l'activation (cadrage 5).
3. **Given** l'annonce **coupée** par ce tap **When** une parole est en cours **Then** elle est interrompue (`cancel()`).
4. **Given** un réglage modifié **When** je recharge l'application (ou qu'elle est relancée le lendemain) **Then** le réglage est **celui que j'ai laissé** : persisté dans `localStorage` sous la clé `1score:settings` (enveloppe versionnée `{ version, settings }`, `SETTINGS_STORAGE_VERSION = 1`), lu au lancement par `useSettingsStore`, écrit **une fois par action** via `saveSettings()` de `storageService.ts`. Valeur par défaut, et repli sur une sauvegarde illisible (JSON corrompu, version inconnue, forme inattendue, jetée avec `console.warn`) : **désactivé**. Toute erreur de stockage est absorbée dans le service (`try/catch` + `console.error('[storage] …')`), jamais dans le store ni dans un composant (AR12) — la garde de test « aucun appel à `localStorage` hors `services/` » reste verte.
5. **Given** un navigateur sans `speechSynthesis` (happy-dom, WebView exotique) **When** la partie s'affiche **Then** le picto VOIX est **grisé et inerte** (`disabled`, `disabled:opacity-30`, comme RECOMMENCER sur scoreboard intact), le réglage persisté est laissé tel quel, et **rien ne lève** — ni au montage, ni à la validation d'une série.

### L'annonce

6. **Given** l'annonce activée et une partie en cours **When** une série est validée au pavé — par `VALIDER` ou par l'auto-validation à 3 s **Then** une annonce est prononcée via la Web Speech API, en français (`utterance.lang = 'fr-FR'`), de la forme **« {nom}, {série}. »** où `{nom}` est le nom du joueur **qui vient de jouer** (celui qui avait la main avant la bascule) et `{série}` la valeur **enregistrée** (donc plafonnée à la distance restante : distance 10, score 8, `5` tapé → « deux »). Le nom est passé en **minuscules** au moteur (`MICHEL` → « michel » ; un mot en capitales peut être épelé lettre par lettre). Les deux chemins de validation (bouton, 3 s) produisent la **même** annonce (UX-DR15). Un `0` tapé puis validé est une série saisie : « michel, zéro. ».
7. **Given** l'annonce activée **When** je rends la main **sans marquer** au tap sur la zone adverse (`passTurn`, série de 0) **Then** rien n'est prononcé (décision de Nathan). Même silence pour `VALIDER` sur une saisie vide (no-op strict, AC12 de la 1.5) et pour toute action qui n'est pas une série saisie : `ANNULER`, `−`/`+`, `ÉCHANGER`, `RECOMMENCER`, `UNE PARTIE DE PLUS`, `REPRENDRE LA PARTIE`, `FIN DE PARTIE`, et toute action hors `playing`.
8. **Given** l'annonce activée **When** une nouvelle série est validée alors que la précédente est encore en train d'être prononcée **Then** la parole en cours est **interrompue** (`cancel()` si `speaking` ou `pending`) et la nouvelle annonce part seule — jamais de file d'attente qui parle trente secondes après le geste. Si `speechSynthesis.paused` est vrai (retour d'arrière-plan), `resume()` est appelé avant `speak()`.
9. **Given** l'annonce activée **When** une série validée déclenche en même temps une pop-up de fin (offre d'égalisatrice, « PARTIE TERMINÉE ») **Then** l'annonce est prononcée quand même et la pop-up s'affiche comme d'habitude ; l'annonce ne dit rien de la fin de partie.
10. **Given** l'annonce **désactivée** **When** une série est validée **Then** `speechSynthesis.speak()` n'est **jamais appelé** — pas d'utterance construit, pas de `cancel()` non plus.

### Transverses

11. **Given** la voix choisie **When** l'utterance est construit **Then** il reçoit, si elle existe, une voix dont `lang` commence par `fr` (comparaison après remplacement de `_` par `-`), en préférant `localService === true` (hors ligne) ; sinon aucune voix (`voice = null`) et seul `lang = 'fr-FR'` guide le moteur. La liste des voix est lue **au moment de parler** (`getVoices()`), jamais mise en cache au chargement : sur Chrome elle est vide tant que `voiceschanged` n'a pas tiré. La référence de l'utterance en cours est **conservée** dans le composable jusqu'à la suivante (cadrage 5d).
12. **Given** le code livré **When** je lis les specs **Then** `epics.md`, `ux-design-specification.md`, `architecture.md` et `deferred-work.md` portent des notes datées (Task 7), et la vérification sur **Android** (hors ligne, auto-validation) est consignée comme **action manuelle de Nathan**, comme l'AC5 de la 1.13.

## Tasks / Subtasks

- [ ] **Task 1 — Type et persistance du réglage (AC: 4)**
  - [ ] 1.1 Créer `src/types/settings.ts` : `export interface AppSettings { voiceEnabled: boolean }` et `export const DEFAULT_SETTINGS: AppSettings = { voiceEnabled: false }` (export nommé, pas de `I`, AR15).
  - [ ] 1.2 `src/services/storageService.ts` : ajouter `SETTINGS_STORAGE_KEY = '1score:settings'`, `SETTINGS_STORAGE_VERSION = 1`, `interface PersistedSettings { version: number; settings: AppSettings }`, une garde `isPersistedSettings(value): value is PersistedSettings` (version exacte + `typeof settings.voiceEnabled === 'boolean'`), `loadSettings(): AppSettings` (retourne **toujours** un objet : `DEFAULT_SETTINGS` si absent ; sauvegarde illisible → `console.warn('[storage] unreadable settings dropped')` + `removeItem` + défauts ; stockage qui lève → `console.error('[storage] loadSettings failed:', e)` + défauts) et `saveSettings(settings: AppSettings): void` (`try/catch` + `console.error('[storage] saveSettings failed:', e)` — **sans** suppression : un réglage périmé n'a rien de dangereux, contrairement à une partie). Réutiliser `isRecord` et `parseJson` existants ; **ne pas toucher** à `GAME_STORAGE_VERSION` ni à `GameState`.
  - [ ] 1.3 Tests `storageService.test.ts` : aller-retour `saveSettings`/`loadSettings` ; stockage vide → défauts ; JSON corrompu, version 2, `voiceEnabled: 'oui'` → défauts + `console.warn` + entrée supprimée ; `setItem` qui lève (`vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw … })`) → `console.error`, pas d'exception ; la clé jeu n'est **pas** touchée par les fonctions settings (et réciproquement) ; la garde `?raw` « aucun `localStorage.` hors services » reste verte sans modification.

- [ ] **Task 2 — `useSettingsStore` (AC: 2, 4)**
  - [ ] 2.1 Créer `src/stores/useSettingsStore.ts` : `defineStore('settings', () => { … })` (setup store, comme `useGameStore` dont l'id est `'game'`) ; `const voiceEnabled = ref(loadSettings().voiceEnabled)` (lecture synchrone à la création — c'est le service qui absorbe les erreurs) ; `watch(voiceEnabled, (enabled) => saveSettings({ voiceEnabled: enabled }))` (flush `pre` par défaut : une écriture par action, pas d'`immediate`) ; actions `setVoiceEnabled(enabled: boolean)` et `toggleVoice()` (verbe + nom, AR15) ; `return { voiceEnabled, setVoiceEnabled, toggleVoice }`.
  - [ ] 2.2 Tests `useSettingsStore.test.ts` (`setActivePinia(createPinia())` et `localStorage.clear()` en `beforeEach`) : défaut `false` ; une valeur `true` persistée est relue à la création ; `toggleVoice()` bascule et écrit **une fois** (`setItem` compté, `await nextTick()` avant de lire — le `watch` est en flush `pre`, piège consigné en 1.15) ; `setVoiceEnabled(true)` deux fois → une seule écriture (le `watch` ne tire pas sans changement) ; la clé écrite est `SETTINGS_STORAGE_KEY`, le JSON contient `version: 1` et `voiceEnabled`.

- [ ] **Task 3 — `useSpeech.ts` : Web Speech API + abonnement au store (AC: 3, 5, 6, 7, 8, 9, 10, 11)**
  - [ ] 3.1 Créer `src/composables/useSpeech.ts` (exports nommés) :
    - `export function isSpeechSupported(): boolean` → `typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'` — garde de **présence**, pas de type (cadrage 5a ; `useHaptics` est le modèle : « TypeScript ne protège pas »).
    - `export function announcementFor(name: string, series: number): string` — fonction **pure**, testée seule : `` `${name.toLowerCase()}, ${series}.` `` (AC6). Une seule définition du texte, importée par les tests.
    - `function pickFrenchVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null` — `getVoices()` lu à l'appel, filtre `voice.lang.replace('_', '-').toLowerCase().startsWith('fr')`, `localService` d'abord, sinon la première `fr`, sinon `null` (AC11).
    - `function speak(text: string): void` — garde `isSpeechSupported()` ; `try { if (synth.paused) synth.resume(); if (synth.speaking || synth.pending) synth.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.voice = pickFrenchVoice(synth); currentUtterance = u; synth.speak(u) } catch (e) { console.error('[speech] speak failed:', e) }` — `currentUtterance` est une variable de module (AC11, cadrage 5d). **Synchrone**, sans `nextTick` ni `setTimeout`.
    - `export function useSpeech()` — appelé une fois dans `App.vue` : `const gameStore = useGameStore(); const settingsStore = useSettingsStore(); const { voiceEnabled } = storeToRefs(settingsStore)` ; abonnement `gameStore.$onAction(({ name, store, after }) => { if (name !== 'validateScoreInput') return; const before = store.reprises; const playerId = store.activePlayer; after(() => { if (!voiceEnabled.value || store.reprises === before) return; const series = store.reprises[store.reprises.length - 1]?.[playerId]; if (series === null || series === undefined) return; speak(announcementFor(store[playerId].name, series)) }) })` — `before`/`playerId` sont capturés **avant** l'action (le tour bascule pendant) ; `reprises` est un `shallowRef` **remplacé** à chaque série et jamais muté (AR9), l'identité suffit à distinguer une série enregistrée d'un no-op (buffer vide, hors `playing`) ; le proxy réactif d'un même tableau est stable (cache de Vue), la comparaison `===` tient. **`passTurn` n'est pas abonné** (AC7). Coupure : `watch(voiceEnabled, (enabled) => { if (!enabled && isSpeechSupported()) window.speechSynthesis.cancel() })` (AC3). Le `$onAction` retourne son désabonnement : l'appeler dans `onScopeDispose` (déclaré **de façon synchrone** dans le corps du composable, piège 1.13). Retourner `{ supported: isSpeechSupported() }` (lecture, tests).
  - [ ] 3.2 `App.vue` : `useSpeech()` sous `usePwaUpdate()`. Rien d'autre ; le template reste `<router-view />`.
  - [ ] 3.3 Tests `useSpeech.test.ts` — happy-dom n'a **ni** `speechSynthesis` **ni** `SpeechSynthesisUtterance` (vérifié le 2026-09-10 : aucune occurrence dans `node_modules/happy-dom/lib`) : en `beforeEach`, installer sur `window` un faux `speechSynthesis` (`{ speak: vi.fn(), cancel: vi.fn(), resume: vi.fn(), getVoices: vi.fn(() => voices), speaking: false, pending: false, paused: false }`) et une classe `SpeechSynthesisUtterance` factice (`constructor(text) { this.text = text }`, champs `lang`, `voice`) ; les **supprimer** en `afterEach` (`delete`, vue détachée du type comme dans `useHaptics.test.ts`) ; `setActivePinia(createPinia())`, `localStorage.clear()` ; exécuter `useSpeech()` dans un `effectScope()` et `scope.stop()` en fin de test. Cas :
    - annonce désactivée (défaut) : `startGame` + `appendScoreDigit` + `validateScoreInput` → `speak` **jamais** appelé, `cancel` non plus (AC10) ;
    - activée (`settingsStore.setVoiceEnabled(true)` → **aucun** `speak`, AC2) : série `12` par `validateScoreInput('player1')` sur MICHEL → un `speak` avec `text === announcementFor('MICHEL', 12)` = `'michel, 12.'`, `lang === 'fr-FR'` (AC6) ; puis `passTurn()` (jaune) → **rien** (AC7) ; puis `0` tapé et validé → `'andré, 0.'` ;
    - **plafonnement** : distances `{ player1: 10 }`, série `8` puis `5` tapé → l'annonce dit `2`, pas `5` (AC6) ;
    - buffer vide : `validateScoreInput` → rien (AC7) ; `adjustScore`, `undoLastAction`, `swapPlayers`, `restartGame`, `rematch` (après `finishGame`), `resumeGame` (sauvegarde posée à la main comme dans les tests 1.12) → rien ; `validateScoreInput` en `idle` → rien ;
    - interruption : `speaking = true` avant la seconde série → `cancel` appelé **avant** `speak` (ordre vérifié via `mock.invocationCallOrder`) ; `paused = true` → `resume` appelé (AC8) ; `speaking = false, pending = false` → **pas** de `cancel` ;
    - voix : `voices = [{ lang: 'en-US', localService: true }, { lang: 'fr_FR', localService: false, name: 'Google' }, { lang: 'fr-FR', localService: true, name: 'Thomas' }]` → `utterance.voice.name === 'Thomas'` ; sans voix `fr` → `voice === null` et `lang === 'fr-FR'` ; `getVoices` appelé à **chaque** `speak` (AC11) ;
    - coupure : `setVoiceEnabled(false)` → `cancel` et pas de `speak` (AC3) ;
    - série validée pendant une offre d'égalisatrice (série gagnante du blanc) → annonce prononcée **et** `endPrompt` posé (AC9) ;
    - API absente (test sans installation du faux) : `isSpeechSupported() === false`, `useSpeech()` puis une série → **aucune exception** (AC5) ; `speak` qui lève → `console.error('[speech] speak failed:', …)` absorbé ;
    - `scope.stop()` → plus aucun `speak` après une série suivante (désabonnement).

- [ ] **Task 4 — Picto VOIX dans la barre basse de `GameView` (AC: 1, 2, 5)**
  - [ ] 4.1 `GameView.vue` : `const settingsStore = useSettingsStore(); const { voiceEnabled } = storeToRefs(settingsStore)` (AR17) ; `const voiceAvailable = isSpeechSupported()` (constante, lue une fois au montage) ; `function toggleVoice(): void { settingsStore.toggleVoice() }` — pas de grâce anti-tap fantôme : la barre est sous la carte de la pop-up, comme la sortie et RECOMMENCER qui n'en ont pas. Aucun état local : le réglage vit dans le store.
  - [ ] 4.2 Template : remplacer la colonne centrale vide de la barre (`<div class="w-1/5 shrink-0" />`) par `<div class="flex w-1/5 shrink-0 justify-center">` contenant **un seul** `<button data-testid="voice-button" aria-label="Annonce vocale" :aria-pressed="voiceEnabled" :disabled="!voiceAvailable" class="disabled:opacity-30" :class="PICTO_BUTTON_CLASSES" @pointerdown="toggleVoice">` avec le SVG inline (`aria-hidden="true"`, `viewBox="0 0 24 24"`, `class="h-8 w-8"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, mêmes attributs que les pictos voisins) : tête + bulle (Lucide `speech`) et, `v-if="!voiceEnabled"`, une `<line>` diagonale de coin à coin (`data-testid="voice-off-slash"`). **Pas de duplication** : la colonne centrale ne change pas de côté. Ne rien changer aux pictos de sortie/RECOMMENCER ni au CTA ; la colonne centrale n'a pas de marge négative à compenser (elle n'est pas au bord).
  - [ ] 4.3 Tests `GameView.test.ts` (nouveau `describe('GameView — annonce vocale')`, `localStorage.clear()` en `beforeEach` — le réglage persisté survivrait sinon d'un test à l'autre —, faux `speechSynthesis` installé en `beforeEach` pour que `voiceAvailable` soit vrai, retiré en `afterEach`) : picto présent **une fois**, dans la colonne centrale (parent `w-1/5`), entre les deux colonnes 2/5 dans l'ordre du DOM ; ne bouge pas quand le tour bascule (`store.switchTurn()` → toujours un seul `voice-button`, même parent) ; tap → `settingsStore.voiceEnabled` passe à `true`, `aria-pressed="true"`, `voice-off-slash` absent, entrée `1score:settings` écrite (`await nextTick()`), `canUndo` inchangé, tour inchangé, aucune pop-up ; second tap → `false`, trait présent ; sans faux `speechSynthesis` → `voice-button` `disabled` et inerte (happy-dom n'envoie pas le handler d'un bouton désactivé — c'est ce que le test vérifie, piège 1.15 ; garde `if (!voiceAvailable) return` dans `toggleVoice` si la version de happy-dom en décidait autrement).

- [ ] **Task 5 — Passe visuelle et sonore unique (AC: 1, 6, 8 — CLAUDE.md §9)**
  - [ ] 5.1 `npm run dev` + extension Claude for Chrome (demander quel Chrome utiliser — deux sont connectés, mémoire 1.15), harnais iframe `public/_viewport-harness.html` pour **1024×768** puis **768×1024** (supprimé en fin de passe), store piloté depuis l'iframe (`[data-v-app].__vue_app__.config.globalProperties.$pinia._s.get('game')` et `.get('settings')`), `pendingRestore` jeté si présent. Mesures DOM : picto 90×90 px, centré dans la colonne centrale (`getBoundingClientRect()` contre la console au-dessus), glyphe barré/non barré, `aria-pressed`, aucun débordement (`scrollWidth` = `innerWidth` en portrait).
  - [ ] 5.2 Son : activer VOIX → **rien** n'est prononcé ; série au pavé par `VALIDER` → « michel, douze » ; série par auto-validation 3 s → annonce ; main rendue → silence ; deux séries coup sur coup → la seconde interrompt la première ; couper VOIX → silence sur la série suivante ; `⌘R` → réglage conservé, picto dans l'état laissé ; console vierge. Chrome desktop : voix Google française **distante**, le réseau doit être disponible pour cette passe (cadrage 5b). Ne pas rester sur une saisie ouverte à la fin (la 1.12 la rouvrirait à la passe suivante).
  - [ ] 5.3 Consigner dans le Dev Agent Record : nom de la voix retenue par `pickFrenchVoice` sur ce Chrome (`localService` ?), et la **vérification sur Android laissée à Nathan** (Task 6.5) — ne pas la cocher soi-même.

- [ ] **Task 6 — Specs (AC: 12)**
  - [ ] 6.1 `epics.md` › Story 1.16 : note datée du cadrage (picto VOIX dans la colonne centrale de la barre, réglage de tablette persisté sous sa propre clé, `useSettingsStore`, annonce « nom, série. » sur `validateScoreInput` seulement, main rendue muette, défaut désactivé, cible Android, pas de confirmation vocale, story reportée) ; AR13 → « livré en 1.16 (`useSpeech.ts`, `$onAction`) » ; AR7 → note « + `useSettingsStore` (réglages de la tablette, 1.16) ».
  - [ ] 6.2 `ux-design-specification.md` : fiche `ActionBar` → note *Story 1.16* (colonne centrale de la barre : picto VOIX à place fixe, glyphe personne qui parle, barré quand coupé, grisé si non supporté) ; « Feedback Patterns » → puce « Annonce vocale (FR42) : … » ; §2.5 point 3 « Feedback » → mention de l'annonce vocale optionnelle.
  - [ ] 6.3 `architecture.md` : « Stores Pinia » → `useSettingsStore` (réglages de la tablette, `localStorage` clé `1score:settings`) ; « Gaps » › `useSpeech.ts` → « livré en 1.16 » avec les contraintes navigateurs (cadrage 5) ; « Mapping Exigences → Fichiers » FR39-FR43 → `useSpeech.ts`, `useSettingsStore.ts`, `GameView.vue` ; « Arborescence » → `types/settings.ts`, `stores/useSettingsStore.ts`, `composables/useSpeech.ts`.
  - [ ] 6.4 `deferred-work.md` : section « Deferred from: dev-story 1-16 » → vérification sur Android par Nathan (Task 6.5) ; « iPad : `speak()` exige un geste, l'auto-validation à 3 s peut rester muette — hors cible, non traité » comme point ouvert.
  - [ ] 6.5 Créer `1-16-actions-manuelles-nathan.md` (même dossier, même format que `1-13-actions-manuelles-nathan.md`) : sur **Android** (PWA installée, **hors ligne**, Google TTS avec pack français installé) — activer VOIX (rien ne doit être prononcé) ; série par `VALIDER` ; **série par auto-validation 3 s** ; main rendue (silence) ; couper ; relancer l'app → réglage conservé ; retour d'arrière-plan puis série. iPad : à essayer **pour information** seulement.
  - [ ] 6.6 `sprint-status.yaml` → `in-progress` au démarrage du dev, `review` en fin.

- [ ] **Task 7 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts ; aucune régression sur les **428 tests / 15 fichiers** de départ (vérifiés le 2026-09-10) ; **aucune dépendance ajoutée** (la Web Speech API est native) ; garde « aucune ressource réseau » (1.13) verte — le SVG est inline ; aucun harnais résiduel (`_viewport-harness.html` supprimé).

## Dev Notes

### Décisions produit (Nathan, 2026-09-10)

1. **Annonce = nom + série**, pas de total (« Michel, douze. »).
2. **Main rendue sans marquer : silence.** Seule la série saisie au pavé est annoncée.
3. **Glyphe d'une personne qui parle**, pas un haut-parleur ; picto **au même niveau que la sortie et RECOMMENCER**, dans la barre basse. La colonne des pictos alternants ne peut pas en porter trois en portrait : la story le place dans la **colonne centrale** de la barre, à place fixe (à confirmer au rendu si Nathan le voulait strictement dans la même colonne).
4. **Défaut désactivé.**
5. **Cible Android** : pas de confirmation vocale à l'activation, iOS hors périmètre.
6. **Story reportée** : pas prioritaire, à faire plus tard.

### Décisions d'implémentation prises à la création

- **`$onAction` plutôt qu'un `watch` sur `reprises`.** `reprises` est aussi remplacé par `undoLastAction`, `swapPlayers` (`map`), `resumeGame`, `startGame`, `passTurn` : un `watch` annoncerait à chaque annulation et à chaque main rendue. Filtrer par **nom d'action** (`validateScoreInput` seul) est exact et lisible ; l'identité de `reprises` avant/après règle les no-op (buffer vide, hors `playing`). `after()` s'exécute **de façon synchrone** pour une action synchrone.
- **Pourquoi pas dans `GameView`** : `validateEntry` de la vue n'est qu'un des chemins ; un pilotage déporté (V2+, UX-DR23) appelle le store. L'annonce est un **effet de bord d'action**, comme la persistance (1.12, `watch(persistedState)`), pas un geste d'écran.
- **Pourquoi pas dans le store** : le store ne touche à aucune API navigateur directement (le `localStorage` passe par le service) ; la parole est une **sortie** de l'application, elle vit dans un composable, comme le haptique (`useHaptics`) et la mise à jour PWA (`usePwaUpdate`).
- **Un store `settings` séparé**, pas un champ de `useGameStore` : `GameState` est la forme **persistée et versionnée** de la partie (1.12) — y ajouter un réglage obligerait à incrémenter `GAME_STORAGE_VERSION` (jetant les sauvegardes en cours), le rendrait annulable par `ANNULER` (snapshot) et jetable par `resetGame`. Un réglage de tablette n'a rien de tout cela.
- **Colonne centrale de la barre** : elle existe déjà (`<div class="w-1/5 shrink-0" />`, calée sur la console), elle est vide, et un picto à place fixe y est cohérent avec la règle générale « un contrôle de navigation ne se déplace jamais » — l'alternance des pictos de sortie/RECOMMENCER est l'exception, pas la règle. Un seul markup, pas de duplication (la dette de la barre n'est pas aggravée).
- **`cancel()` seulement si `speaking || pending`** : un `cancel()` inconditionnel juste avant `speak()` a historiquement fait taire Chrome (le `speak` suivant ne partait pas). À vérifier à la passe Chrome ; si le second `speak` d'une rafale ne part pas, essayer `cancel()` **puis** `speak()` dans le même tick sans autre appel entre les deux.
- **Nom en minuscules pour le moteur** : les noms sont stockés en capitales (1.4). Un moteur TTS peut lire `ANDRÉ` comme un sigle ; `andré` est lu normalement. L'affichage ne change pas. `toLowerCase()` et non `toLocaleLowerCase('fr')` : les noms viennent d'`AlphaKeyboard` (ASCII + `É È À Ç`).
- **Pas de `volume`, `rate`, `pitch`** : valeurs par défaut du moteur. Le volume est celui de la tablette (« volume réglable » du brainstorming #17 : hors périmètre).
- **`voiceAvailable` constante au montage** : la présence de l'API ne change pas en cours de session. Ne pas la rendre réactive.

### Ce que cette story NE fait PAS

- Pas d'annonce de la main rendue, du total, de la fin de partie, du vainqueur, d'un record (FR44, Epic 6 / Story 3.5), ni du « pour n » (Epic 2).
- Pas de confirmation vocale à l'activation, pas de déblocage iOS, pas de test iPad exigé.
- Pas d'écran ni de modale de réglages, pas de route `/settings` (AR6) — un picto.
- Pas de réglage de volume, de voix, de vitesse.
- Pas de son autre que la parole (aucun bip, aucun fichier audio — rien à précacher).
- Pas de modification de `GameState`, de `GAME_STORAGE_VERSION`, des snapshots, de `CenterPanel`, ni de la pop-up de saisie.
- Pas de durcissement du store pendant une pop-up ouverte (famille « pilotage déporté », différée 1.7/1.10/1.15).
- Pas de refactor de la colonne des pictos alternants (dette 1.5/1.15) : la story ne la touche pas.

### État du code au démarrage

| Fichier | Aujourd'hui | Ce que la story y fait |
|---|---|---|
| `src/stores/useGameStore.ts` (~740 l.) | `defineStore('game', …)` ; `validateScoreInput` (l. ~365) et `passTurn` (l. ~401) : garde `playing`, `pushHistory`, `addReprise` (plafonné), `switchTurn`, `checkEndOfGame` ; `reprises`/`history` en `shallowRef` remplacés | **inchangé** — abonné de l'extérieur par `$onAction` |
| `src/services/storageService.ts` (~110 l.) | clé `1score:game`, enveloppe versionnée, `isRecord`/`parseJson`, AR12 | `+ SETTINGS_STORAGE_KEY/VERSION`, `loadSettings`, `saveSettings` |
| `src/composables/useHaptics.ts` | garde `typeof navigator.vibrate === 'function'`, commentaire « TypeScript ne protège pas » | **modèle** de la garde `isSpeechSupported` |
| `src/composables/usePwaUpdate.ts` | composable appelé une fois dans `App.vue`, `storeToRefs(useGameStore())`, `onScopeDispose` synchrone, erreurs en `console.error('[pwa] …')` | **modèle** de `useSpeech` |
| `src/views/GameView.vue` (~390 l.) | barre basse : colonnes `w-2/5` (CTA / pictos alternants) autour d'une colonne centrale **vide** `<div class="w-1/5 shrink-0" />` ; `PICTO_BUTTON_CLASSES` ; SVG inline | `+ useSettingsStore`, `toggleVoice`, picto `voice-button` dans la colonne centrale |
| `src/components/CenterPanel.vue` | `ANNULER` `:disabled` + `disabled:opacity-30` | **inchangé** |
| `src/App.vue` | `usePwaUpdate()` + `<router-view />` | `+ useSpeech()` |
| `src/views/GameView.test.ts` (~1320 l.) | helpers `startedGame`, `validateSeries`, `press`, `prompt`, `panels` ; fake timers dans « fin de partie » ; `localStorage.clear()` dans « reprise après fermeture » | + `describe` « annonce vocale » |
| `src/composables/useHaptics.test.ts` | `delete nav.vibrate` en `beforeEach`/`afterEach`, vue détachée du type | **modèle** du faux `speechSynthesis` |
| `src/composables/usePwaUpdate.test.ts` | `effectScope().run(...)`, `scope.stop()`, `console.error` espionné en `mockImplementation(() => {})` | **modèle** de `useSpeech.test.ts` |

### Pièges à ne pas rejouer (revues 1.3 → 1.15)

- **`reprises` et `history` sont des `shallowRef`** : jamais `push` — la story ne les touche pas, mais l'identité `store.reprises === before` **repose** sur ce remplacement.
- **`@pointerdown` déclenche au contact** : VOIX n'a rien de destructif, pas de confirmation, pas de grâce (comme ses voisins de barre).
- **`gap-4` = 32 px, `gap-2` = 16 px** (`--spacing: 8px`).
- **Tailwind v4 JIT** : classes écrites en toutes lettres (`disabled:opacity-30`).
- **Test de persistance** : `await nextTick()` après l'action avant de lire `localStorage` (flush `pre`).
- **`onScopeDispose` synchrone** dans le corps du composable, jamais dans un callback (1.13).
- **`lib.dom.d.ts` ment** sur la présence de `speechSynthesis` comme sur `vibrate` : garde de présence obligatoire, sinon happy-dom lève `ReferenceError` au premier `speak`.
- **Aucune ressource réseau dans `src/`** (garde 1.13) : SVG inline, pas de `<img>`, pas d'audio.
- **Ne pas « nettoyer » les specs au-delà du sujet** : notes datées, historique conservé.

### Project Structure Notes

- Nouveaux : `1score/src/types/settings.ts`, `src/stores/useSettingsStore.ts`, `src/stores/useSettingsStore.test.ts`, `src/composables/useSpeech.ts`, `src/composables/useSpeech.test.ts`, `_bmad-output/implementation-artifacts/1-16-actions-manuelles-nathan.md`.
- Modifiés : `src/services/storageService.ts` + test, `src/views/GameView.vue` + test, `src/App.vue` ; specs `_bmad-output/planning-artifacts/{epics,ux-design-specification,architecture}.md`, `_bmad-output/implementation-artifacts/{deferred-work.md,sprint-status.yaml}`.
- Nommage (AR15) : `useSettingsStore` (id `'settings'`), `useSpeech`, actions `setVoiceEnabled`/`toggleVoice`, `data-testid="voice-button"`, type `AppSettings` (sans `I`), exports nommés. Écart assumé vis-à-vis d'AR7 (« `useGameStore` et `useHistoryStore` ») : un troisième store, consigné dans l'architecture (Task 6.3).
- Stack inchangée : Vue 3.5 `<script setup>`, Pinia 4 (`$onAction` disponible sur les setup stores), Tailwind 4, Vitest 5 + happy-dom 20. Aucune dépendance ajoutée.

### Point à confirmer au rendu (non bloquant)

- **Colonne centrale vs colonne des pictos alternants.** Nathan demande le picto « au même niveau que QUITTER et RECOMMENCER » ; la story le met dans la colonne **centrale** de la barre (même ligne, place fixe) parce que trois pictos de 90 px ne tiennent pas dans la colonne alternante en portrait (334 px pour 307). Si Nathan le veut malgré tout dans la colonne alternante, il faudra réduire l'écart (`gap-1`) **et** la marge extérieure, ou passer sous 90 px — une exception UX-DR8 à arbitrer.

### References

- [Source: décisions de Nathan, 2026-09-10 (conversation de création) — nom + série sans total, main rendue muette, glyphe personne qui parle au niveau des pictos de la barre, défaut désactivé, cible Android, story reportée]
- [Source: epics.md#Story 1.16 (AC FR42, AR13 `useSpeech.ts`) ; AR6 (réglages = modales inline, pas de route), AR7 (stores), AR12, AR15, AR16, AR17 ; UX-DR14/UX-DR22 (signal non chromatique), UX-DR15 (deux chemins de validation = même état), UX-DR23 (actions nommées, pilotage déporté) ; Story 1.5 « règle d'alternance » ; Story 1.10 (plafonnement) ; Story 1.12 (`GameState` versionné, `watch` par action) ; Story 1.15 (pictos de la barre, `PICTO_BUTTON_CLASSES`)]
- [Source: prd.md l. 104 « Annonce vocale du score (on/off) » (V1a) ; FR42 l. 437 ; NFR13 (aucune donnée externe)]
- [Source: brainstorming-session-2026-05-18-now.md › UX #17 « Annonce Vocale Désactivable » — « utile en compétition pour que les spectateurs suivent sans regarder l'écran », volume réglable (hors périmètre)]
- [Source: ux-design-specification.md › fiche `ActionBar` (notes 1.5 et 1.15 : colonnes 2/5 · 1/5 · 2/5, pictos alternants, sortie au bord), « Barre d'action permanente » (un contrôle de navigation ne se déplace jamais — exception assumée sur l'écran de partie), « Feedback Patterns », « Note de compatibilité future — pilotage à distance »]
- [Source: architecture.md › « Stores Pinia », « Réglages en V1 : modales inline », « Gaps Identifiés » (`useSpeech.ts`), « Mapping Exigences → Fichiers » FR39-FR43, « Frontières & Flux de Données », note 1.13 (`usePwaUpdate` dans `App.vue`)]
- [Source: 1-13 story — modèle de composable appelé dans `App.vue`, `onScopeDispose` synchrone, recette `effectScope` en test, AC5 « vérification sur appareil par Nathan », `1-13-actions-manuelles-nathan.md`]
- [Source: 1-15 story — Pièges (`--spacing`, flush `pre`, happy-dom et `disabled`), passe visuelle par iframe et store de l'iframe, mesures de la colonne des pictos (paysage 0–410, portrait 461–768)]
- [Source: 1-12 story — `GameState` = forme persistée versionnée, clé `1score:game`, garde structurelle minimale, `console.warn` sur sauvegarde illisible]
- [Source: deferred-work.md — revue 1.5 (markup dupliqué dans la barre — non aggravé), revues 1.7/1.10/1.15 (store non durci pendant une pop-up — non touché), revue 1.2 (pas de convention d'id de store — `'settings'` suit `'game'`)]
- [Source: 1score/CLAUDE.md §2 (pointer), §3 (storage en service), §4 (Pinia, `storeToRefs`), §6 (tests co-localisés), §7 (`--spacing: 8px`), §9 (validation)]
- [Source: code — `useGameStore.ts` (`defineStore('game')` l. 93, `validateScoreInput` l. ~365, `passTurn` l. ~401, `capToRemainingDistance`, `checkEndOfGame`, `persistedState`/`watch`), `storageService.ts` (`isRecord`, `parseJson`, enveloppe versionnée), `useHaptics.ts`/`.test.ts` (garde de présence, `delete` en test), `usePwaUpdate.ts`/`.test.ts` (`App.vue`, `effectScope`), `GameView.vue` (colonne centrale vide de la barre, `PICTO_BUTTON_CLASSES`, SVG inline), `GameView.test.ts` (helpers « fin de partie », `localStorage.clear()`)]
- [Source: recherche web du 2026-09-10 — Chrome M71+ : `speak()` sans activation utilisateur refusé (activation collante) ; iOS Safari : `speak()` doit être dans un geste, `setTimeout` casse la chaîne (hors cible) ; Chrome Android : `utterance.lang` obligatoire, `lang` en `fr_FR`, voix par défaut de l'appareil ; Chrome desktop : voix distantes seulement ; utterance ramassé par le GC sans référence conservée ; `getVoices()` vide avant `voiceschanged` — testmuai.com « Speech Synthesis API: Browser Support », talkrapp.com « Lessons Learned Using the javascript speechSynthesis API », readium.org/speech « SpeechSynthesis in browsers and OSes »]
- [Source: sonde du 2026-09-10 — `grep -rl speechSynthesis node_modules/happy-dom/lib` : aucune occurrence ; `lib.dom.d.ts` déclare `SpeechSynthesis`/`SpeechSynthesisUtterance` sans garde ; `npm test` : 428 tests / 15 fichiers verts]

## Change Log

| Date | Changement |
|---|---|
| 2026-09-10 | Création de la story (bmad-create-story) : cadrage en cinq décisions, contraintes iOS/Chrome/happy-dom vérifiées, 5 questions ouvertes posées à Nathan. |
| 2026-09-10 | Décisions de Nathan : annonce « nom, série » sans total ; main rendue muette ; glyphe « personne qui parle » au niveau des pictos de la barre (placé en colonne centrale, à confirmer) ; défaut désactivé ; cible Android, sans confirmation vocale ni déblocage iOS. **Story reportée, non prioritaire.** |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
