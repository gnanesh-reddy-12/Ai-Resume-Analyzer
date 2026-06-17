import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const KOFI_URL = "https://ko-fi.com/gnanesh"

/* ── Inline button (used inside Results card) ── */
export default function KofiButton({ style }) {
  return (
    <motion.a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        background: "#FF5E5B",
        color: "#fff",
        padding: "12px 28px",
        borderRadius: 99,
        fontWeight: 700,
        fontSize: 15,
        textDecoration: "none",
        boxShadow: "0 6px 20px rgba(255,94,91,0.35)",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.2px",
        ...style
      }}
    >
      <KofiIcon />
      Support on Ko-fi
    </motion.a>
  )
}

/* ── Floating pill (global, fixed bottom-left) ── */
export function KofiFloating() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-xl)",
              padding: "18px 20px",
              boxShadow: "var(--shadow-lg)",
              maxWidth: 260,
            }}
          >
            <p style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: 6,
              letterSpacing: "-0.3px"
            }}>
              Did ResumeAI help you? ☕
            </p>
            <p style={{
              fontSize: 12.5,
              color: "var(--text-3)",
              lineHeight: 1.6,
              marginBottom: 14
            }}>
              Built for free to help job seekers. If it helped, a coffee keeps the servers alive!
            </p>
            <motion.a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#FF5E5B",
                color: "#fff",
                padding: "9px 18px",
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(255,94,91,0.3)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <KofiIcon size={16} />
              Support on Ko-fi
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger pill */}
      <motion.button
        onClick={() => setExpanded(v => !v)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: expanded ? "var(--text-1)" : "#FF5E5B",
          color: "#fff",
          border: "none",
          borderRadius: 99,
          padding: "10px 18px 10px 14px",
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          boxShadow: expanded
            ? "0 4px 16px rgba(0,0,0,0.18)"
            : "0 4px 16px rgba(255,94,91,0.35)",
          transition: "background 0.2s, box-shadow 0.2s",
          letterSpacing: "-0.2px",
        }}
      >
        {expanded
          ? <span style={{ fontSize: 16, lineHeight: 1 }}>✕</span>
          : <KofiIcon size={18} />
        }
        {expanded ? "Close" : "Support me"}
      </motion.button>
    </div>
  )
}

function KofiIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.061-4.3-.037-.046-.054-.09-.067-.136-.181-.539-.026-1.571 1.054-2.273 1.082-.702 2.392-.046 2.392-.046s.809.689 1.101 1.011c.304-.322 1.101-1.011 1.101-1.011s1.311-.656 2.392.046c1.082.702 1.235 1.734 1.054 2.273-.013.046-.03.09-.067.136-.118.232-.573.744-1.47 1.391zM21.572 11.83c-1.638 1.488-5.111 1.5-5.111 1.5s-.356-2.846-.145-5.021c1.139-.095 3.398-.103 4.253.111 1.346.335 2.64 1.925 1.003 3.41z"/>
    </svg>
  )
}
