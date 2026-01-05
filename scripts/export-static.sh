#!/bin/bash
# Static export script for Next.js 16 (Turbopack)
# Creates out/ directory with static HTML files for nginx serving

set -e
cd /opt/omr/frontend

echo "📦 Preparing static export..."

# Clean and create out directory
rm -rf out
mkdir -p out

# Copy HTML files from server/app to out
for html_file in .next/server/app/*.html; do
    if [[ -f "$html_file" ]]; then
        filename=$(basename "$html_file")
        # index.html stays as index.html, others keep their names
        if [[ "$filename" == "_not-found.html" ]]; then
            cp "$html_file" "out/404.html"
        elif [[ "$filename" == "_global-error.html" ]]; then
            cp "$html_file" "out/500.html"
        else
            cp "$html_file" "out/$filename"
        fi
    fi
done

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
echo "📁 Output directory: /opt/omr/frontend/out"
ls -la out/
