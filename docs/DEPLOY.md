# Deployment Guide — noisytrains.org

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account (free tier is fine)
- Domain `noisytrains.org` already on Cloudflare

## 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

## 2. Create the D1 Database

```bash
cd backend
npx wrangler d1 create railnoise-db
```

Copy the `database_id` from the output into `backend/wrangler.toml`.

## 3. Run the Schema

```bash
npx wrangler d1 execute railnoise-db --file=schema.sql
```

## 4. Set Secrets

```bash
npx wrangler secret put ADMIN_PASSWORD
# Enter a strong password — used for /admin.html

npx wrangler secret put CONFIRM_SECRET
# Enter a random string — used for token signing
```

## 5. Deploy the Worker

```bash
cd backend
npx wrangler deploy
```

The Worker will be available at `railnoise-api.<your-subdomain>.workers.dev`.

## 6. Set Up Custom Domain Routing

In the Cloudflare dashboard for `noisytrains.org`:

1. **Workers Routes**: Add a route `noisytrains.org/api/*` → `railnoise-api`
2. **Pages**: Create a Cloudflare Pages project pointing to the `site/` directory
   - Or simply upload the `site/` folder via the Pages dashboard

Alternatively, deploy everything as a single Worker with static asset serving using `wrangler pages`.

## 7. Email Setup (MailChannels)

The Worker uses MailChannels (free for Cloudflare Workers) to send confirmation emails from `campaign@noisytrains.org`.

Add this DNS record to `noisytrains.org`:
```
TXT  _mailchannels  v=mc1 cfid=railnoise-api
```

And an SPF record if not already present:
```
TXT  @  v=spf1 include:_spf.mx.cloudflare.net include:relay.mailchannels.net ~all
```

## 8. Cleanup Cron (Optional)

To auto-delete unconfirmed signups after 30 days, add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 3 * * *"]
```

And add a `scheduled` handler in the Worker (see worker.js comments).

## File Structure

```
site/           Static HTML/CSS/JS — deployed to Cloudflare Pages
  index.html    Home page with live signature counter
  sign.html     Petition form
  thank-you.html  Post-signature share page
  about.html    About + FAQ
  updates.html  Campaign news
  privacy.html  Privacy policy (GDPR)
  contact.html  Contact info
  admin.html    Password-protected admin panel
  css/style.css Styles

backend/        Cloudflare Worker + D1
  wrangler.toml Configuration
  schema.sql    Database schema
  src/worker.js API endpoints
```
