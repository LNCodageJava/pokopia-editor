import React, { useMemo, useState } from "react";

function toTitleCase(str) {
  return str
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function readableNameFromId(id) {
  if (!id) return "";
  const raw = String(id);

  if (
    raw.startsWith("minecraft:") ||
    raw.startsWith("cobblemon:") ||
    raw.startsWith("cobblemonfury:")
  ) {
    const namePart = raw.split(":")[1] || "";
    return toTitleCase(namePart.replace(/_/g, " "));
  }

  // pokemon ids (snake_case) or block ids (unlikely here)
  return toTitleCase(raw.replace(/_/g, " "));
}

export default function ImageWithFallback({
  src,
  alt,
  labelId,
  className,
  style,
}) {
  const [errored, setErrored] = useState(false);

  const readable = useMemo(() => {
    if (labelId) return readableNameFromId(labelId);
    if (alt) return readableNameFromId(alt);
    return "";
  }, [labelId, alt]);

  if (!src) {
    return (
      <div className={className} style={style} aria-label={readable}>
        {readable || alt || "—"}
      </div>
    );
  }

  if (errored) {
    return (
      <div className={className} style={style} aria-label={readable}>
        {readable || alt || "—"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || readable}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
