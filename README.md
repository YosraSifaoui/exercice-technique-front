# Métiers 360 — Préparer une séance

Application de préparation de séances de vidéos immersives 360° pour les conseiller·es
France Travail, enseignant·es et éducateur·ices. Elle permet de chercher des vidéos dans
le catalogue, de composer une séance (sélection, ordre, nom, casque), puis de l'enregistrer. En plus elle permet de lister les séances déjà enregistré et voir leur détail.

## Lancer le projet

```bash
# 1. Démarrer l'API simulée (fournie, port 4000)
cd server && npm && npm start

# 2. Démarrer l'application (port 5173)
cd app && npm install && npm run dev
```

Ouvrir http://localhost:5173

## Mise en place du projet

Le dépôt contient deux parties :

- **`server`** : le serveur d'API simulé fourni, tel quel, sans changement.
- **`app`** : l'application front-end, bootstrap avec `npm create vite@latest -- --template react-ts`,
  puis adaptée au sujet.

### Choix technologiques

| Techno | Rôle | Pourquoi |
|---|---|---|
| **React 18 + TypeScript strict** | Base | Exigé. |
| **Vite 8** | Bundler / dev server | Exigé. |
| **React Router 7** | Routage | Trois routes : catalogue, liste des séances, détail d'une séance. |
| **TanStack Query v5** | Données serveur | TanStack Query gère cache, retry, loading/error states nativement. |
| **Ant Design 5** | Composants + style | Cité comme utilisé en interne. Composants accessibles (Drawer, Select, AutoComplete, Pagination...) prêts à l'emploi. |
| **React Context + useState** | État du brouillon | Un seul état global (la séance en cours de composition). Pas de dépendance supplémentaire (Redux,...) |

## Les trois hypothèses qui ont le plus pesé

1. **Persistance locale du brouillon.** La spécification ne dit pas si une séance en
   cours de composition doit survivre à un rafraîchissement. Le brouillon est donc persisté dans `localStorage`.
2. **Pas d'édition/suppression des séances enregistrées.** L'API n'expose que
   `GET` et `POST /sessions` (ni `PUT` ni `DELETE`). J'en déduis qu'une séance
   enregistrée est définitive ; la vue « Mes séances » est en lecture seule.
3. **Le filtre « casque » sert aussi de filtre de compatibilité.** Un casque choisi
   filtre les vidéos à celles qui le supportent — usage : « je n'ai que des Pico 4
   aujourd'hui, ne me montrez que ce que je peux lancer ».

## Choix d'interface, et pour qui

- **Catalogue et composition sur le même écran**, le panneau de séance s'ouvrant en
  tiroir latéral. Pour des utilisateur·ices pressé·es qui préparent juste avant la
  séance : on ne change pas de page pour ajouter/ordonner.
- **Filtres alignés sur l'usage** : titre, métier (ROME, recherche par nom), public
  (le groupe est connu), casque (matériel disponible). Pas de filtre « durée » : peu
  utile au moment de choisir.
- **États d'interface explicites** (spinner de chargement, liste vide, erreur avec
  réessayer) car l'API simulée peut échouer.
- **Reponsive** : grille responsive (`Row`/`Col` avec breakpoints
AntD), tiroir prenant toute la largeur en portrait.

## Ce qui a été laissé de côté

- Édition/suppression de séances (non couvert par l'API).
- Authentification et persistance serveur au-delà de la mémoire (hors périmètre).

## Avec plus de temps

- **Tests automatisés** (Vitest + Testing Library) sur le brouillon, le flux de
  sauvegarde et les états d'erreur.
- **Réordonnancement en drag and drop** (accessible) en plus des boutons haut/bas.
- **Prévisualisation d'une vidéo** avant de l'ajouter à la séance.
- **Thème sombre** et raffinement des contrastes (audit RGAA complet).
- **Recherche plein-texte** sur la description des vidéos, pas seulement le titre
  (l'API ne supporte `q` que sur le titre — il faudrait filtrer côté client sur la
  page courante, ou demander une évolution de l'API).
- **InternationalisationU** de l'application avec `react-i18next`, pour basculer entre le français et l'anglais (ou d'autres langues) sans réécrire les composants — l'API et le référentiel ROME étant en français, seuls les textes de l'interface seraient concernés.

## Utilisation de l'IA

J'ai utilisé un assistant IA pour le bootstrapping initial, l'écriture des types et une première version des composants, tout en pilotant l'architecture (séparation `lib` / `components`, store en `Context`, hooks `TanStack Query`).
J'ai ensuite repris, ajusté et simplifié le code à la main. J'ai vérifié moi-même : le build réussit, et la chaîne complète fonctionne contre l'API réelle (GET vidéos, GET filtres, POST /sessions → 201, GET sessions) y compris la gestion des échecs transitoires.

**Décision prise contre une proposition de l'outil** : l'assistant a proposé d'abord un
store Zustand pour le brouillon, puis un store maison basé sur `useSyncExternalStore`.
J'ai tranché pour un simple React Context + `useState` — moins de code, pas de
dépendance, suffisant pour un seul état global. Lors d'une deuxième itération,
l'assistant a également proposé de combiner Ant Design avec Tailwind ; j'ai retiré
Tailwind pour garder un seul système de style.

## Temps et sessions

Une seule session d'environ 2 h, répartie entre la revue du code produit par l'IA et la modification des composants (retrait de `Tailwind`, passage de useReducer à useState, extraction de composants partagés, rajout des routes session et détail, fixes de types et vérification bout-en-bout).
