#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 Fixing Next.js dev environment..."

# Kill any Next.js dev servers on ports 3000-3010
for port in {3000..3010}; do
  pid=$(lsof -ti tcp:$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "🔴 Killing process on port $port (PID: $pid)"
    kill $pid 2>/dev/null || true
    sleep 1
    if kill -0 $pid 2>/dev/null; then
      kill -9 $pid 2>/dev/null || true
    fi
  fi
done

# Remove Next.js locks and cache
[ -f ".next/dev/lock" ] && echo "🗑️  Removing .next/dev/lock" && rm -f .next/dev/lock
[ -d ".next" ] && echo "🗑️  Removing .next" && rm -rf .next

# Ensure App Router structure exists
mkdir -p app

if [ ! -f "app/layout.tsx" ]; then
  echo "📝 Creating app/layout.tsx"
  cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Bayern",
  description: "Actualité FC Bayern Munich",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
EOF
fi

if [ ! -f "app/page.tsx" ]; then
  echo "📝 Creating app/page.tsx"
  cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>MBF — ça marche ✅</h1>
      <p style={{ fontSize: "1.25rem", marginTop: "1rem", color: "#666" }}>
        Media Bayern Frontend is running
      </p>
    </main>
  );
}
EOF
fi

# Make sure globals.css exists (otherwise Next will error)
if [ ! -f "app/globals.css" ]; then
  echo "🧩 Creating app/globals.css"
  mkdir -p app
  cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { color-scheme: light dark; }
html,body { margin:0; }
EOF
fi

# Find first free port between 3000-3010
PORT=3000
for p in {3000..3010}; do
  if ! lsof -ti tcp:$p >/dev/null 2>&1; then PORT=$p; break; fi
done

echo "✅ Starting Next.js on port $PORT..."
echo "🌐 Open: http://localhost:$PORT"
npm run dev -- -p $PORT
