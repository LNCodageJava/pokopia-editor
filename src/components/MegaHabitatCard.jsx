import React, { useState, useEffect, useRef } from "react";
import PokemonAutocomplete from "./PokemonAutocomplete";
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
  megaHabitats,
  setMegaHabitats,
  pokemonSuggestions,
  blockSuggestions,
  selected = [],
  setSelected,
}) {
  const ref = useRef(null);
  const draggingRef = useRef({});
  const [editing, setEditing] = useState(false);
  const [activeType, setActiveType] = useState("block");
  const [activeSlot, setActiveSlot] = useState(0);

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

  function setBlockAt(slotIndex, blockId) {
    const next = [...megaHabitats];
    next[index] = { ...next[index], blockList: [...next[index].blockList] };
    next[index].blockList[slotIndex] = blockId;
    setMegaHabitats(next);
  }

  function setPokemonAt(pokemonSlot, pokemonId) {
    const next = [...megaHabitats];
    next[index] = { ...next[index], pokemons: [...(next[index].pokemons || Array(6).fill(null))] };
    next[index].pokemons[pokemonSlot] = pokemonId;
    setMegaHabitats(next);
  }

  function setName(name) {
    const next = [...megaHabitats];
    next[index] = { ...next[index], name };
    setMegaHabitats(next);
  }

  function removeBlock(slotIndex) {
    setBlockAt(slotIndex, null);
  }

  function removePokemon(pokemonSlot) {
    setPokemonAt(pokemonSlot, null);
  }

  return (
    <div
      ref={ref}
      className={
        "ruleCard ruleCard--absolute" +
        (isSelected ? " ruleCard--selected" : "")
      }
      onPointerDown={onPointerDown}
      style={{ width: 300 }}
    >
      <div className="ruleCard__body">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>
            {megaHabitat.name || "Mega Habitat"}
          </div>

          {/* Grille 5x6 = 30 blocs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 2,
            marginBottom: 8
          }}>
            {(megaHabitat.blockList || Array(30).fill(null)).map((b, i) => (
              <div key={i} style={{
                width: 24,
                height: 24,
                border: '1px solid #ddd',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#f9f9f9'
              }}>
                {b && (
                  <ImageWithFallback
                    src={getImage(b)}
                    labelId={b}
                    alt={b}
                    style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 6 pokémons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 4
          }}>
            {(megaHabitat.pokemons || Array(6).fill(null)).map((p, i) => (
              <div key={i} style={{
                width: 32,
                height: 32,
                border: '2px solid #2b6cdf',
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: '#fff'
              }}>
                {p && (
                  <ImageWithFallback
                    src={getImage(p)}
                    labelId={p}
                    alt={p}
                    style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
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
                setEditing((s) => !s);
              }}
            >
              {editing ? "Fermer" : "Éditer"}
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div
          className="ruleCard__editor"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 500,
            left: Math.min(pos.x + 320, window.innerWidth - 520),
            top: Math.min(pos.y, window.innerHeight - 100)
          }}
        >
          <div className="ruleCard__editorInner">
            <div style={{ marginBottom: 12 }}>
              <div className="ruleCard__labelSmall">Nom</div>
              <input
                type="text"
                className="ruleCard__levelInput"
                style={{ width: '100%' }}
                value={megaHabitat.name || ""}
                onChange={(e) => setName(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="ruleCard__labelSmall">Grille 5x6 Blocs</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 4
              }}>
                {(megaHabitat.blockList || Array(30).fill(null)).map((b, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <button
                      className={
                        "ruleCard__blockBtn" +
                        (activeType === "block" && activeSlot === i
                          ? " ruleCard__blockBtn--active"
                          : "")
                      }
                      style={{ width: 40, height: 40 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveType("block");
                        setActiveSlot(i);
                      }}
                    >
                      {b ? (
                        <ImageWithFallback
                          src={getImage(b)}
                          labelId={b}
                          alt={b}
                          style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                        />
                      ) : (
                        <div style={{ fontSize: 10 }}>{i + 1}</div>
                      )}
                    </button>
                    {b && (
                      <button
                        className="ruleCard__removeBtn"
                        style={{ fontSize: 10, padding: '2px 4px' }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(i);
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="ruleCard__labelSmall">6 Pokémons</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 4
              }}>
                {(megaHabitat.pokemons || Array(6).fill(null)).map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <button
                      className={
                        "ruleCard__blockBtn" +
                        (activeType === "pokemon" && activeSlot === i
                          ? " ruleCard__blockBtn--active"
                          : "")
                      }
                      style={{ width: 48, height: 48 }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveType("pokemon");
                        setActiveSlot(i);
                      }}
                    >
                      {p ? (
                        <ImageWithFallback
                          src={getImage(p)}
                          labelId={p}
                          alt={p}
                          style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                        />
                      ) : (
                        <div style={{ fontSize: 10 }}>P{i + 1}</div>
                      )}
                    </button>
                    {p && (
                      <button
                        className="ruleCard__removeBtn"
                        style={{ fontSize: 10, padding: '2px 4px' }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePokemon(i);
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="ruleCard__autocompleteRow">
              <div className="ruleCard__labelSmall">Recherche</div>
              {activeType === "pokemon" ? (
                <PokemonAutocomplete
                  value={megaHabitat.pokemons?.[activeSlot] || ""}
                  suggestions={pokemonSuggestions}
                  onSelect={(p) => {
                    setPokemonAt(activeSlot, p);
                  }}
                  placeholder={`Choisir Pokémon ${activeSlot + 1}`}
                />
              ) : (
                <PokemonAutocomplete
                  value={megaHabitat.blockList?.[activeSlot] || ""}
                  suggestions={blockSuggestions}
                  onSelect={(b) => {
                    setBlockAt(activeSlot, b);
                  }}
                  placeholder={`Choisir bloc ${activeSlot + 1}`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
