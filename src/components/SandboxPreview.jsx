import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import WebsiteRenderer from './WebsiteRenderer'

const FRAME_DOCUMENT = `<!doctype html>
<html lang="id">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body><div id="preview-root"></div></body>
</html>`

/**
 * Renders the generated website in an isolated document.  Keeping the preview
 * in an iframe prevents template styles from leaking into the editor, while a
 * React portal preserves instant updates from the chat state.
 */
export default function SandboxPreview({ templateId, data, theme, viewport, isGenerating = false, className = '' }) {
  const frameRef = useRef(null)
  const [frameRoot, setFrameRoot] = useState(null)

  const handleLoad = () => {
    const frameDocument = frameRef.current?.contentDocument
    if (!frameDocument) return

    // Vite injects the app stylesheet in the parent document. Clone it once so
    // the templates have the same design tokens inside the sandbox.
    if (!frameDocument.head.querySelector('[data-preview-styles]')) {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
      styles.forEach((style) => {
        const clone = style.cloneNode(true)
        clone.setAttribute('data-preview-styles', '')
        frameDocument.head.appendChild(clone)
      })
    }

    setFrameRoot(frameDocument.getElementById('preview-root'))
  }

  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'umkm-preview-updated', templateId },
      '*',
    )
  }, [data, templateId, theme, viewport])

  return (
    <iframe
      ref={frameRef}
      title="Live preview website UMKM"
      srcDoc={FRAME_DOCUMENT}
      // allow-popups-to-escape-sandbox: without it, a target="_blank" link
      // clicked inside this sandbox (e.g. the WA CTA's wa.me link, which
      // redirects to api.whatsapp.com) opens a popup that inherits this
      // iframe's sandbox restrictions instead of behaving like a normal new
      // tab — Chrome then refuses to load the redirect target at all
      // (ERR_BLOCKED_BY_RESPONSE).
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      onLoad={handleLoad}
      className={`block w-full h-full border-0 bg-white ${className}`}
    >
      Preview website tidak dapat dimuat pada browser ini.
      {frameRoot && createPortal(
        <WebsiteRenderer
          templateId={templateId}
          data={data}
          theme={theme}
          viewport={viewport}
          isGenerating={isGenerating}
        />,
        frameRoot,
      )}
    </iframe>
  )
}
