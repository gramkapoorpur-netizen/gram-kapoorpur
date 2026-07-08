# Kapoorpur Social

This site is now a social networking app for Gram Kapoorpur.

Live URL:
`https://gramkapoorpur-netizen.github.io/gram-kapoorpur/`

Direct app URL:
`https://gramkapoorpur-netizen.github.io/gram-kapoorpur/social.html`

## Features

- Login and register
- Forgot password with Recovery PIN
- Hindi default with English language switch
- Feed posts
- Like, comment, and share
- Friend requests
- Members search
- Private-style messages
- Notifications
- Profile editing
- Entertainment / fun prompts
- Admin panel for removing users, posts, comments, messages, sessions, and friend links

## Shared Backend

GitHub Pages cannot store shared user accounts by itself. To make every villager see the same accounts, posts, comments, friends, and messages:

1. Create a Google Sheet.
2. Open `Extensions > Apps Script`.
3. Paste `google-apps-script.gs`.
4. Deploy it as a Web App with access set to `Anyone`.
5. Copy the Web App URL into `config.js`:

```js
formEndpoint: "YOUR_APPS_SCRIPT_WEB_APP_URL",
socialEndpoint: "YOUR_APPS_SCRIPT_WEB_APP_URL",
```

6. Upload the changed `config.js` to GitHub Pages.

Passwords are stored as hashes, not plain text. This is suitable for a simple village community site, not high-security banking-style authentication.

## Admin Panel

Admin page:
`/admin.html`

In Apps Script, set a Script Property named `ADMIN_TOKEN`, then use the same token in the admin panel.

Keep these sheets private:

- `users`
- `sessions`
- `socialPosts`
- `socialComments`
- `socialReactions`
- `socialFriends`
- `socialMessages`

Do not publish those sheets as public CSV files.
