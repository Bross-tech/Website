#!/bin/bash
set -e

TARGET="components/AdminDashboard.tsx"

echo "📂 Updating $TARGET ..."

cat > $TARGET <<'EOT'
# (the full extended AdminDashboard.tsx code I gave you earlier goes here)
EOT

echo "✅ AdminDashboard.tsx updated!"

# Git commit + push
echo "📦 Committing changes..."
git add $TARGET
git commit -m "Update AdminDashboard with extended features (users, approvals, announcements, file manager)"
git pull --rebase origin main
git push origin main

echo "🚀 Update pushed to GitHub!"
