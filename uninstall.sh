#!/usr/bin/env bash
# Désinstalle la commande « labomi » (Linux / macOS).
# Retire le lien ~/.local/bin/labomi et la ligne PATH ajoutée par install.sh.
# Le dossier du projet n'est pas supprimé : efface-le toi-même si tu veux tout enlever.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LINK="$HOME/.local/bin/labomi"
MARKER="# Ajouté par labomi/install.sh"

# 1. Lien de la commande (seulement s'il pointe vers ce projet)
if [ -L "$LINK" ]; then
  TARGET="$(readlink "$LINK")"
  if [ "$TARGET" = "$DIR/bin/labomi" ]; then
    rm "$LINK"
    echo "✓ Commande supprimée : $LINK"
  else
    echo "⚠ $LINK pointe vers un autre dossier ($TARGET) : laissé tel quel."
  fi
elif [ -e "$LINK" ]; then
  echo "⚠ $LINK n'est pas un lien créé par install.sh : laissé tel quel."
else
  echo "La commande labomi n'était pas installée."
fi

# 2. Ligne PATH ajoutée par install.sh (repérée par son commentaire)
for RC in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
  if [ -f "$RC" ] && grep -qF "$MARKER" "$RC"; then
    TMP="$(mktemp)"
    # supprime le commentaire, la ligne export qui suit et la ligne vide qui précède
    awk -v m="$MARKER" '
      { lines[NR] = $0 }
      END {
        for (i = 1; i <= NR; i++) {
          if (lines[i] == m) { skip[i] = 1; skip[i + 1] = 1; if (i > 1 && lines[i - 1] == "") skip[i - 1] = 1 }
        }
        for (i = 1; i <= NR; i++) if (!skip[i]) print lines[i]
      }' "$RC" > "$TMP"
    cat "$TMP" > "$RC" && rm "$TMP"
    echo "✓ Ligne PATH retirée de $RC"
  fi
done

echo
echo "Désinstallation terminée. Pour tout supprimer : rm -rf \"$DIR\""
