# Sai

This template should help get you started developing with Vue 3 in Vite.

## Full stack (Fastify + Postgres + Docker)

This project now includes:

- Frontend: Vue + Vite
- Backend: Fastify (`backend/src/server.js`)
- Database: PostgreSQL with init scripts in `db/init`
- Docker orchestration: `docker-compose.yml`

### 1) Environment variables

Use two env files:

- Root `.env` for Docker Compose + frontend (`VITE_*` variables).
- `backend/.env` for local backend execution and backend secrets.

Copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

Copy backend env example:

```sh
cp backend/.env.example backend/.env
```

### 2) Run with Docker

```sh
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- Health: `http://localhost:3000/health`

### 3) API endpoints

- `GET /api/categories`
- `GET /api/products?category=<slug|name>&search=<text>`
- `GET /api/products/:code`
- `GET /api/clients`

### 4) Admin panel

The admin panel is available at:

```txt
/admin
```

It manages:

- Categories
- Products
- Clients carousel logos

Image upload flow:

1. Frontend sends multipart form data to Fastify.
2. Backend validates file type and max size.
3. Backend uploads the image to Firebase Storage.
4. Firebase returns a public download URL.
5. Backend stores the URL in PostgreSQL.

Required Firebase environment variables:

```env
BACKEND_FIREBASE_PROJECT_ID=
BACKEND_FIREBASE_CLIENT_EMAIL=
BACKEND_FIREBASE_PRIVATE_KEY=
BACKEND_FIREBASE_STORAGE_BUCKET=
BACKEND_MAX_IMAGE_SIZE_MB=3
```

### 5) Local backend (without Docker)

Requires local Postgres running with matching env vars.

```sh
npm run dev:api
```

For local backend execution, configure:

```env
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sai
DB_USER=postgres
DB_PASSWORD=postgres
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=
MAX_IMAGE_SIZE_MB=3
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
