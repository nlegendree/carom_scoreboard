# Scoreboard Billard Carambole 🎱

Application Vue.js pour marquer le score lors d'une partie de billard carambole, optimisée pour tablette avec interface tactile.

## Fonctionnalités

- **Interface tactile** optimisée pour tablette
- **Pavé numérique** pour saisir les séries (jusqu'à 999 points)
- **Affichage en temps réel** des scores des deux joueurs
- **Historique des reprises** avec horodatage
- **Statistiques** : totaux par joueur et moyenne
- **Design responsive** qui s'adapte aux différentes tailles d'écran

## Prérequis

- **Node.js 18.0.0 ou supérieur** (requis pour Vite 5)
- npm ou yarn

## Installation

1. Utiliser la bonne version de Node.js (si vous utilisez nvm) :
```bash
nvm use
```
Ou installer Node.js 18+ depuis [nodejs.org](https://nodejs.org/)

2. Installer les dépendances :
```bash
npm install
```

## Lancement

Pour démarrer l'application en mode développement :
```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:5173`

## Build pour production

Pour créer une version optimisée pour la production :
```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

### Déploiement

1. **Construire l'application** :
   ```bash
   npm run build
   ```

2. **Déployer le contenu du dossier `dist/`** sur votre serveur web

3. **Vérifier les versions** :
   - Le fichier `dist/manifest.json` doit contenir la version actuelle
   - Le fichier `dist/sw.js` doit avoir le même numéro de version dans `CACHE_NAME`
   - Le fichier `dist/update-helper.js` doit avoir la même version

4. **Tester en production** :
   - Vérifier que le Service Worker s'enregistre correctement
   - Tester la mise à jour automatique
   - Vérifier que l'application fonctionne en mode hors ligne

## Utilisation

### Interface

L'application est divisée en 3 sections :

- **Gauche** : Score et pavé numérique du Joueur 1 (vert)
- **Centre** : Affichage des reprises et statistiques
- **Droite** : Score et pavé numérique du Joueur 2 (rouge)

### Saisie des scores

1. **Pavé numérique** : Saisissez une série et validez avec **✓** (enregistre la série sans l'ajouter au score)
2. **Effacer** : Appuyez sur **C** pour effacer la saisie en cours
3. **Reset** : Appuyez sur **Reset Score** pour remettre le score à zéro

### Gestion des reprises

- **Compteur de reprises** au centre avec le numéro de la reprise actuelle
- **Boutons + et -** pour incrémenter/décrémenter le numéro de reprise
- **Bouton "RAZ"** pour remettre le compteur de reprises à 1
- **Historique** : Chaque série validée apparaît avec le numéro de reprise
- Les séries sont horodatées et colorées selon le joueur

## Technologies utilisées

- Vue.js 3
- Vite
- CSS3 avec animations et dégradés

## Responsive Design

L'application s'adapte automatiquement :
- **Mode tablette** : Layout horizontal (3 colonnes)
- **Mode mobile** : Layout vertical empilé

---

*Développé pour une expérience tactile optimale sur tablette* 📱