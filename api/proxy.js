const http = require("http");
const https = require("https");

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

function getUpstreamUrl() {
  if (process.env.UPSTREAM_URL) {
    return process.env.UPSTREAM_URL;
  }

  return process.env.VERCEL ? null : "http://127.0.0.1:3000";
}

function getTargetUrl(req, upstreamUrl) {
  const incomingUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requestedPath = incomingUrl.searchParams.get("path") || "";
  incomingUrl.searchParams.delete("path");

  const targetUrl = new URL(upstreamUrl);
  const basePath = targetUrl.pathname.replace(/\/+$/, "");
  const cleanPath = requestedPath.replace(/^\/+/, "");
  targetUrl.pathname = `${basePath}/${cleanPath}`;

  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  return targetUrl;
}

function copyHeaders(headers) {
  const nextHeaders = { ...headers };

  for (const header of Object.keys(nextHeaders)) {
    if (HOP_BY_HOP_HEADERS.has(header``.toLowerCase())) {
      delete nextHeaders[header];
    }
  }

  return nextHeaders;
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

module.exports = function handler(req, res) {
  const upstreamUrl = getUpstreamUrl();

  if (!upstreamUrl) {
    sendJson(res, 502, {
      error: "UPSTREAM_URL is not configured",
      detail: "Set UPSTREAM_URL to a public URL, such as an ngrok or Cloudflare Tunnel URL."
    });
    return;
  }

  let targetUrl;

  try {
    targetUrl = getTargetUrl(req, upstreamUrl);
  } catch (error) {
    sendJson(res, 500, {
      error: "Invalid upstream URL",
      detail: error.message
    });
    return;
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    sendJson(res, 500, {
      error: "Unsupported upstream protocol",
      detail: "UPSTREAM_URL must start with http:// or https://."
    });
    return;
  }

  const requestHeaders = copyHeaders(req.headers);
  requestHeaders.host = targetUrl.host;
  requestHeaders["x-forwarded-host"] = req.headers.host || "";
  requestHeaders["x-forwarded-proto"] = req.headers["x-forwarded-proto"] || "https";

  const transport = targetUrl.protocol === "https:" ? https : http;
  const timeoutMs = Number(process.env.PROXY_TIMEOUT_MS || 30000);

  const proxyRequest = transport.request(
    targetUrl,
    {
      method: req.method,
      headers: requestHeaders,
      timeout: Number.isFinite(timeoutMs) ? timeoutMs : 30000
    },
    (proxyResponse) => {
      const responseHeaders = copyHeaders(proxyResponse.headers);
      res.writeHead(proxyResponse.statusCode || 502, responseHeaders);
      proxyResponse.pipe(res);
    }
  );

  proxyRequest.on("timeout", () => {
    proxyRequest.destroy(new Error("Upstream request timed out"));
  });

  proxyRequest.on("error", (error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    sendJson(res, 502, {
      error: "Proxy request failed",
      detail: error.message
    });
  });

  req.pipe(proxyRequest);
};
