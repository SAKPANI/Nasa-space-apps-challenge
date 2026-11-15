# SPEC — Exploration sonore au survol (cœur du produit)

À lire par Cursor avec `nasa_data_manifest.json` et `nasa_sonification_map.json`.

## 0. Ce que demande l'équipe (à respecter à la lettre)

1. **Le site est fait avec les visualisations NASA des ressources fournies.** Toutes les images et vidéos viennent du manifeste. Rien n'est inventé, rien n'est généré.
2. **Survoler = entendre.** Quand le pointeur (ou le doigt, ou le curseur clavier) traverse une visualisation, un son se produit **sans cliquer**. Le son change selon ce qu'il y a **sous le pointeur** : mer, pluie, neige, forêt, ville allumée, fumée, orage, poussière.
3. **Le son reflète la donnée.** Si on traverse une zone de pluie, on entend la pluie. Si on traverse la mer, on sent la mer. Si on traverse un continent là où il n'y a pas de mer, on entend le vide. Une personne qui ne voit pas doit pouvoir **comprendre l'image par l'écoute**.
4. **Cliquer = comprendre davantage** : détail, valeur, explication, lecture vocale.
5. **Tous les phénomènes de la Terre fournis** sont inclus : température de la mer, courants, salinité, pluie/précipitations/neige/humidité, aérosols (sel, poussière, fumée, sulfates), qualité de l'air (CO, PM2.5, O₃, NOx), CO₂, éclairs, forêts, lumières nocturnes.
6. **Motion design et 3D** soignés pour les personnes qui voient (voir §7).

## 1. Principe : la « sonde de données »

```
pointeur (x,y) ─▶ coordonnées de texture (u,v) ─▶ pixel de la frame NASA courante
              ─▶ couleur ─▶ [LUT de la légende NASA] ─▶ valeur + classe
              ─▶ paramètres de paysage sonore ─▶ moteur audio (lissé, sans clics)
```
Rien n'est deviné : **la couleur du pixel est ramenée à la valeur de la légende NASA** (inversion de colorbar). Si la couleur ne correspond à aucune entrée de la légende (continents, fond, zone sans donnée), la classe est `no_data` et on **n'entend rien de faux**.

## 2. Calibration des légendes (obligatoire, Phase 1)

Je n'ai pas pu lire les pixels des images depuis mon environnement. **C'est donc Cursor, sur la machine de l'équipe, qui extrait les vraies valeurs.** Procédure :

1. `scripts/calibrate_colorbar.py <slug>` charge le fichier de légende NASA (champ `colorbar_file` de `nasa_sonification_map.json`).
2. Détecte la bande de dégradé (zone allongée à forte variation de couleur), échantillonne N points (≥ 256) le long de la bande, convertit en **CIELAB**.
3. Ancre les valeurs avec les **bornes écrites par la NASA** (ex. 3912 : 0 °C → 32 °C ; PO2 température : 0 → 25 °C ; salinité : 33 → 36 ; GEDI : 0 → 50 m ; ces bornes sont dans le manifeste). Si une légende a des repères intermédiaires (ex. vert 10-20 °C), les utiliser comme **points de contrôle de vérification**.
4. Produit `public/data/lut/<slug>.json` : `[{value, L, a, b}, ...]` + seuil `deltaE_max`.
5. **Validation humaine (une fois par légende)** : l'outil ouvre une page de contrôle qui affiche la LUT à côté de la légende NASA et permet de cliquer 3 points de l'image NASA pour vérifier que la valeur lue est plausible. **L'équipe valide.** Tant que ce n'est pas validé : `lut_status = A_CALIBRER` et la salle reste désactivée.
6. Cas particuliers (voir le fichier carte) :
   - **5313 (lumières)** : aucune légende numérique ; classification qualitative (clair/sombre, violet/orange). Ne pas fabriquer d'unité.
   - **5533 (qualité de l'air)** : lire l'association couleur→polluant sur l'image `WithLabels` et les pages liées 5151-5154. Ne pas deviner.
   - **4960 (rivière atmosphérique)** : la légende contient plusieurs couches (neige en haut, océan en bas ; valeurs faibles transparentes). Identifier visuellement quelle zone de couleur correspond à vapeur d'eau, précipitations, nuages, neige ; **faire valider**.
   - **5196 (CO₂)** : calibrer **plage, couleur et opacité**.

## 3. Lire le pixel sous le pointeur

- Chaque salle garde la **frame courante** dans un `<canvas>` caché de taille réduite (ex. 512 px de large), **même origine** (assets auto-hébergés, canvas non « taché »). Pour les vidéos : `requestVideoFrameCallback` pour copier la frame courante ; pour les images : une seule fois.
- Calcul dans un **Web Worker** (`OffscreenCanvas` si dispo).
- **Ouverture d'écoute** : au lieu d'un pixel unique, médiane sur un petit voisinage (5×5), plus un anneau plus large pour le contexte (« est-ce que je suis près d'un front de pluie ? »).
- **Mouvement** : différence entre la frame courante et la précédente dans le voisinage → énergie de mouvement (courants, rivière atmosphérique, rotation d'orbite).
- **Lissage** : lissage exponentiel (≈ 80-150 ms) + hystérésis sur la classe, pour éviter le clignotement quand le pointeur passe sur des pixels de transition.
- **Cadence** : événements pointeur jusqu'à 60 Hz ; mise à jour des paramètres audio à ≤ 30 Hz avec `setTargetAtTime`.

## 4. Moteur de paysages sonores (procédural, déterministe)

Tout est **synthétisé en Web Audio** (pas d'échantillons : pas de problème de licence, pas de poids réseau). Chaque « couche » est un petit graphe audio dont **le gain et les paramètres** sont pilotés par la sonde. Les couches sont mélangées par **crossfade à puissance égale** quand on change de classe.

| Couche | Synthèse (métaphore sonore) | Piloté par |
|---|---|---|
| **Mer / houle** | bruit brun → passe-bas, gonflement lent (LFO 0,08-0,25 Hz) | température → coupure/hauteur ; mouvement → intensité |
| **Courant** | bruit passe-bande mobile, grains de ressac | énergie de mouvement, direction → panoramique |
| **Courant profond** | sous-basse + bruit passe-bas | intensité de la couche profonde |
| **Pluie** | impulsions très courtes filtrées (gouttes), densité variable, toit de plafonnement | valeur de précipitation → densité et brillance |
| **Air humide** | souffle passe-bande aéré qui « coule » | transport de vapeur d'eau |
| **Neige** | quasi-silence feutré + scintillement très doux | valeur de la couche neige |
| **Nuages** | nappe aérienne douce | présence de la couche nuages |
| **Embruns (sel marin)** | bruit passe-haut | abondance de la classe |
| **Vent de poussière** | bruit passe-bande médium-grave | abondance de la classe |
| **Feu / fumée** | crépitements épars + grondement grave | abondance de la classe |
| **Verre (sulfates)** | scintillement cristallin, FM très douce | abondance de la classe |
| **Ville** | bourdonnement doux + tintements aigus | luminosité (lumières nocturnes) |
| **Croissance/déclin** | arpèges ascendants brillants / descendants filtrés | violet (plus de lumière) / orange (moins) |
| **Respiration planétaire** | pouls lent + nappe grave | pulsation réelle des frames CO₂ |
| **Orage lointain** | craquements doux + grondement sourd | densité de flashs détectés |
| **Canopée** | bruissement dense + vent grave | hauteur de végétation (grande) |
| **Herbes sèches** | bruissement clairsemé | hauteur de végétation (basse) |

### Règles de fidélité (non négociables)
1. **Aucun son sans donnée.** Si la sonde ne trouve pas le phénomène, la couche est à zéro. **Le silence est une information** (« ici, pas de mer », « ici, pas d'éclair »).
2. **Jamais de pluie ailleurs que là où les données montrent des précipitations** (salle 4960). Pas de pluie dans les aérosols, la qualité de l'air, les lumières, etc.
3. **Déterminisme :** même lieu, même frame → même son. Les « gouttes », « crépitements » et « grains » utilisent un **PRNG avec graine** dérivée de `(slug, cellule, tranche de temps)`. Pas de `Math.random()`.
4. **Monotonie (test unitaire) :** si la valeur augmente, le paramètre associé évolue toujours dans le même sens.
5. **Étiquette honnête :** l'interface dit « Le *timbre* est une métaphore sonore ; *où* et *combien* viennent des données NASA ».
6. **Sécurité auditive :** limiteur maître, plafond −12 dBFS, fondus 80-200 ms, pas d'attaque brutale (éclairs doux), volume initial bas.

## 5. Interaction

| Entrée | Comportement |
|---|---|
| **Souris (survol)** | Le pointeur est l'« oreille ». Son continu qui suit la sonde. Aucun clic requis. |
| **Tactile (glisser)** | Même chose avec le doigt ; au relâchement, fondu. |
| **Clavier** | Un **curseur virtuel** : flèches = déplacement par cellule ; `Maj`+flèches = grand pas ; `L` = annonce la valeur et la classe ; `Entrée` = détail complet ; `Échap` = silence ; `Début/Fin` = bords. Annonces via `aria-live` (≤ 1 / 3 s). |
| **Clic / Entrée** | Panneau de détail : valeur et unité (si connue), classe, date de la frame, explication NASA **traduite** (mention « traduction »), crédit, lien source, et **lecture vocale** optionnelle (`speechSynthesis`, `fr-FR`). |
| **Mode Balayage** | Un « radar » ou une ligne qui parcourt l'image automatiquement ; utile pour avoir **une vue d'ensemble** sans bouger. |

### Déblocage de l'audio
Les navigateurs interdisent l'audio avant un **geste utilisateur** (clic, touche, toucher) ; le simple mouvement de la souris **ne compte pas**. Le Seuil (maintien de l'anneau) débloque déjà l'audio. Si quelqu'un entre « sans son » ou revient sur la page, afficher un bandeau discret « **Active le son** (Entrée) » ; dès la première touche/clic, l'exploration devient sonore sans autre action.

## 6. Parcours utilisateur de la salle

1. On arrive devant la visualisation NASA (image/vidéo) en grand, légende officielle visible.
2. On **déplace le pointeur** : on entend tout de suite ce qu'on traverse.
3. Un **anneau d'écoute** suit le pointeur (voir §7).
4. Un **panneau « Ce que tu entends »** se met à jour : « Océan, ~24 °C : houle chaude », « Précipitations fortes : pluie dense », « Aucune donnée ici : silence ».
5. **Clic** pour le détail et la voix.
6. Boutons : changer de **version** (température / salinité / beauté ; avec/sans légende ; zoom régional), **Balayage**, **Silence**, **Volume**.

## 7. Motion design et 3D de l'exploration (pour qui voit)

- La visualisation NASA est posée dans une **scène 3D** (plan légèrement courbé façon « hyperwall », parallaxe très douce à la souris). **Jamais** de déformation qui fausse la donnée ; la légende reste **plate et lisible**.
- **Anneau d'écoute** : cercle fin qui suit le pointeur avec inertie ; son **rayon** reflète l'ouverture d'écoute ; sa **couleur** prend celle du pixel sous le pointeur (valeur réelle).
- **Ondulations** : quand la classe change (mer → terre, sec → pluie), une onde discrète part de l'anneau. Pour la pluie : de petites gouttes **visuelles** au pointeur, **proportionnelles à la valeur**. Pour l'orage : un halo bref et doux (jamais clignotant > 3 flashs/s).
- **Transitions entre salles** : le globe 3D du hub sert de transition (la caméra plonge vers le phénomène choisi) ; l'image NASA reste visible pendant la transition.
- **`prefers-reduced-motion`** : pas de parallaxe ni d'ondulations ; anneau fixe simple.
- **Outils :** R3F + drei pour la scène, GSAP pour les timelines, Lenis pour le scroll. Une seule vidéo-texture active à la fois.

## 8. Performance

- Canvas de sonde ≤ 512 px de large ; calculs dans un Worker ; pas de lecture de pixels sur le thread principal.
- Boucles vidéo ≤ 8 Mo ; images WebP/AVIF ; préchargement de la salle survolée dans le hub.
- Mode économie de données : images fixes + exploration sonore identique (la sonde marche aussi sur une image fixe).
- Cible : latence entre mouvement et changement de son **< 100 ms** perçue.

## 9. Accessibilité

- Tout ce qui s'entend a un **équivalent texte** (panneau « Ce que tu entends », `aria-live`).
- Exploration **entièrement au clavier**. Compatible lecteurs d'écran (NVDA, VoiceOver, TalkBack).
- Description longue de chaque scène (traduction des textes NASA, mention « traduction »). Pour 4960 : sous-titres `.vtt` NASA comme transcription.
- Aucune information transmise **uniquement** par la couleur ou **uniquement** par le son.
- Test avec une personne aveugle ou malvoyante si possible (sinon l'écrire dans `docs/A11Y.md`).

## 10. Tests d'acceptation (CI et recette)

- [ ] Chaque LUT est `VALIDÉE` par un humain avant d'activer la salle.
- [ ] Sur chaque image NASA, un test place la sonde sur 5 points connus (mer, terre, fort/faible) et vérifie classe + valeur attendues (tolérance).
- [ ] **Test pluie** : dans 4960, la sonde sur une zone de précipitation active la couche pluie ; sur une zone sans précipitation, la pluie est à zéro. Aucune pluie dans les autres salles.
- [ ] **Test mer** : dans 3912, la mer joue sur l'océan et se tait sur les continents.
- [ ] **Test déterminisme** : même position + même frame = mêmes paramètres audio.
- [ ] **Test monotonie** par couche.
- [ ] **Test sans clic** : après le Seuil, un simple déplacement du pointeur produit du son.
- [ ] **Test clavier** : un utilisateur parcourt l'image avec les flèches et entend les mêmes changements.
- [ ] **Test aveugle** : 3 personnes écoutent 3 extraits sans image et décrivent ce qu'elles « voient » ; l'écart avec la réalité est consigné.
- [ ] Axe : 0 violation critique. Volume plafonné.

## 11. Limites à dire honnêtement dans l'interface et la doc

- Le **timbre** est une métaphore (synthèse) ; **où/quand/combien** viennent des données NASA.
- La valeur lue est celle de la **légende NASA appliquée à une image**, pas la mesure brute du capteur. Précision limitée (compression, anti-crénelage, exagération de hauteur pour GEDI).
- Les images fixes (ex. aérosols 5669) montrent **un instant figé**.
- Les « zones géographiques nommées » sont des repères à valider visuellement.
