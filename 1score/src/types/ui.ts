// Types des composants d'interface de l'Epic 10 (refonte 1Score). Le modèle de partie
// reste dans `game.ts` : rien ici ne touche au store.

// Noms du jeu de pictos de `PictoIcon`. Les stories suivantes y ajoutent les leurs.
export type PictoName = 'training' | 'signup' | 'power' | 'arrow-right'

// `soon` : fonction affichée mais pas encore livrée (état BIENTÔT, inerte).
export type ItemState = 'normal' | 'soon'

// Item de `SideBar`. Le contenu est fourni par l'écran, jamais codé dans la barre.
export interface SideBarItem {
  id: string
  picto: PictoName
  label: string
  state: ItemState
  action?: () => void
}
