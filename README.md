# FastSpring React Checkouts

Vite + React Router reference app with each FastSpring checkout on its own page.

| Route | Checkout | How it loads |
|---|---|---|
| `/components` | Checkout Components | `@fastspring/checkout-sdk` + server created session |
| `/embedded` | Embedded checkout | Store Builder Library, `embedded-react` storefront |
| `/popup` | Popup checkout | Store Builder Library, `popup-react` storefront |
| `/complete` | Thank you page | Shared by all three |

## Setup

```bash
npm install
cp .env.example .env   # then fill in products and API creds
npm run dev            # web on :3000, session API on :4000
```

## FastSpring app config

1. **Products**: set `VITE_FS_PRODUCTS` to real product paths from the store.
2. **Embedded storefront**: add `http://localhost:3000` to the embedded storefront's allowed domains (Checkouts > Embedded Checkouts > Settings). Embedded will not render on a non whitelisted domain.
3. **Component Checkout**: Checkout Components is beta and has to be enabled on the store.
   * Implementation tab > add `http://localhost:3000` to allowed domains, otherwise you get a `frame-ancestors` error.
   * Set `FS_CHECKOUT_PATH` to `store-id/checkout-id` as shown on the Implementation tab.
4. **API credentials**: only needed for authenticated session fields (orderTags, hiding payment methods, custom pricing). Keep them in `.env`, never in a `VITE_` var.

## How it works

**SBL pages** use `src/lib/useStoreBuilder.js`. SBL reads its config from script data attributes and is a singleton on `window.fastspring`, so each page injects its own `#fsc-api` script with its storefront and removes it on unmount. Callbacks (`data-data-callback`, `data-error-callback`, `data-popup-closed`, `data-popup-webhook-received`) are wired to React through globals.

* Embedded: `builder.reset()` then `builder.push({ products })`. SBL renders into `#fsc-embedded-checkout-container`.
* Popup: `builder.push({ products, checkout: true })` on Buy. Prices come from the data callback.

**Checkout Components** (`src/pages/ComponentsCheckout.jsx`):

1. `FastSpring.init({ checkoutUrl, callbacks })`
2. Mounts `fs-email`, `fs-apple-pay`, `fs-google-pay`, `fs-paypal`, `fs-card`, `fs-billing-postal-code`, `fs-coupon`, `fs-pay-button`, `fs-disclosures`. Wallets render nothing when not available.
3. `POST /api/session` → server calls `POST https://api.fastspring.com/v2/checkouts/{FS_CHECKOUT_PATH}/sessions`
4. `sdk.checkout(sessionId)`
5. `sdk.components.destroyAll()` on unmount

Sessions are single use, so a new one is created on every page load. `debug: true` is on in dev only and shows FastSpring's built in success/failure dialogs.

## Notes

* StrictMode is off so dev does not double load SBL or burn two sessions.
* The thank you page is UX only. Fulfil from the `order.completed` webhook.
* Session request body uses `cart.lineItems[].productPath` and `quantity`, email goes in `customer.billToContact.email`.
