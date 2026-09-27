# GuidfromM Fashion — GitHub Pages

This is a static, GitHub-Pages-ready version of the GuidfromM Fashion Desk.

## Files
- `index.html` — page structure/content
- `styles.css` — luxury editorial design
- `app.js` — live fashion feed + filters + mobile menu

## Publish
1. Create a GitHub repository (for example `guidfromm-fashion`).
2. Upload these three files to the repository root.
3. Commit to `main`.
4. GitHub → Settings → Pages → Deploy from branch → `main` / `/root`.
5. Open the generated Pages URL.

## Live news
The page reads Google News RSS search feeds for Vogue/Vogue Business, WWD and Hypebeast through a public CORS proxy, then displays short attributed headlines with a link to the original article.

Important: external feeds/proxies can change or rate-limit. If a feed is unavailable, the page automatically shows attributed fallback links instead of breaking.

## Editing
The quickest place to change the editorial content is the `ORIGINALS` section in `index.html`.
The live-feed sources are at the top of `app.js`.

## Recommended next production step
For a more robust publication, move the RSS fetching to a server-side scheduled job/API so the browser does not depend on a public CORS proxy. The visual site can stay exactly the same.
