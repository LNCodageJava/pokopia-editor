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

export default function RuleCardEditor({
  rule,
  index,
  onClose,
  rules,
  setRules,
  pokemonSuggestions,
  blockSuggestions,
}) {
  const [activeType, setActiveType] = useState("block");
  const [activeSlot, setActiveSlot] = useState(0);

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
        <div className="ruleCard__editorInner">
          {/* Editeur pour le mode pokemons */}
          {rule.pokemons && rule.pokemons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {rule.pokemons.slice(0, 6).map((p, i) => (
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
                      style={{ width: 60, padding: 4, fontSize: 11 }}
                    />
                  </div>
                  {p?.name && (
                    <button
                      className="ruleCard__removeBtn"
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
          ) : (
            <div className="ruleCard__blocksCol">
              <div className="ruleCard__blocksGrid">
                {(rule.pattern || Array(9).fill(null)).map((b, i) => (
                  <div key={i} className="ruleCard__blockCell">
                    <button
                      className={
                        "ruleCard__blockBtn" +
                        (activeType === "block" && activeSlot === i
                          ? " ruleCard__blockBtn--active"
                          : "")
                      }
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
                          className="ruleCard__blockImg"
                          style={{ imageRendering: "pixelated" }}
                        />
                      ) : (
                        <div className="ruleCard__blockPlaceholder">
                          {i + 1}
                        </div>
                      )}
                    </button>
                    {b && (
                      <button
                        className="ruleCard__removeBtn"
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
          )}

          {!(rule.pokemons && rule.pokemons.length > 0) && (
            <div className="ruleCard__rightCol">
              <div className="ruleCard__pokemonRow">
                <div className="ruleCard__pokemonThumbLarge">
                  {rule.pokemon ? (
                    <ImageWithFallback
                      src={getImage(rule.pokemon)}
                      labelId={rule.pokemon}
                      alt={rule.pokemon}
                      className="ruleCard__pokemonImgLarge"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="ruleCard__pokemonPlaceholder">Pokémon</div>
                  )}
                </div>
                <div>
                  <div className="ruleCard__labelSmall">Pokémon</div>
                  <div className="ruleCard__pokemonActions">
                    <button
                      className="ruleCard__chooseBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveType("pokemon");
                      }}
                    >
                      Choisir
                    </button>
                    {rule.pokemon && (
                      <button
                        className="ruleCard__removeBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePokemon();
                        }}
                      >
                        Suppr
                      </button>
                    )}
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
                />
              </div>

              <div className="ruleCard__levelRow">
                <div className="ruleCard__labelSmall">Ability</div>
                <select
                  className="ruleCard__levelInput"
                  value={rule.ability || ""}
                  onChange={(e) => setAbility(e.target.value)}
                >
                  <option value="">-- Choisir --</option>
                  <option value="stardust">stardust</option>
                  <option value="destroy">destroy</option>
                  <option value="place">place</option>
                  <option value="transform">transform</option>
                  <option value="mount">mount</option>
                </select>
              </div>

              {rule.ability === "stardust" && (
                <>
                  <div className="ruleCard__levelRow">
                    <div className="ruleCard__labelSmall">Item Price</div>
                    <input
                      type="number"
                      step="0.01"
                      className="ruleCard__levelInput"
                      value={rule.itemPrice ?? ""}
                      onChange={(e) => setItemPrice(e.target.value)}
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="ruleCard__levelRow">
                    <div className="ruleCard__labelSmall">Max Value</div>
                    <input
                      type="number"
                      step="0.01"
                      className="ruleCard__levelInput"
                      value={rule.maxValue ?? ""}
                      onChange={(e) => setMaxValue(e.target.value)}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              <div className="ruleCard__labelSmall" style={{ marginTop: 8 }}>Capacity Blocks</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {(rule.capacityBlocks || Array(3).fill(null)).map((b, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <button
                      className={
                        "ruleCard__blockBtn" +
                        (activeType === "capacity" && activeSlot === i
                          ? " ruleCard__blockBtn--active"
                          : "")
                      }
                      style={{ width: 48, height: 48 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveType("capacity");
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
                        <div className="ruleCard__blockPlaceholder">
                          {i + 1}
                        </div>
                      )}
                    </button>
                    {b && (
                      <button
                        className="ruleCard__removeBtn"
                        style={{ position: 'absolute', top: -4, right: -4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCapacityBlock(i);
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="ruleCard__autocompleteRow">
                <div className="ruleCard__labelSmall">Recherche</div>
                {activeType === "pokemon" ? (
                  <PokemonAutocomplete
                    value={rule.pokemon || ""}
                    suggestions={pokemonSuggestions}
                    onSelect={(p) => {
                      setPokemon(p);
                    }}
                    placeholder={`Choisir Pokémon`}
                  />
                ) : activeType === "capacity" ? (
                  <PokemonAutocomplete
                    value={rule.capacityBlocks?.[activeSlot] || ""}
                    suggestions={blockSuggestions}
                    onSelect={(b) => {
                      setCapacityBlockAt(activeSlot, b);
                    }}
                    placeholder={`Choisir capacity bloc ${activeSlot + 1}`}
                  />
                ) : (
                  <PokemonAutocomplete
                    value={rule.pattern[activeSlot] || ""}
                    suggestions={blockSuggestions}
                    onSelect={(b) => {
                      setBlockAt(activeSlot, b);
                    }}
                    placeholder={`Choisir bloc`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
