// Types des composants d'interface de l'Epic 10 (refonte 1Score). Le modèle de partie
// reste dans `game.ts` : rien ici ne touche au store.

// Noms du jeu de pictos de `PictoIcon`. Les stories suivantes y ajoutent les leurs.
export type PictoName =
  | 'training'
  | 'signup'
  | 'power'
  | 'arrow-right'
  | 'arrow-left'
  | 'gear'
  | 'close'
  | 'chevron-right'
  | 'refresh'
  | 'arrow-right-left'

// `soon` : fonction affichée mais pas encore livrée (état BIENTÔT, inerte).
export type ItemState = 'normal' | 'soon'

// Commande de la variante « liste » de `PromptModal` (Story 10.2) : n choix empilés à la
// place du CTA principal. `id` est la valeur remontée par l'emit `select`, le libellé n'est
// qu'un affichage.
export interface PromptAction {
  id: string
  label: string
}

// Item de `SideBar`. Le contenu est fourni par l'écran, jamais codé dans la barre.
export interface SideBarItem {
  id: string
  picto: PictoName
  label: string
  state: ItemState
  action?: () => void
}
