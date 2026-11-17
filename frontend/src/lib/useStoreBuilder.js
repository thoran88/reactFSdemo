import { useEffect, useRef, useState } from 'react'

// Loads the FastSpring Store Builder Library (SBL) for one storefront.
//
// SBL reads its config from data attributes on the script tag when it loads, and it
// lives on window.fastspring as a singleton. Popup and embedded use different
// storefronts, so each page injects its own script and tears it down on unmount.
// Callbacks are registered as globals because SBL looks them up by name.

const SCRIPT_ID = 'fsc-api'

const CALLBACK_ATTRS = {
  onData: ['data-data-callback', '__fsDataCallback'],
  onError: ['data-error-callback', '__fsErrorCallback'],
  onPopupClosed: ['data-popup-closed', '__fsPopupClosed'],
  onWebhookReceived: ['data-popup-webhook-received', '__fsPopupWebhookReceived'],
}

function teardown() {
  document.getElementById(SCRIPT_ID)?.remove()
  // Popup checkout iframe injected by SBL
  document.getElementById('fsc-popup-frame')?.remove()
  try {
    delete window.fastspring
  } catch {
    window.fastspring = undefined
  }
  Object.values(CALLBACK_ATTRS).forEach(([, name]) => {
    delete window[name]
  })
}

/**
 * @param {object} opts
 * @param {string} opts.src SBL script URL
 * @param {string} opts.storefront e.g. mystore.test.onfastspring.com/popup-mystore
 * @param {object} [opts.attrs] extra data-* attributes, e.g. { 'data-debug': 'true' }
 * @param {object} [opts.callbacks] onData, onError, onPopupClosed, onWebhookReceived
 */
export function useStoreBuilder({ src, storefront, attrs = {}, callbacks = {} }) {
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    if (!storefront) {
      setStatus('error')
      return
    }

    teardown()
    setStatus('loading')

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = src
    script.type = 'text/javascript'
    script.setAttribute('data-storefront', storefront)

    Object.entries(CALLBACK_ATTRS).forEach(([key, [attr, globalName]]) => {
      // Always proxy through the ref so the latest handler runs without reloading SBL
      window[globalName] = (...args) => callbacksRef.current[key]?.(...args)
      script.setAttribute(attr, globalName)
    })

    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v))

    script.onload = () => setStatus('ready')
    script.onerror = () => setStatus('error')

    document.body.appendChild(script)

    return teardown
    // attrs is intentionally serialised so a new object each render does not reload SBL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, storefront, JSON.stringify(attrs)])

  return {
    status,
    builder: status === 'ready' ? window.fastspring?.builder : undefined,
  }
}
