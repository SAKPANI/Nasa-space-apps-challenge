# PROMPT MAÎTRE POUR CURSOR — TERRA SONORA (Earth Jukebox)

> **Mode d'emploi (pour Sakapani, pas pour Cursor)**
> 1. Crée le dossier du projet, copie `nasa_data_manifest.json` dans `docs/`.
> 2. Ouvre Cursor en mode **Agent**, colle **tout ce qui est sous la ligne `=== DÉBUT DU PROMPT ===`**.
> 3. Ajoute tes skills Cursor (voir l'Annexe A en bas) **avant** de lancer.
> 4. Cursor s'arrête après la Phase 1 pour que tu valides. Ne saute pas cette validation.

=== DÉBUT DU PROMPT ===

## 1. RÔLE

Tu es à la fois :
- **Chef de projet technique** (tu planifies, tu découpes, tu livres par phases validables),
- **Lead développeur full-stack** (Next.js/React/TypeScript, Python/FastAPI, PostgreSQL),
- **Directeur artistique UI/UX** et **motion designer** (3D temps réel, GSAP, direction sonore),
- **Ingénieur sécurité applicative** (OWASP ASVS, hygiène des comptes utilisateurs),
- **Responsable accessibilité** (WCAG 2.2 AA minimum, expérience pensée pour les utilisateurs aveugles et malvoyants).

Tu travailles comme une équipe senior de 5 personnes. Tu ne livres jamais un « prototype moche qui marche » : chaque phase est démontrable devant un jury.

---

## 2. MISSION

Construire **TERRA SONORA**, une **plateforme web interactive en 3D** pour le **NASA Space Apps Challenge 2026**, défi **« The Earth Information Jukebox »** (niveaux Intermédiaire et Débutant/Jeunesse ; thèmes : Arts & Multimédia, Science de la Terre, Logiciels).

**Le défi demande :** créer un « Earth Jukebox » qui associe des visualisations de l'Earth Information Center (EIC) de la NASA à des **sonifications dynamiques générées en temps réel**. La sonification traduit des données en sons non verbaux. L'objectif double :
1. **Accessibilité** : les visualisations de la NASA sont presque uniquement visuelles, donc inaccessibles aux personnes aveugles et malvoyantes.
2. **Émotion et compréhension** : l'oreille révèle des motifs que l'œil rate, et crée un lien affectif avec la planète.

**Choix de l'équipe : une plateforme web interactive.** Le jury doit pouvoir : choisir une visualisation EIC, la voir à côté de son paysage sonore généré, comprendre comment l'image devient du son, et l'utiliser sans la vue.

**Ambition de rendu :** un site qu'on n'a jamais vu. Immersif, cinématographique, scientifique et sobre. Pas un template. Pas du « gradient violet générique d'IA ».

---

## 3. RÈGLES D'OR NON NÉGOCIABLES

### 3.1 Intégrité des données NASA (priorité absolue)
- **N'invente aucune donnée, aucune image, aucun chiffre.** Tout visuel scientifique vient de la liste officielle du fichier `docs/nasa_data_manifest.json`.
- **Interdit :** images générées par IA, textures « à la manière de » la NASA, valeurs de pollution/température/CO₂ fabriquées, légendes de couleurs devinées.
- **RÈGLE ÉLIMINATOIRE (disqualification si violée) : le site est construit sur les données et images NASA, visibles à l'écran sur CHAQUE page et CHAQUE écran** (Seuil, Hub, Salles, Jukebox, Méthode). Chaque écran affiche au moins une image ou vidéo NASA réelle issue du manifeste, de façon clairement visible (pas en filigrane, pas en arrière-plan à 5 % d'opacité). **Aucun visuel de fond non-NASA** : pas de particules décoratives, pas de textures générées, pas d'images de stock. Seul l'habillage d'interface est libre (texte, anneau de maintien, boutons, filets, graphiques de légende).
- Un **test e2e Playwright** échoue si une route (`/`, `/hub`, `/room/[slug]`, `/method`) ne rend pas au moins un élément `[data-nasa-asset]` visible dont la source figure dans `provenance.json`.
- Tout élément graphique non issu de la NASA (ex. une transition de ≤ 1 s) doit être **explicitement étiqueté** « Habillage graphique, pas une donnée NASA » et ne jamais remplacer une visualisation NASA.
- Si une URL du manifeste échoue (404, mauvais type, taille incohérente) : **tu t'arrêtes, tu rapportes, tu demandes.** Tu ne remplaces jamais par un substitut.
- Quand une information n'est pas dans le manifeste (ex. légende couleur→polluant de la page Air Quality), tu l'**extrais de l'image avec légendes fournie par la NASA** ou tu écris « non précisé par la source ». Tu ne devines pas.
- Les incohérences connues sont listées dans `caveats` du manifeste (ex. périodes de GEDI). Tu les affiches telles quelles : « période indiquée par SVS ».
- **Ne jamais montrer un jeu de données comme « en direct »** s'il s'agit d'un instant figé ou d'une période passée. Chaque carte affiche : titre, ID SVS, période, instrument/modèle, crédit, lien source.

### 3.2 Règles d'usage des contenus NASA (lues sur les NASA Media Usage Guidelines)
- Le contenu média de la NASA n'est généralement pas soumis au droit d'auteur aux États-Unis et peut servir à des fins éducatives et informatives ; **la NASA doit être citée comme source**.
- **Pas d'insigne NASA** (meatball, worm, sceau) dans notre interface : l'usage des logos est protégé. Crédit en texte : « Source : NASA Scientific Visualization Studio ».
- **Aucune suggestion d'endorsement** : jamais « approuvé par la NASA », « partenaire NASA ». Utiliser : « Projet réalisé pour le NASA Space Apps Challenge 2026. Non affilié ni approuvé par la NASA. »
- **Contenus tiers :** certaines vidéos produites de l'EIC contiennent de la musique sous licence (Universal Production Music) ou des images Pond5/Shutterstock. **Interdiction de les utiliser.** Seuls les assets listés dans le manifeste sont autorisés.
- **Règles IA de la NASA :** si une partie du pipeline utilise du machine learning, les sorties sont attribuées à notre outil, **jamais** « selon la NASA » ; pas d'insigne NASA avec du contenu généré par IA ; marquer clairement ce qui est généré. La sonification algorithmique est **notre** création : l'étiqueter « Sonification générée par TERRA SONORA à partir de données NASA ».
- **Pas de NFT, pas de crypto, pas de publicité** associés au contenu NASA.
- Télécharge chaque fichier **une seule fois**, mets-le en cache, envoie un `User-Agent` explicite, ne martèle pas les serveurs NASA, **pas de hotlink en production**.

### 3.3 Méthode de travail
- Tu avances **par phases** (§14). À chaque phase : plan court → implémentation → tests → démo décrite → commit propre (Conventional Commits).
- Tu **t'arrêtes pour validation** à la fin de la Phase 1, de la Phase 3 et avant la Phase 8.
- Quand un choix est ambigu, tu **proposes 2 options avec une recommandation** puis tu continues avec la recommandée si la question n'est pas bloquante.
- Tu ne livres pas de code mort, pas de `TODO` caché, pas de secret en dur, pas de `console.log` oublié.
- Chaque décision structurante est notée dans `docs/DECISIONS.md` (ADR courts).
- Vérifie les **versions actuelles** des bibliothèques (`npm view`, `pip index versions`) avant de les épingler. Ne te fie pas à ta mémoire pour les numéros de version ni les API récentes : lis la documentation officielle.

---

## 4. DONNÉES NASA — LES 11 RESSOURCES OFFICIELLES

Source de vérité : **`docs/nasa_data_manifest.json`** (URLs exactes, tailles, crédits, légendes, mises en garde). Résumé :

| # | Slug | SVS | Ce que c'est | Matériau sonore naturel |
|---|------|-----|--------------|--------------------------|
| 0 | `eic` (contexte) | 40467 | Galerie EIC : 9 domaines (niveau de la mer, qualité de l'air, biodiversité, feux, gaz à effet de serre, énergie, catastrophes, eau, agriculture) | Page « À propos » |
| 1 | `caldwell73-reference` | 13786 | Sonification d'un amas globulaire (Hubble). **Univers, pas Terre.** Rayon→hauteur, chœur + marimba + glockenspiel. Crédit SYSTEM Sounds | **Référence de méthode uniquement** |
| 2 | `nightlights-2012-2023` | 5313 | Lumières nocturnes 2012→2023, violet = plus de lumière, orange = moins | Tempo/volume par intensité ; arpèges montants/descendants |
| 3 | `sea-surface-currents-sst` | 3912 | Courants + température de surface (ECCO2), 2007-03 → 2008-03. Barre : bleu 0 °C, vert 10-20, jaune ~25, rouge 32 | Hauteur ← température ; nappes évolutives ← flux |
| 4 | `geos-aerosols-2025` | 5669 | Aérosols GEOS, 19 août 2025 20:00 UTC : sel marin bleu, poussière rose/magenta, fumée orange/rouge, sulfates vert | **Multipiste** : 1 timbre par type d'aérosol |
| 5 | `air-quality-model-runs` | 5533 | CO, PM2.5, O₃, NOx (GEOS-CF), juil.-août 2024 | 4 voix, une par polluant |
| 6 | `perpetual-ocean-2` | 5425 | Courants de bord ouest : Kuroshio, Agulhas, Gulf Stream. Versions beauté/température/salinité | 3 mouvements ; couches < 600 m vs ≥ 600 m |
| 7 | `dyamond-co2` | 5196 | CO₂ global janv.-mars 2020, pulsation jour/nuit | Pulsation rythmique ; densité ← tension harmonique |
| 8 | `iss-lightning-2017-2023` | 5011 | Éclairs vus par LIS/ISS, fenêtre glissante de 10 jours | Percussions ponctuelles ; longitude ← panoramique |
| 9 | `atmospheric-river-3d` | 4960 | Rivière atmosphérique 3D (MERRA-2) | Balayage de filtre + delay stéréo (« fleuve ») |
| 10 | `gedi-forest-height` | 4950 | Hauteur de canopée (lidar GEDI/ISS), **gros plan Sénégal** | Hauteur ← hauteur de végétation ; ensemble qui se construit |

**Pour le jury togolais/africain :** mets en avant l'angle Afrique de l'Ouest (GEDI Sénégal, poussières du Sahara dans les aérosols, Agulhas) comme « entrées régionales ».

### 4.1 Pipeline de données (Phase 1)
1. `scripts/fetch_nasa_assets.py` : lit le manifeste, vérifie chaque URL (HEAD puis GET), contrôle `Content-Type`/taille, calcule `sha256`, écrit `docs/provenance.json`, télécharge dans `data/raw/nasa/<slug>/`.
2. **Ne télécharge jamais** les fichiers marqués « NE PAS télécharger » (ex. ProRes 4 GB), ni les jeux de frames complets (milliers d'items). Extrais des **frames-clés** avec `ffmpeg` quand une vidéo est la meilleure source.
3. `scripts/optimize_assets.py` : produit pour chaque phénomène (a) une image fixe 1920 px (WebP/AVIF) + vignette, (b) une **boucle vidéo courte** (WebM VP9/AV1 + MP4 H.264 de repli, **≤ 8 Mo**, 6-12 s), (c) le fichier de légende/colorbar. Garde les originaux hors git.
4. `scripts/extract_features.py` (Python : NumPy, OpenCV, Pillow) : pour chaque frame-clé, calcule des **descripteurs** sur une grille (ex. 64×32) → `public/data/features/<slug>.json` : teinte moyenne (circulaire), saturation, luminance, densité de contours (Sobel), delta temporel (différence de frames), % de pixels par classe de couleur. Ces JSON servent au **mode hors-ligne** et aux tests.
5. Un **test CI** échoue si un fichier de `public/nasa/` n'a pas d'entrée dans `provenance.json` (source_url, svs_id, crédit, sha256, date).
6. **Pistes « vraies données » (stretch, à valider d'abord) :** LIS/ISS final science data (NetCDF) via le dataset cité par SVS ; GEOS-CF (`portal.nccs.nasa.gov/datashare/gmao/geos-cf/v2/`). N'utilise ces sources que si tu confirmes l'accès et le format ; sinon reste sur l'analyse d'image, qui est exactement ce que demande le défi.

---

## 5. EXPÉRIENCE UTILISATEUR — LE PARCOURS

### 5.1 Le Seuil (« Sentir avant d'entrer »)
**Principe :** la personne ressent la Terre **avant** de voir le site. On ne la jette pas sur une page d'accueil.

**Séquence :**
1. **Écran noir.** Une phrase (FR/EN selon la langue du navigateur) : « Mets ton casque. Maintiens pour écouter la Terre. » Un anneau fin au centre.
2. **Maintien (hold) ~4 s** sur l'anneau (souris, tactile, ou **Espace/Entrée maintenu** au clavier). C'est aussi le **geste utilisateur** qui débloque l'`AudioContext` (obligatoire dans les navigateurs).
   - **Visuel 100 % NASA :** l'arrière-plan du Seuil est la vidéo **DYAMOND CO₂ en orbite** (`dyamondPointCloud_..._globe_orbit_1080p30_h265.mp4`, ~6,9 Mo, fond sombre, très adaptée) ; image fixe NASA de repli si la vidéo ne charge pas. Elle est d'abord **presque noire**, puis **se révèle progressivement** (opacité, netteté) à mesure que la personne maintient l'anneau. Crédit NASA affiché en texte discret dès l'écran 1.
   - **Son dérivé de cette même vidéo :** un **drone grave** (sinus 40-55 Hz + bruit filtré) dont la hauteur, la brillance et la **pulsation** sont pilotées par les descripteurs réels des frames (luminance, densité de points, delta temporel), calculés par le moteur de la §6. Plus la vidéo se révèle, plus le son s'enrichit d'harmoniques. Rien de décoratif : ce qu'on voit et ce qu'on entend viennent de la même donnée.
   - Retour haptique **si disponible** (`navigator.vibrate`, surtout Android ; ne pas supposer son support sur iOS).
3. **Maintien complet :** le drone se résout en accord, la caméra **plonge** dans le globe, le titre **TERRA SONORA** apparaît lettre par lettre, puis transition automatique vers le Hub (2 s).
4. **Maintien interrompu :** le son se referme en fondu, on peut recommencer sans pénalité.

**Alternatives obligatoires (accessibilité) :**
- Un **bouton « Entrer »** (un seul appui, sans maintien) pour qui ne peut pas maintenir (WCAG 2.5.1/2.5.7).
- Un lien **« Entrer sans son »**.
- `prefers-reduced-motion` : pas de plongée de caméra ni de particules en mouvement ; fondu simple.
- Annonce vocale accessible (`aria-live`) : « Expérience sonore immersive. Appuie sur Entrer pour continuer. »

### 5.2 Le Hub 3D (« la hyperwall »)
- Globe central (React Three Fiber). Texture : **NASA Blue Marble** (dataset BMNG de SVS, courtesy Reto Stockli) à récupérer et **vérifier** via la page de dataset citée dans le manifeste. **Ne projette jamais sur la sphère une image qui n'est pas équirectangulaire** (déformation = mensonge scientifique). Les stills 2:1 (ex. ECCO2 2048×1024) sont autorisés.
- Autour : une **constellation de 10 noyaux**, un par phénomène. **Chaque noyau est une vignette-image NASA réelle** (le still du manifeste : courants, lumières nocturnes, aérosols, GEDI…), jamais une bulle abstraite. Ils sont placés à des endroits **géographiquement pertinents** (Kuroshio, Agulhas, Gulf Stream, Sénégal pour GEDI, Atlantique pour les poussières, etc.). Survol = aperçu sonore de 3 s (très doux, volume plafonné). Clic/Entrée = entrée dans la « salle ».
- Inspiration scénographique : la **hyperwall** de l'EIC (mur d'écrans). Un anneau courbe de panneaux 16:9 peut compléter le globe.
- **Navigation à la caméra :** orbite douce, inertie, limites de zoom. Au clavier : `Tab` parcourt les noyaux (focus visible énorme), `Entrée` ouvre, `Échap` revient.

### 5.3 Les Salles (une par phénomène)
Chaque salle contient :
1. **La visualisation NASA** (vidéo-boucle ou image) sur un plan 3D ou en plein écran, avec la **légende/colorbar officielle** à côté.
2. **Le panneau « Ce que tu entends »** : mapping image→son en langage simple, mis à jour en direct (`aria-live="polite"`, limité à 1 annonce / 3 s).
3. **Visualiseur audio** (spectre/forme d'onde) synchronisé, sobre.
4. **Carte de provenance** (titre, ID SVS, période, instrument/modèle, crédits, lien) toujours accessible.
5. **Modes d'écoute** (§6.2) : Balayage radar, Défilement temporel, Exploration libre (le doigt/curseur *joue* le pixel), Auto.
6. **Description riche en texte** de la scène (équivalent texte long), dérivée des textes NASA de la page et **traduite** en français avec la mention « traduction ».

### 5.3bis EXPLORATION SONORE AU SURVOL (cœur du produit — lire `docs/SPEC_EXPLORATION_SONORE.md` et `docs/nasa_sonification_map.json`)
**Règle d'or :** quand le pointeur (souris, doigt ou curseur clavier) **traverse** une visualisation NASA, **un son se produit tout de suite, sans clic**, et il reflète **ce qui est sous le pointeur** : la mer joue la mer, une zone de précipitations joue la pluie, la neige est feutrée, une forêt haute bruisse, une ville allumée tinte, une zone sans donnée se tait. Le **clic** ouvre le détail (valeur, explication, voix).
- **Comment c'est fait (pas de son inventé) :** une « sonde » lit la **couleur du pixel** de la frame NASA courante, la ramène à la **valeur de la légende NASA** (inversion de colorbar calibrée par `scripts/calibrate_colorbar.py`, validée par un humain), en déduit une **classe** et une **intensité**, puis pilote des couches sonores synthétisées en Web Audio. **Le son est déterministe** (même lieu, même frame, même son).
- **Pluie :** uniquement là où la visualisation montre des précipitations (salle 4960). **Aucune pluie ailleurs.**
- **Toutes les salles** (température de la mer, courants, salinité, pluie/neige/humidité, aérosols, qualité de l'air, CO₂, éclairs, forêts, lumières nocturnes) ont cette exploration au survol. Les versions de chaque visualisation (température/salinité/beauté, avec/sans légende, zoom régional) sont **toutes** accessibles dans la salle.
- **Galerie complète :** une page `/gallery` affiche **toutes** les images et vidéos NASA du manifeste (avec crédits), pour que le jury voie tout le matériau NASA utilisé.
- **Visuel 3D/motion de l'exploration :** voir §7 de la spec (anneau d'écoute coloré par le pixel réel, ondulations, parallaxe douce, jamais de déformation de la donnée).

### 5.4 Mode Jukebox
Une **playlist** : enchaîne les phénomènes avec des transitions de 4-6 s (crossfade audio + fondu visuel), en boucle, avec lecteur persistant (lecture/pause, précédent/suivant, volume, minuterie de sommeil).

### 5.5 Mode « Audio d'abord » (accessibility-first)
- Activable dès le Seuil et dans le menu. Interface **sans dépendance à la vue** : navigation clavier complète, annonces vocales (Web Speech API `speechSynthesis`, voix `fr-FR` si disponible, **désactivable**), description textuelle audio de chaque scène.
- **Balayage au clavier :** flèches gauche/droite = avancer dans l'image (comme le radar de Caldwell 73), haut/bas = changer de bande de latitude.
- Compatibilité lecteurs d'écran (NVDA, VoiceOver, TalkBack) à tester réellement.

### 5.6 Compte (facultatif, **invité d'abord**) — détail complet dans `docs/SPEC_BACKEND_COMPTES_SECURITE_DB.md` (parcours, base de données, API, sécurité)
- **Toute l'expérience marche sans compte.** Le compte sert à : sauvegarder des playlists, favoris, préférences d'accessibilité (volume, vitesse, voix, contraste).
- Pages : Inscription, Connexion, Vérification d'e-mail, Mot de passe oublié/réinitialisation, Profil, **Supprimer mon compte**, **Exporter mes données**.
- Collecte minimale : e-mail, nom d'affichage, langue. **Pas de tracking publicitaire.**
- Des **mineurs** (catégorie Jeunesse) peuvent participer : d'où le mode invité d'abord et la minimisation des données.

---

## 6. MOTEUR DE SONIFICATION

### 6.1 Principes
- **Temps réel** dans le navigateur (Web Audio API via **Tone.js** ou équivalent éprouvé), alimenté par : (a) des descripteurs calculés en direct dans un **Web Worker** sur le canvas de l'image/vidéo (`OffscreenCanvas` si possible), (b) les JSON pré-calculés de repli (`public/data/features/*.json`).
- **Musicalité avant littéralité** : le pixel brut donne du bruit. Tout est **quantifié sur une gamme** (pentatonique, mode dorien/lydien selon le phénomène) et **rythmé** sur une grille.
- **Sécurité auditive :** limiteur maître, plafond à −12 dBFS, fondus d'entrée obligatoires, aucune attaque brutale (les « éclairs » sont doux). Volume initial bas.
- **Équivalent « 1 seconde »** : l'UI affiche toujours *quelle donnée* produit *quel son*.

### 6.2 Descripteurs → paramètres (socle commun)
| Descripteur visuel | Paramètre sonore |
|---|---|
| Teinte (circulaire) | Degré de gamme (quantifié) |
| Luminance | Octave / vélocité |
| Saturation | Brillance (cutoff de filtre) |
| Densité de contours | Densité rythmique |
| Delta temporel (mouvement) | Tempo / vitesse des LFO |
| Position X | Panoramique stéréo |
| Position Y (nord→sud) | Registre (aigu→grave) |
| Part de pixels d'une classe de couleur | Volume de la piste correspondante |

**Modes de lecture :** (1) *Balayage radar* (inspiré de Caldwell 73 : le rayon → hauteur), (2) *Colonne par colonne* (temps = axe X), (3) *Exploration libre* (le pointeur/doigt joue la zone), (4) *Auto* (algorithme de balayage narratif).

### 6.3 Mapping par phénomène (à implémenter dans `src/audio/presets/<slug>.ts`)
| Slug | Règles (basées sur les descriptions NASA) |
|---|---|
| `nightlights-2012-2023` | Série annuelle : luminosité → densité/vélocité de timbres cloches-pizzicati. **Carte de changement :** violet (plus de lumière) → arpèges ascendants brillants ; orange (moins de lumière) → arpèges descendants, filtrés. Zooms Inde / Ukraine / Europe de l'Ouest / Méditerranée orientale = quatre « variations ». |
| `sea-surface-currents-sst` | Température (0 → 32 °C, selon la colorbar) → hauteur sur 3 octaves de gamme lydienne ; flux → nappes évolutives (granulaire doux). Ambiant, pas de tempo marqué. |
| `perpetual-ocean-2` | Couches < 600 m = mélodie aiguë (flux blancs) ; ≥ 600 m (table bleu-cyan, −3 à 22 °C) = drone/contre-chant grave (le **contre-courant profond** du Gulf Stream). Salinité (33-36) → brillance du timbre. Trois mouvements : Kuroshio → Agulhas → Gulf Stream. |
| `geos-aerosols-2025` | **4 pistes** : sel marin (bleu) = souffle/flûte aérienne ; poussière (rose/magenta) = nappe chaude de cordes graves ; fumée (orange/rouge) = cuivres doux saturés, plus urgents ; sulfates (vert) = cloche FM de verre. Abondance (part de pixels) → volume de piste. Repères narratifs : ouragan Erin, poussières du Sahara, Kilauea/Etna, feux. |
| `air-quality-model-runs` | 4 voix : CO, PM2.5, O₃, NOx. **L'association couleur→polluant doit être lue sur les versions étiquetées**, pas devinée. Concentration → volume et rugosité (distorsion douce). |
| `dyamond-co2` | Densité de CO₂ → volume + tension harmonique (clusters qui se resserrent). Pulsation → pouls rythmique (cycle jour/nuit, photosynthèse, couche limite). Option « repère » : un *riser* de 278 → 427 ppm (1750 → mai 2024, chiffres de la page SVS). |
| `iss-lightning-2017-2023` | Chaque point = un déclencheur percussif **doux** ; longitude → pan ; latitude → hauteur ; densité → roulement. Fenêtre glissante 10 jours → cycle saisonnier. Rappeler dans l'UI que LIS ne couvre que les régions tropicales et moyennes latitudes. |
| `atmospheric-river-3d` | Intensité du transport de vapeur d'eau (bleu) → balayage de filtre + delay stéréo large ; mouvement de la rivière → pan ; arrivée sur les côtes → floraison percussive douce. Sous-titres NASA `.vtt` = transcription accessible. |
| `gedi-forest-height` | Hauteur 0→50/75 m (colorbar) → hauteur de note ; brun → vert foncé → vert vif → blanc = bois/marimba → bois/vents → cordes scintillantes. Couverture croissante au fil des passages → **l'ensemble se construit** (polyphonie = empreintes dessinées). Entrée régionale « Sénégal ». |
| `caldwell73-reference` | **Pas un phénomène Terre.** Page « Méthode » : explique le balayage radar → hauteur, avec crédit SYSTEM Sounds. |

---

## 7. DESIGN SYSTEM & MOTION

### 7.1 Direction artistique
- **Concept :** *« Observatoire nocturne »*. Fond noir profond, lumière rare et précieuse, typographie éditoriale. L'interface s'efface devant les données NASA.
- **Palette :** dérivée des **colorbars NASA** (bleu océan, cyan, jaune/orange chaleur, violet/orange lumières nocturnes, vert canopée). Un **neutre chaud** pour le texte (pas de blanc pur #FFF). Définir en tokens CSS (variables) + thème **sombre par défaut**, option **clair/contraste élevé**.
- **Typographie (à vérifier et auto-héberger si licences OK) :** un serif d'affichage éditorial (ex. *Instrument Serif* ou équivalent), un sans lisible (ex. *Inter Tight* / *Geist*), une mono pour les valeurs scientifiques (ex. *JetBrains Mono*). Échelle modulaire fluide (`clamp()`).
- **Anti-clichés :** pas de dégradés violet-bleu génériques, pas de glassmorphism partout, pas d'icônes décoratives sans rôle, pas de cartes identiques en grille répétitive. Chaque salle a **sa** respiration visuelle, mais **un seul** système de composants.
- **Composants clés :** anneau de maintien, carte de provenance, légende/colorbar, panneau « Ce que tu entends », lecteur Jukebox, sélecteur de mode, toasts accessibles.

### 7.2 Règles de mouvement
- **GSAP** (timelines, ScrollTrigger si scroll) + **Lenis** (scroll doux, **désactivé** avec `prefers-reduced-motion`). **R3F + drei** pour la 3D. Post-traitement **mesuré** (bloom léger seulement, jamais de flou lourd).
- Durées : micro 120-200 ms, transitions 400-700 ms, scènes 1,2-2 s. Courbes d'accélération cohérentes (définies une fois en tokens).
- **Le mouvement porte du sens** : la caméra qui plonge = on entre dans la donnée ; jamais d'animation gratuite qui retarde l'accès au contenu. Un bouton **« Passer »** existe pour toute séquence > 2 s.
- **Une seule vidéo-texture active** à la fois ; les autres sont des vignettes statiques.

### 7.3 Responsive
- Mobile d'abord pour les contrôles (zone du pouce), 3D **adaptative** : sur petit écran/faible GPU, bascule vers une **scène 2D allégée** (images NASA + son) sans perdre l'expérience sonore.
- Détecter WebGL2 ; en cas d'échec, **repli page 2D complète** (progressive enhancement).

---

## 8. ARCHITECTURE & STACK

### 8.1 Choix (à confirmer par un ADR après vérification des versions)
| Couche | Choix par défaut |
|---|---|
| Frontend | **Next.js (App Router)** + **React** + **TypeScript strict**, Tailwind CSS, composants accessibles (Radix/shadcn), Zustand (état), TanStack Query, Zod (validation), `next-intl` (FR par défaut, EN) |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` + postprocessing |
| Motion | GSAP + Lenis |
| Audio | Tone.js / Web Audio API, Web Workers pour l'analyse |
| Backend | **Python 3.12 + FastAPI** (Pydantic v2), SQLAlchemy 2 + Alembic |
| Base de données | **PostgreSQL** (hébergée, sauvegardes, rôle applicatif à privilèges minimaux) |
| Traitement de données | Python : NumPy, OpenCV, Pillow ; `ffmpeg` |
| Tests | Vitest + Testing Library, Playwright (e2e + a11y avec axe), Pytest, Schemathesis (fuzz API) |
| Qualité | ESLint + Prettier, Ruff + mypy, pre-commit, Conventional Commits |
| Déploiement | Frontend sur CDN (ex. Vercel/Cloudflare), API + Postgres sur un hébergeur managé ; assets lourds sur stockage objet + CDN |

> Si un composant (ex. auth gérée) réduit le **risque de sécurité** pour une équipe étudiante, **propose-le dans un ADR** plutôt que de réécrire de la cryptographie. **Pas de crypto maison.**

### 8.2 Arborescence cible
```
terra-sonora/
├─ apps/
│  ├─ web/                  # Next.js
│  │  ├─ src/app/           # routes : /, /hub, /room/[slug], /method, /account, /legal
│  │  ├─ src/components/    # ui/, three/, audio/, a11y/
│  │  ├─ src/audio/         # engine/, presets/<slug>.ts, workers/
│  │  └─ public/{nasa,data}/
│  └─ api/                  # FastAPI : auth, users, playlists, favorites, health
├─ scripts/                 # fetch_nasa_assets.py, optimize_assets.py, extract_features.py
├─ data/raw/nasa/           # hors git (gros fichiers)
├─ docs/                    # nasa_data_manifest.json, provenance.json, DECISIONS.md, THREAT_MODEL.md, A11Y.md
├─ .cursor/rules/           # règles (voir §13)
└─ .github/workflows/       # CI : lint, tests, audit, provenance
```

### 8.3 Modèle de données minimal
`users`(id UUID, email unique normalisé, email_verified_at, password_hash, display_name, locale, created_at, deleted_at) · `sessions`/`refresh_tokens`(id, user_id, token_hash, expires_at, revoked_at, user_agent_hash) · `playlists`(id, user_id, title, created_at) · `playlist_items`(playlist_id, dataset_slug, position, mode) · `favorites`(user_id, dataset_slug) · `audit_events`(id, user_id nullable, type, ip_hash, created_at). Les `dataset_slug` sont validés contre la **liste fermée** du manifeste (jamais de saisie libre).

### 8.4 API (extrait)
`POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `POST /auth/verify-email` · `POST /auth/forgot-password` · `POST /auth/reset-password` · `GET/PATCH /me` · `DELETE /me` · `GET /me/export` · CRUD `playlists`/`favorites` · `GET /datasets` (lit le manifeste, lecture seule) · `GET /health`. Spécification **OpenAPI** générée et versionnée.

---

## 9. SÉCURITÉ (obligatoire, pas optionnelle)

> **Transparence :** je n'ai pas trouvé de « règlement de sécurité NASA » spécifique aux sites d'équipes Space Apps. Les exigences ci-dessous suivent les **bonnes pratiques de l'industrie** (OWASP ASVS niveau 2 visé, OWASP Top 10, NIST SP 800-63B) **plus** les règles de contenu de la NASA (§3.2). L'équipe doit aussi relire le **règlement et les guides participants Space Apps** pour toute exigence de soumission, de licence ou de confidentialité.

### 9.1 Comptes et mots de passe
- Hachage **Argon2id** (paramètres ≥ recommandations OWASP actuelles), sel unique par mot de passe, via bibliothèque éprouvée.
- Mot de passe : **12 caractères minimum**, jusqu'à 128 ; **pas de règles de composition absurdes**, pas de rotation forcée (NIST 800-63B) ; **vérification contre mots de passe compromis** via l'API *Have I Been Pwned* en **k-anonymity** (ne jamais envoyer le mot de passe entier).
- **Pas d'énumération de comptes :** réponses identiques « si un compte existe, un e-mail est envoyé » ; temps de réponse homogènes.
- Vérification d'e-mail obligatoire pour les fonctions de compte. Jetons de vérification/réinitialisation : aléatoires (≥ 128 bits), **stockés hachés**, **usage unique**, expiration courte (15-60 min), comparaison en temps constant.
- **Anti-bruteforce :** limitation de débit par IP **et** par compte, délais exponentiels, CAPTCHA respectueux de la vie privée (ex. Cloudflare Turnstile) après échecs répétés.
- **2FA TOTP** et/ou **passkeys (WebAuthn)** en phase 2 (COULD).

### 9.2 Sessions
- Jeton d'accès **court (≤ 15 min)** + **jeton de rafraîchissement rotatif** stocké côté serveur (haché) avec détection de réutilisation (révoque la famille).
- Cookies : `HttpOnly`, `Secure`, `SameSite=Lax` (ou `Strict`), préfixe `__Host-` quand possible. **Aucun jeton dans `localStorage`.**
- Protection **CSRF** (double-submit ou jeton synchronisé) pour toute requête mutante ; vérification stricte de l'`Origin`.
- Expiration d'inactivité + durée absolue ; « Déconnecter tous les appareils ».

### 9.3 Entrées, sorties, API
- **Validation stricte** à l'entrée (Zod côté client, **Pydantic v2 côté serveur : la vérité**), listes d'autorisation (allow-lists) pour `slug`, mode, langue.
- **Requêtes SQL paramétrées uniquement** (ORM) ; aucune concaténation.
- Encodage de sortie, pas de `dangerouslySetInnerHTML` sauf contenu assaini (DOMPurify) ; **pas d'upload d'utilisateur en MVP**. Si ajouté plus tard : validation de type par signature (magic bytes), taille max, ré-encodage Pillow, suppression EXIF, SVG interdit, stockage hors racine web.
- **CORS** en liste blanche explicite. Limitation de débit globale + par route. Taille maximale de corps. Délais d'expiration (timeouts).
- Aucune clé API NASA ni secret côté client ; si une API NASA est utilisée, **appel côté serveur** uniquement, avec cache.

### 9.4 En-têtes et navigateur
`Content-Security-Policy` stricte (nonces ; `default-src 'self'` ; autoriser uniquement ce qui est nécessaire pour workers/audio/médias), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimale, `frame-ancestors 'none'`. **HTTPS partout.** Intégrité des sous-ressources (SRI) si un script tiers est inévitable (idéalement aucun).

### 9.5 Secrets, dépendances, chaîne logicielle
- `.env` jamais commité ; `.env.example` documenté ; **gitleaks** en pre-commit et en CI.
- Verrouiller les dépendances (lockfiles) ; **`npm audit`**, **`pip-audit`**, Dependabot/Renovate ; analyse **CodeQL/Semgrep** en CI. Épingler les actions CI par SHA.
- Images/binaires : sources officielles uniquement.

### 9.6 Base de données et données personnelles
- Rôle applicatif **sans droit DDL** en production ; migrations par un rôle séparé. Chiffrement au repos (fournisseur) et en transit (TLS). **Sauvegardes testées.**
- **Minimisation :** e-mail, nom d'affichage, langue, rien d'autre. Pas de données sensibles. Hachage de l'IP dans les journaux ; **pas de PII dans les logs**.
- Pages **Confidentialité** et **Mentions légales** claires (FR/EN) ; droits d'accès, d'export et de suppression **fonctionnels** (`GET /me/export`, `DELETE /me` avec effacement effectif sous délai court).
- Vérifier le cadre légal local (la loi togolaise sur la protection des données personnelles, n° 2019-014, à confirmer) et le RGPD si des utilisateurs européens s'inscrivent.

### 9.7 Journalisation et réponse à incident
Journal structuré (connexion, échec, réinitialisation, suppression), alertes sur pics d'échecs, **`docs/THREAT_MODEL.md`** (STRIDE court : usurpation, falsification, répudiation, divulgation, déni de service, élévation de privilèges) et **`SECURITY.md`** (comment signaler une faille).

### 9.8 Intégrité du contenu scientifique (aussi une exigence de sécurité)
Le manifeste est en **lecture seule** à l'exécution ; l'API n'accepte jamais une URL d'image ou de média fournie par l'utilisateur (**pas de SSRF**). Les assets servis ont un hachage connu (`provenance.json`).

---

## 10. ACCESSIBILITÉ (cœur du défi, pas un bonus)

- **WCAG 2.2 AA** au minimum : contrastes (≥ 4,5:1 texte, 3:1 composants), focus visible et jamais masqué, cibles ≥ 24×24 px (idéalement 44), navigation clavier **complète** (y compris la 3D via une liste alternative des 10 phénomènes), ordre de tabulation logique, pas de piège clavier.
- **Équivalent textuel** de chaque scène (description longue) et de chaque carte de données ; légendes/colorbars **décrites en texte**. Pour 4960, utiliser les **sous-titres NASA `.vtt`** comme transcription ; traduire en français avec mention « traduction ».
- **Audio :** commande de volume toujours visible, **pause globale (touche Échap/Espace)**, pas d'audio qui démarre seul (sauf après geste), aucune alerte sonore soudaine.
- **Mouvement :** respect de `prefers-reduced-motion`, aucune alerte clignotante (> 3 flashs/s interdits ; attention aux éclairs).
- **Lecteurs d'écran :** rôles/ARIA corrects, `aria-live` mesuré, pas de bruit verbal ; tester **NVDA/VoiceOver/TalkBack**.
- **Langue :** `lang` correct, FR par défaut, EN complet ; texte clair, phrases courtes.
- **Tactile/haptique :** optionnels, jamais indispensables.
- **Preuves :** `docs/A11Y.md` (checklist + résultats), tests axe dans Playwright en CI, **test utilisateur** avec au moins une personne aveugle/malvoyante si possible (sinon l'écrire dans les limites connues).

---

## 11. PERFORMANCE & CONNECTIVITÉ (réalité du terrain)

Beaucoup d'utilisateurs seront sur **mobile et connexion limitée** (Lomé et région).
- **Budgets :** JS initial du Seuil **< 250 Ko gzip** ; 3D chargée **à la demande** (dynamic import) ; LCP < 2,5 s sur 4G moyenne ; INP < 200 ms ; 60 fps cible bureau, **30 fps** acceptable mobile.
- **Mode économie de données** (détecte `Save-Data` / `navigator.connection` quand dispo + interrupteur manuel) : images fixes + son seulement, pas de vidéo.
- Chaque asset ≤ **8 Mo** ; préchargement intelligent (le noyau survolé précharge sa salle) ; **cache** agressif (headers immuables + hash de contenu) ; service worker pour le hors-ligne des assets essentiels.
- Qualité 3D adaptative (`PerformanceMonitor` de drei) ; DPR plafonné ; instancing ; pas d'ombres temps réel inutiles ; libération de la mémoire GPU à la sortie des salles (`dispose`).
- **Web Workers** pour l'analyse d'image ; jamais de calcul lourd sur le thread principal.
- Mesurer avec Lighthouse CI + profilage réel sur un téléphone d'entrée de gamme.

---

## 12. QUALITÉ & TESTS

- **Tests unitaires :** moteur de mapping (entrées → paramètres), quantification sur gamme, limiteur, validations.
- **Tests de contrat :** `provenance.json` ↔ `public/nasa/` ; slugs valides ↔ manifeste.
- **Tests e2e (Playwright) :** parcours Seuil → Hub → Salle → Jukebox ; auth complète (invité, inscription, vérification, connexion, réinitialisation, suppression) ; **axe** sur chaque page.
- **Tests de sécurité :** rate limiting, énumération, CSRF, expiration de jetons, rotation de refresh, injection de base, en-têtes.
- **CI obligatoire :** lint, types, tests, audit de dépendances, gitleaks, provenance, Lighthouse CI. Une PR qui casse l'un de ces points n'est pas fusionnée.
- **Définition de « fini » :** voir §15.

---

## 13. RÈGLES CURSOR À CRÉER (`.cursor/rules/*.mdc`)

Crée ces fichiers dès la Phase 0 (contenu court, impératif) :
1. **`nasa-data-integrity.mdc`** : « Jamais d'image/donnée inventée. Seulement le manifeste. Étiqueter l'artistique. Vérifier chaque URL. Crédit texte, pas de logo NASA. Pas de musique sous licence. »
2. **`security.mdc`** : « Argon2id, cookies HttpOnly/Secure/SameSite, CSRF, validation Pydantic/Zod, SQL paramétré, CSP stricte, pas de secrets, pas de crypto maison, pas de PII dans les logs, pas d'entrée utilisateur pour les URLs de médias. »
3. **`accessibility.mdc`** : « WCAG 2.2 AA, clavier complet, `aria-live` mesuré, `prefers-reduced-motion`, équivalent texte de chaque visuel, pas d'audio sans geste, volume plafonné. »
4. **`motion-3d-performance.mdc`** : « R3F/drei, GSAP, Lenis. Une vidéo-texture active. Import dynamique de la 3D. DPR plafonné. Dispose des ressources. Repli 2D. Jamais de motion qui retarde le contenu. »
5. **`code-quality.mdc`** : « TS strict, Ruff+mypy, tests avec chaque fonctionnalité, Conventional Commits, ADR pour les décisions structurantes, pas de TODO caché. »

---

## 14. PLAN D'EXÉCUTION (phases avec portes de validation)

| Phase | Contenu | Livrable testable |
|---|---|---|
| **0. Fondations** | Dépôt, monorepo, lint/CI, règles Cursor, ADR de stack (vérifier versions), design tokens, squelette Next.js + FastAPI, `/health` | `npm run dev` + `uvicorn` démarrent ; CI verte |
| **1. Données NASA** | Scripts fetch/optimize/extract, **calibration des légendes (LUT) avec page de validation humaine**, `provenance.json`, test CI de provenance, page technique `/data` listant les sources | **Toutes les URLs du manifeste vérifiées** ; rapport des échecs/écarts. **⛔ STOP : validation Sakapani** |
| **2. Moteur audio** | Engine Tone.js, limiteur, quantification, Web Worker d'analyse, 2 presets (nightlights, ocean) | Démo audio 2 phénomènes + tests unitaires |
| **3. Seuil + Hub 3D** | Séquence « maintien », globe, 10 noyaux, transitions, repli 2D, mode réduit | Parcours Seuil→Hub fluide, a11y de base. **⛔ STOP : validation** |
| **4. Salles (tranche verticale)** | 4 salles complètes : **nightlights, courants (3912 ou 5425), CO₂ (5196), éclairs (5011)**, panneau « Ce que tu entends », modes de lecture, provenance | 4 phénomènes de bout en bout |
| **5. Salles restantes** | Aérosols, qualité de l'air, rivière atmosphérique, GEDI (Sénégal), page Méthode (Caldwell 73) | 10 phénomènes |
| **6. Backend & comptes** | Tout `SPEC_BACKEND_COMPTES_SECURITE_DB.md` : schéma BD + migrations, API, auth sécurisée (§9), profils, playlists, favoris, export/suppression, mode invité, e-mails, CAPTCHA, limites de débit, docker-compose | Auth complète + tests de sécurité + THREAT_MODEL |
| **7. Durcissement** | Audit a11y, perf (budgets §11), sécurité (en-têtes, rate limit, pen-test maison), THREAT_MODEL, SECURITY.md | Rapports + corrections |
| **8. Finition & livraison** | Jukebox, i18n FR/EN, pages légales, README, vidéo démo, déploiement | Site en ligne + dépôt propre. **⛔ STOP avant mise en ligne finale** |

**Priorités (MoSCoW) :** MUST = Seuil + Hub + **les 10 phénomènes NASA** (aucun n'est abandonné) + **exploration sonore au survol dans chaque salle** + galerie complète + mode invité + auth sécurisée + a11y + provenance. L'ordre des phases (4 salles d'abord, puis les autres) sert à **livrer progressivement**, pas à réduire le périmètre. SHOULD = Jukebox, FR/EN complet. COULD = 2FA/passkeys, export WAV, vraies données LIS/GEOS-CF. WON'T (cette version) = uploads utilisateur, commentaires publics, paiements.

---

## 15. DÉFINITION DE « FINI » (critères d'acceptation)

- [ ] **Images/vidéos NASA réelles visibles sur chaque page et chaque écran** (Seuil, Hub, Salles, Jukebox, Méthode), vérifié par test e2e `[data-nasa-asset]`. Sans cela, le projet n'est pas livrable.
- [ ] Aucune donnée/image hors manifeste ; `provenance.json` complet ; aucun visuel de fond non-NASA ; tout habillage graphique étiqueté.
- [ ] Le Seuil donne la sensation **avant** l'entrée, avec alternatives (bouton Entrer, sans son, mouvement réduit).
- [ ] 4 phénomènes minimum jouables de bout en bout (10 visés), avec légende officielle + carte de provenance + « Ce que tu entends ».
- [ ] Utilisable **sans la vue** (clavier + lecteur d'écran + mode Audio d'abord) ; axe : 0 violation critique.
- [ ] Volume plafonné et fondus ; aucun son brutal ; aucune animation clignotante dangereuse.
- [ ] Compte facultatif ; invité complet ; sécurité §9 implémentée et testée ; export/suppression fonctionnels.
- [ ] Perf : budgets §11 tenus (rapport Lighthouse joint) ; repli 2D testé.
- [ ] CI verte (lint, types, tests, audit, gitleaks, provenance).
- [ ] Docs : README, DECISIONS, THREAT_MODEL, A11Y, SECURITY, crédits NASA, licence du code (MIT par défaut, **sauf exigence du règlement Space Apps à vérifier**).
- [ ] Vidéo démo de 2-3 minutes prête.

---

## 16. TA PREMIÈRE ACTION

1. Lis **intégralement** ce prompt, `docs/nasa_data_manifest.json`, `docs/nasa_sonification_map.json`, `docs/SPEC_EXPLORATION_SONORE.md` (exploration au survol et ce que chaque visualisation fait entendre) **et `docs/SPEC_BACKEND_COMPTES_SECURITE_DB.md`** (comment le site fonctionne, parcours de connexion, schéma de base de données, API, sécurité, déploiement, tests). Copie ces fichiers dans `docs/`. **Ces specs détaillent et prévalent sur les résumés des §5.6, §8 et §9 du prompt ; en cas de doute, la règle de sécurité la plus stricte s'applique.**
2. Réponds en **10 lignes maximum** : ce que tu as compris, 3 risques majeurs, et les ADR de stack que tu proposes (après vérification des versions).
3. Exécute les **Phases 0 et 1** sans attendre.
4. **Arrête-toi** en fin de Phase 1 avec : rapport de vérification des URLs, tailles réelles, écarts avec le manifeste, et arborescence `public/nasa/`. Attends ma validation.

=== FIN DU PROMPT ===

---

## ANNEXE A — Skills / extensions à ajouter à Cursor (pour toi, Sakapani)

Je ne peux pas vérifier ici quels noms de skills existent dans ton marketplace ; cherche ces **catégories** et garde celles bien notées/maintenues :

| Catégorie de skill | Pourquoi |
|---|---|
| **Frontend design / UI** (direction artistique, composants, tokens) | Éviter le rendu « template IA » |
| **Three.js / React Three Fiber / WebGL** | Globe, shaders, performance 3D |
| **GSAP / animation / motion design** | Timelines du Seuil, transitions |
| **Web Audio / Tone.js / DSP** | Moteur de sonification |
| **Accessibilité (WCAG, ARIA, axe)** | Cœur du défi |
| **Sécurité (OWASP, revue de code sécurité, secrets)** | Comptes utilisateurs |
| **FastAPI / Python backend** | API propre, Pydantic v2 |
| **PostgreSQL / SQLAlchemy / migrations** | Schéma et accès sûrs |
| **Tests (Playwright, Vitest, Pytest)** | e2e + a11y en CI |
| **Performance web (Lighthouse, bundle analysis)** | Budgets sur mobile faible débit |
| **i18n (next-intl)** | FR/EN |
| **Git / Conventional Commits / revue de PR** | Historique propre |

## ANNEXE B — Points de vigilance connus (à garder en tête)

- **GEDI (4950)** : la page SVS cite des périodes différentes (avril 2018-avril 2019 pour certaines vidéos, avril 2019-avril 2020 dans d'autres textes). Afficher « période indiquée par SVS ».
- **Air Quality (5533)** : le texte parle de juillet-août 2024 ; les données utilisées couvrent du 1er juillet au 14 septembre 2024. Légende couleur→polluant **non fournie dans le texte** : à lire sur les versions étiquetées.
- **Aérosols (5669)** : c'est une **image fixe** (19 août 2025, 20:00 UTC), pas une vidéo.
- **Vidéos lourdes** : Perpetual Ocean 2 (0,9-1,2 Go), Air Quality (180-360 Mo), éclairs (127-414 Mo). Ne pas servir telles quelles.
- **Caldwell 73** est de l'astronomie (Hubble) : référence de méthode seulement.
- **Traductions FR** des textes NASA : marquer « traduction », ne jamais les attribuer à la NASA.
