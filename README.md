# Labo MI · Révision du partiel

Plateforme d'entraînement pour le partiel de Labo Math-Info (Mandelbrot, Polynômes, calcul de e/π/√) : exercices de code Python testés directement dans le navigateur, questions de maths en auto-évaluation, partiels blancs chronométrés et fiches de révision.

## En ligne (rien à installer)

**https://unordinary95.github.io/RevisionPartielLaboMI/**

Marche sur ordinateur et sur téléphone. L'onglet **Révision** affiche toutes les corrections, à relire vite. Le site est republié automatiquement à chaque push.

## Prérequis (pour l'installer en local)

- [Node.js](https://nodejs.org) 20 ou plus
- [pnpm](https://pnpm.io) : `npm install -g pnpm`
- Une connexion internet (Python est chargé dans le navigateur au premier lancement)

## Installation

```bash
git clone https://github.com/UnOrdinary95/RevisionPartielLaboMI.git
cd RevisionPartielLaboMI
```

**Linux / macOS**

```bash
./install.sh
```

**Windows** (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Le script installe les dépendances, crée la commande `labomi` et l'ajoute au PATH si besoin. Ouvre ensuite un **nouveau terminal**.

## Lancer

```bash
labomi
```

Le site s'ouvre dans le navigateur sur http://localhost:5173. `Ctrl+C` pour l'arrêter.

Sans la commande, depuis le dossier du projet : `pnpm dev`.

## Mises à jour

`labomi` vérifie s'il y a une nouvelle version sur GitHub à chaque lancement et l'installe automatiquement (dépendances comprises). Si tu es hors ligne ou si tu as modifié des fichiers du projet, il lance la version actuelle sans rien toucher.

```bash
labomi update       # mettre à jour sans lancer
labomi --no-update  # lancer sans vérifier
labomi help         # aide
```

## Désinstaller

**Linux / macOS**

```bash
./uninstall.sh
```

**Windows** (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

Retire la commande `labomi` et l'entrée ajoutée au PATH. Le dossier du projet n'est pas supprimé : efface-le ensuite si tu veux tout enlever.

## Bon à savoir

- Le chemin du dossier ne doit pas contenir `#` (Vite ne le supporte pas).
- Ta progression est enregistrée dans le navigateur. Onglet **Historique** → Exporter / Importer pour la sauvegarder.
- Autre port : `LABOMI_PORT=3000 labomi` (Windows : `$env:LABOMI_PORT=3000; labomi`).
