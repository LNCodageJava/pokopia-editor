import React, { useState } from "react";
import PokemonAutocomplete from "./PokemonAutocomplete";
import ImageWithFallback from "./ImageWithFallback";

function getImage(id) {
  if (!id) return null;
  if (id.includes(":")) {
    const imageName = id.replace(":", "__");
    return `/blocks/${imageName}.png`;
  } else {
    return `/pokemon/${id}.png`;
  }
}

export default function MegaHabitatEditor({
  megaHabitat,
  index,
  onClose,
  megaHabitats,
  setMegaHabitats,
  pokemonSuggestions,
  blockSuggestions,
}) {
  const [activeType, setActiveType] = useState("block");
  const [activeSlot, setActiveSlot] = useState(0);

  function setBlock(blockId) {
    const next = [...megaHabitats];
    next[index] = { ...next[index], block: blockId };
    setMegaHabitats(next);
  }

  function setPokemonAt(pokemonSlot, pokemonId) {
    const next = [...megaHabitats];
    const currentPokemons = next[index].pokemons || [];
    const pokemons = Array(9).fill(null);
    currentPokemons.forEach((p, i) => {
      if (i < 9) pokemons[i] = p;
    });
    pokemons[pokemonSlot] = pokemonId;
    next[index] = { ...next[index], pokemons };
    setMegaHabitats(next);
  }

  function setName(name) {
    const next = [...megaHabitats];
    next[index] = { ...next[index], name };
    setMegaHabitats(next);
  }

  function removePokemon(pokemonSlot) {
    setPokemonAt(pokemonSlot, null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99999,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="ruleCard__editor"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="ruleCard__closeBtn"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          ✕
        </button>
        <div className="ruleCard__editorInner" style={{ display: 'flex', gap: 16 }}>
          {/* Colonne gauche : Bloc unique */}
          <div style={{ flex: '0 0 auto' }}>
            <div className="ruleCard__labelSmall" style={{ marginBottom: 8 }}>Bloc</div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={
                  "ruleCard__blockBtn" +
                  (activeType === "block" ? " ruleCard__blockBtn--active" : "")
                }
                style={{ width: 64, height: 64 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveType("block");
                }}
              >
                {megaHabitat.block ? (
                  <ImageWithFallback
                    src={getImage(megaHabitat.block)}
                    labelId={megaHabitat.block}
                    alt={megaHabitat.block}
                    style={{ width: '100%', height: '100%', imageRendering: "pixelated" }}
                  />
                ) : (
                  <div style={{ fontSize: 10 }}>Bloc</div>
                )}
              </button>
              {megaHabitat.block && (
                <button
                  className="ruleCard__removeBtn"
                  style={{ fontSize: 10, padding: '2px 4px', position: 'absolute', top: -4, right: -4 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBlock(null);
                  }}
                >
                  X
                </button>
              )}
            </div>
          </div>

          {/* Colonne droite : Autocomplete + Nom + 9 Pokémons */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Nom */}
            <div>
              <div className="ruleCard__labelSmall" style={{ marginBottom: 4 }}>Nom</div>
              <input
                type="text"
                className="ruleCard__levelInput"
                style={{ width: '100%' }}
                value={megaHabitat.name || ""}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* 9 Pokémons */}
            <div>
              <div className="ruleCard__labelSmall" style={{ marginBottom: 8 }}>9 Pokémons</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4
              }}>
                {(megaHabitat.pokemons || Array(9).fill(null)).slice(0, 9).map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <button
                      className={
                        "ruleCard__blockBtn" +
                        (activeType === "pokemon" && activeSlot === i
                          ? " ruleCard__blockBtn--active"
                          : "")
                      }
                      style={{ width: 48, height: 48 }}
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

            {/* Autocomplete */}
            <div className="ruleCard__autocompleteRow">
              <div className="ruleCard__labelSmall">Recherche</div>
              {activeType === "pokemon" ? (
                <PokemonAutocomplete
                  value={(megaHabitat.pokemons || Array(9).fill(null))[activeSlot] || ""}
                  suggestions={pokemonSuggestions}
                  onSelect={(p) => setPokemonAt(activeSlot, p)}
                  placeholder={`Choisir Pokémon ${activeSlot + 1}`}
                />
              ) : (
                <PokemonAutocomplete
                  value={megaHabitat.block || ""}
                  suggestions={blockSuggestions}
                  onSelect={(b) => setBlock(b)}
                  placeholder={`Choisir bloc`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
