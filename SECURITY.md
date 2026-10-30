# Security notes

This repository is a static HTML/CSS/JavaScript storefront. Browser-side controls cannot provide private admin access, protect client-side data from the site visitor, or securely process orders and payments. The `admin.html` dashboard is a prototype with sample data, not a secured administration system.

## Current browser hardening

- Pages include a restrictive Content Security Policy meta tag. It allows only same-origin scripts, the current Google Fonts stylesheet/font hosts, local images, and the site's embedded decorative data image. Browser-to-server connections are disabled until an API is deliberately configured.
- The policy blocks plugin/object content, restricts form submissions and base URLs, upgrades insecure subresources, and the pages set a strict referrer policy.
- Inline event handlers and inline style attributes are avoided so the policy can block inline scripts and styles.
- These HTML policies are defense-in-depth only. In particular, meta CSP cannot set `frame-ancestors`; it must be delivered as an HTTP response header.

## Required before public production use

Configure these as **HTTP response headers** in the production hosting/CDN, adjusting permitted hosts to the actual deployment:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Only send HSTS after HTTPS is enabled and all covered subdomains support HTTPS. If a separate API is deployed, explicitly add its exact HTTPS origin to `connect-src`; do not use a wildcard.

Before enabling admin, customer accounts, coupons, inventory updates, orders, newsletter subscriptions, or payment flows:

1. Deploy a maintained backend with server-side authentication, role-based authorization, input validation, rate limiting, secure sessions, and audit logs. Protect every administrative API route; hiding a page or adding `noindex` is not access control.
2. Store provider credentials only in the backend's secret manager. Verify signed payment webhooks server-side, validate transaction amount/currency/order, and process provider events idempotently. Never trust a browser success screen or user-submitted payment reference as proof of payment.
3. Use a database with atomic inventory reservation, transaction-safe order creation, backups, and appropriate access controls. Validate coupons and all prices on the server.
4. Collect newsletter consent and submit subscriptions through the backend. Define retention, unsubscribe, and privacy handling before storing customer information.
5. Test the production deployment's HTTPS, headers, authentication boundaries, webhook verification, backups, and incident-response process. Reassess whenever API or third-party origins change.

No set of client-side changes can guarantee that nobody will hack or bypass a website. Security depends on the deployed host, backend, provider configuration, operational practices, and ongoing updates.
