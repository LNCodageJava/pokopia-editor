import React, { useState, useEffect, useRef } from 'react';
import PokemonAutocomplete from './PokemonAutocomplete';
import '../RuleCard.css';

function getImage(id) {
  if (!id) return null;
  if (id.startsWith('minecraft:')) {
    const name = id.split(':')[1];
    return `/blocks/${name}.png`;
  } else {
    return `/pokemon/${id}.png`;
  }
}

export default function RuleCard({ index, rule, positions, setPositions, bringToFront, rules, setRules, pokemonSuggestions, blockSuggestions, selected = [], setSelected }) {
  const ref = useRef(null);
  const draggingRef = useRef({});
  const [editing, setEditing] = useState(false);
  const [activeType, setActiveType] = useState('block');
  const [activeSlot, setActiveSlot] = useState(0);

  const isSelected = Array.isArray(selected) && selected.includes(index);
  const pos = positions?.[index] || { x: 20 + (index % 5) * 240, y: 20 + Math.floor(index / 5) * 160, z: 0 };

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

    // selection logic: modifier (ctrl/meta/shift) toggles membership, otherwise select single
    if (setSelected) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        setSelected((prev) => {
          if (!Array.isArray(prev)) prev = [];
          return prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
        });
      } else {
        // if not already the only selected, replace selection
        setSelected((prev) => (Array.isArray(prev) && prev.length === 1 && prev[0] === index ? prev : [index]));
      }
    }

    // prepare indices to move: if this card is selected, move all selected, else move this one
    const movingIndices = (Array.isArray(selected) && selected.includes(index)) ? selected.slice() : [index];

    bringToFront(movingIndices);
    const startX = e.clientX;
    const startY = e.clientY;

    // capture original positions for all moving indices
    const orig = {};
    movingIndices.forEach((i) => {
      const p = positions?.[i] || { x: (20 + (i % 5) * 240), y: (20 + Math.floor(i / 5) * 160), z: 0 };
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
            next[i] = { ...(next[i] || {}), x: o.x + dx, y: o.y + dy, z: next[i]?.z || o.z || 0 };
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
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      draggingRef.current = {};
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
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

  return (
    <div
      ref={ref}
      className={"ruleCard ruleCard--absolute" + (isSelected ? ' ruleCard--selected' : '')}
      onPointerDown={onPointerDown}
    >
      <div className="ruleCard__body">
        <div className="ruleCard__left">
          <div className="ruleCard__preview">
            {(rule.pattern || Array(9).fill(null)).map((b, i) => (
              <div key={i} className="ruleCard__cell">
                {b && <img src={getImage(b)} alt={b} className="ruleCard__cellImg" style={{imageRendering: 'pixelated' }}/>}
              </div>
            ))}
          </div>
        </div>

        <div className="ruleCard__right">
          <div className="ruleCard__pokemonLargeWrap">
            <div className="ruleCard__pokemonThumbLarge">
              {rule.pokemon ? (
                <img src={getImage(rule.pokemon)} alt={rule.pokemon} className="ruleCard__pokemonImgLarge" style={{imageRendering: 'pixelated' }}/>
              ) : (
                <div className="ruleCard__pokemonPlaceholder">Pokémon</div>
              )}
            </div>

            <div className="ruleCard__metaBelow">
              <div className="ruleCard__title">{rule.pokemon ? rule.pokemon : '—'}</div>
              <div className="ruleCard__level">Lvl: {rule.level ?? 0}</div>
            </div>
          </div>

          <div className="ruleCard__rightSpacer" />

          <div className="ruleCard__editContainer">
            <button className="ruleCard__editBtn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setEditing((s) => !s); }}> {editing ? 'Fermer' : 'Éditer'} </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="ruleCard__editor" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <div className="ruleCard__editorInner">
            <div className="ruleCard__blocksCol">
              <div className="ruleCard__blocksGrid">
                {(rule.pattern || Array(9).fill(null)).map((b, i) => (
                  <div key={i} className="ruleCard__blockCell">
                    <button
                      className={"ruleCard__blockBtn" + (activeType === 'block' && activeSlot === i ? ' ruleCard__blockBtn--active' : '')}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setActiveType('block'); setActiveSlot(i); }}
                    >
                      {b ? <img src={getImage(b)} alt={b} className="ruleCard__blockImg" style={{imageRendering:
                          'pixelated' }} /> : <div className="ruleCard__blockPlaceholder">{i+1}</div>}
                    </button>
                    {b && <button className="ruleCard__removeBtn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeBlock(i); }}>X</button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="ruleCard__rightCol">
              <div className="ruleCard__pokemonRow">
                <div className="ruleCard__pokemonThumbLarge">
                  {rule.pokemon ? <img src={getImage(rule.pokemon)} alt={rule.pokemon} className="ruleCard__pokemonImgLarge" style={{imageRendering: 'pixelated' }}/> : <div className="ruleCard__pokemonPlaceholder">Pokémon</div>}
                </div>
                <div>
                  <div className="ruleCard__labelSmall">Pokémon</div>
                  <div className="ruleCard__pokemonActions">
                    <button className="ruleCard__chooseBtn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setActiveType('pokemon'); }}>Choisir</button>
                    {rule.pokemon && <button className="ruleCard__removeBtn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removePokemon(); }}>Suppr</button>}
                  </div>
                </div>
              </div>

              <div className="ruleCard__levelRow">
                <div className="ruleCard__labelSmall">Niveau</div>
                <input
                  type="number"
                  className="ruleCard__levelInput"
                  value={rule.level ?? 0}
                  onChange={(e) => setLevel(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              </div>

              <div className="ruleCard__autocompleteRow">
                <div className="ruleCard__labelSmall">Recherche</div>
                {activeType === 'pokemon' ? (
                  <PokemonAutocomplete
                    value={rule.pokemon || ''}
                    suggestions={pokemonSuggestions}
                    onSelect={(p) => { setPokemon(p); }}
                    placeholder={`Choisir Pokémon`}
                  />
                ) : (
                  <PokemonAutocomplete
                    value={rule.pattern[activeSlot] || ''}
                    suggestions={blockSuggestions}
                    onSelect={(b) => { setBlockAt(activeSlot, b); }}
                    placeholder={`Choisir bloc`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
