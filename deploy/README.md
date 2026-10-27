# Deploy under /crm/

Use Node.js 24 LTS. From the repository, install dependencies and build the frontend:

```sh
npm ci
npm run build:crm
APP_BASE_HREF=/crm/ PORT=3100 HOST=127.0.0.1 pm2 start server/index.cjs --name nikhand-crm --update-env
pm2 save
```

`APP_BASE_HREF` must match the Angular build's base href. For a root deployment, use `npm run build` and leave `APP_BASE_HREF` unset. The backend still receives root paths such as `/api/login`; Nginx strips `/crm/` via the trailing slash on `proxy_pass`.

Copy the locations in `nginx/nikhand-crm.conf` into the **existing** port 80 server block for the target host. Preserve its existing `location /` and port 3000 configuration. Do not include this file as a standalone server block. Check and reload safely:

```sh
sudo nginx -t && sudo systemctl reload nginx
curl -I http://127.0.0.1:3100/
curl -I http://20.244.43.224/crm/
curl -I http://20.244.43.224/crm/main-EXAMPLE.js
```

Use the actual generated JavaScript filename from `dist/crm/browser/index.html` for the last check. In a browser, test `/crm/`, a bookmarked hash route such as `/crm/#/leads`, login, logout, voice upload and playback, and the existing `/` application. Session cookies use path `/crm/` in this mode. For HTTPS, terminate TLS at Nginx and retain `X-Forwarded-Proto $scheme`; Express trusts proxy headers only from loopback and marks the cookie Secure on HTTPS.
