import type { PlayerColor, PlayerId } from '../types/game'

// Les tables de la BILLE, partagées — même emplacement et même patron que
// `keyClasses.ts`. Avant la Story 11.3 elles vivaient recopiées : `BALL_PICTOS` deux fois
// (`PlayerSetupCard` en `PlayerColor`, `GameSummary` en `PlayerId`, mêmes deux chemins),
// `BALL_LABELS` et `BALL_CLASSES` (retirée depuis) chacune dans son fichier. L'audit du design system le
// relève en P2 (« constantes dupliquées »).
//
// Clés par `PlayerColor` — la bille est une COULEUR, pas une place à la table. Un écran qui
// raisonne en `PlayerId` traduit à l'appel (`ballOf`), il ne redéclare pas la table.
//
// ⚠️ Pictos servis depuis `public/` : aucune ressource réseau, l'app doit tourner hors ligne
// (FR45, NFR13). Ce sont les images fournies par Nathan (2026-09-12), et non des aplats
// colorés — ceux-ci ne se lisaient pas sur le ruban rouge du récap (décision 3 de Nathan,
// 2026-09-14).
export const BALL_PICTOS: Record<PlayerColor, string> = {
  white: '/bille_blanche.png',
  yellow: '/bille_jaune.png',
}

export const BALL_LABELS: Record<PlayerColor, string> = {
  white: 'BILLE BLANCHE',
  yellow: 'BILLE JAUNE',
}

// ⚠️ `BALL_CLASSES` (l'aplat de couleur de la bille) est RETIRÉE par la Story 11.5 : son seul
// consommateur, la pastille de `PromptModal`, affiche désormais l'image de `BALL_PICTOS`
// (Nathan, au rendu, 2026-09-19). Les couleurs `bg-player-*` restent consommées par les cartes.

// `player1` joue la bille BLANCHE, `player2` la jaune : la règle était déjà écrite en
// commentaire dans `GameSummary`, elle est ici une fonction — un seul endroit où la lire, et
// un seul à corriger si elle change. C'est le modèle du store et non une supposition
// d'affichage : `useGameStore` construit `player1` en `makePlayer('white')`, et
// `CHANGER DE BILLE` ne déplace que `whiteSide`, le CÔTÉ où la carte est posée.
//
// ⚠️ Table indexée et non ternaire (revue du 2026-09-17) : un ternaire faisait retomber sur
// `yellow` tout ce qui n'est pas `player1`, et une troisième valeur ajoutée à `PlayerId`
// serait passée sans un mot du compilateur — dans un module de base que le critère de sortie
// de l'epic invite tout écran neuf à consommer.
const BALL_OF: Record<PlayerId, PlayerColor> = {
  player1: 'white',
  player2: 'yellow',
}

export function ballOf(player: PlayerId): PlayerColor {
  return BALL_OF[player]
}
