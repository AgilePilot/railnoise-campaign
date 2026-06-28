# Editing the Site with Visual Studio Code

## 1. Install VS Code

Download from https://code.visualstudio.com/ and install it.

## 2. Open the Project

1. Open VS Code
2. Click **File → Open Folder**
3. Navigate to `D:\Railnoise-campaign\railnoise-campaign\site`
4. Click **Select Folder**

You'll see all the site files in the left sidebar (Explorer panel).

## 3. Install Live Preview Extension

This lets you see your changes in real-time without deploying.

1. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for **Live Preview**
3. Install the one by **Microsoft**
4. Restart VS Code if prompted

## 4. Preview Your Site Locally

1. Right-click on `index.html` in the Explorer panel
2. Click **Show Preview** (or **Open with Live Server**)
3. A browser preview opens inside VS Code (or in your default browser)
4. Any changes you save will update the preview instantly

## 5. Editing Content

### Change text on any page

1. Open the HTML file (e.g. `index.html`) by clicking it in the sidebar
2. Find the text you want to change — it's between HTML tags like:
   ```html
   <h1>Stop the Train Wheel-Squeal in Chiswick W4</h1>
   <p>An ear-splitting screech tears through our neighbourhood...</p>
   ```
3. Edit the text between the `>` and `<` characters
4. Press `Ctrl+S` to save
5. The preview updates automatically

### Add a campaign update

1. Open `updates.html`
2. Find the existing update card that starts with `<div class="update-card">`
3. Copy the whole block and paste it above the existing one:
   ```html
   <div class="update-card">
     <div class="update-date">28 June 2026</div>
     <h3>Your Update Title Here</h3>
     <p>Your update text goes here.</p>
   </div>
   ```
4. Edit the date, title, and text
5. Save with `Ctrl+S`

### Add a new FAQ item

1. Open `about.html`
2. Find an existing `<details>` block
3. Copy and paste it, then edit:
   ```html
   <details>
     <summary>Your question here?</summary>
     <p>Your answer here.</p>
   </details>
   ```
4. Save with `Ctrl+S`

## 6. Editing Design / Styles

All styling is in `css/style.css`.

### Change colours

Search for `:root` near the top of the file. You'll see:

```css
--color-primary: #1a5632;      /* Dark green — header, buttons */
--color-accent: #e63946;       /* Red — sign button, errors */
--color-bg: #fafaf8;           /* Page background */
--color-surface: #ffffff;      /* Card/form background */
--color-text: #1a1a1a;         /* Main text */
```

Change the hex colour codes (`#1a5632` etc.) to your preferred colours. Use https://htmlcolorcodes.com/ to pick colours.

### Change font sizes

Search for `font-size` in style.css. Key ones:

- Hero heading: search for `.hero h1` → change `clamp(1.75rem, 5vw, 2.75rem)`
- Body text: search for `html` → change `font-size: 16px`
- Button text: search for `.btn` → change `font-size: 1rem`

### Change spacing / padding

Look for `padding` and `margin` values near the section you want to adjust:

- `padding: 3rem 1rem` means 3rem top/bottom, 1rem left/right
- `margin-bottom: 1rem` means space below an element
- `1rem` = 16px at default font size

## 7. Useful Tips

### Finding text quickly

Press `Ctrl+Shift+F` to search across all files. Type the text you're looking for and VS Code shows every file that contains it.

### Finding text in one file

Press `Ctrl+F` while a file is open to search within it.

### Undo a mistake

Press `Ctrl+Z` to undo. You can undo multiple times.

### Format messy HTML

Press `Shift+Alt+F` to auto-format the current file (fixes indentation).

## 8. Deploy Your Changes

Once you're happy with your edits:

1. Open the **Terminal** in VS Code: click **Terminal → New Terminal** (or press `` Ctrl+` ``)
2. Make sure you're in the `site` folder. If not, type:
   ```
   cd D:\Railnoise-campaign\railnoise-campaign\site
   ```
3. Run:
   ```
   npx wrangler pages deploy . --project-name railnoise-site --commit-dirty=true
   ```
4. Wait ~10 seconds for the success message
5. Visit https://noisytrains.org to verify

## Quick Reference

| Task | How |
|---|---|
| Open project | File → Open Folder → `site` |
| Preview locally | Right-click `index.html` → Show Preview |
| Search all files | `Ctrl+Shift+F` |
| Search current file | `Ctrl+F` |
| Save | `Ctrl+S` |
| Undo | `Ctrl+Z` |
| Format/indent | `Shift+Alt+F` |
| Open terminal | `` Ctrl+` `` |
| Deploy | `npx wrangler pages deploy . --project-name railnoise-site --commit-dirty=true` |
