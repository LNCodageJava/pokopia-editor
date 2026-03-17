import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import "./App.css";

const BLOCKS = [
  "minecraft:air",
  "minecraft:stone",
  "minecraft:granite",
  "minecraft:polished_granite",
  "minecraft:diorite",
  "minecraft:polished_diorite",
  "minecraft:andesite",
  "minecraft:polished_andesite",
  "minecraft:grass_block",
  "minecraft:dirt",
  "minecraft:coarse_dirt",
  "minecraft:podzol",
  "minecraft:crimson_nylium",
  "minecraft:warped_nylium",
  "minecraft:crimson_roots",
  "minecraft:warped_roots",
  "minecraft:mycelium",
  "minecraft:sand",
  "minecraft:red_sand",
  "minecraft:gravel",
  "minecraft:cobblestone",
  "minecraft:oak_planks",
  "minecraft:spruce_planks",
  "minecraft:birch_planks",
  "minecraft:jungle_planks",
  "minecraft:acacia_planks",
  "minecraft:dark_oak_planks",
  "minecraft:crimson_planks",
  "minecraft:warped_planks",
  "minecraft:oak_log",
  "minecraft:spruce_log",
  "minecraft:birch_log",
  "minecraft:jungle_log",
  "minecraft:acacia_log",
  "minecraft:dark_oak_log",
  "minecraft:crimson_stem",
  "minecraft:warped_stem",
  "minecraft:oak_leaves",
  "minecraft:spruce_leaves",
  "minecraft:birch_leaves",
  "minecraft:jungle_leaves",
  "minecraft:acacia_leaves",
  "minecraft:dark_oak_leaves",
  "minecraft:sponge",
  "minecraft:wet_sponge",
  "minecraft:glass",
  "minecraft:lapis_block",
  "minecraft:lapis_ore",
  "minecraft:coal_ore",
  "minecraft:iron_ore",
  "minecraft:copper_ore",
  "minecraft:gold_ore",
  "minecraft:redstone_ore",
  "minecraft:diamond_ore",
  "minecraft:emerald_ore",
  "minecraft:nether_gold_ore",
  "minecraft:ancient_debris",
  "minecraft:deepslate",
  "minecraft:copper_block",
  "minecraft:iron_block",
  "minecraft:gold_block",
  "minecraft:diamond_block",
  "minecraft:emerald_block",
  "minecraft:obsidian",
  "minecraft:end_stone",
  "minecraft:bedrock",
  "minecraft:stone_bricks",
  "minecraft:mossy_stone_bricks",
  "minecraft:cracked_stone_bricks",
  "minecraft:chiseled_stone_bricks",
  "minecraft:sandstone",
  "minecraft:cut_sandstone",
  "minecraft:chiseled_sandstone",
  "minecraft:red_sandstone",
  "minecraft:cut_red_sandstone",
  "minecraft:chiseled_red_sandstone",
  "minecraft:brick_block",
  "minecraft:clay",
  "minecraft:terracotta",
  "minecraft:white_terracotta",
  "minecraft:orange_terracotta",
  "minecraft:magenta_terracotta",
  "minecraft:light_blue_terracotta",
  "minecraft:yellow_terracotta",
  "minecraft:lime_terracotta",
  "minecraft:pink_terracotta",
  "minecraft:gray_terracotta",
  "minecraft:light_gray_terracotta",
  "minecraft:cyan_terracotta",
  "minecraft:purple_terracotta",
  "minecraft:blue_terracotta",
  "minecraft:brown_terracotta",
  "minecraft:green_terracotta",
  "minecraft:red_terracotta",
  "minecraft:black_terracotta",
  "minecraft:bookshelf",
  "minecraft:crafting_table",
  "minecraft:furnace",
  "minecraft:blast_furnace",
  "minecraft:smoker",
  "minecraft:chest",
  "minecraft:trapped_chest",
  "minecraft:hopper",
  "minecraft:anvil",
  "minecraft:enchanting_table",
  "minecraft:beacon",
  "minecraft:jukebox",
  "minecraft:dispenser",
  "minecraft:dropper",
  "minecraft:observer",
  "minecraft:piston",
  "minecraft:sticky_piston",
  "minecraft:sticky_piston_head",
  "minecraft:lever",
  "minecraft:rail",
  "minecraft:activator_rail",
  "minecraft:detector_rail",
  "minecraft:powered_rail",
  "minecraft:hay_block",
  "minecraft:slime_block",
  "minecraft:snow",
  "minecraft:snow_block",
  "minecraft:ice",
  "minecraft:packed_ice",
  "minecraft:blue_ice",
  "minecraft:water",
  "minecraft:lava",
  "minecraft:sea_lantern",
  "minecraft:glowstone",
  "minecraft:shroomlight",
  "minecraft:campfire",
  "minecraft:soul_campfire",
  "minecraft:lantern",
  "minecraft:soul_lantern",
  "minecraft:torch",
  "minecraft:soul_torch",
  "minecraft:cobblestone_wall",
  "minecraft:andesite_wall",
  "minecraft:granite_wall",
  "minecraft:diorite_wall",
  "minecraft:mossy_cobblestone_wall",
  "minecraft:brick_wall",
  "minecraft:blackstone_wall",
  "minecraft:nether_brick_wall",
  "minecraft:red_nether_brick_wall",
  // ajoute davantage si besoin
];

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
  if (id.startsWith("minecraft:")) {
    const name = id.split(":")[1];
    return `/blocks/${name}.png`;
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
      <img src={getImage(label)} alt={label} className="img" />
      <div className="label">{label}</div> {/* <-- Nom sous l'image */}
    </div>
  );
}

function Slot({ id, value }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="slot">
      {value && <img src={getImage(value)} alt={value} className="img" />}
    </div>
  );
}

export default function App() {
  const createRule = () => ({
    pattern: Array(9).fill(null),
    pokemons: Array(5).fill(null),
  });

  const [rules, setRules] = useState(Array(100).fill(null).map(createRule));

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
          pokemons:
            r.pokemons
              ?.slice(0, 5)
              .concat(Array(5 - (r.pokemons?.length || 0)).fill(null)) ||
            Array(5).fill(null),
        }));

        setRules(importedRules); // ✅ ici setRules existe
      } catch (err) {
        console.error(err);
        alert("Erreur en lisant le fichier JSON : " + err.message);
      }
    };
    reader.readAsText(file);
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const data = active.id.split("|");
    const type = data[0];
    const value = data[1];

    const overData = over.id.split("|");
    const ruleIndex = parseInt(overData[1]);
    const slotIndex = parseInt(overData[2]);

    const newRules = [...rules];

    if (type === "block" && slotIndex < 9) {
      newRules[ruleIndex].pattern[slotIndex] = value;
    }

    if (type === "pokemon" && slotIndex >= 9) {
      newRules[ruleIndex].pokemons[slotIndex - 9] = value;
    }

    setRules(newRules);
  }

  function exportJSON() {
    const json = JSON.stringify({ rules }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "habitats.json";
    a.click();
  }

  // Juste après exportJSON(), dans le composant App
  const [blockFilter, setBlockFilter] = useState("");
  const [pokemonFilter, setPokemonFilter] = useState("");

  // Blocs et Pokémon filtrés
  const filteredBlocks = BLOCKS.filter((b) =>
    b.includes(blockFilter.toLowerCase()),
  );
  const filteredPokemons = POKEMONS.filter((p) =>
    p.includes(pokemonFilter.toLowerCase()),
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app">
        <h2>Palette Blocs</h2>
        <input
          type="text"
          placeholder="Filtrer blocs..."
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          style={{ marginBottom: 5, width: "100%" }}
        />
        <div className="palette">
          {filteredBlocks.map((b) => (
            <Draggable key={b} id={`block|${b}`} label={b} />
          ))}
        </div>

        <h2>Palette Pokémon</h2>
        <input
          type="text"
          placeholder="Filtrer Pokémon..."
          value={pokemonFilter}
          onChange={(e) => setPokemonFilter(e.target.value)}
          style={{ marginBottom: 5, width: "100%" }}
        />
        <div className="palette">
          {filteredPokemons.map((p) => (
            <Draggable key={p} id={`pokemon|${p}`} label={p} />
          ))}
        </div>

        <div style={{ margin: "10px 0" }}>
          <button onClick={exportJSON}>Exporter JSON</button>

          {/* Import JSON */}
          <label style={{ marginLeft: 10, cursor: "pointer", color: "blue" }}>
            Importer JSON
            <input
              type="file"
              accept=".json"
              onChange={importJSON}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="rules">
          {rules.map((rule, rIndex) => (
            <div key={rIndex} className="ruleRow">
              <div className="grid">
                {rule.pattern.map((v, i) => (
                  <Slot key={i} id={`slot|${rIndex}|${i}`} value={v} />
                ))}
              </div>

              <div className="pokeSlots">
                {rule.pokemons.map((v, i) => (
                  <Slot key={i} id={`slot|${rIndex}|${i + 9}`} value={v} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}

// Juste après exportJSON(), ajoute :
