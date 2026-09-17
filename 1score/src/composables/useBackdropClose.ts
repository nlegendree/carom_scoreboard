// Fermeture d'une pop-up au tap sur son voile — LE mécanisme, en un seul endroit.
//
// Il vivait recopié à l'identique dans les quatre pop-ups (`PromptModal`, `ScoreEntryDock`,
// `NumericPadDock`, `AlphaKeyboardSheet`) ; l'audit du design system le relève en P2
// (« mécanismes dupliqués »). Depuis la Story 11.3, `PopupCard` en est l'unique consommateur
// direct : les quatre pop-ups l'obtiennent en passant par elle.
//
// Règle du voile (Nathan, 2026-09-15, CLAUDE.md §10) : toute pop-up qui porte un CTA
// `ANNULER` ou `FERMER` se referme au tap dehors, et ce tap vaut ce CTA. Une pop-up sans
// retour garde un voile inerte — c'est ce que fait `enabled`.
//
// Trois précautions, toutes payées en revue :
// - le geste doit être COMPLET (appui ET relâchement du même pointeur). Se contenter du
//   relâchement refermait la pop-up dès son ouverture : une pop-up qui monte SOUS LE DOIGT
//   au `pointerdown` de `VALIDER` ou de `+` reçoit le `pointerup` de ce geste sur son voile,
//   qu'elle n'a jamais armé (revue du 2026-09-09) ;
// - le `pointerId` est MÉMORISÉ, jamais un booléen : une paume posée sur le voile n'arme
//   pas la fermeture au profit d'un autre doigt, et ne DÉSARME pas non plus le doigt actif
//   en se faisant annuler (revue du 2026-09-17 : `onPointercancel` prend son événement) ;
// - le geste se juge à la CIBLE de l'événement (`event.target === event.currentTarget`), et
//   NON à l'arrêt de propagation de la carte (revue du 2026-09-17). `@pointerup.stop` sur la
//   carte laissait un armement PÉRIMÉ derrière lui : le relâchement n'atteignait jamais le
//   voile, `armedPointerId` survivait à tout le reste de la vie de la pop-up, et le geste
//   suivant — parti DANS la carte, donc jamais armé — retombait sur le même `pointerId` (il
//   vaut 1 en permanence à la souris) et refermait la pop-up. Sur `ScoreEntryDock`, la série
//   en cours de frappe était perdue. Il ne protégeait d'ailleurs rien au tactile : la CAPTURE
//   IMPLICITE du pointeur redirige le `pointerup` vers la cible du `pointerdown`, si bien que
//   le gestionnaire de la carte ne se déclenchait même pas — happy-dom ne l'implémente pas,
//   ce qui faisait réussir le test sur un cas qui ne se produit pas au navigateur.
//
// ⚠️ Contrat qui en découle, à connaître : sous capture implicite, c'est le point de DÉPART
// du geste qui commande, pas le point d'arrivée. Un appui sur le voile suivi d'un
// relâchement au-dessus de la carte ferme la pop-up — le pointeur reste « capturé » par le
// voile. C'est l'intention d'armement qui compte, et c'est cohérent avec « appui ET
// relâchement du MÊME pointeur ».
//
// Seule exception assumée à `@pointerdown` seul (AR8) : la fermeture demande les deux temps.
export function useBackdropClose(
  onClose: () => void,
  options?: { enabled?: () => boolean },
): {
  onPointerdown: (event: PointerEvent) => void
  onPointerup: (event: PointerEvent) => void
  onPointercancel: (event: PointerEvent) => void
} {
  // `enabled` est une FONCTION et non un booléen : `PromptModal` le dérive du libellé de son
  // secondaire par un `computed`, dont la valeur change sur place. Relu aux DEUX temps du
  // geste — une pop-up devenue inerte entre l'appui et le relâchement ne se referme pas.
  const isEnabled = () => options?.enabled?.() ?? true

  // Le voile est la cible du geste, pas un ancêtre qui l'attrape au passage.
  const onBackdrop = (event: PointerEvent) => event.target === event.currentTarget

  let armedPointerId: number | null = null

  return {
    onPointerdown(event: PointerEvent): void {
      if (!onBackdrop(event)) return
      // Un pointeur déjà armé GARDE la main : sans cette garde, la paume posée après le doigt
      // écrasait l'armement de celui-ci, et c'est le relèvement de la paume qui fermait.
      if (armedPointerId !== null) return
      if (!isEnabled()) return
      armedPointerId = event.pointerId
    },

    onPointerup(event: PointerEvent): void {
      if (armedPointerId !== event.pointerId) return
      // Désarmé AVANT toute autre garde : le geste est fini, quoi qu'il advienne de la
      // fermeture. C'est ce qui interdit à un armement de survivre à son propre geste.
      armedPointerId = null
      if (!onBackdrop(event)) return
      if (!isEnabled()) return
      onClose()
    },

    onPointercancel(event: PointerEvent): void {
      if (armedPointerId !== event.pointerId) return
      armedPointerId = null
    },
  }
}
