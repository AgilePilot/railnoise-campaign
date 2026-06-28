# Chiswick W4 Rail Noise Campaign

Campaign website at [noisytrains.org](https://noisytrains.org) — a petition to demand Network Rail fix train wheel-squeal noise affecting residents near Chiswick W4.

## Structure

- **`site/`** — Static HTML/CSS/JS website (Cloudflare Pages)
- **`backend/`** — Cloudflare Worker + D1 database (petition API, admin, email)
- **`docs/`** — Deployment guide
- **`assets/`** — Leaflet designs, images, etc.

## Quick Start

See [docs/DEPLOY.md](docs/DEPLOY.md) for full setup instructions.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/count` | GET | Public signature count |
| `/api/sign` | POST | Submit a signature |
| `/api/confirm?token=…` | GET | Email confirmation (double opt-in) |
| `/api/delete?token=…` | GET | One-click data deletion |
| `/api/admin/signatures` | GET | List all signatures (Basic auth) |
| `/api/admin/export` | GET | CSV export of confirmed signatures (Basic auth) |

## Contact

AP Dasgupta — [chiswickw4railnoise@outlook.com](mailto:chiswickw4railnoise@outlook.com)
