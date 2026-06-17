import { motion } from "framer-motion"

export default function KofiButton({ username = "gnanesh", label = "Support on Ko-fi", style }) {
  const kofiUrl = `https://ko-fi.com/${username}`

  return (
    <motion.a
      href={kofiUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "#FF5E5B",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 99,
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        textDecoration: "none",
        boxShadow: "0 4px 14px rgba(255, 94, 91, 0.3)",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "box-shadow 0.2s ease",
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 94, 91, 0.4)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(255, 94, 91, 0.3)"
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.061-4.3-.037-.046-.054-.09-.067-.136-.181-.539-.026-1.571 1.054-2.273 1.082-.702 2.392-.046 2.392-.046s.809.689 1.101 1.011c.304-.322 1.101-1.011 1.101-1.011s1.311-.656 2.392.046c1.082.702 1.235 1.734 1.054 2.273-.013.046-.03.09-.067.136-.118.232-.573.744-1.47 1.391zM21.572 11.83c-1.638 1.488-5.111 1.5-5.111 1.5s-.356-2.846-.145-5.021c1.139-.095 3.398-.103 4.253.111 1.346.335 2.64 1.925 1.003 3.41z" fill="#ffffff"/>
      </svg>
      {label}
    </motion.a>
  )
}
