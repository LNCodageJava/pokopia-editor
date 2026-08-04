import React, { useEffect, useRef } from "react";
import PokemonAutocomplete from "./PokemonAutocomplete";
import ImageWithFallback from "./ImageWithFallback";
import "../RuleCard.css";

function getImage(id) {
  if (!id) return null;
  if (id.includes(":")) {
    // Format namespace:nom_block -> namespace__nom_block.png
    const imageName = id.replace(":", "__");
    return `/blocks/${imageName}.png`;
  } else {
    return `/pokemon/${id}.png`;
  }
}

export default function RuleCard({
  index,
  rule,
  positions,
  setPositions,
  bringToFront,
  rules,
  setRules,
  pokemonSuggestions,
  blockSuggestions,
  selected = [],
  setSelected,
  habitatsData,
  editingCard,
  setEditingCard,
}) {
  const ref = useRef(null);
  const draggingRef = useRef({});

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

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.key === "Delete" || e.key === "Suppr") && isSelected) {
        e.preventDefault();
        // Supprimer toutes les cartes sélectionnées
        const indicesToDelete = Array.isArray(selected) ? selected : [index];
        const newRules = rules.filter((_, i) => !indicesToDelete.includes(i));
        setRules(newRules);

        // Réinitialiser les positions
        const newPositions = {};
        Object.keys(positions || {}).forEach((key) => {
          const oldIndex = parseInt(key);
          if (!indicesToDelete.includes(oldIndex)) {
            // Calculer le nouvel index après suppression
            const newIndex = oldIndex - indicesToDelete.filter(i => i < oldIndex).length;
            newPositions[newIndex] = positions[oldIndex];
          }
        });
        setPositions(newPositions);

        // Réinitialiser la sélection
        if (setSelected) {
          setSelected([]);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, selected, index, rules, setRules, positions, setPositions, setSelected]);

  function onPointerDown(e) {
    if (e.button === 2) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;

    // selection logic: modifier (ctrl/meta/shift) toggles membership, otherwise select single
    if (setSelected) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        setSelected((prev) => {
          if (!Array.isArray(prev)) prev = [];
          return prev.includes(index)
            ? prev.filter((i) => i !== index)
            : [...prev, index];
        });
      } else {
        // if not already the only selected, replace selection
        setSelected((prev) =>
          Array.isArray(prev) && prev.length === 1 && prev[0] === index
            ? prev
            : [index],
        );
      }
    }

    // prepare indices to move: if this card is selected, move all selected, else move this one
    const movingIndices =
      Array.isArray(selected) && selected.includes(index)
        ? selected.slice()
        : [index];

    bringToFront(movingIndices);
    const startX = e.clientX;
    const startY = e.clientY;

    // capture original positions for all moving indices
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

      // use rAF to update smoothly positions of all moving indices
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
      } catch (err) {
        // ignore
      }
      // persist final position
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
    const next = [...rules];
    next[index] = { ...next[index], pattern: [...next[index].pattern] };
    next[index].pattern[slotIndex] = blockId;
    setRules(next);
  }

  function setPokemon(pokemonId) {
    const next = [...rules];
    next[index] = { ...next[index], pokemon: pokemonId };
    setRules(next);
  }

  function setLevel(level) {
    const next = [...rules];
    next[index] = { ...next[index], level: Math.max(0, parseInt(level) || 0) };
    setRules(next);
  }

  function removeBlock(slotIndex) {
    setBlockAt(slotIndex, null);
  }

  function removePokemon() {
    setPokemon(null);
  }

  function setCapacityBlockAt(slotIndex, blockId) {
    const next = [...rules];
    next[index] = { ...next[index], capacityBlocks: [...(next[index].capacityBlocks || Array(3).fill(null))] };
    next[index].capacityBlocks[slotIndex] = blockId;
    setRules(next);
  }

  function setAbility(ability) {
    const next = [...rules];
    next[index] = { ...next[index], ability };
    setRules(next);
  }

  function setItemPrice(itemPrice) {
    const next = [...rules];
    next[index] = { ...next[index], itemPrice: itemPrice === "" ? "" : Math.max(0, parseFloat(itemPrice) || 0) };
    setRules(next);
  }

  function setMaxValue(maxValue) {
    const next = [...rules];
    next[index] = { ...next[index], maxValue: maxValue === "" ? "" : Math.max(0, parseFloat(maxValue) || 0) };
    setRules(next);
  }

  function removeCapacityBlock(slotIndex) {
    setCapacityBlockAt(slotIndex, null);
  }

  function setPokemonAtSlot(slotIndex, pokemonId) {
    const next = [...rules];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { ...pokemons[slotIndex], name: pokemonId };
    next[index] = { ...next[index], pokemons };
    setRules(next);
  }

  function setWeightAtSlot(slotIndex, weight) {
    const next = [...rules];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { ...pokemons[slotIndex], weight: parseFloat(weight) || 1 };
    next[index] = { ...next[index], pokemons };
    setRules(next);
  }

  function removePokemonAtSlot(slotIndex) {
    const next = [...rules];
    const pokemons = next[index].pokemons || Array(6).fill(null).map(() => ({ name: null, weight: 1 }));
    pokemons[slotIndex] = { name: null, weight: 1 };
    next[index] = { ...next[index], pokemons };
    setRules(next);
  }

  function generateOtherPokemons() {
    if (!habitatsData || !habitatsData.habitats) return;

    const newRules = [...rules];
    const existingPokemonCards = new Set(
      rules.filter(r => r.pokemons && r.pokemons.length > 0).map(r => r.pokemons[0]?.name).filter(Boolean)
    );

    habitatsData.habitats.forEach(habitat => {
      if (!habitat.pokemons || habitat.pokemons.length === 0) return;

      habitat.pokemons.forEach(pokemon => {
        if (existingPokemonCards.has(pokemon.name)) return;

        const newRule = {
          pattern: Array(9).fill(null),
          pokemon: null,
          level: habitat.lvl || 0,
          capacityBlocks: Array(3).fill(null),
          ability: null,
          pokemons: [
            pokemon,
            ...habitat.pokemons.filter(p => p.name !== pokemon.name)
          ].slice(0, 6)
        };

        newRules.push(newRule);
        existingPokemonCards.add(pokemon.name);
      });
    });

    setRules(newRules);
  }

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
        <div className="ruleCard__left">
          {/* Affichage des pokemons avec poids si disponible */}
          {rule.pokemons && rule.pokemons.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 4 }}>
              {rule.pokemons.slice(0, 6).map((p, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 9 }}>
                  <div style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
                    {p?.name && (
                      <ImageWithFallback
                        src={getImage(p.name)}
                        labelId={p.name}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: 2, fontWeight: 'bold' }}>{p?.weight || 1}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="ruleCard__preview">
                {(rule.pattern || Array(9).fill(null)).map((b, i) => (
                  <div key={i} className="ruleCard__cell">
                    {b && (
                      <ImageWithFallback
                        src={getImage(b)}
                        labelId={b}
                        alt={b}
                        className="ruleCard__cellImg"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Capacity section */}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#555' }}>
                {rule.ability || '—'}
              </div>

              {rule.ability === "stardust" && (rule.itemPrice || rule.maxValue) && (
                <div style={{ marginTop: 4, fontSize: 9, textAlign: 'center', color: '#333', lineHeight: 1.3 }}>
                  <div>Price: {rule.itemPrice || 0}</div>
                  <div>Max: {rule.maxValue || 0}</div>
                  <div style={{ fontWeight: 'bold', color: '#2b6cdf' }}>
                    Total: {((rule.itemPrice || 0) * (rule.maxValue || 0)).toFixed(2)}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 4 }}>
                {(rule.capacityBlocks || Array(3).fill(null)).map((b, i) => (
                  <div key={i} style={{ width: 24, height: 24, border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
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
            </>
          )}
        </div>

        <div className="ruleCard__right">
          <div className="ruleCard__pokemonLargeWrap">
            <div className="ruleCard__pokemonThumbLarge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {rule.pokemon ? (
                <ImageWithFallback
                  src={getImage(rule.pokemon)}
                  labelId={rule.pokemon}
                  alt={rule.pokemon}
                  className="ruleCard__pokemonImgLarge"
                  style={{ imageRendering: "pixelated", width: '200%', height: '200%' }}
                />
              ) : (
                <div className="ruleCard__pokemonPlaceholder">Pokémon</div>
              )}
            </div>

            <div className="ruleCard__metaBelow">
              <div className="ruleCard__title">
                {rule.pokemon ? rule.pokemon : "—"}
              </div>
              <div className="ruleCard__level">Lvl: {rule.level ?? 0}</div>
            </div>
          </div>

          <div className="ruleCard__rightSpacer" />

          <div className="ruleCard__editContainer">
            {index === 0 && (
              <button
                className="ruleCard__editBtn"
                style={{ marginBottom: 8 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  generateOtherPokemons();
                }}
              >
                Generate Other Pokemons
              </button>
            )}
            <button
              className="ruleCard__editBtn"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setEditingCard({ type: 'rule', index });
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
