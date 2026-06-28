# Editing & Deploying the Site

## Editing the Site

All site files are in `D:\Railnoise-campaign\railnoise-campaign\site\`.

### Key files

| File | What it is |
|---|---|
| `index.html` | Home page |
| `sign.html` | Petition form |
| `thank-you.html` | Thank-you page with share buttons |
| `about.html` | About / FAQ |
| `updates.html` | Campaign news |
| `privacy.html` | Privacy policy |
| `contact.html` | Contact page |
| `admin.html` | Admin panel (password-protected) |
| `css/style.css` | All styles |

### Recommended editor

**Visual Studio Code** (free) — https://code.visualstudio.com/

Install the **Live Preview** extension to see changes in real-time as you edit.

## Deploying Changes

After editing any file in `site\`:

1. Open **Command Prompt** or **PowerShell**

2. Navigate to the site folder:
   ```
   cd D:\Railnoise-campaign\railnoise-campaign\site
   ```

3. Deploy:
   ```
   npx wrangler pages deploy . --project-name railnoise-site --commit-dirty=true
   ```

4. Wait ~10 seconds. You'll see a success message with a preview URL.

5. Visit https://noisytrains.org to verify. Changes are live immediately.

## Notes

- You must have Node.js installed for `npx` to work.
- If you get "wrangler not recognized", use `npx wrangler` instead of `wrangler`.
- If your Cloudflare login has expired, run `npx wrangler login` first.
- The admin panel is at https://noisytrains.org/admin.html — use the password you set with `wrangler pages secret put ADMIN_PASSWORD`.
