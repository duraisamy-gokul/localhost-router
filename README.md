# Localhost Router

This project returns a static HTML file from Vercel for every path and redirects the browser to the same path on `http://localhost:3000`.

Example:

```txt
https://localhost-router.vercel.app/cart?x=1
```

redirects the browser to:

```txt
http://localhost:3000/cart?x=1
```

This is not a server-side proxy. It only works for a browser running on the same machine where the target app is available at `localhost:3000`.

## Deploy to Vercel

Connect this repository to Vercel and set the production branch to `release`.

No environment variables are required.

After deployment, every path on the Vercel URL redirects to the same path on `localhost:3000`.

## Local Target

Keep your actual app running locally on port `3000`.
