import React, { useState, useEffect, useRef } from 'react';

// Petit composant Autocomplete pour Pokémon
// Props:
// - value: valeur initiale (string)
// - suggestions: array of strings
// - onSelect(pokemon: string): appelé quand on choisit un élément
// - placeholder

export default function PokemonAutocomplete({ value = '', suggestions = [], onSelect, placeholder = 'Tapez un Pokémon' }) {
  const [input, setInput] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    setFiltered(
      suggestions.filter((s) => s.toLowerCase().includes((input || '').toLowerCase())).slice(0, 10)
    );
    setHighlight(0);
  }, [input, suggestions]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) select(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function select(item) {
    setInput(item);
    setOpen(false);
    if (onSelect) onSelect(item);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={input}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        style={{ width: 200, padding: '6px 8px' }}
        aria-autocomplete="list"
      />

      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 9999,
            width: 220,
            maxHeight: 220,
            overflow: 'auto',
          }}
        >
          {filtered.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e) => {
                // use onMouseDown to avoid blur before click
                e.preventDefault();
                select(s);
              }}
              onMouseEnter={() => setHighlight(i)}
              style={{
                padding: '6px 8px',
                background: i === highlight ? '#f0f4ff' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

