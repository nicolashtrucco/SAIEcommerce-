# Pinned to 22.23.2 (or later): 22.23.0 has a Node.js regression (CVE-2026-48931 fix
# side effect) that makes node-fetch@2 throw ERR_STREAM_PREMATURE_CLOSE on Google API
# calls (used internally by @google-cloud/storage via google-auth-library@9/gaxios@6).
FROM node:22.23.2-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY backend ./backend
COPY public/LogoBlancoNaranja.png ./public/LogoBlancoNaranja.png

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
