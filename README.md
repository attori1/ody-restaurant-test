# Ody Restaurant — Test technique Fullstack

Un petit produit de gestion pour restaurant : gestion du menu, prise de commandes avec
une vraie logique métier, CRM, réglages et un tableau de bord d'accueil. Le tout sur la
stack demandée, avec une chaîne de types entièrement générée — de la base de données
jusqu'aux hooks du frontend.

---

## La stack

| Couche | Techno |
|--------|--------|
| Monorepo | pnpm workspace + Turborepo |
| Dashboard | Expo (React Native + Web), Expo Router |
| Backend | Hono sur Cloudflare Workers |
| Base de données | PostgreSQL (Neon) + Drizzle ORM |
| Validation | drizzle-zod |
| Contrat d'API | `@hono/zod-openapi` → spec OpenAPI |
| Client généré | Orval → hooks React Query |
| Récupération des données | TanStack React Query |

---

## La chaîne de contrat (le cœur du projet)

```
schéma Drizzle  →  drizzle-zod  →  Hono/OpenAPI  →  Orval  →  hooks React Query générés
   (la vérité)    (validation)     (le contrat)   (codegen)        (le frontend)
```

C'est l'idée centrale du projet, et celle sur laquelle j'ai le plus insisté. La forme
des données est définie **une seule fois**, dans le schéma Drizzle
([services/backend/src/db/schema.ts](services/backend/src/db/schema.ts)). Tout le reste
en découle automatiquement :

- `drizzle-zod` génère les schémas Zod à partir des tables — aucune validation écrite à la main.
- `@hono/zod-openapi` transforme ça en spec OpenAPI, exposée sur `/openapi.json`.
- Orval lit cette spec et génère des hooks React Query typés
  ([packages/api-client/src/generated](packages/api-client/src/generated)).
- Le dashboard importe **uniquement** des hooks et des types générés depuis
  `@ody/api-client` — pas de DTO écrits à la main, pas d'enums dupliqués.

Concrètement : si je change une colonne dans le schéma, le type se propage jusqu'au
frontend et TypeScript râle partout où il y a une incohérence. Ça m'a d'ailleurs fait
gagner du temps en cours de route — la chaîne a attrapé un vrai bug toute seule (voir le
commit « fix: use OpenAPI path params {id} »). Les routes étaient écrites avec la syntaxe
de Hono (`/items/:id`) au lieu de celle d'OpenAPI (`/items/{id}`), et Orval générait donc
des URLs cassées. Sans cette chaîne, je ne l'aurais découvert qu'au runtime.

---

## Structure du dépôt

```
apps/dashboard         App Expo (web) — pages et hooks métier
services/backend       API Hono sur Workers — schéma Drizzle, routes, logique commandes
packages/shared        Design system : tokens + composants UI réutilisables (@ody/shared)
packages/types         Types et logique de domaine partagés (@ody/types)
packages/api-client    Config Orval + hooks/types générés (la surface de contrat)
```

---

## Prérequis

- Node ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- Une base PostgreSQL — le plus simple est un projet [Neon](https://neon.tech) gratuit.
  Pas besoin de Postgres en local : Cloudflare Workers se connecte à Neon en HTTP.

---

## Lancer le projet en local

```bash
# 1. Installer les dépendances
pnpm install

# 2. Configurer l'URL de la base pour le backend.
#    Créer services/backend/.dev.vars avec ta connection string Neon :
echo 'DATABASE_URL=postgresql://USER:PASS@HOST/db?sslmode=require' > services/backend/.dev.vars

# 3. Créer les tables à partir du schéma Drizzle
pnpm db:push

# 4. Injecter les données de démo (catégories, plats, clients, commandes)
pnpm db:seed

# 5. Démarrer le backend (http://localhost:8787)
pnpm dev:backend

# 6. Dans un autre terminal, démarrer le dashboard puis appuyer sur "w" pour le web
pnpm dev:dashboard
```

> Le client Orval est déjà généré et commité. Pour le régénérer après un changement
> côté backend, laisse `pnpm dev:backend` tourner et lance `pnpm gen:contract`.

---

## Les scripts

| Script | Ce qu'il fait |
|--------|---------------|
| `pnpm dev:backend` | Lance l'API Hono en local (wrangler) |
| `pnpm dev:dashboard` | Lance l'app Expo (web) |
| `pnpm gen:contract` | Régénère le client Orval depuis la spec OpenAPI en cours |
| `pnpm db:push` | Pousse le schéma Drizzle vers la base |
| `pnpm db:seed` | Injecte les données de démo |
| `pnpm test` | Lance les tests backend + frontend |
| `pnpm typecheck` | Vérifie les types sur tous les packages |
| `pnpm lint` | Lint sur tous les packages |

---

## Le comportement du backend (volontairement strict, pas piloté par le client)

La logique des commandes vit dans un module pur et testé
([services/backend/src/lib/orders-logic.ts](services/backend/src/lib/orders-logic.ts)).
Trois règles que je tenais à appliquer côté serveur :

- **Le total est calculé par le serveur.** Le client n'envoie que
  `{ menuItemId, quantity }`. Les prix et le total sont recalculés à partir de la base —
  jamais à partir de ce que dit le client (sinon, n'importe qui pourrait commander à 0 €).
- **Vérification de disponibilité.** Commander un plat indisponible est rejeté (400).
- **Machine à états.** Les changements de statut sont validés contre une table de
  transitions explicite. Un saut interdit (par ex. `confirmed → delivered`) est refusé
  avec un message clair qui liste les statuts autorisés. Et le statut se change via une
  action dédiée (`POST /orders/:id/status`), pas en modifiant librement un champ.

---

## Le design system

Le design system vit dans le package partagé `@ody/shared`. Des tokens centralisés
([packages/shared/src/tokens](packages/shared/src/tokens)) pour les couleurs, la
typographie, les espacements, les arrondis et les ombres. Les primitives réutilisables
sont dans [packages/shared/src/components](packages/shared/src/components) : Button, Input,
Badge/StatusBadge, Card, Modal, Skeleton, EmptyState — avec leurs états hover / focus /
pressed / disabled.

Il y a aussi une route **Design System** dédiée
([/ui-library](apps/dashboard/app/ui-library.tsx), accessible depuis l'en-tête de
l'accueil) qui présente tous les tokens, les surfaces et les états des composants.

---

## Les tests

- **Backend** (Vitest) : transitions de la machine à états + calcul/validation des prix
  côté serveur — 11 tests sur la logique métier pure.
- **`@ody/types`** (Vitest) : logique de flux des commandes — 3 tests.
- **Dashboard** (Jest) : flux des commandes tel que consommé par la page Orders — 2 tests.

```bash
pnpm test
```

---

## Mes choix d'architecture

- **Le contrat généré plutôt que des types écrits à la main.** C'est la règle la plus
  importante de l'énoncé. Les types et les hooks du frontend sont générés à 100 % depuis
  la spec OpenAPI du backend ; l'app ne déclare jamais ses propres DTO.
- **La logique métier hors des composants.** Les pages ne font que de l'affichage. Les
  données et les mutations vivent dans des hooks métier (`hooks/useMenu.ts`,
  `hooks/useOrders.ts`, `hooks/useSettings.ts`), et les règles pures dans des packages
  dédiés (`@ody/types` côté front, `lib/orders-logic.ts` côté backend).
- **Packages partagés.** Le design system (tokens + composants) vit dans `@ody/shared`,
  les types/logique de domaine dans `@ody/types`, et le client d'API généré dans
  `@ody/api-client`. Le dashboard ne fait que les consommer.
- **Invalidation du cache React Query.** Les mutations invalident les bonnes clés de
  requête, donc l'UI se resynchronise depuis le serveur (la source de vérité) au lieu de
  bricoler un état local.
- **Driver HTTP de Neon.** Cloudflare Workers ne peut pas ouvrir de connexion TCP
  classique, donc le backend passe par le driver serverless HTTP de Neon
  (`drizzle-orm/neon-http`).

---

## Compromis et ce qui n'est pas fini (gestion du périmètre)

Vu le créneau d'1 à 2 jours, j'ai priorisé la **chaîne de types** et le **domaine
Orders** (les parties les plus valorisées dans l'énoncé), et j'ai assumé quelques coupes :

- **Web uniquement.** Le natif est un bonus dans l'énoncé, donc l'app vise le web. Les
  primitives RN sont compatibles natif, mais je ne les ai pas testées sur device.
- **La création de commande depuis le dashboard** est gérée côté backend (validée,
  chiffrée, testée), mais l'UI se concentre sur le flux opérationnel (liste / filtres /
  détail / statut). Un écran de création de commande serait la prochaine étape.
- **Les tests de rendu des composants frontend** ont été mis de côté au profit de tests
  de logique pure : faire tourner le rendu React Native sous `jest-expo` dans un monorepo
  pnpm demande une grosse config de transformation pour peu de valeur. J'ai préféré
  couvrir la logique métier (backend + flux des commandes), là où sont les vraies règles.
- **Validation du client sur une commande.** À la création d'une commande, les plats sont
  validés (existence, disponibilité) mais un `customerId` inexistant remonterait encore une
  erreur de clé étrangère ; le valider explicitement serait le prochain petit durcissement.
- **Auth et multi-restaurant** sont volontairement hors périmètre.
