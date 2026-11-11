#!/usr/bin/env bash
# Installe la commande « labomi » (Linux / macOS) : dépendances + lien dans ~/.local/bin.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HOME/.local/bin"

case "$DIR" in
  *"#"*) echo "⚠ Le chemin du projet contient « # », Vite ne fonctionnera pas : déplace le dossier." >&2; exit 1 ;;
esac

if ! command -v pnpm >/dev/null; then
  echo "pnpm est introuvable. Installe-le d'abord : npm install -g pnpm" >&2
  exit 1
fi

# Ne jamais écraser une autre commande « labomi » qui n'est pas la nôtre
if [ -e "$BIN/labomi" ] || [ -L "$BIN/labomi" ]; then
  # c'est « le nôtre » si c'est un lien vers un lanceur Labo MI (ou un lien cassé d'une ancienne install)
  if [ ! -L "$BIN/labomi" ] || { [ -e "$BIN/labomi" ] && ! grep -qs "plateforme de révision Labo MI" "$BIN/labomi"; }; then
    echo "⚠ $BIN/labomi existe déjà et ne vient pas de ce projet : installation annulée." >&2
    echo "  Supprime-le ou renomme-le toi-même si tu es sûr de toi." >&2
    exit 1
  fi
fi

# Dépendances d'abord : si ça échoue, rien d'autre n'est modifié
(cd "$DIR" && { pnpm install --frozen-lockfile || pnpm install; })

chmod +x "$DIR/bin/labomi"
mkdir -p "$BIN"
ln -sfn "$DIR/bin/labomi" "$BIN/labomi"

echo
echo "✓ Commande installée : $BIN/labomi"

case ":$PATH:" in
  *":$BIN:"*)
    echo "Lance le site avec : labomi"
    ;;
  *)
    # Ajoute ~/.local/bin au PATH dans le fichier de config du shell (zsh par défaut sur macOS)
    case "$(basename "${SHELL:-bash}")" in
      zsh) RC="$HOME/.zshrc" ;;
      bash)
        if [ "$(uname)" = "Darwin" ]; then
          # bash de connexion : lit le PREMIER fichier existant parmi ces trois.
          # Créer ~/.bash_profile masquerait un ~/.profile existant, donc on réutilise l'existant.
          RC="$HOME/.bash_profile"
          for f in "$HOME/.bash_profile" "$HOME/.bash_login" "$HOME/.profile"; do
            if [ -f "$f" ]; then RC="$f"; break; fi
          done
        else
          RC="$HOME/.bashrc"
        fi ;;
      *) RC="$HOME/.profile" ;;
    esac
    LINE='export PATH="$HOME/.local/bin:$PATH"'
    if ! grep -qsF "$LINE" "$RC"; then
      printf '\n# Ajouté par labomi/install.sh\n%s\n' "$LINE" >> "$RC"
      echo "✓ $BIN ajouté au PATH dans $RC"
    fi
    echo "Ouvre un nouveau terminal, puis lance : labomi"
    ;;
esac
