# SPEC — Fonctionnement du site, comptes, sécurité, base de données

À lire par Cursor avec le prompt maître. En cas de conflit avec le prompt, **la règle la plus stricte en sécurité gagne**, et tu signales le conflit dans `docs/DECISIONS.md`.

> **Transparence :** je n'ai pas trouvé de règlement de sécurité NASA propre aux sites des équipes Space Apps. Les exigences ci-dessous suivent **OWASP ASVS (niveau 2 visé), OWASP Top 10 et NIST SP 800-63B**, plus les règles de contenu NASA du prompt maître. L'équipe relit aussi le règlement et les guides participants Space Apps pour toute exigence de soumission, de licence ou de confidentialité.

---

## 1. Comment le site fonctionne (vue d'ensemble)

```
Navigateur (Next.js + R3F + Web Audio)
 ├─ Assets NASA statiques (images/vidéos optimisées + LUT + features)  ← CDN, cache immuable
 ├─ Moteur de sonification  → 100 % côté client (Worker + Web Audio), AUCUNE donnée perso envoyée
 └─ Appels API (uniquement pour les comptes) ─▶ API FastAPI ─▶ PostgreSQL
                                                  └─▶ Service e-mail (vérification, réinitialisation)
```
**Principe clé :** toute l'expérience (Seuil, Hub, salles, exploration sonore, galerie, Jukebox) **fonctionne sans compte et sans appel serveur** pour les données NASA. Le backend sert **seulement** : comptes, préférences d'accessibilité, favoris, playlists, export/suppression de données.

### Routes (Next.js)
| Route | Accès | Rôle |
|---|---|---|
| `/` | public | Seuil (ouverture immersive) |
| `/hub` | public | Globe 3D + 10 phénomènes |
| `/room/[slug]` | public | Salle d'un phénomène (exploration au survol) |
| `/gallery` | public | Toutes les images/vidéos NASA + crédits |
| `/method` | public | Méthode, référence Caldwell 73, limites |
| `/data` | public | Liste des sources et provenance |
| `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email` | public | Comptes |
| `/account` | connecté | Profil, préférences, playlists, favoris |
| `/account/privacy` | connecté | Export, suppression |
| `/legal/privacy`, `/legal/terms`, `/legal/credits` | public | Légal et crédits NASA |

### Mode invité (par défaut)
- Aucun compte requis pour écouter/explorer.
- Les préférences locales (volume, voix, contraste, langue) sont gardées dans `localStorage` **uniquement** (jamais de jeton d'authentification dans `localStorage`).
- Un compte apporte : synchroniser préférences, sauvegarder des playlists et favoris.

---

## 2. Parcours des utilisateurs (connexion)

### 2.1 Inscription
1. L'utilisateur saisit **e-mail**, **mot de passe**, **nom d'affichage** (optionnel), langue ; coche l'acceptation des conditions (**sans** pré-cocher).
2. Le serveur : normalise l'e-mail (minuscules, trim), valide, vérifie le mot de passe (§4.1), crée l'utilisateur `email_verified_at = NULL`, envoie un e-mail de vérification.
3. **Réponse identique** que l'e-mail existe déjà ou non : « Si cette adresse peut être utilisée, un e-mail vient d'être envoyé. » (pas d'énumération de comptes). Si l'e-mail existe, on envoie à la place un e-mail « Vous avez déjà un compte ».
4. L'utilisateur clique le lien (jeton à usage unique) → `email_verified_at` rempli → connexion possible.

### 2.2 Connexion
1. E-mail + mot de passe. Contrôles : limitation de débit, délais progressifs, CAPTCHA après échecs (§4.4).
2. Succès → le serveur pose les cookies de session (§4.2) et renvoie le profil minimal.
3. Échec → message **générique** (« Identifiants incorrects ou compte non vérifié »), temps de réponse homogène.

### 2.3 Mot de passe oublié
1. L'utilisateur saisit l'e-mail → réponse **toujours identique**.
2. Si le compte existe : e-mail avec lien à usage unique (15-60 min).
3. Nouveau mot de passe → **toutes les sessions sont révoquées**, un e-mail de notification est envoyé.

### 2.4 Déconnexion / sessions
- « Se déconnecter » (cet appareil) et « Se déconnecter partout ».
- Liste des appareils actifs (user-agent haché/arrondi, date) dans `/account`.

### 2.5 Suppression et export
- **Export** : `GET /me/export` → JSON de toutes les données de l'utilisateur.
- **Suppression** : `DELETE /me` avec re-saisie du mot de passe ; anonymisation immédiate et purge complète sous ≤ 30 jours ; e-mail de confirmation.

### 2.6 UX des écrans de compte
- Même langage visuel que le site (sombre, éditorial, motion sobre), **sans** distraire : pas d'animation lourde sur les formulaires.
- Formulaires 100 % accessibles : étiquettes visibles, erreurs liées aux champs (`aria-describedby`), focus géré, pas de piège clavier, `autocomplete` correct (`email`, `current-password`, `new-password`), bouton « afficher le mot de passe », compatibles gestionnaires de mots de passe (ne **jamais** bloquer le collage).
- Messages d'erreur clairs en français (et anglais), sans jargon, sans révéler l'existence d'un compte.

---

## 3. Base de données (PostgreSQL)

Extensions : `pgcrypto` (UUID), `citext` (e-mails insensibles à la casse). Migrations par **Alembic** ; le rôle applicatif n'a **aucun droit DDL**.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Liste fermée des phénomènes : alimentée depuis nasa_data_manifest.json (jamais depuis l'utilisateur)
CREATE TABLE datasets (
  slug        text PRIMARY KEY,
  svs_id      integer NOT NULL,
  title       text NOT NULL
);

CREATE TABLE users (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             citext NOT NULL UNIQUE,
  email_verified_at timestamptz,
  password_hash     text NOT NULL,                 -- Argon2id (chaîne encodée avec paramètres)
  display_name      text CHECK (char_length(display_name) <= 60),
  locale            text NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr','en')),
  prefs             jsonb NOT NULL DEFAULT '{}'::jsonb,  -- préférences d'accessibilité validées par schéma
  terms_accepted_at timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE TABLE email_tokens (                        -- vérification d'e-mail ET réinitialisation
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose     text NOT NULL CHECK (purpose IN ('verify_email','reset_password')),
  token_hash  bytea NOT NULL UNIQUE,              -- SHA-256 du jeton ; le jeton brut n'est jamais stocké
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id   uuid NOT NULL,                      -- rotation : une famille par connexion
  token_hash  bytea NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  replaced_by uuid REFERENCES refresh_tokens(id),
  ua_summary  text,                               -- résumé arrondi du navigateur, pas l'UA brut
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON refresh_tokens (user_id);
CREATE INDEX ON refresh_tokens (family_id);

CREATE TABLE playlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON playlists (user_id);

CREATE TABLE playlist_items (
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  position    integer NOT NULL CHECK (position >= 0),
  dataset_slug text NOT NULL REFERENCES datasets(slug),
  mode        text NOT NULL CHECK (mode IN ('hover','sweep','scan','auto')),
  PRIMARY KEY (playlist_id, position)
);

CREATE TABLE favorites (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dataset_slug text NOT NULL REFERENCES datasets(slug),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, dataset_slug)
);

CREATE TABLE audit_events (                         -- sécurité : pas de PII brute
  id          bigserial PRIMARY KEY,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  type        text NOT NULL,                        -- signup, login_ok, login_fail, reset_request, reset_done, delete_account, ...
  ip_hash     bytea,                                -- HMAC(ip, secret rotatif), jamais l'IP brute
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON audit_events (type, created_at);
```
**Règles :**
- Limites de quantité par utilisateur (ex. ≤ 50 playlists, ≤ 100 éléments par playlist) appliquées côté serveur.
- `prefs` est validé par un **schéma Pydantic** (clés autorisées : `volume`, `voice`, `highContrast`, `reducedMotion`, `speech`, `dataSaver`) ; tout le reste est rejeté.
- **Aucune donnée sensible** (pas de date de naissance, pas de téléphone, pas d'adresse).
- **Rôles BD :** `terra_migrator` (DDL) ≠ `terra_app` (SELECT/INSERT/UPDATE/DELETE sur les tables listées, rien d'autre).
- **Sauvegardes** quotidiennes chiffrées + **test de restauration** documenté.
- Alternative acceptable (via ADR) : service géré d'authentification + PostgreSQL à sécurité au niveau des lignes (RLS) pour réduire le risque de crypto/session faite maison. **Jamais de crypto maison.**

---

## 4. Sécurité des comptes

### 4.1 Mots de passe
- Hachage **Argon2id** (bibliothèque éprouvée, p. ex. `argon2-cffi`), paramètres réglés pour ~250-500 ms sur le serveur de prod et **≥ aux recommandations OWASP actuelles** (vérifier la page OWASP Password Storage Cheat Sheet à la date du dev). Sel unique intégré ; **rehash** automatique à la connexion si les paramètres changent.
- **12 caractères minimum**, 128 maximum, tous caractères autorisés, **pas** de règles de composition, **pas** de rotation forcée (NIST 800-63B).
- **Contrôle de mots de passe compromis** via l'API *Pwned Passwords* en **k-anonymity** : on n'envoie que les 5 premiers caractères du SHA-1, jamais le mot de passe. Si l'API est indisponible : on laisse passer (et on journalise), on ne bloque pas l'inscription.
- Jamais de mot de passe dans les logs, les erreurs, les URLs.

### 4.2 Sessions et cookies
- **Jeton d'accès** court (≤ 15 min) + **jeton de rafraîchissement** opaque aléatoire (≥ 256 bits), **haché** en base, **rotatif** à chaque usage, avec **détection de réutilisation** : si un ancien jeton réapparaît, on **révoque toute la famille**.
- Cookies : `HttpOnly`, `Secure`, `SameSite=Lax`, préfixe `__Host-` (donc `Path=/` et pas de `Domain`). **Aucun jeton dans `localStorage`/`sessionStorage`.**
- Durées : inactivité 7 jours, absolue 30 jours (ajustables). Les actions sensibles (suppression, changement d'e-mail/mot de passe) exigent le mot de passe actuel.
- **CSRF :** jeton anti-CSRF (double-submit signé) en en-tête sur chaque requête mutante + contrôle strict des en-têtes `Origin`/`Host`.

### 4.3 Jetons e-mail (vérification, réinitialisation)
- Aléatoires (≥ 128 bits), **stockés hachés (SHA-256)**, **usage unique**, expiration : vérification 24 h, réinitialisation 30 min.
- Comparaison en temps constant. Un nouvel envoi invalide les anciens du même type.
- Les liens envoient vers une page POST (pas d'action sur simple GET) pour éviter l'exécution par les prévisualiseurs de liens.

### 4.4 Anti-abus
| Endpoint | Limite (à ajuster et tester) |
|---|---|
| `POST /auth/login` | 5/min par IP **et** 5/min par e-mail, délais exponentiels, CAPTCHA après 3 échecs |
| `POST /auth/register` | 5/heure par IP, CAPTCHA |
| `POST /auth/forgot-password` | 3/heure par e-mail, 10/heure par IP |
| `POST /auth/refresh` | 30/min par session |
| Autres routes API | 60/min par utilisateur ou IP |
- **Pas de verrouillage définitif de compte** (évite qu'un attaquant bloque un utilisateur) : délais progressifs + alerte e-mail après activité suspecte.
- CAPTCHA respectueux de la vie privée (ex. Cloudflare Turnstile).
- Optionnel (phase 2) : **TOTP** et **passkeys (WebAuthn)**.

### 4.5 Validation et API
- **Pydantic v2** côté serveur (la vérité) + Zod côté client. Listes d'autorisation pour `slug`, `mode`, `locale`.
- SQL **uniquement paramétré** via l'ORM. Taille de corps maximale. Délais d'expiration. **CORS** en liste blanche. Réponses d'erreur **uniformes** :
```json
{ "error": { "code": "invalid_credentials", "message": "…", "request_id": "…" } }
```
- **Aucune URL de média fournie par l'utilisateur** (pas de SSRF). Pas d'upload en MVP. Les `slug` viennent de la table `datasets`.

### 4.6 En-têtes de sécurité (exemple de départ, à resserrer)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<n>'; style-src 'self' 'nonce-<n>';
  img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' <API_ORIGIN>;
  worker-src 'self' blob:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
Les assets NASA sont **auto-hébergés** (pas de hotlink) : le canvas de la sonde n'est donc pas « taché » et la CSP reste stricte.

### 4.7 Secrets et chaîne logicielle
- `.env` jamais commité ; `.env.example` complet ; secrets dans le gestionnaire du fournisseur ; rotation documentée.
- **gitleaks** (pre-commit + CI), **npm audit**, **pip-audit**, Dependabot/Renovate, **CodeQL/Semgrep**, actions CI épinglées par SHA, lockfiles commités.
- Variables d'environnement attendues : `DATABASE_URL`, `APP_SECRET`, `COOKIE_DOMAIN` (vide pour `__Host-`), `WEB_ORIGIN`, `API_ORIGIN`, `EMAIL_API_KEY`, `EMAIL_FROM`, `TURNSTILE_SECRET`, `IP_HASH_SECRET`, `ENV`.

### 4.8 E-mail
Fournisseur transactionnel avec **SPF, DKIM, DMARC** configurés ; modèles FR/EN sobres ; liens HTTPS uniquement ; aucun contenu sensible dans l'e-mail. En développement : serveur d'e-mail local (ex. Mailpit) dans `docker-compose`.

### 4.9 Confidentialité et conformité
- **Minimisation :** e-mail, nom d'affichage, langue, préférences. **Aucun tracking publicitaire**, pas de cookies tiers. Mesure d'audience, si elle existe, **sans cookie et anonyme**.
- Pages **Confidentialité** et **Conditions** claires (FR/EN), en langage simple (des mineurs de la catégorie Jeunesse peuvent venir : **mode invité complet**, aucune date de naissance demandée).
- Vérifier le cadre légal : loi togolaise sur la protection des données personnelles (n° 2019-014, à confirmer) et RGPD si des Européens s'inscrivent.
- Journaux **sans PII** ; IP hachée avec HMAC et secret rotatif ; rétention des journaux ≤ 90 jours.

---

## 5. API (contrats)

Préfixe `/api/v1`. JSON. Erreurs au format uniforme (§4.5). OpenAPI généré et versionné (`docs/openapi.json`).

| Méthode | Route | Auth | Corps → Réponse | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | non | `{email, password, display_name?, locale, accept_terms}` → `202` | réponse identique si l'e-mail existe |
| POST | `/auth/verify-email` | non | `{token}` → `204` | usage unique |
| POST | `/auth/login` | non | `{email, password}` → `200 {user}` + cookies | générique en cas d'échec |
| POST | `/auth/refresh` | cookie | → `200` + cookies | rotation + détection de réutilisation |
| POST | `/auth/logout` | cookie | → `204` | cet appareil |
| POST | `/auth/logout-all` | oui | → `204` | toutes les familles |
| POST | `/auth/forgot-password` | non | `{email}` → `202` | toujours `202` |
| POST | `/auth/reset-password` | non | `{token, new_password}` → `204` | révoque toutes les sessions |
| GET | `/me` | oui | → `200 {profil}` | |
| PATCH | `/me` | oui | `{display_name?, locale?, prefs?}` → `200` | prefs validées par schéma |
| GET | `/me/export` | oui | → `200 JSON` | |
| DELETE | `/me` | oui + mot de passe | → `202` | anonymisation immédiate, purge ≤ 30 j |
| GET/POST/PATCH/DELETE | `/playlists`, `/playlists/{id}` | oui | CRUD | `dataset_slug` ∈ `datasets` |
| GET/PUT/DELETE | `/favorites/{slug}` | oui | | |
| GET | `/datasets` | non | → liste fermée depuis le manifeste | lecture seule |
| GET | `/health` | non | → `200` | sans info sensible |

---

## 6. Structure du backend (FastAPI)

```
apps/api/
├─ app/
│  ├─ main.py              # création de l'app, middlewares (sécurité, CORS, request-id, limites)
│  ├─ core/                # config (pydantic-settings), sécurité (hash, jetons), logging
│  ├─ db/                  # session, modèles SQLAlchemy 2, migrations Alembic
│  ├─ auth/                # routes, services, dépendances (current_user), CSRF
│  ├─ users/  playlists/  favorites/  datasets/
│  └─ email/               # modèles FR/EN, envoi
├─ tests/                  # pytest : unitaires + intégration (BD de test) + sécurité
└─ pyproject.toml          # ruff, mypy, pytest
```
- Dépendances injectées (`Depends`) ; **services** séparés des routes ; pas de logique métier dans les routes.
- Middlewares : identifiant de requête, journalisation structurée sans PII, en-têtes de sécurité, limite de taille, timeouts.

---

## 7. Environnements et déploiement

| Env | Contenu |
|---|---|
| **dev** | `docker-compose` : Postgres, Mailpit, API, web ; données de test ; CAPTCHA en mode test |
| **staging** | copie de prod avec données factices ; tests e2e et sécurité automatiques |
| **prod** | HTTPS partout, front sur CDN, API + Postgres managés, sauvegardes, supervision |

- Migrations appliquées au déploiement (rôle `terra_migrator`), puis l'app tourne avec `terra_app`.
- **Assets NASA** servis par CDN avec en-têtes `Cache-Control: public, max-age=31536000, immutable` (noms avec hash).
- Surveillance : `/health`, alertes sur pics d'erreurs 5xx et d'échecs de connexion ; journal d'audit.
- **Plan de reprise** : restauration testée, procédure `docs/RUNBOOK.md`.

---

## 8. Menaces à traiter (`docs/THREAT_MODEL.md`, STRIDE court)

| Menace | Mesure |
|---|---|
| Usurpation (vol de session) | cookies `HttpOnly/Secure/SameSite`, rotation, révocation, CSRF |
| Falsification (injection) | validation Pydantic/Zod, SQL paramétré, CSP stricte |
| Répudiation | journal d'audit sans PII |
| Divulgation (fuite de données) | minimisation, hachage Argon2id, jetons hachés, TLS, pas de PII dans les logs |
| Déni de service | limites de débit, tailles max, timeouts, CDN pour les assets lourds |
| Élévation de privilèges | autorisation par propriétaire sur chaque ressource (`user_id` vérifié), rôle BD minimal |
| Énumération de comptes | réponses et temps homogènes |
| SSRF / contenu non fiable | aucune URL fournie par l'utilisateur ; manifeste en lecture seule |

---

## 9. Tests obligatoires (CI)

- **Auth** : inscription, vérification, connexion, rafraîchissement, réutilisation d'un jeton rafraîchissement (famille révoquée), réinitialisation, suppression, export.
- **Sécurité** : limites de débit, pas d'énumération (réponses identiques), CSRF refusé sans jeton, jetons expirés/réutilisés refusés, accès à la ressource d'un autre utilisateur refusé (`403/404`), en-têtes présents, cookies aux bons drapeaux.
- **Fuzz API** (Schemathesis) sur l'OpenAPI.
- **BD** : contraintes (slugs fermés, quotas), migrations montantes/descendantes.
- **e2e (Playwright)** : parcours invité complet puis compte ; **axe** sur les pages de compte.
- **Robustesse** : le site reste utilisable (invité) si l'API est indisponible ; messages d'erreur clairs, jamais de page blanche.

## 10. Définition de « fini » pour cette partie

- [ ] Invité : tout fonctionne sans appel API.
- [ ] Parcours compte complet (inscription → vérification → connexion → réinitialisation → export → suppression) testé en e2e.
- [ ] Toutes les mesures des §4 et §8 implémentées et couvertes par des tests ; CI verte (gitleaks, audits, CodeQL/Semgrep).
- [ ] `THREAT_MODEL.md`, `SECURITY.md`, `RUNBOOK.md`, `openapi.json` à jour.
- [ ] Sauvegarde restaurée avec succès au moins une fois.
- [ ] Aucune PII dans les logs ; IP hachée ; rétention appliquée.
