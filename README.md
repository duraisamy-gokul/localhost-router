# Vercel Localhost Router

This project forwards every HTTP request that reaches Vercel to the URL in `UPSTREAM_URL`.

Important: a deployed Vercel project cannot reach your laptop at `localhost:3000`. On Vercel, `localhost` means the Vercel runtime itself. To send traffic to an app running on your machine, expose that app with a public tunnel and set `UPSTREAM_URL` to the tunnel URL.

## Local test

Run your real app on port `3000`, then run this project with Vercel:

```sh
cp .env.example .env
vercel dev
```

Requests to the Vercel dev URL will be forwarded to `http://127.0.0.1:3000`.

## Deploy to Vercel

1. Start your real app locally on port `3000`.
2. Create a public tunnel to it:

```sh
ngrok http 3000
```

or:

```sh
cloudflared tunnel --url http://127.0.0.1:3000
```

3. In Vercel, set:

```sh
UPSTREAM_URL=https://your-public-tunnel-url.example
```

4. Deploy this project to Vercel.

## Notes

- HTTP methods, request bodies, response headers, and paths are proxied.
- WebSockets are not supported by Vercel serverless functions.
- Long-running requests are limited by Vercel function timeouts and `PROXY_TIMEOUT_MS`.
