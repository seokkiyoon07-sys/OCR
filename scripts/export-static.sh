#!/bin/bash
# Static export script for Next.js 16 (Turbopack)
# Creates out/ directory with static HTML files for nginx serving

set -euo pipefail

# scripts/ 폴더 안에 있으니, 한 단계 위가 repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "📦 Preparing static export..."
echo "📍 Working directory: $(pwd)"

# Clean and create out directory
rm -rf out
mkdir -p out

# Copy HTML files from server/app to out
shopt -s nullglob
for html_file in .next/server/app/*.html; do
    filename="$(basename "$html_file")"
    if [[ "$filename" == "_not-found.html" ]]; then
        cp "$html_file" "out/404.html"
    elif [[ "$filename" == "_global-error.html" ]]; then
        cp "$html_file" "out/500.html"
    else
        cp "$html_file" "out/$filename"
    fi
done
shopt -u nullglob

# Copy static assets (_next/static)
mkdir -p out/_next
cp -r .next/static out/_next/

# Copy favicon, robots.txt, sitemap.xml
cp .next/server/app/favicon.ico.body out/favicon.ico 2>/dev/null || true
cp .next/server/app/robots.txt.body out/robots.txt 2>/dev/null || true
cp .next/server/app/sitemap.xml.body out/sitemap.xml 2>/dev/null || true

# Copy public files if they exist
if [[ -d "public" ]]; then
    cp -r public/* out/ 2>/dev/null || true
fi

echo "✅ Static export completed!"
echo ""
echo "📁 Output directory: $(pwd)/out"
ls -la out/
