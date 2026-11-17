const env = import.meta.env

export const config = {
  sblUrl:
    env.VITE_FS_SBL_URL ||
    'https://sbl.onfastspring.com/sbl/1.0.10/fastspring-builder.min.js',
  embeddedStorefront: env.VITE_FS_EMBEDDED_STOREFRONT || 'tariqh.test.onfastspring.com/embedded-react',
  popupStorefront: env.VITE_FS_POPUP_STOREFRONT || '',
  componentsCheckoutUrl: env.VITE_FS_COMPONENTS_CHECKOUT_URL || '',
  products: (env.VITE_FS_PRODUCTS || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
}
