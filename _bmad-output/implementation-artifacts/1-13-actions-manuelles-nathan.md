# Story 1.13 — Actions manuelles à faire par Nathan

> **✅ Terminé le 2026-09-10** : Nathan a déployé et testé lui-même ; la story 1.13 est passée en `done` (`sprint-status.yaml`, Dev Agent Record). Les cases ci-dessous ne sont pas cochées une à une : c'est la check-list d'origine, conservée pour mémoire.

Créé le 2026-09-10 en fin de dev-story. À traiter au moment de la code-review de la 1.13 (ou après). Tant que ces points ne sont pas cochés, l'AC5 de la story reste non vérifié et la story ne doit pas passer en `done`.

## 1. Rattacher le dépôt GitHub au site Netlify (AR11)

- [ ] Se connecter sur Netlify › **Add new site** › **Import an existing project** › **GitHub** › choisir `nlegendree/carom_scoreboard`, branche `main`.
- [ ] Vérifier que Netlify a lu `netlify.toml` (base `1score`, publish `dist`, commande `npm run build`). Ne rien saisir à la main dans le formulaire si ces valeurs sont déjà remplies.
- [ ] Lancer le premier déploiement et lire le log de build.
  - Si le build échoue sur la version de Node (`.nvmrc` = 26.8.1), ajouter dans `netlify.toml` :
    ```toml
    [build.environment]
      NODE_VERSION = "24"
    ```
    puis pousser. Ne pas modifier `.nvmrc` (choix explicite de la revue 1.1).
- [ ] Ouvrir l'URL fournie (`https://<nom>.netlify.app`) sur l'ordinateur :
  - Chrome › DevTools › Application › **Service Workers** → `activated and is running`.
  - Application › **Manifest** → aucun avertissement, nom « Carom Scoreboard ».
  - Lighthouse › catégorie PWA / « Installable » → vert.
  - Recharger sur `https://<nom>.netlify.app/nimporte-quoi` → l'accueil s'affiche (redirection SPA).

## 2. AC5 — Installation et hors ligne sur appareil réel (FR46)

### iPad (Safari, iPadOS 15+)
- [ ] Ouvrir l'URL Netlify dans Safari, laisser la page se charger une fois en ligne.
- [ ] Partager › **Sur l'écran d'accueil** › Ajouter.
- [ ] Lancer depuis l'icône : pas de barre Safari, fond sombre, barre d'état noire.
- [ ] Activer le **mode avion**, fermer et relancer l'application depuis l'icône : l'accueil s'affiche.
- [ ] Hors ligne, dérouler une partie : `JEUX DE SÉRIES` › `LIBRE`, régler noms et distance, quelques séries, `ANNULER`, `ÉCHANGER`, fin de partie, récap, `UNE PARTIE DE PLUS`.
- [ ] Hors ligne, tuer l'application en pleine partie et la relancer : « PARTIE EN COURS » › `REPRENDRE LA PARTIE`.
- [ ] Vérifier les deux orientations (portrait et paysage) : aucun débordement.

### Android (Chrome, Android 10+)
- [ ] Ouvrir l'URL Netlify dans Chrome, attendre la proposition d'installation (ou menu ⋮ › **Installer l'application**).
- [ ] Mêmes vérifications que sur iPad : lancement standalone, mode avion, partie complète, reprise après fermeture, deux orientations.

### Mise à jour automatique (AC3, après un déploiement ultérieur)
- [ ] Pousser une modification visible sur `main` (Netlify redéploie seul).
- [ ] Sur la tablette **laissée sur l'accueil** : dans l'heure, la page se recharge d'elle-même avec la modification. Aucune pop-up.
- [ ] Sur une tablette **en pleine partie** : rien ne se passe pendant la partie ni sur le récap ; le rechargement arrive au retour à l'accueil.

## 3. Une fois tout coché
- [ ] Reporter le résultat dans la story 1.13 (Dev Agent Record › Completion Notes, ligne AC5) et passer la story en `done` dans `sprint-status.yaml`.
- [ ] Supprimer ce fichier ou le marquer terminé.
