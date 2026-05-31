import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const slugs = [
  "vip",
  "card",
  "live",
  "month",
  "season",
  "year",
  "trial",
  "download",
  "support",
  "order",
];

function html(slug, depth) {
  const assetPrefix = depth === 0 ? "assets" : "../assets";
  const cfg = depth === 0 ? "config.js" : "../config.js";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>VIP Access · Key Lounge</title>
  <link rel="stylesheet" href="${assetPrefix}/landing.css" />
  <script src="${cfg}"></script>
</head>
<body data-slug="${slug}">
  <div class="page">
    <div class="promo-bar" id="promo-bar" aria-hidden="true"></div>
    <div class="page-body">
      <div class="card">
        <div class="card-top">
          <span id="badge" class="badge">18+</span>
          <span id="limited" class="limited">Limited time</span>
        </div>
        <h1 id="title">Loading…</h1>
        <div class="promo-callout" id="promo-callout"></div>
        <p id="subtitle" class="sub">One moment</p>
        <ul class="benefits" id="benefits"></ul>
        <a id="cta" class="cta" href="#">Claim Now →</a>
        <p id="trust" class="trust"></p>
        <p id="timer" class="timer" hidden></p>
        <p id="fine" class="fine"></p>
      </div>
    </div>
  </div>
  <script src="${assetPrefix}/landing.js"></script>
</body>
</html>
`;
}

fs.writeFileSync(path.join(root, "index.html"), html("vip", 0));
for (const slug of slugs) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html(slug, 1));
}

console.log(`Generated ${slugs.length + 1} landing pages in ${root}`);
