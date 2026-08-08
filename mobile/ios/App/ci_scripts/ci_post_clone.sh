#!/bin/zsh
# Xcode Cloud: kører automatisk efter repoet er hentet.
# Capacitor-projekt kræver: Node → web-build → cap sync.
# 'cap sync' genererer capacitor.config.json, config.xml og public/ (som er
# gitignored og derfor mangler i skyen) OG kører pod install (xcconfig-filer).
set -e
set -x

echo "▸ Installerer Node…"
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

echo "▸ Sikrer CocoaPods…"
command -v pod >/dev/null 2>&1 || brew install cocoapods

echo "▸ Bygger web-appen (app/ → mobile/www med prod-backend-URL bagt ind)…"
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile"
npm ci
npm run build

echo "▸ Capacitor sync (capacitor.config.json + config.xml + public/ + pods)…"
npx cap sync ios

echo "▸ ci_post_clone færdig."
