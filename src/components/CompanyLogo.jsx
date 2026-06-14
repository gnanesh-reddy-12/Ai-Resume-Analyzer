import { useState } from "react";

export default function CompanyLogo({ name, size = 24 }) {
  const [error, setError] = useState(false);
  const cleanDomain = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : '';

  if (error || !cleanDomain) {
    return (
      <div style={{ 
        width: size, height: size, borderRadius: Math.max(4, size/6), 
        background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", 
        flexShrink: 0, border: "1px solid var(--border-2)" 
      }}>
        <span style={{ fontSize: Math.max(10, size/2), fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase" }}>
          {name ? name.charAt(0) : "?"}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
      alt={name}
      onError={() => setError(true)}
      style={{ 
        width: size, height: size, borderRadius: Math.max(4, size/6), 
        border: "1px solid var(--border-2)", objectFit: "contain", 
        background: "#fff", flexShrink: 0 
      }}
    />
  );
}
