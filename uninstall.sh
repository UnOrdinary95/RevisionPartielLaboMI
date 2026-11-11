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

# 2. Ligne PATH ajoutée par install.sh : on retire UNIQUEMENT le commentaire repère
#    et la ligne export exacte qui le suit (rien d'autre n'est touché).
LINE='export PATH="$HOME/.local/bin:$PATH"'
for RC in "$HOME/.zshrc" "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.bash_login" "$HOME/.profile"; do
  if [ -f "$RC" ] && grep -qF "$MARKER" "$RC"; then
    TMP="$(mktemp)"
    trap 'rm -f "$TMP"' EXIT
    awk -v m="$MARKER" -v l="$LINE" '
      { lines[NR] = $0 }
      END {
        for (i = 1; i <= NR; i++) {
          if (lines[i] == m && lines[i + 1] == l) {
            skip[i] = 1; skip[i + 1] = 1
            if (i > 1 && lines[i - 1] == "") skip[i - 1] = 1
          }
        }
        for (i = 1; i <= NR; i++) if (!skip[i]) print lines[i]
      }' "$RC" > "$TMP"
    if cmp -s "$TMP" "$RC"; then
      echo "⚠ Repère trouvé dans $RC mais la ligne qui suit a été modifiée : fichier laissé tel quel."
    else
      cp "$RC" "$RC.labomi-backup"       # sauvegarde au cas où
      cat "$TMP" > "$RC"                 # « cat > » garde le fichier (et un éventuel lien) intact
      rm -f "$RC.labomi-backup"
      echo "✓ Ligne PATH retirée de $RC"
    fi
    rm -f "$TMP"
  fi
done

echo
echo "Désinstallation terminée. Pour tout supprimer : rm -rf \"$DIR\""
