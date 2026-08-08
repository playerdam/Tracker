#!/bin/zsh
# Xcode Cloud: kører automatisk efter repoet er hentet.
# Capacitor-projekt kræver: Node → web-build → pod install (genererer de
# xcconfig-filer som ellers mangler i skyen, fordi Pods/ ikke er i git).
set -e
set -x

echo "▸ Installerer Node…"
export HOMEBREW_NO_AUTO_UPDATE=1
brew install node

echo "▸ Bygger web-appen (app/ → mobile/www med prod-backend-URL bagt ind)…"
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile"
npm ci
npm run build

echo "▸ Installerer CocoaPods-afhængigheder…"
cd "$CI_PRIMARY_REPOSITORY_PATH/mobile/ios/App"
command -v pod >/dev/null 2>&1 || brew install cocoapods
pod install

echo "▸ ci_post_clone færdig."
