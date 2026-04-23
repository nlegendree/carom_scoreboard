# Billard Français — Méchaniques du système de score

Extraction complète des règles, de la logique et des patterns d'UI du scoreboard existant.
Stack : Vue 3, Vite, localStorage, PWA.

---

## Modes de jeu

### 1. Carambole (classique)

Jeu à deux joueurs, organisé en **reprises**. Chaque reprise contient une série par joueur (score entier saisi au clavier).

**Données d'une reprise :**
```js
{ player1: 12, player2: 5 }   // complète
{ player1: 8,  player2: null } // joueur 2 n'a pas encore saisi
{ player1: null, player2: 15 } // joueur 1 n'a pas encore saisi
```

**Métriques calculées par joueur :**
- **Score total** — somme de toutes ses séries
- **Moyenne** — total / nombre de reprises jouées
- **Meilleure série** — max de toutes ses séries

### 2. Casin

Jeu à deux joueurs avec **9 catégories de tirs** indépendantes. La victoire est obtenue quand **toutes** les catégories atteignent l'objectif (`pattes`).

**Catégories :**
| ID | Nom affiché |
|----|-------------|
| `direct` | Direct |
| `libre` | Libre |
| `rouge` | Rouge |
| `casin` | Casin |
| `bande1` | Bande 1 |
| `bande2` | Bande 2 |
| `bande3` | Bande 3 |
| `main-gauche` | Main gauche |
| `bande-avant` | Bande avant |

**Données de score Casin :**
```js
categoryScores: {
  direct: 3,
  libre: 5,      // complété si pattes = 5
  rouge: 2,
  // ...
}
```

**Condition de victoire :** `Object.values(categoryScores).every(v => v >= pattes)`

---

## Structure des joueurs

```js
player: {
  id: 'player1' | 'player2',
  name: 'NOM',          // affiché en majuscules, max 20 caractères
  score: 0,             // total Carambole
  currentSeries: 0,     // saisie en cours
  pattes: 5,            // objectif Casin (1–10, configurable)
  shots: [],            // historique des tirs Casin
  sets: []              // sets complétés Casin
}
```

---

## Logique de saisie — Carambole

### Clavier numérique

- Chiffres 0–9, 3 digits maximum (valeur max 999 par série)
- Un indicateur "négatif" permet de saisir des déductions (soustraction du total)
- La valeur en cours est affichée dans un overlay centré pendant la saisie

### Auto-validation (3 secondes)

```
Joueur appuie sur un chiffre
  → timer démarre à 0 s
  → progress bar animée de 0 % à 100 % sur 3 s
  → à 100 % : validation automatique de la série
  → nouveau chiffre enfoncé : timer remis à 0
  → bouton "Correction" : annule la saisie, stoppe le timer
```

### Validation manuelle

- Quand le joueur 2 commence à saisir sa série → valide automatiquement celle du joueur 1
- Si le joueur 1 n'a rien saisi → sa série est créditée `0` automatiquement

### Undo / Correction

- **Premier appui sur "Correction"** : efface la saisie en cours (si saisie active)
- **Deuxième appui** : annule la dernière série enregistrée (la repasse à `null`)
- Cooldown de 1 seconde entre deux annulations pour éviter les doubles appuis

---

## Logique de saisie — Casin

- Chaque bouton de catégorie incrémente son compteur de 1
- Le bouton est **verrouillé** (plus cliquable) dès que `count >= pattes`
- Affichage d'une barre de progression : `width = (count / pattes) * 100%`
- L'undo enlève le dernier tir enregistré (dépile `shots`)
- Les scores sont sauvegardés en localStorage dès chaque changement

---

## Gestion des reprises

```
reprise N
  ├── série joueur 1  (null → en saisie → valeur entière)
  └── série joueur 2  (null → en saisie → valeur entière)
```

- L'ordre de saisie est **libre** : n'importe quel joueur peut entrer sa série en premier
- La table affiche les 5 dernières reprises avec : n° | série J1 | total J1 | série J2 | total J2
- Formatage : `null/0 → "-"`, `positif → "+N"`, `négatif → "-N"`
- Couleurs : vert (+), rouge (−), gris (null/0)

---

## Persistance

**Clé localStorage :** `scoreboard-game-data`

Données sauvegardées :
- joueurs (nom, score, séries)
- tableau des reprises
- mode de jeu actuel
- scores Casin par joueur (`casinScores_player1`, `casinScores_player2`)

**Déclencheur :** watchers Vue avec debounce 500 ms pour éviter les écritures excessives.
**Au montage :** lecture du localStorage ; si vide, affichage du sélecteur de mode.

---

## Minuteur de partie (Casin)

- Démarre à la sélection du mode
- Stocke le timestamp de début : `gameStartTime = Date.now()`
- Interval de 1 s pour recalculer le temps écoulé : `gameTime = Math.floor((now - gameStartTime) / 1000)`
- Affiché en `mm:ss`
- S'arrête à la victoire

---

## Gestion du nom des joueurs

- Clic sur le nom → champ d'édition inline
- Bouton "effacer" (×) disponible pendant l'édition
- Sauvegarde en `UPPERCASE` à la confirmation
- Limite : 20 caractères

---

## Optimisations tactiles

| Technique | Effet |
|-----------|-------|
| `vibrate(50–100ms)` | Retour haptique sur chaque appui clavier |
| `touch-action: manipulation` | Supprime le délai 300 ms (double-tap zoom iOS) |
| `-webkit-tap-highlight-color: transparent` | Supprime le flash bleu iOS |
| `transform: scale(0.95)` sur touch | Feedback visuel immédiat |
| Détection tap < 500 ms | Distingue tap et long press |

---

## Layout responsive

### Desktop (> 768 px)
```
[ Joueur 1 (40%) ] [ Centre (20%) ] [ Joueur 2 (40%) ]
```

### Mobile (≤ 768 px)
```
[ Joueur 1 (35vh) ]
[ Centre (flex)   ]
[ Joueur 2 (35vh) ]
```

Tailles de police fluides avec `clamp()`.
Boutons minimum 90 px pour le tactile.

---

## Thème visuel joueurs

| Joueur | Fond | Accent |
|--------|------|--------|
| Joueur 1 | Blanc / gris clair | Neutre |
| Joueur 2 | Orange / orange foncé | Orange |

---

## Machine à états simplifiée

```
[Démarrage]
    │
    ▼
[Sélection du mode]  ←──────────────────┐
    │                                    │
    ▼                                    │
[Partie en cours]                        │
    │  ├─ Carambole : saisie de séries   │
    │  └─ Casin : incrémentation tirs    │
    │                                    │
    ├─ "Nouvelle partie" ────────────────┘
    │
    ▼ (Casin seulement)
[Victoire] → affichage trophée, timer stoppé
```

---

## Exemple de calcul Carambole

```
Reprise 1 : J1 = 12,  J2 = 5    → Totaux : J1 = 12,  J2 = 5
Reprise 2 : J1 = 8,   J2 = −3   → Totaux : J1 = 20,  J2 = 2
Reprise 3 : J1 = 15,  J2 = 10   → Totaux : J1 = 35,  J2 = 12
Reprise 4 : J1 = 0,   J2 = 20   → Totaux : J1 = 35,  J2 = 32

Moyennes   : J1 = 35/4 = 8,75   J2 = 32/4 = 8,00
Meilleures : J1 = 15            J2 = 20
```

## Exemple de partie Casin (pattes = 5)

```
Catégorie     Compte  Objectif  Progression
Direct           3       5        60 %
Libre            5       5       100 % ✓
Rouge            2       5        40 %
Casin            5       5       100 % ✓
Bande 1          4       5        80 %
Bande 2          5       5       100 % ✓
Bande 3          1       5        20 %
Main gauche      5       5       100 % ✓
Bande avant      5       5       100 % ✓

→ Victoire quand toutes les lignes sont à ✓
```

---

## Points réutilisables pour un nouveau projet

1. **Auto-validation temporisée** : saisie libre + validation auto après N secondes + annulation manuelle — pattern élégant pour éviter un bouton "valider" explicite.
2. **Undo avec cooldown** : empêche les doubles-annulations accidentelles sans complexifier l'UX.
3. **Score négatif toggle** : déduction sans changer de clavier.
4. **Catégories avec barre de progression et verrouillage** : pattern générique pour tout jeu où plusieurs objectifs doivent être atteints indépendamment.
5. **Persistance debounced** : sauvegarde automatique sans surcharger le storage.
6. **Minuteur de partie** : timestamp de début + calcul à la demande (pas d'état dérivé stocké).
7. **Layout trois colonnes / empilement mobile** : adaptable à n'importe quel jeu à deux joueurs avec panneau central.
