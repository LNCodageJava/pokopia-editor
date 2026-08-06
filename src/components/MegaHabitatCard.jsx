import React, { useEffect, useRef } from "react";
import ImageWithFallback from "./ImageWithFallback";
import "../RuleCard.css";

function getImage(id) {
  if (!id) return null;
  if (id.includes(":")) {
    const imageName = id.replace(":", "__");
    return `/blocks/${imageName}.png`;
  } else {
    return `/pokemon/${id}.png`;
  }
}

export default function MegaHabitatCard({
  index,
  megaHabitat,
  positions,
  setPositions,
  bringToFront,
  selected = [],
  setSelected,
  editingCard,
  setEditingCard,
}) {
  const ref = useRef(null);
  const draggingRef = useRef({});

  const isSelected = Array.isArray(selected) && selected.includes(index);
  const pos = positions?.[index] || {
    x: 20 + (index % 5) * 320,
    y: 20 + Math.floor(index / 5) * 200,
    z: 0,
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    el.style.zIndex = pos.z || 0;
  }, [pos.x, pos.y, pos.z]);

  function onPointerDown(e) {
    if (e.button === 2) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;

    if (setSelected) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        setSelected((prev) => {
          if (!Array.isArray(prev)) prev = [];
          return prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index];
        });
      } else {
        setSelected((prev) =>
          Array.isArray(prev) && prev.length === 1 && prev[0] === index
            ? prev
            : [index],
        );
      }
    }

    const movingIndices =
      Array.isArray(selected) && selected.includes(index)
        ? selected.slice()
        : [index];

    bringToFront(movingIndices);
    const startX = e.clientX;
    const startY = e.clientY;

    const orig = {};
    movingIndices.forEach((i) => {
      const p = positions?.[i] || {
        x: 20 + (i % 5) * 320,
        y: 20 + Math.floor(i / 5) * 200,
        z: 0,
      };
      orig[i] = { x: p.x, y: p.y, z: p.z || 0 };
    });

    draggingRef.current = {
      pointerId: e.pointerId,
      startX,
      startY,
      orig,
      indices: movingIndices,
      raf: null,
    };

    el.setPointerCapture(e.pointerId);

    function onPointerMove(ev) {
      ev.preventDefault();
      const d = draggingRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;

      if (d.raf) cancelAnimationFrame(d.raf);
      d.raf = requestAnimationFrame(() => {
        setPositions((prev) => {
          const next = { ...(prev || {}) };
          d.indices.forEach((i) => {
            const o = d.orig[i];
            next[i] = {
              ...(next[i] || {}),
              x: o.x + dx,
              y: o.y + dy,
              z: next[i]?.z || o.z || 0,
            };
          });
          return next;
        });
      });
    }

    function onPointerUp(ev) {
      ev.preventDefault();
      const d = draggingRef.current;
      if (d && d.raf) cancelAnimationFrame(d.raf);
      try {
        el.releasePointerCapture(d.pointerId);
      } catch (err) {}
      setPositions((prev) => ({ ...prev }));
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      draggingRef.current = {};
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  return (
    <div
      ref={ref}
      className={
        "ruleCard ruleCard--absolute" +
        (isSelected ? " ruleCard--selected" : "")
      }
      onPointerDown={onPointerDown}
      style={{ width: 400 }}
    >
      <div className="ruleCard__body">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
            {megaHabitat.name || "Mega Habitat"}
          </div>

          {/* Bloc unique */}
          <div style={{
            width: 48,
            height: 48,
            border: '2px solid #ddd',
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: '#f9f9f9',
            marginBottom: 8,
            margin: '0 auto 8px'
          }}>
            {megaHabitat.block && (
              <ImageWithFallback
                src={getImage(megaHabitat.block)}
                labelId={megaHabitat.block}
                alt={megaHabitat.block}
                style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
              />
            )}
          </div>

          {/* 9 pokémons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: 4,
            maxWidth: 380,
            margin: '0 auto'
          }}>
            {(megaHabitat.pokemons || Array(9).fill(null)).slice(0, 9).map((p, i) => (
              <div key={i} style={{
                aspectRatio: '1/1',
                border: '2px solid #2b6cdf',
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {p && (
                  <ImageWithFallback
                    src={getImage(p)}
                    labelId={p}
                    alt={p}
                    style={{ width: '200%', height: '200%', imageRendering: "pixelated" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <button
              className="ruleCard__editBtn"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setEditingCard({ type: 'mega', index });
              }}
            >
              Éditer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
