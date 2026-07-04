# Localhost Router

This project returns a static HTML file from Vercel for every path and renders the same path on `http://localhost:5173` inside a full-page iframe.

Example:

```txt
https://localhost-router.vercel.app/cart?x=1
```

renders this iframe URL:

```txt
http://localhost:5173/cart?x=1
```

This is not a server-side proxy. It only works for a browser running on the same machine where the target app is available at `localhost:5173`.

## Deploy to Vercel

Connect this repository to Vercel and set the production branch to `release`.

No environment variables are required.

After deployment, every path on the Vercel URL renders the same path on `localhost:5173` in a full-page iframe.

## Local Target

Keep your actual app running locally on port `5173`.
