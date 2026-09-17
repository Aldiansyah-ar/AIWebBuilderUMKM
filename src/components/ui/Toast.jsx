/**
 * Toast — Notification UI Primitive (TSK-06B / Hari 7)
 *
 * Lightweight success/error toast stack, no external dependency.
 *
 * Usage:
 *   const [toasts, setToasts] = useState([])
 *   const showToast = (type, message) =>
 *     setToasts((prev) => [...prev, { id: Date.now(), type, message }])
 *   const dismissToast = (id) =>
 *     setToasts((prev) => prev.filter((t) => t.id !== id))
 *   <ToastContainer toasts={toasts} onDismiss={dismissToast} />
 */
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react'

const VARIANTS = {
  success: { icon: CheckCircle2, classes: 'bg-emerald-600 border-emerald-500' },
  error: { icon: XCircle, classes: 'bg-rose-600 border-rose-500' },
  // Degraded-but-usable states (AI fallback, partial failure) — distinct from
  // 'success' so a real failure never gets a green checkmark (issue #46).
  warning: { icon: AlertTriangle, classes: 'bg-amber-500 border-amber-400' },
}

function ToastItem({ id, type = 'success', message, onDismiss, duration = 3500 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => handleDismiss(), duration)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(id), 200)
  }

  const { icon: Icon, classes } = VARIANTS[type] || VARIANTS.success

  return (
    <div
      role="status"
      className={[
        'flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-lg border min-w-[220px] max-w-sm',
        'transition-all duration-200 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        classes,
      ].join(' ')}
    >
      <Icon className="w-4.5 h-4.5 shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={handleDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
