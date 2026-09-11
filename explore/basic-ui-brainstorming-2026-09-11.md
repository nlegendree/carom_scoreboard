Carom Scoreboard → 1Score/1Shot (le nom change mais j'hésite entre les 2)

Globalement les éléments comme les CTA/Cards/Pavés, etc... doivent avoir des contours et être dans des conteneurs. Chaque écrans en eux-mêmes aussi. Ça donne un effet plus premium et plus propre.

Globalement j'ai ajouté des images dans ../resources/ à partir desquelles je me suis inspiré donc pour chaque feature me demander quelles images aller chercher pour l'inspiration.>

Home :

- Faire une barre latérale à gauche (assez intuitif)
  - Mettre le logo à gauche et nom de la solution en-dessous
  - Mode entraînement → à terme on affichera la vidéo en plein écran avec possibilité de replay + des cours
  - Inscription/Devenir membre
  - Fermer l’application
- Afficher un message dans une police sympa et mettre un fond imagé ou alors un dégradé plutôt que du noir.
- 4 tuiles pour les modes de jeu avec une flèche pour insiter à cliquer (avec des petites phrases d’accroches dedans) → Mettre de la couleur
  - 3 bandes
  - JDS
  - Quilles
  - Casin



JDS :

- Garder la barre latérale à gauche :
  - Logo + Nom
  - Flèche pour revenir en arrière en dessous
- Tuiles :
  - Libre
  - Bande
  - Cadre → Faire une pop-up pour choisir 47/2, 47/1, 71/2
  - 4 Billes

3 Bandes → Directement page de paramètrage joueurs

Quilles → COMING SOON

Casin → COMING SOON

&nbsp;

Paramétrage joueurs :

- Garder la barre latérale à gauche :
  - Logo + Nom
  - Flèche pour revenir en arrière en dessous
  - Configuration → permet de régler le temps du timer etc..
  - Croix pour annuler la partie en bas
- Une partie de gauche avec par défaut le joueur blanc
  - Champ avec marqué par défaut “JOUEUR” au centre → quand on clique dessus ça ouvre un pavé tactile pour rentrer le nom (pour l’instant mais quand on aura une base de joueur on ouvrira une page)
  - Champ avec marqué par défaut “0” au centre → quand on clique dessus pavé numérique où on peut rentrer le score qu’on joue

⚠️ Il faut retravailler le pavé numérique qui est trop fat → peut-être mettre que le pavé et avoir en arrière plan le score qui s’actualise légèrement flouté

- Une partie centrale avec les paramétrages
  - CTA “CHANGER DE BILLE” et CTA “CHANGER DE CÔTÉ” sur une ligne
  - CTA “DÉMARRER”
- Une partie de droite avec par défaut le joueur jaune → idem joueur blanc

&nbsp;

Scoreboard après avoir cliqué sur DÉMARRER :

- Zone de gauche avec un JOUEUR
  - Bandeau en haut de la card → couleur légèrement différente pour repérer la démarcation (limite une petite ligne discrète aussi)
    - En haut à gauche “NOM” (peut-être sur 2 lignes à définir)
    - En haut à droite “DISTANCE”
    - Juste en-dessous du score en un peu plus petit “MOY” et “SERIE”
    - Juste en dessous du nom on peut mettre le nombre de points restants “RESTANT” à voir comment ça rend
  - Au centre le score en gros (c’est le plus important)
  - En bas
    - Bouton - et + de part et d’autres pour corriger le score si il y a un problème
    - Entre ces 2 boutons la série en cours si on note des +1 à chaque fois sinon rien. Quand on arrive à la fin, on annonce temporairement “POUR N” et après on remet la série
- Zone centrale avec :
  - REPRISES
  - CHRONO → pour un effet esthétique sympa c’est pas obligé que le chrono soit un cercle parfait mais il peut un peu chevauché les card blanche et jaune
  -  CTA “PASSER LE TOUR”
- Zone de droite avec un autre joueur → idem en gardant les mêmes zone gauche/droite/haut/bas que JOUEUR 1
- Zone basse :
  - Alternativement un CTA “+1 ADVERSAIRE” (au 3 bandes) ou “+ POINTS ADVERSAIRE” → qui ouvre un pavé numérique pour rentrer les points et si le pavé est central on peut remplir la zone entre le - et +
  - De l’autre côté : pour ces CTA on veut que des pictos
    - CTA “QUITTER”
    - CTA “ANNULER”
    - CTA “RECOMMENCER
    - CTA “PARAMÈTRES”



Ecran de recap :

-  Reproduire le style billiboard mais en ajoutant la barre latérale :
  - Garder la barre latérale à gauche :
    - Logo + Nom
    - Option de quitter
    - Option de recommencer
