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

chmod +x "$DIR/bin/labomi"
mkdir -p "$BIN"
ln -sfn "$DIR/bin/labomi" "$BIN/labomi"
(cd "$DIR" && pnpm install)

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
      bash) if [ "$(uname)" = "Darwin" ]; then RC="$HOME/.bash_profile"; else RC="$HOME/.bashrc"; fi ;;
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
