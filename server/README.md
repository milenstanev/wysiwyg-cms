# CMS API Server

Node.js + MongoDB REST API for CMS content. Built with OOP best practices.

## Architecture

- **Models** – Mongoose schemas (Page, ContentBlock)
- **Repositories** – Data access layer (abstraction over Mongoose)
- **Services** – Business logic
- **Controllers** – HTTP request handling
- **Routes** – Express route definitions
- **DI** – Dependency injection via constructor

## API

- `GET /api/content` – List pages (id, slug, title)
- `GET /api/content/:slug` – Get full page
- `PUT /api/content/:slug` – Update page
- `GET /health` – Health check

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Docker

```bash
docker compose up -d
```
