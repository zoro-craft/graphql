# syntax=docker/dockerfile:1.7

# Static site: nginx serves the HTML, CSS and JS as they are. The unprivileged
# variant already runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

WORKDIR /usr/share/nginx/html

COPY --chown=101:101 index.html ./index.html
COPY --chown=101:101 css ./css
COPY --chown=101:101 js ./js

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
