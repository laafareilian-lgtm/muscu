# Muscu — Suivi d'entraînement PWA

Application web mobile-first (PWA) ultra-minimaliste pour le suivi de musculation. Conçue pour une utilisation d'une seule main pendant la séance. **100 % client** — LocalStorage, zéro backend.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- lucide-react
- recharts (courbes de progression)
- LocalStorage + Service Worker (PWA)

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). Sur mobile, ajoute l'app à l'écran d'accueil pour le mode standalone.

## Personnaliser le programme

Édite `src/lib/programme.ts` :

- jours (Push, Pull, Legs…)
- exercices, séries cibles, temps de repos

Aucun menu complexe : le programme est le code.

## Fonctionnalités

| Écran | Contenu |
|--------|---------|
| Accueil | Liste des séances + dernier passage + démarrer |
| Séance | Séries pré-remplies, check → timer repos, bip/vibration |
| Historique | Séances passées + courbe charge max / volume |

## Structure

```
src/
  app/                 # Pages (accueil, séance, historique)
  components/          # UI modulaire
  hooks/               # useWorkoutStorage, useRestTimer
  lib/                 # types, programme, storage, utils
public/
  manifest.webmanifest
  sw.js
```

## Build

```bash
npm run build
npm start
```
