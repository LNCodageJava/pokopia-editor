import React, { useState, useEffect, useRef } from "react";
import PokemonAutocomplete from "./PokemonAutocomplete";
import ImageWithFallback from "./ImageWithFallback";
import "../RuleCard.css";

function getImage(id) {
  if (!id) return null;
  return `/pokemon/${id}.png`;
}

export default function PokemonWeightCard({
  index,
  card,
  positions,
  setPositions,
  bringToFront,
  cards,
  setCards,
  pokemonSuggestions,
  selected = [],
  setSelected,
}) {
  const ref = useRef(null);
  const draggingRef = useRef({});
  const [editing, setEditing] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);

  const isSelected = Array.isArray(selected) && selected.includes(index);
  const pos = positions?.[index] || {
    x: 20 + (index % 5) * 240,
    y: 20 + Math.floor(index / 5) * 160,
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
        x: 20 + (i % 5) * 240,
        y: 20 + Math.floor(i / 5) * 160,
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

  function setPokemonAtSlot(slotIndex, pokemonId) {
    const next = [...cards];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { ...pokemons[slotIndex], name: pokemonId };
    next[index] = { ...next[index], pokemons };
    setCards(next);
  }

  function setWeightAtSlot(slotIndex, weight) {
    const next = [...cards];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { ...pokemons[slotIndex], weight: parseFloat(weight) || 1 };
    next[index] = { ...next[index], pokemons };
    setCards(next);
  }

  function removePokemonAtSlot(slotIndex) {
    const next = [...cards];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { name: null, weight: 1 };
    next[index] = { ...next[index], pokemons };
    setCards(next);
  }

  const pokemons = card.pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));

  return (
    <div
      ref={ref}
      className={
        "ruleCard ruleCard--absolute" +
        (isSelected ? " ruleCard--selected" : "")
      }
      onPointerDown={onPointerDown}
    >
      <div className="ruleCard__body">
        {/* --- GRILLE DES 6 CASES AGRANDIE AVEC ZOOM 200% --- */}
        <div className="ruleCard__left" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '8px' }}>
            {pokemons.slice(0, 6).map((p, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 12 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  overflow: 'hidden',
                  margin: '0 auto',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {p?.name && (
                    <ImageWithFallback
                      src={getImage(p.name)}
                      labelId={p.name}
                      alt={p.name}
                      style={{ width: '200%', height: '200%', imageRendering: "pixelated", objectFit: "contain" }}
                    />
                  )}
                </div>
                <div style={{ marginTop: 4, fontWeight: 'bold', color: '#333' }}>{p?.weight || 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* --- PARTIE DROITE ÉPURÉE (UNIQUEMENT LE BOUTON ÉDITER) --- */}
        <div className="ruleCard__right" style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          {!editing && (
            <div className="ruleCard__editContainer">
              <button
                className="ruleCard__editBtn"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
              >
                Éditer
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div
          className="ruleCard__editor"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            left: Math.min(pos.x + 220, window.innerWidth - 520),
            top: Math.min(pos.y, window.innerHeight - 100)
          }}
        >
          <div className="ruleCard__editorInner">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #ddd' }}>
                <span style={{ fontWeight: 'bold', fontSize: 14 }}>Édition Pokémons/Poids</span>
                <button
                  className="ruleCard__editBtn"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(false);
                  }}
                >
                  Fermer
                </button>
              </div>
              {pokemons.slice(0, 6).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 4, border: '1px solid #ddd', borderRadius: 4 }}>
                  <div style={{ width: 32, height: 32, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden' }}>
                    {p?.name && (
                      <ImageWithFallback
                        src={getImage(p.name)}
                        labelId={p.name}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <PokemonAutocomplete
                      value={p?.name || ""}
                      suggestions={pokemonSuggestions}
                      onSelect={(pokemonId) => setPokemonAtSlot(i, pokemonId)}
                      placeholder={`Pokemon ${i + 1}`}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11 }}>Poids:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={p?.weight || 1}
                      onChange={(e) => setWeightAtSlot(i, e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ width: 60, padding: 4, fontSize: 11 }}
                    />
                  </div>
                  {p?.name && (
                    <button
                      className="ruleCard__removeBtn"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePokemonAtSlot(i);
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}