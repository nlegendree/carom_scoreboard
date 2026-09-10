import { onScopeDispose, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useGameStore } from '../stores/useGameStore'

// Story 1.13 : la tablette tourne 24 h/24 sans jamais recharger. Sans vérification
// périodique, elle ne verrait jamais un déploiement.
export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

/**
 * Mise à jour automatique de la PWA, appliquée uniquement à l'accueil.
 *
 * - Vérifie une nouvelle version toutes les 60 min (si en ligne) via `registration.update()`.
 * - Une version trouvée (`needRefresh`) est appliquée par rechargement DÈS que
 *   `status === 'idle'` : tout de suite sur l'écran de veille, sinon à la fin de la partie.
 *   Jamais pendant `playing` ni `finished` : on n'interrompt pas une partie (UX-DR18).
 * - Aucune pop-up, aucun toast : le rechargement de l'accueil est invisible pour le club.
 * - Toute erreur (enregistrement, vérification, hors ligne) est absorbée en `console.error`.
 */
export function usePwaUpdate() {
  const { status } = storeToRefs(useGameStore())

  // Déclarés de façon synchrone dans le scope du composable : `onRegisteredSW` est appelé
  // plus tard, hors de tout scope actif, où `onScopeDispose` ne serait pas enregistré.
  let intervalId: ReturnType<typeof setInterval> | undefined
  let applying = false

  // Le module `virtual:pwa-register` ne recharge la page sur `controlling` que si
  // `isUpdate` est vrai. Or `workbox-window` classe comme EXTERNE (`isUpdate: false`)
  // toute mise à jour trouvée plus de 60 s après l'enregistrement — c'est précisément
  // la vérification horaire sur une tablette allumée 24 h/24 (vérifié le 2026-09-10 :
  // sans ceci, le nouveau SW prend le contrôle mais la page reste sur l'ancienne
  // version). On recharge donc nous-mêmes quand le nouveau SW prend le contrôle. Le
  // drapeau `applying` écarte le `controllerchange` du premier chargement (`clientsClaim`).
  const swContainer = 'serviceWorker' in navigator ? navigator.serviceWorker : undefined
  const onControllerChange = () => {
    if (applying) window.location.reload()
  }
  swContainer?.addEventListener('controllerchange', onControllerChange)

  onScopeDispose(() => {
    clearInterval(intervalId)
    swContainer?.removeEventListener('controllerchange', onControllerChange)
  })

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      // `registration.update()` fait la vérification lui-même ; `navigator.onLine` suffit
      // comme garde, et un échec (réseau, 404 pendant un déploiement) est absorbé.
      intervalId = setInterval(async () => {
        if (!navigator.onLine) return
        try {
          await registration.update()
        } catch (e) {
          console.error('[pwa] update check failed:', e)
        }
      }, UPDATE_CHECK_INTERVAL_MS)
    },
    onRegisterError(e) {
      console.error('[pwa] registration failed:', e)
    },
  })

  // `updateServiceWorker(true)` envoie SKIP_WAITING au SW en attente ; le rechargement
  // suit sur `controllerchange` (ci-dessus). Le drapeau évite un second appel entre les deux.
  watch(
    [needRefresh, status],
    ([refresh, s]) => {
      if (refresh && s === 'idle' && !applying) {
        applying = true
        updateServiceWorker(true)
      }
    },
    { immediate: true },
  )

  return { needRefresh }
}
