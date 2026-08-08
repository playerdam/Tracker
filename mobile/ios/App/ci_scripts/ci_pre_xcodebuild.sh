#!/bin/zsh
# Xcode Cloud: kører lige før 'xcodebuild'.
# Sætter et unikt, altid-stigende build-nummer. Xcode Clouds CI_BUILD_NUMBER
# tæller op ved hver sky-build; +1000 sikrer det aldrig kolliderer med de
# manuelle builds (1–5) eller lokale builds. Cloud-builds bliver 1001, 1002, …
set -e

BUILD_NUM=$((CI_BUILD_NUMBER + 1000))
echo "▸ Sætter build-nummer til $BUILD_NUM"
sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = $BUILD_NUM;/g" \
  "$CI_PRIMARY_REPOSITORY_PATH/mobile/ios/App/App.xcodeproj/project.pbxproj"
