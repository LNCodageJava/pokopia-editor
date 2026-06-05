import React, { useState, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import "./App.css";
import RuleCard from "./components/RuleCard";
import ShapesLayer from "./components/ShapesLayer";
import ImageWithFallback from "./components/ImageWithFallback";

const LAYOUT_KEY = "pokopia.rules.layout.v1";

// Charger dynamiquement tous les blocs depuis le dossier public/blocks
// Format des fichiers: namespace__nom_block.png -> namespace:nom_block
const blockImages = import.meta.glob('/public/blocks/*.png', { eager: true });
const BLOCKS = Object.keys(blockImages)
  .map((path) => {
    // Extraire le nom du fichier: /public/blocks/minecraft__stone.png -> minecraft__stone.png
    const fileName = path.split('/').pop();
    // Retirer l'extension: minecraft__stone.png -> minecraft__stone
    const nameWithoutExt = fileName.replace('.png', '');
    // Convertir __ en :: minecraft__stone -> minecraft:stone
    return nameWithoutExt.replace('__', ':');
  })
  .sort();

const POKEMONS = [
  "turtwig",
  "grotle",
  "torterra",
  "chimchar",
  "monferno",
  "infernape",
  "piplup",
  "prinplup",
  "empoleon",
  "starly",
  "staravia",
  "staraptor",
  "bidoof",
  "bibarel",
  "kricketot",
  "kricketune",
  "shinx",
  "luxio",
  "luxray",
  "budew",
  "roserade",
  "cranidos",
  "rampardos",
  "shieldon",
  "bastiodon",
  "burmy",
  "wormadam",
  "mothim",
  "combee",
  "vespiquen",
  "pachirisu",
  "buizel",
  "floatzel",
  "cherubi",
  "cherrim",
  "shellos",
  "gastrodon",
  "ambipom",
  "drifloon",
  "drifblim",
  "buneary",
  "lopunny",
  "mismagius",
  "honchkrow",
  "glameow",
  "purugly",
  "chingling",
  "stunky",
  "skuntank",
  "bronzor",
  "bronzong",
  "bonsly",
  "mimejr",
  "happiny",
  "chatot",
  "spiritomb",
  "gible",
  "gabite",
  "garchomp",
  "munchlax",
  "riolu",
  "lucario",
  "hippopotas",
  "hippowdon",
  "skorupi",
  "drapion",
  "croagunk",
  "toxicroak",
  "carnivine",
  "finneon",
  "lumineon",
  "mantyke",
  "snover",
  "abomasnow",
  "weavile",
  "magnezone",
  "lickilicky",
  "rhyperior",
  "tangrowth",
  "electivire",
  "magmortar",
  "togekiss",
  "yanmega",
  "leafeon",
  "glaceon",
  "gliscor",
  "mamoswine",
  "porygonz",
  "gallade",
  "probopass",
  "dusknoir",
  "froslass",
  "rotom",
  "uxie",
  "mesprit",
  "azelf",
  "dialga",
  "palkia",
  "heatran",
  "regigigas",
  "giratina",
  "cresselia",
  "phione",
  "manaphy",
  "darkrai",
  "shaymin",
  "arceus",
];

// Fonction pour récupérer l'image depuis le nom
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

function Draggable({ id, label }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="item"
    >
      <ImageWithFallback
        src={getImage(label)}
        labelId={label}
        alt={label}
        className="img"
      />
      <div className="label">{label}</div>
    </div>
  );
}

function Slot({ id, value }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="slot">
      {value && (
        <ImageWithFallback
          src={getImage(value)}
          labelId={value}
          alt={value}
          className="img"
        />
      )}
    </div>
  );
}

function defaultX(index) {
  return 20 + (index % 5) * 240;
}
function defaultY(index) {
  return 20 + Math.floor(index / 5) * 160;
}

export default function App() {
  const createRule = () => ({
    pattern: Array(9).fill(null),
    pokemon: null,
    level: 0,
    ability: null,
    capacityBlocks: Array(3).fill(null),
  });
  const [rules, setRules] = useState(Array(100).fill(null).map(createRule));
  // selected cards (array of indices)
  const [selected, setSelected] = useState([]);
  // shapes drawn on canvas (rect or arrow)
  const [shapes, setShapes] = useState(() => {
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.shapes) return parsed.shapes;
      }
    } catch (err) {}
    return [];
  });

  const [tool, setTool] = useState("select"); // 'select' | 'rect' | 'arrow' | 'text'
  const canvasRef = useRef(null);
  const drawingRef = useRef(null); // temp state while drawing
  // context menu for shapes
  const [shapeMenu, setShapeMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    shapeId: null,
  });
  // context menu for canvas background (tool picker)
  const [canvasMenu, setCanvasMenu] = useState({ visible: false, x: 0, y: 0 });

  const [blockFilter, setBlockFilter] = useState("");
  const [pokemonFilter, setPokemonFilter] = useState("");

  // positions: { [index]: { x, y, z } }
  const [positions, setPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(LAYOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.positions) return parsed.positions;
      }
    } catch (err) {
      // ignore
    }
    // default positions for initial load
    const obj = {};
    for (let i = 0; i < 100; i++) {
      obj[i] = { x: defaultX(i), y: defaultY(i), z: 0 };
    }
    return obj;
  });

  // track z-order
  const zRef = useRef(1);
  function bringToFront(indexOrArray) {
    setPositions((prev) => {
      const next = { ...(prev || {}) };
      const indices = Array.isArray(indexOrArray)
        ? indexOrArray
        : [indexOrArray];
      indices.forEach((i) => {
        next[i] = { ...(next[i] || {}), z: ++zRef.current };
      });
      // persist
      try {
        localStorage.setItem(
          LAYOUT_KEY,
          JSON.stringify({
            version: 1,
            positions: next,
            updatedAt: Date.now(),
          }),
        );
      } catch (err) {}
      return next;
    });
  }

  // save positions when they change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LAYOUT_KEY,
          JSON.stringify({
            version: 1,
            positions,
            shapes,
            updatedAt: Date.now(),
          }),
        );
      } catch (err) {
        console.error("Erreur sauvegarde layout", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [positions]);

  // persist shapes too when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem(LAYOUT_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.positions = positions;
        parsed.shapes = shapes;
        parsed.updatedAt = Date.now();
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(parsed));
      } catch (err) {
        console.error("Erreur sauvegarde shapes", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [shapes, positions]);

  // -------------------------------
  // Fonction import JSON
  // -------------------------------
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // Support new pokopia_data structure: { habitats: [ { name, hab, lvl }, ... ], capacities: [...] }
        if (data && Array.isArray(data.habitats)) {
          const importedRules = data.habitats.map((h) => {
            // Find corresponding capacity for this pokemon
            const capacity = Array.isArray(data.capacities)
              ? data.capacities.find(c => c.name === h.name)
              : null;

            return {
              pattern: Array.isArray(h.hab)
                ? h.hab.slice(0, 9).concat(Array(9 - h.hab.length).fill(null))
                : Array(9).fill(null),
              pokemon: h.name || null,
              level: h.lvl ?? 0,
              ability: capacity?.ability || null,
              capacityBlocks: Array.isArray(capacity?.blocks)
                ? capacity.blocks.slice(0, 3).concat(Array(3 - capacity.blocks.length).fill(null))
                : Array(3).fill(null),
            };
          });

          setRules(importedRules);
          return;
        }

        let importedRules = Array.isArray(data.rules)
          ? data.rules
          : Array.isArray(data)
            ? data
            : null;

        if (!importedRules) throw new Error("Fichier JSON invalide");

        importedRules = importedRules.map((r) => ({
          pattern:
            r.pattern
              ?.slice(0, 9)
              .concat(Array(9 - (r.pattern?.length || 0)).fill(null)) ||
            Array(9).fill(null),
          // support ancien format (pokemons array) ou nouveau (pokemon string)
          pokemon:
            r.pokemon ||
            (Array.isArray(r.pokemons) ? r.pokemons[0] : null) ||
            null,
          level: r.level ?? r.niveau ?? 0,
        }));

        setRules(importedRules);
      } catch (err) {
        console.error(err);
        alert("Erreur en lisant le fichier JSON : " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // export rules in pokopia_data format (habitats + capacities)
  function exportJSON() {
    const habitats = rules
      .map((r) => {
        if (!r.pokemon) return null; // export only entries that have a pokemon name
        // produce hab array by removing nulls and limiting to 9
        const hab = (r.pattern || []).slice(0, 9).filter((x) => x != null);
        return { name: r.pokemon, hab, lvl: r.level ?? 0 };
      })
      .filter(Boolean);

    const capacities = rules
      .map((r) => {
        if (!r.pokemon) return null;
        if (!r.ability && (!r.capacityBlocks || r.capacityBlocks.every(b => !b))) return null;
        const blocks = (r.capacityBlocks || []).slice(0, 3).filter((x) => x != null);
        return {
          name: r.pokemon,
          ability: r.ability || "none",
          blocks
        };
      })
      .filter(Boolean);

    const out = {
      habitats,
      mega_habitats: [],
      capacities,
    };

    const json = JSON.stringify(out, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pokopia_data.json";
    a.click();
  }

  function exportLayout() {
    try {
      const json = JSON.stringify(
        { version: 1, positions, shapes, updatedAt: Date.now() },
        null,
        2,
      );
      const blob = new Blob([json], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "habitats-layout.json";
      a.click();
    } catch (err) {
      console.error(err);
      alert("Erreur export layout");
    }
  }

  function importLayout(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.positions)
          throw new Error("Format invalide: positions manquantes");
        setPositions(data.positions);
        // load shapes if present
        if (Array.isArray(data.shapes)) setShapes(data.shapes);
        localStorage.setItem(
          LAYOUT_KEY,
          JSON.stringify({
            version: 1,
            positions: data.positions,
            shapes: data.shapes || [],
            updatedAt: Date.now(),
          }),
        );
      } catch (err) {
        console.error(err);
        alert("Erreur en lisant le layout JSON : " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetLayout() {
    const obj = {};
    for (let i = 0; i < rules.length; i++)
      obj[i] = { x: defaultX(i), y: defaultY(i), z: 0 };
    setPositions(obj);
    setShapes([]);
    localStorage.setItem(
      LAYOUT_KEY,
      JSON.stringify({ version: 1, positions: obj, updatedAt: Date.now() }),
    );
  }

  const filteredBlocks = BLOCKS.filter((b) =>
    b.includes(blockFilter.toLowerCase()),
  );
  const filteredPokemons = POKEMONS.filter((p) =>
    p.includes(pokemonFilter.toLowerCase()),
  );

  // canvas size - large area to simulate 'infinite' space
  const canvasStyle = {
    width: 8000,
    height: 6000,
    position: "relative",
    background:
      "linear-gradient(90deg, #f8f9fa 0.5px, transparent 0.5px), linear-gradient(#f8f9fa 0.5px, transparent 0.5px)",
    backgroundSize: "20px 20px",
  };

  // pointer handlers for drawing shapes on the canvas
  function canvasPointerDown(e) {
    // only handle left mouse button for drawing
    if (!canvasRef.current) return;
    if (e.button !== 0) return;
    if (tool === "select" || tool === "text") return; // text handled by global click

    // only start drawing when clicking on canvas background
    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const startY = e.clientY - rect.top + canvasRef.current.scrollTop;
    drawingRef.current = { startX, startY, tool };

    function onMove(ev) {
      const curX = ev.clientX - rect.left + canvasRef.current.scrollLeft;
      const curY = ev.clientY - rect.top + canvasRef.current.scrollTop;
      drawingRef.current.endX = curX;
      drawingRef.current.endY = curY;
      // set a temporary preview shape
      const preview = {
        id: "__preview",
        type: tool === "rect" ? "rect" : "arrow",
        x1: drawingRef.current.startX,
        y1: drawingRef.current.startY,
        x2: curX,
        y2: curY,
        stroke: "#2b6cdf",
      };
      setShapes((prev) => {
        const others = prev.filter((s) => s.id !== "__preview");
        return [...others, preview];
      });
    }

    function onUp(ev) {
      const curX = ev.clientX - rect.left + canvasRef.current.scrollLeft;
      const curY = ev.clientY - rect.top + canvasRef.current.scrollTop;
      const id = "shape_" + Date.now();
      const final = {
        id,
        type: drawingRef.current.tool === "rect" ? "rect" : "arrow",
        x1: drawingRef.current.startX,
        y1: drawingRef.current.startY,
        x2: curX,
        y2: curY,
        stroke: "#2b6cdf",
      };
      setShapes((prev) =>
        prev.filter((s) => s.id !== "__preview").concat(final),
      );
      drawingRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // handle drag from palettes into card slots
  function handleDragEnd(event) {
    const { active, over } = event || {};
    if (!active || !over || !active.id || !over.id) return;

    const [type, value] = active.id.split("|");
    const overParts = over.id.split("|");
    // expected over.id format: `slot|<ruleIndex>|<slotIndex>` or similar
    const ruleIndex = parseInt(overParts[1]);
    const slotIndex = parseInt(overParts[2]);

    if (Number.isNaN(ruleIndex) || Number.isNaN(slotIndex)) return;

    const newRules = [...rules];

    if (type === "block" && slotIndex < 9) {
      newRules[ruleIndex] = {
        ...newRules[ruleIndex],
        pattern: [...(newRules[ruleIndex].pattern || Array(9).fill(null))],
      };
      newRules[ruleIndex].pattern[slotIndex] = value;
    }

    if (type === "pokemon" && slotIndex >= 9) {
      // if there were multiple pokemon slots previously, keep backward compatibility
      newRules[ruleIndex] = {
        ...newRules[ruleIndex],
        pokemons: [...(newRules[ruleIndex].pokemons || [])],
      };
      newRules[ruleIndex].pokemons[slotIndex - 9] = value;
    }

    setRules(newRules);
  }

  // Gestionnaire de clic global pour créer du texte
  const handleGlobalClick = (e) => {
    if (tool !== "text") return;
    if (!canvasRef.current) return;
    // Ignorer les clics sur les boutons et inputs
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;
    const text = prompt("Enter text");
    if (text) {
      const id = "shape_" + Date.now();
      setShapes((prev) =>
        prev.concat({
          id,
          type: "textbox",
          x1: x,
          y1: y,
          text,
        }),
      );
    }
    setTool("select");
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Bandeau fixe en haut pour les outils */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f5f5f5',
        borderBottom: '2px solid #ccc',
        padding: '10px 20px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        zIndex: 10000,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 'bold', marginRight: 10 }}>Outils:</span>
        <button
          onClick={() => setTool("select")}
          className={tool === "select" ? "active" : ""}
        >
          Select
        </button>
        <button
          onClick={() => setTool("rect")}
          className={tool === "rect" ? "active" : ""}
        >
          Rect
        </button>
        <button
          onClick={() => setTool("arrow")}
          className={tool === "arrow" ? "active" : ""}
        >
          Arrow
        </button>
        <button
          onClick={() => setTool("text")}
          className={tool === "text" ? "active" : ""}
        >
          Text
        </button>
        <button
          onClick={() => {
            setShapes([]);
          }}
        >
          Clear shapes
        </button>

        <div style={{ borderLeft: '2px solid #ccc', height: 30, marginLeft: 10, marginRight: 10 }}></div>

        <button onClick={exportJSON}>Export JSON</button>
        <button onClick={exportLayout}>Export Layout</button>

        <label htmlFor="import-json-file" style={{
          cursor: "pointer",
          padding: '6px 12px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'inline-block',
          fontSize: '14px',
        }}>
          Import JSON
        </label>
        <input
          id="import-json-file"
          type="file"
          accept=".json"
          onChange={importJSON}
          style={{ display: "none" }}
        />

        <label htmlFor="import-layout-file" style={{
          cursor: "pointer",
          padding: '6px 12px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'inline-block',
          fontSize: '14px',
        }}>
          Import Layout
        </label>
        <input
          id="import-layout-file"
          type="file"
          accept=".json"
          onChange={importLayout}
          style={{ display: "none" }}
        />

        <button onClick={resetLayout}>Reset Layout</button>
      </div>

      <div className="app" style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, display: "flex", gap: 0, overflow: 'hidden' }} onClick={handleGlobalClick}>
        <div
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            position: "relative",
            cursor:
              tool === "select"
                ? "default"
                : tool === "text"
                  ? "text"
                  : "crosshair",
          }}
          onPointerDown={(e) => {
              // left click: clear selection if outside card and possibly start drawing
              if (e.button === 0) {
                try {
                  const el = e.target;
                  if (!el || !el.closest || !el.closest(".ruleCard")) {
                    setSelected([]);
                  }
                } catch (err) {
                  setSelected([]);
                }
                // if tool is drawing, start drawing
                canvasPointerDown(e);
              }
              // right click handled by onContextMenu below
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              // open canvas tool menu only when right-clicking on background (not on cards or shapes)
              const el = e.target;
              if (el && el.closest && el.closest(".ruleCard")) return;
              // close any shape menu
              setShapeMenu({ visible: false, x: 0, y: 0, shapeId: null });
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
              const y = e.clientY - rect.top + canvasRef.current.scrollTop;
              setCanvasMenu({ visible: true, x, y });
            }}
          >
            <div style={canvasStyle}>
              {/* shapes layer */}
              <ShapesLayer
                shapes={shapes}
                onShapeContext={(shape, e) => {
                  // open menu at pointer location
                  const canvasRect = canvasRef.current?.getBoundingClientRect();
                  const x = e.clientX - (canvasRect?.left || 0);
                  const y = e.clientY - (canvasRect?.top || 0);
                  setShapeMenu({ visible: true, x, y, shapeId: shape.id });
                }}
              />

              {rules.map((rule, rIndex) => (
                <RuleCard
                  key={rIndex}
                  index={rIndex}
                  rule={rule}
                  positions={positions}
                  setPositions={setPositions}
                  bringToFront={bringToFront}
                  rules={rules}
                  setRules={setRules}
                  selected={selected}
                  setSelected={setSelected}
                  pokemonSuggestions={filteredPokemons}
                  blockSuggestions={filteredBlocks}
                />
              ))}
              {/* context menu for shapes */}
              {shapeMenu.visible && (
                <div
                  style={{
                    position: "absolute",
                    left: shapeMenu.x,
                    top: shapeMenu.y,
                    background: "#fff",
                    border: "1px solid #ccc",
                    zIndex: 9999,
                    padding: 6,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <button
                      onClick={() => {
                        // delete shape
                        setShapes((prev) =>
                          prev.filter((s) => s.id !== shapeMenu.shapeId),
                        );
                        setShapeMenu({
                          visible: false,
                          x: 0,
                          y: 0,
                          shapeId: null,
                        });
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        // edit text: find shape and prompt new text
                        const sh = shapes.find(
                          (s) => s.id === shapeMenu.shapeId,
                        );
                        if (sh && (sh.type === "text" || sh.type === "textbox")) {
                          const newText = prompt("Edit text", sh.text || "");
                          if (newText !== null)
                            setShapes((prev) =>
                              prev.map((s) =>
                                s.id === sh.id ? { ...s, text: newText } : s,
                              ),
                            );
                        } else if (sh) {
                          // convert shape to text at its midpoint
                          const midX = Math.round(
                            ((sh.x1 || sh.x) + (sh.x2 || sh.x)) / 2,
                          );
                          const midY = Math.round(
                            ((sh.y1 || sh.y) + (sh.y2 || sh.y)) / 2,
                          );
                          const text = prompt("Enter text");
                          if (text)
                            setShapes((prev) =>
                              prev.concat({
                                id: "shape_" + Date.now(),
                                type: "textbox",
                                x1: midX,
                                y1: midY,
                                text,
                              }),
                            );
                        }
                        setShapeMenu({
                          visible: false,
                          x: 0,
                          y: 0,
                          shapeId: null,
                        });
                      }}
                    >
                      Edit Text
                    </button>
                    <button
                      onClick={() =>
                        setShapeMenu({
                          visible: false,
                          x: 0,
                          y: 0,
                          shapeId: null,
                        })
                      }
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              {/* canvas context menu for tool selection */}
              {canvasMenu.visible && (
                <div
                  style={{
                    position: "absolute",
                    left: canvasMenu.x,
                    top: canvasMenu.y,
                    background: "#fff",
                    border: "1px solid #ccc",
                    zIndex: 9999,
                    padding: 6,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <button
                      onClick={() => {
                        setTool("select");
                        setCanvasMenu({ visible: false, x: 0, y: 0 });
                      }}
                    >
                      Select
                    </button>
                    <button
                      onClick={() => {
                        setTool("rect");
                        setCanvasMenu({ visible: false, x: 0, y: 0 });
                      }}
                    >
                      Rect
                    </button>
                    <button
                      onClick={() => {
                        setTool("arrow");
                        setCanvasMenu({ visible: false, x: 0, y: 0 });
                      }}
                    >
                      Arrow
                    </button>
                    <button
                      onClick={() => {
                        setTool("text");
                        setCanvasMenu({ visible: false, x: 0, y: 0 });
                      }}
                    >
                      Text
                    </button>
                    <button
                      onClick={() =>
                        setCanvasMenu({ visible: false, x: 0, y: 0 })
                      }
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </DndContext>
  );
}
