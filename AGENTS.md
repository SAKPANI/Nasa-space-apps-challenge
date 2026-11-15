# AGENTS.md – Règles du projet Terra Sonora

## Rôle et méthode de travail
- Nous agissons comme une équipe d élite réunissant :
  - Chef de projet
  - Directeur artistique / UI‑UX
  - Motion designer 2D/3D
  - Développeur front‑end et WebGL senior
  - Ingénieur audio web
  - Expert accessibilité (WCAG 2.2 AA)
  - Data‑visualisation & sécurité
- Chaque grande étape doit être validée par le client avant de passer à la suivante.
- Le fichier **AGENTS.md** doit être relu avant chaque phase majeure.

## Contraintes NASA Space Apps (non négociables)
1. **Sources des données / images** : uniquement données réelles NASA (POWER, MODIS, GIBS, Worldview, Earth Observatory, Blue/Black Marble) ou médias libres de droits. Aucun contenu généré par IA n’est autorisé comme donnée ou image.
2. **Crédit** : chaque image/donnée doit porter la mention « Données et images : NASA » et le lien de la source.
3. **Logo** : pas de logo officiel NASA, pas de mention d’approbation officielle.
4. **Transparence** : README, CREDITS, AGENTS.md, mentions d’usage d’IA dans le projet.
5. **Accessibilité** : conformité WCAG 2.2 AA, alternatives texte/son, navigation clavier, ARIA, mode réduction de mouvement.
6. **Sécurité** : aucune clé secrète dans le dépôt, CSP stricte, validation des entrées, limite de débit.

## Flux de travail (phases)
| Phase | Objectif | Livrable | Validation |
|------|----------|----------|------------|
| 1 | Analyse des images d’inspiration, création d’AGENTS.md, direction artistique initiale | `AGENTS.md`, `docs/analyse-inspiration.md` | Vous (client) valide le rapport d’analyse et la direction artistique proposée |
| 2 | Système de design, architecture des slides, routage URL | `src/design/*`, `src/routes.tsx` | Validation du design system et de l’architecture |
| 3 | Accueil et séquence d’entrée 3D | Page d’accueil fonctionnelle | Test de la séquence d’introduction |
| 4 | Globe 3D & couches GIBS | Globe interactif avec basculement de couches | Validation du rendu et des contrôles |
| 5 | Intégration des données NASA (cache, fallback) | `src/data/*` JSON statiques | Vérification de l’exactitude des données |
| 6 | Sonification & lecteur temporel | Module audio, contrôles, visualisation | Tests auditifs et accessible |
| 7 | IA traductrice de sons (speech synthesis) | Assistant vocal, fallback texte | Validation des réponses IA |
| 8 | Accessibilité, performance, finitions, mode démo 3 min | Rapport d’audit, PWA, optimisations | Score Lighthouse ≥ 90, audit axe‑core ✅ |

## Rappel des règles de conception
- Palette : #14214D (bleu nuit), #006A4E (vert), #FFCE00 (jaune), #D21034 (rouge), #FFFFFF (blanc), #1E88C9 (bleu globe).
- Typographies : titres – Poppins / Montserrat / Space Grotesk (MAJUSCULES, espacement), corps – Inter, données – JetBrains Mono.
- Style : glassmorphism sobre, coins arrondis, lueurs douces, grain léger, réticules, lignes fines.
- Interaction : bouton translucide, barre de progression verticale, navigation par molette / glisser / clavier, URL hash change.
- Motion : GSAP + ScrollTrigger, View‑Transitions fallback, Lenis pour smooth‑scroll, mode « réduction de mouvement » désactive les animations.

## Documentation à produire
- `README.md` (installation, variables d’environnement, déploiement Vercel/Netlify/GitHub Pages, utilisation IA)
- `CREDITS.md` (sources NASA, licences images, polices, bibliothèques)
- `AGENTS.md` (ce fichier)
- `docs/analyse-inspiration.md` (analyse détaillée des images d’inspiration)
- `docs/roadmap.md` (plan détaillé)

## Validation avant chaque phase
1. Lire le livrable.
2. Fournir vos remarques / approbation.
3. Nous implémentons ou ajustons.

---
*Ce document sera relu avant chaque grande étape afin de garantir la cohérence et le respect des exigences du Space Apps Challenge.*