# Processus créatif — TERRA SONORA

## Intention

Le Earth Information Center montre la Terre à celles et ceux qui voient. Le jukebox devait la rendre audible sans transformer les images en bruit. Le slogan tient dans trois mots : écoutez la Terre.

## Identité

Le logo pose le cadre : un globe sombre dans un casque, TERRA en bleu marine, SONORA en vert, le O devenu une onde dorée. L'interface reprend ces cinq couleurs (`#0B2A4A`, `#0E6B63`, `#8DC63F`, `#1E9BD7`, `#E8A317`) sur un thème sombre. La typographie vient du système de design installé pour un produit musical : Righteous pour le nom, Poppins pour le texte. Le lecteur reste fixé en bas, comme un jukebox, plutôt qu'une page de réglages.

## Traduction vue vers son

Chaque image est lue sur un canvas, colonne par colonne.

- La luminosité ouvre le volume et le filtre.
- La position horizontale place le son à gauche ou à droite et choisit une hauteur, ensuite quantifiée.
- La teinte déplace la tonique.
- Le contraste raccourcit les notes, donc resserre le rythme.
- Les pixels clairs des éclairs deviennent des percussions. Une colonne noire ne produit pas de frappe.

La quantification est le choix artistique central. Sans elle, les colonnes voisines feraient un glissando continu, fatigant et peu mémorisable. Avec une gamme, l'oreille reconnaît une phrase.

Le CO₂ est le cœur du jukebox : quand la colonne devient très lumineuse, l'accord ajoute un intervalle d'un demi-ton. La dissonance reste liée à la densité visuelle, puis revient à une tierce quand la densité baisse. L'urgence n'efface pas la tenue musicale.

Les forêts hautes descendent dans le grave. Un son plus lourd marque le poids de la canopée mieux qu'une note aiguë qui sonnerait comme une alerte.

## Ce qui n'est pas encore l'image NASA

Les dix fichiers de `public/visuals` sont dessinés par `scripts/make_visuals.py`. Ils donnent une forme reconnaissable pour entendre la règle. Ils ne sont pas les films du Scientific Visualization Studio. Le son lit les pixels réellement chargés : remplacer le fichier par la frame officielle, en gardant le nom, change l'écoute sans changer le programme.

## Accessibilité

Le parcours utile tient au clavier : Espace, flèches, M. Le focus est doré. Une région live annonce l'état. Les textes alternatifs disent à la fois ce que l'image montre et ce que le son en fait. La vibration, la voix et le contraste élevé sont des options, pas des présupposés.

## Crédits

NASA Scientific Visualization Studio / Earth Information Center, pour les visualisations visées. La NASA n'endosse pas TERRA SONORA.
