// Retour haptique des frappes du pavé numérique (AC6, AC7).
//
// Deux précautions non négociables, l'une pour les tests, l'autre pour l'appareil cible :
// - `navigator.vibrate` est ABSENT de happy-dom, et l'API Vibration n'est implémentée par
//   AUCUNE version de Safari iOS/iPadOS. TypeScript ne protège pas : `lib.dom.d.ts` déclare
//   `vibrate()` comme toujours présente, donc un appel non gardé compile et casse à
//   l'exécution. D'où la garde `typeof … === 'function'`.
// - Sur une borne iPad il n'y aura donc AUCUN retour haptique : le flash visuel et la
//   pulsation de refus portent seuls le feedback (raison d'être du signal visuel d'AC7).
//
// L'appel est synchrone dans le handler `pointerdown` : la contrainte NFR1 (< 100 ms) ne
// tolère ni `nextTick` ni aller-retour par le store.

// Impulsion d'accusé de réception d'une frappe prise en compte.
const TAP_DURATION_MS = 40
// Impulsion de refus (UX-DR10) : plus courte et sèche, reconnaissable au doigt sans
// regarder l'écran. C'est la DIFFÉRENCE entre les deux qui porte le sens.
const REJECT_DURATION_MS = 15

function vibrate(durationMs: number): void {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(durationMs)
  }
}

export function useHaptics() {
  return {
    tap: () => vibrate(TAP_DURATION_MS),
    reject: () => vibrate(REJECT_DURATION_MS),
  }
}
