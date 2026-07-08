# Gram Kapoorpur Website

This is a lightweight static website for `ग्राम कपूरपुर / Gram Kapoorpur`.

Live URL after GitHub Pages is enabled:
`https://gramkapoorpur-netizen.github.io/gram-kapoorpur/`

## What is included

- Hindi is the default language, with an English switch.
- No framework, no build step, and no login system.
- Notices, events, contacts, and gallery load from CSV files.
- The CSV files can be replaced with published Google Sheet CSV links.
- Contact form can save messages into Google Sheets through Apps Script.
- AdSense placeholders are ready, but disabled until you add your publisher ID.

## Google Sheet Database Setup

1. Create a Google Sheet with these tabs: `notices`, `events`, `directory`, `gallery`, `Messages`.
2. Copy the headers from the files in the `data` folder into the matching Sheet tabs.
3. In Google Sheets, go to `File > Share > Publish to web`.
4. Publish each tab as `Comma-separated values (.csv)`.
5. Copy each published CSV URL into `config.js` under `sheetSources`.

Example:

```js
sheetSources: {
  notices: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv",
  events: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=111&single=true&output=csv",
  directory: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=222&single=true&output=csv",
  gallery: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=333&single=true&output=csv"
}
```

## Contact Form to Google Sheets

1. Open the same Google Sheet.
2. Go to `Extensions > Apps Script`.
3. Paste the code from `google-apps-script.gs`.
4. Deploy as a Web App.
5. Set access to `Anyone`.
6. Copy the Web App URL into `config.js` as `formEndpoint`.

## Admin Panel

The admin panel is available at `/admin.html`. It is not linked from the public navigation and has `noindex`, but it must still be protected by the Apps Script token.

1. In Apps Script, open `Project Settings`.
2. Add a Script Property named `ADMIN_TOKEN`.
3. Use a long private value, for example a random password of 24+ characters.
4. Open `/admin.html`.
5. Paste the Apps Script Web App URL and the private admin token.

Admin can list, add, edit, hide, and delete rows in `notices`, `events`, `directory`, `gallery`, and `users`. Messages are read-only. Keep the `users` sheet private; do not publish it as a public CSV.

## AdSense Setup

After Google AdSense gives you a publisher ID and ad slot IDs, update `config.js`:

```js
adsenseClient: "ca-pub-0000000000000000",
adSlots: {
  top: "1111111111",
  middle: "2222222222",
  bottom: "3333333333"
}
```

Then update `ads.txt` with the real publisher ID.

## GitHub Pages

Upload all files in this folder to a GitHub repository. In the repository settings, enable GitHub Pages from the main branch.

Do not paste a GitHub token into chat. Use GitHub login, GitHub CLI, or a local environment variable when publishing.
