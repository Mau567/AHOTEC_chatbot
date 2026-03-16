# Embed the AHOTEC Chat on Any Website

The chat widget can be added to **any webpage** as a floating widget. It runs in an iframe and talks to your AHOTEC app’s API.

## 1. Deploy your AHOTEC app

Your app must be deployed and reachable at a public URL, e.g.:

- `https://ahotec-chatbot.vercel.app`
- `https://chat.ahotec.com`

Use that URL as **YOUR_DOMAIN** below.

## 2. Add the chat to a website

### Option A: Script tag (recommended)

Add this before `</body>` on the page where you want the chat:

```html
<script src="https://YOUR_DOMAIN/embed.js" async></script>
```

Replace `YOUR_DOMAIN` with your app’s URL (no trailing slash), e.g.:

```html
<script src="https://ahotec-chatbot.vercel.app/embed.js" async></script>
```

The script will inject a floating iframe in the bottom-right corner.

### Option B: Iframe only

You can also embed the chat with a plain iframe:

```html
<iframe
  src="https://YOUR_DOMAIN/embed/chat"
  title="AHOTEC Chat"
  style="position: fixed; bottom: 20px; right: 20px; width: 380px; height: 520px; border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); z-index: 2147483647;"
></iframe>
```

Replace `YOUR_DOMAIN` with your app’s URL.

## 3. How it works

- The widget is loaded from **your** AHOTEC domain (`/embed/chat`).
- All API calls go to **your** domain (`/api/chat`), so no CORS setup is needed for the host site.
- The host site only loads your script or iframe; it does not need to expose any API.
- The chat appears as a floating bubble and panel on top of the existing page.

## 4. Requirements

- The AHOTEC app (this repo) must be deployed and publicly accessible.
- The host site must allow loading your domain (no strict CSP that blocks your origin).
- For **Option A**, the host site must allow loading the script from your domain.

## 5. Customization (optional)

To change size or position when using the script, you can host a copy of `public/embed.js` and edit the `iframe.style.cssText` values (width, height, bottom, right, etc.).
