#!/bin/sh
set -e
npx prisma generate
npx prisma migrate deploy 2>/dev/null || true
exec npm run dev
