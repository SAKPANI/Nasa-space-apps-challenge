# Analyse des images d'inspiration

Les quatre images fournies (via le dossier *user_uploaded*) sont traitées comme références d'inspiration pour la direction artistique de **TERRA SONORA**.  Chaque image a été étudiée en termes de composition, typographie, mouvement, lumière et effets, avec des propositions concrètes d’adaptation.

---
## 1. `media_1794748802128_36c14154.jpg`
**Lien** : [image](/user_uploaded/media_1794748802128_36c14154.jpg)

### Ce qui fonctionne
- **Composition massive** : le visuel occupe tout l’écran avec un fond spatial sombre et une silhouette de la Terre au centre, créant une immersion immédiate.
- **Typographie large, majuscules, contrastée** : le titre en blanc lumineux sur fond noir garantit un contraste supérieur à 7 :1 (WCAG AA).
- **Effet de verre/translucide** : le bandeau de texte utilise une légère transparence et un flou de fond, rappel du glassmorphism.
- **Rythme visuel** : les éléments (titre → sous‑titre → bouton) sont espacés de façon à laisser « respirer » le design.

### Adaptation à Terra Sonora
- Utiliser la même **palette de fond** : #14214D (bleu nuit) avec un effet de particules d’étoiles.
- Conserver le **glassmorphism** pour le bouton d’entrée, mais appliquer la couleur jaune #FFCE00 pour le bouton d’appel à l’action.
- Implémenter le **titre animé lettre‑par‑lettre** via GSAP `SplitText` en s’inspirant du timing de l’image.
- Ajouter un **compteur de chargement** en haut‑droite, inspiré du petit texte « Chargement… ».  

---
## 2. `media_1794748870965_bda43336.jpg`
**Lien** : [image](/user_uploaded/media_1794748870965_bda43336.jpg)

### Ce qui fonctionne
- **Barre de progression verticale** à gauche composée de traits fins, avec un segment actif épais ; très lisible et orientée « mission control ».
- **Couleur d’accent** : vert #006A4E utilisé pour le trait actif, rappelant les indicateurs de télémétrie.
- **Typographie mono‑espace** pour les coordonnées et chiffres, facilitant la lecture rapide des données.
- **Éclairage doux** sur les icônes, créant une impression de tableau de bord futuriste.

### Adaptation à Terra Sonora
- Intégrer une **barre de progression verticale** similaire dans le layout principal (gauche), avec le vert #006A4E pour le segment actif et le jaune #FFCE00 pour les hover.
- Utiliser la **police JetBrains Mono** pour les coordonnées du globe et les valeurs de données affichées.
- Ajouter des **icônes HUD** en SVG légèrement embossées, réutilisant l’effet d’éclairage.

---
## 3. `media_1794748883253_9ae92cc7.jpg`
**Lien** : [image](/user_uploaded/media_1794748883253_9ae92cc7.jpg)

### Ce qui fonctionne
- **Glitch lumineux** autour du texte principal, donnant une impression de transmission satellite.
- **Couleurs de contraste** : noir de fond, texte blanc, accents cyan #1E88C9 qui rappellent le globe.
- **Disposition en grille** avec des blocs d’informations de taille identique, facilitant le scan visuel.
- **Animation subtile** : un léger zoom‑in sur le globe au survol.

### Adaptation à Terra Sonora
- Appliquer un **effet de halo cyan** autour du titre du globe via un shader GLSL (halo‑atmosphère).
- Utiliser la même **grille de blocs** pour les cartes de paramètres (Température, Végétation, Précipitations) en 3D, chaque bloc sera une carte interactif.
- Implémenter le **zoom‑in doux** au survol du globe avec GSAP `to({scale:1.02})`.

---
## 4. `media_1794748896244_3a228ffb.jpg`
**Lien** : [image](/user_uploaded/media_1794748896244_3a228ffb.jpg)

### Ce qui fonctionne
- **Palette sombre avec éclats jaunes** (similaire au jaune #FFCE00 de notre charte) qui attire immédiatement le regard vers les CTA.
- **Bouton « verre » translucide** avec bordure fine, très moderne.
- **Réticule et lignes de guidage** rappelant des équipements de contrôle de mission.
- **Focus sur le texte** : le slogan est centré, avec un interlettrage large qui crée une lecture claire.

### Adaptation à Terra Sonora
- Créer le **bouton d’entrée** en glassmorphism, couleur de fond rgba(255,255,255,0.08) et bordure #FFCE00.
- Ajouter **réticules** légers (ligne fine #1E88C9) autour du globe pour indiquer les zones interactives.
- Utiliser un **interlettrage important** sur le slogan « Quand la Terre se fait entendre » : `letter-spacing: .05em`.
- Le **slogan** sera affiché sous le titre avec une animation de fondu‑in progressive.

---
## Synthèse & Propositions globales
1. **Structure de la page d’accueil** : fond d’étoiles → globe → titre → slogan → bouton d’entrée, exactement comme l’image 1, mais avec nos couleurs et animations.
2. **Barre de progression verticale** sur le côté gauche (image 2) pour indiquer la position dans le parcours de slides.
3. **Cartes de paramètres** en grille 3‑colonne, inspirées de l’image 3, avec effets de halo cyan et zoom‑in.
4. **Boutons d’appel à l’action** et CTA en glassmorphism jaune (image 4), avec état hover réglé via GSAP.
5. **Réticules & HUD** – réutiliser le style de l’image 4 pour les indicateurs de coordonnées et la légende « SOURCE : NASA POWER ».
6. **Accessibilité** – tous les contrastes sont supérieurs à 7 :1, texte en majuscules avec espacement, tailles de police adaptatives, navigation clavier entièrement prise en charge.
7. **Mouvement réduit** – désactiver les effets de halo, zoom‑in et particules d’étoiles via un toggle (respectant la règle de réduction de mouvement).

Ces recommandations seront appliquées dans la prochaine phase (Phase 2) dès validation.
