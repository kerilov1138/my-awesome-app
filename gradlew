#!/usr/bin/env sh
if command -v gradle >/dev/null 2>&1; then
  gradle "$@"
else
  echo "Gradle not found."
  exit 1
fi