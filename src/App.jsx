import React, { useState, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import "./App.css";
import RuleCard from "./components/RuleCard";
import RuleCardEditor from "./components/RuleCardEditor";
import MegaHabitatCard from "./components/MegaHabitatCard";
import MegaHabitatEditor from "./components/MegaHabitatEditor";
import PokemonWeightCard from "./components/PokemonWeightCard";
import ShapesLayer from "./components/ShapesLayer";
import ImageWithFallback from "./components/ImageWithFallback";

const LAYOUT_KEY = "pokopia.rules.layout.v1";
const MEGA_LAYOUT_KEY = "pokopia.megahabitats.layout.v1";
const RULES_DATA_KEY = "pokopia.rules.data.v1";
const MEGA_DATA_KEY = "pokopia.megahabitats.data.v1";
const POKEMON_WEIGHT_DATA_KEY = "pokopia.pokemonweight.data.v1";
const POKEMON_WEIGHT_LAYOUT_KEY = "pokopia.pokemonweight.layout.v1";

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
    "ss",
    "bulbasaur", "ivysaur", "venusaur", "charmander", "charmeleon", "charizard",
    "squirtle", "wartortle", "blastoise", "caterpie", "metapod", "butterfree",
    "weedle", "kakuna", "beedrill", "pidgey", "pidgeotto", "pidgeot", "rattata",
    "raticate", "spearow", "fearow", "ekans", "arbok", "pikachu", "raichu",
    "sandshrew", "sandslash", "nidoran♀", "nidorina", "nidoqueen", "nidoran♂",
    "nidorino", "nidoking", "clefairy", "clefable", "vulpix", "ninetales",
    "jigglypuff", "wigglytuff", "zubat", "golbat", "oddish", "gloom", "vileplume",
    "paras", "parasect", "venonat", "venomoth", "diglett", "dugtrio", "meowth",
    "persian", "psyduck", "golduck", "mankey", "primeape", "growlithe", "arcanine",
    "poliwag", "poliwhirl", "poliwrath", "abra", "kadabra", "alakazam", "machop",
    "machoke", "machamp", "bellsprout", "weepinbell", "victreebel", "tentacool",
    "tentacruel", "geodude", "graveler", "golem", "ponyta", "rapidash", "slowpoke",
    "slowbro", "magnemite", "magneton", "farfetchd", "doduo", "dodrio", "seel",
    "dewgong", "grimer", "muk", "shellder", "cloyster", "gastly", "haunter",
    "gengar", "onix", "drowzee", "hypno", "krabby", "kingler", "voltorb",
    "electrode", "exeggcute", "exeggutor", "cubone", "marowak", "hitmonlee",
    "hitmonchan", "lickitung", "koffing", "weezing", "rhyhorn", "rhydon",
    "chansey", "tangela", "kangaskhan", "horsea", "seadra", "goldeen", "seaking",
    "staryu", "starmie", "mr. mime", "mr. mime [galarian]", "scyther", "jynx",
    "electabuzz", "magmar", "pinsir", "tauros", "magikarp", "gyarados", "lapras",
    "ditto", "eevee", "vaporeon", "jolteon", "flareon", "porygon", "omanyte",
    "omastar", "kabuto", "kabutops", "aerodactyl", "snorlax", "dratini",
    "dragonair", "dragonite", "chikorita", "bayleef", "meganium", "cyndaquil",
    "quilava", "typhlosion", "totodile", "croconaw", "feraligatr", "sentret",
    "furret", "hoothoot", "noctowl", "ledyba", "ledian", "spinarak", "ariados",
    "crobat", "chinchou", "lanturn", "pichu", "cleffa", "igglybuff", "togepi",
    "togetic", "natu", "xatu", "mareep", "flaaffy", "ampharos", "bellossom",
    "marill", "azumarill", "sudowoodo", "politoed", "hoppip", "skiploom",
    "jumpluff", "aipom", "sunkern", "sunflora", "yanma", "wooper", "quagsire",
    "espeon", "umbreon", "murkrow", "slowking", "misdreavus", "unown",
    "wobbuffet", "girafarig", "pineco", "forretress", "dunsparce", "gligar",
    "steelix", "snubbull", "granbull", "qwilfish", "scizor", "shuckle",
    "heracross", "sneasel", "teddiursa", "ursaring", "slugma", "magcargo",
    "swinub", "piloswine", "corsola", "remoraid", "optillery", "delibird",
    "mantine", "skarmory", "houndour", "houndoom", "kingdra", "phanpy",
    "donphan", "porygon2", "stantler", "smeargle", "tyrogue", "hitmontop",
    "smoochum", "elekid", "magby", "miltank", "blissey", "larvitar", "pupitar",
    "tyranitar", "treecko", "grovyle", "sceptile", "torchic", "combusken",
    "blaziken", "mudkip", "marshtomp", "swampert", "poochyena", "mightyena",
    "zigzagoon", "linoone", "lotad", "lombre", "ludicolo", "seedot", "nuzleaf",
    "shiftry", "taillow", "swellow", "wingull", "pelipper", "ralts", "kirlia",
    "gardevoir", "surskit", "masquerain", "shroomish", "breloom", "slakoth",
    "vigoroth", "slaking", "nincada", "ninjask", "shedinja", "whismur",
    "loudred", "exploud", "makuhita", "hariyama", "azurill", "nosepass",
    "sableye", "mawile", "aron", "lairon", "aggron", "meditite", "medicham",
    "electrike", "manectric", "plusle", "minun", "volbeat", "illumise",
    "roselia", "carvanha", "sharpedo", "wailmer", "wailord", "numel", "camerupt",
    "torkoal", "spoink", "grumpig", "spinda", "trapinch", "vibrava", "flygon",
    "cacnea", "cacturne", "swablu", "altaria", "lunatone", "solrock", "barboach",
    "whiscash", "corphish", "crawdaunt", "baltoy", "claydol", "lileep",
    "cradily", "anorith", "armaldo", "feebas", "milotic", "kecleon", "shuppet",
    "banette", "duskull", "dusclops", "tropius", "chimecho", "absol", "wynaut",
    "snorunt", "glalie", "spheal", "sealeo", "walrein", "clamperl", "huntail",
    "gorebyss", "relicanth", "luvdisc", "bagon", "shelgon", "salamence",
    "beldum", "metang", "metagross", "turtwig", "grotle", "torterra", "chimchar",
    "monferno", "infernape", "piplup", "prinplup", "empoleon", "starly",
    "staravia", "staraptor", "bidoof", "bibarel", "kricketot", "kricketune",
    "shinx", "luxio", "luxray", "budew", "roserade", "cranidos", "rampardos",
    "shieldon", "bastiodon", "combee", "vespiquen", "pachirisu", "buizel",
    "floatzel", "shellos", "gastrodon", "ambipom", "drifloon", "drifblim",
    "buneary", "lopunny", "mismagius", "honchkrow", "glameow", "purugly",
    "chingling", "bronzor", "bronzong", "bonsly", "mime jr.", "mime jr.",
    "happiny", "chatot", "spiritomb", "gible", "gabite", "garchomp", "munchlax",
    "riolu", "lucario", "hippopotas", "hippowdon", "skorupi", "drapion",
    "croagunk", "toxicroak", "carnivine", "finneon", "lumineon", "mantyke",
    "weavile", "magnezone", "lickilicky", "rhyperior", "tangrowth", "electivire",
    "magmortar", "togekiss", "yanmega", "leafeon", "glaceon", "gliscor",
    "mamoswine", "porygon-z", "gallade", "probopass", "dusknoir", "froslass",
    "snivy", "servine", "serperior", "tepig", "pignite", "emboar", "oshawott",
    "dewott", "samurott", "patrat", "watchog", "lillipup", "herdier",
    "stoutland", "purrloin", "liepard", "pansage", "simisage", "pansear",
    "simisear", "panpour", "simipour", "munna", "musharna", "blitzle",
    "zebstrika", "roggenrola", "boldore", "gigalith", "woobat", "swoobat",
    "drilbur", "excadrill", "timburr", "gurdurr", "conkeldurr", "throh", "sawk",
    "sewaddle", "swadloon", "leavanny", "venipede", "whirlipede", "scolipede",
    "cottonee", "whimsicott", "petilil", "lilligant", "basculin", "sandile",
    "krokorok", "krookodile", "darumaka", "darmanitan", "maractus", "dwebble",
    "crustle", "scraggy", "scrafty", "sigilyph", "yamask", "cofagrigus",
    "tirtouga", "carracosta", "archen", "archeops", "trubbish", "garbodor",
    "zorua", "zorua [hisuian]", "zoroark", "zoroark [hisuian]", "minccino",
    "cinccino", "gothita", "gothorita", "gothitelle", "solosis", "duosion",
    "reuniclus", "ducklett", "swanna", "vanillite", "vanillish", "vanilluxe",
    "deerling", "sawsbuck", "emolga", "karrablast", "escavalier", "foongus",
    "amoonguss", "frillish", "jellicent", "alomomola", "joltik", "galvantula",
    "ferroseed", "ferrothorn", "klink", "klang", "klinklang", "tynamo",
    "eelektrik", "eelektross", "elgyem", "beheeyem", "litwick", "lampent",
    "chandelure", "axew", "fraxure", "haxorus", "cubchoo", "beantic",
    "cryogonal", "shelmet", "accelgor", "stunfisk", "mienfoo", "mienshao",
    "druddigon", "golett", "golurk", "bouffalant", "rufflet", "braviary",
    "heatmor", "durant", "deino", "zweilous", "hydreigon", "larvesta",
    "volcarona", "chespin", "quilladin", "chesnaught", "fennekin", "braixen",
    "delphox", "froakie", "frogadier", "greninja", "bunnelby", "diggersby",
    "fletchling", "fletchinder", "talonflame", "scatterbug", "spewpa",
    "vivillon", "litleo", "pyroar", "flabebe", "floette", "florges", "skiddo",
    "gogoat", "furfrou", "espurr", "meowstic", "honedge", "doublade",
    "aegislash", "spritzee", "aromatisse", "swirlix", "slurpuff", "inkay",
    "malamar", "binacle", "barbaracle", "skrelp", "dragalge", "clauncher",
    "clawitzer", "tyrunt", "tyrantrum", "amaura", "aurorus", "sylveon",
    "hawlucha", "dedenne", "carbink", "goomy", "sliggoo", "goodra", "klefki",
    "phantump", "trevenant", "pumpkaboo", "gourgeist", "bergmite", "avalugg",
    "noibat", "noivern", "rowlet", "dartrix", "decidueye", "litten", "torracat",
    "incineroar", "popplio", "brionne", "primarina", "pikipek", "trumbeak",
    "toucannon", "yungoos", "gumshoos", "crabrawler", "crabominable", "cutiefly",
    "ribombee", "wishiwashi", "mareanie", "toxapex", "mudbray", "mudsdale",
    "dewpider", "araquanid", "fomantis", "lurantis", "morelull", "shiinotic",
    "salandit", "salazzle", "stufful", "bewear", "bounsweet", "steenee",
    "tsareena", "comfey", "wimpod", "golisopod", "sandygast", "palossand",
    "pyukumuku", "komala", "turtonator", "togedemaru", "mimikyu", "bruxish",
    "drampa", "dhelmise", "jangmo-o", "hakamo-o", "kommo-o", "grookey",
    "thwackey", "rillaboom", "scorbunny", "raboot", "cinderace", "sobble",
    "drizzile", "inteleon", "skwovet", "greedent", "rookidee", "corvisquire",
    "corviknight", "nickit", "thievul", "gossifleur", "eldegoss", "wooloo",
    "dubwool", "chewtle", "drednaw", "yamper", "boltund", "silicobra",
    "sandaconda", "cramorant", "arrokuda", "barraskewda", "toxel", "toxtricity",
    "sizzlipede", "centiskorch", "clobbopus", "grapploct", "sinistea",
    "polteageist", "hatenna", "hattrem", "hatterene", "impidimp", "morgrem",
    "grimmsnarl", "obstagoon", "perrserker", "cursola", "sirfetch'd", "mr. rime",
    "milcery", "alcremie", "falinks", "pincurchin", "stonjourner", "eiscue",
    "morpeko", "cufant", "copperajah", "dreepy", "drakloak", "dragapult",
    "wyrdeer", "kleavor", "ursaluna", "basculegion", "sneasler", "overqwil",
    "sprigatito", "floragato", "meowscarada", "fuecoco", "crocalor",
    "skeledirge", "quaxly", "quaxwell", "quaquaval", "lechonk", "oinkologne",
    "tarountula", "spidops", "tandemaus", "maushold", "fidough", "dachsbun",
    "smoliv", "dolliv", "arboliva", "squawkabilly", "nacli", "naclstack",
    "garganacl", "charcadet", "armarouge", "ceruledge", "tadbulb", "bellibolt",
    "wattrel", "kilowattrel", "maschiff", "mabosstiff", "shroodle", "grafaiai",
    "bramblin", "brambleghast", "toedscool", "toedscruel", "klawf", "capsakid",
    "scovillain", "rellor", "rabsca", "flittle", "espathra", "tinkatink",
    "tinkatuff", "tinkaton", "wiglett", "wugtrio", "finizen", "palafin",
    "varoom", "revavroom", "cyclizar", "orthworm", "glimmet", "glimmora",
    "flamigo", "cetoddle", "cetitan", "veluza", "dondozo", "tatsugiri",
    "annihilape", "clodsire", "farigiraf", "dudunsparce", "gimmighoul", "gholdengo",
    "poltchageist", "sinistcha"
  ];

const evolutions = [
    ["bidoof","bibarel"],
    ["chimchar","monferno"],
    ["sandshrew","sandslash"]
    ]


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

  const createMegaHabitat = () => ({
    name: "",
    block: null,
    pokemons: Array(9).fill(null),
  });

  const createPokemonWeightCard = () => ({
    pokemons: Array(6).fill(null).map(() => ({ name: null, weight: 1 })),
  });

  const [rules, setRules] = useState(() => {
    try {
      const raw = localStorage.getItem(RULES_DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {}
    return Array(100).fill(null).map(createRule);
  });

  const [megaHabitats, setMegaHabitats] = useState(() => {
    try {
      const raw = localStorage.getItem(MEGA_DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Normaliser chaque megaHabitat pour avoir exactement 9 slots pokémon
          return parsed.map(m => {
            const pokemons = Array(9).fill(null);
            if (Array.isArray(m.pokemons)) {
              m.pokemons.forEach((p, i) => {
                if (i < 9) pokemons[i] = p;
              });
            }
            return { ...m, pokemons };
          });
        }
      }
    } catch (err) {}
    return [];
  });

  const [pokemonWeightCards, setPokemonWeightCards] = useState(() => {
    try {
      const raw = localStorage.getItem(POKEMON_WEIGHT_DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {}
    return [];
  });

  // selected cards (array of indices)
  const [selected, setSelected] = useState([]);
  // editing state: { type: 'rule'|'mega'|'pokemonweight', index: number } or null
  const [editingCard, setEditingCard] = useState(null);
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

  // positions for megahabitats: { [index]: { x, y, z } }
  const [megaPositions, setMegaPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(MEGA_LAYOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.positions) return parsed.positions;
      }
    } catch (err) {}
    return {};
  });

  // positions for pokemon weight cards: { [index]: { x, y, z } }
  const [pokemonWeightPositions, setPokemonWeightPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(POKEMON_WEIGHT_LAYOUT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.positions) return parsed.positions;
      }
    } catch (err) {}
    return {};
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

  // save rules data when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(RULES_DATA_KEY, JSON.stringify(rules));
      } catch (err) {
        console.error("Erreur sauvegarde rules", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [rules]);

  // save megahabitats data when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(MEGA_DATA_KEY, JSON.stringify(megaHabitats));
      } catch (err) {
        console.error("Erreur sauvegarde megahabitats", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [megaHabitats]);

  // save pokemon weight cards data when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(POKEMON_WEIGHT_DATA_KEY, JSON.stringify(pokemonWeightCards));
      } catch (err) {
        console.error("Erreur sauvegarde pokemon weight cards", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [pokemonWeightCards]);

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

  // save megahabitats positions when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          MEGA_LAYOUT_KEY,
          JSON.stringify({
            version: 1,
            positions: megaPositions,
            updatedAt: Date.now(),
          }),
        );
      } catch (err) {
        console.error("Erreur sauvegarde mega layout", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [megaPositions]);

  // save pokemon weight positions when they change
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          POKEMON_WEIGHT_LAYOUT_KEY,
          JSON.stringify({
            version: 1,
            positions: pokemonWeightPositions,
            updatedAt: Date.now(),
          }),
        );
      } catch (err) {
        console.error("Erreur sauvegarde pokemon weight layout", err);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [pokemonWeightPositions]);

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
  // Fonction pour générer les cartes pokémon/poids depuis les habitats
  // -------------------------------
  function generateOtherPokemons() {
    const reader = new FileReader();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (!data || !Array.isArray(data.habitats)) {
            alert("Fichier JSON invalide : structure 'habitats' manquante");
            return;
          }

          const newCards = [...pokemonWeightCards];
          const newPositions = { ...pokemonWeightPositions };
          const existingPokemonCards = new Set(
            pokemonWeightCards.map(c => c.pokemons && c.pokemons[0]?.name).filter(Boolean)
          );

          // Position de départ à droite (x = 3000)
          let currentIndex = pokemonWeightCards.length;
          const startX = 6000;
          const startY = 20;

          data.habitats.forEach(habitat => {
            if (!habitat.name) return;

            // Vérifier si une carte existe déjà pour ce pokémon (basé sur habitat.name)
            if (existingPokemonCards.has(habitat.name)) return;

            // Créer un tableau de 6 emplacements
            const cardPokemons = Array(6).fill(null).map(() => ({ name: null, weight: 1 }));

            // Si l'habitat a une clé pokemons, remplir les emplacements
            if (habitat.pokemons && habitat.pokemons.length > 0) {
              habitat.pokemons.forEach((p, i) => {
                if (i < 6) {
                  cardPokemons[i] = {
                    name: p.name || null,
                    weight: p.weight || 1
                  };
                }
              });
            } else {
              // Sinon, juste le pokémon principal dans le premier emplacement
              cardPokemons[0] = {
                name: habitat.name,
                weight: 1
              };
            }

            const newCard = {
              pokemons: cardPokemons
            };

            // Position en grille à partir de startX
            newPositions[currentIndex] = {
              x: startX + (currentIndex % 5) * 450,
              y: startY + Math.floor(currentIndex / 5) * 280,
              z: ++zRef.current
            };

            newCards.push(newCard);
            existingPokemonCards.add(habitat.name);
            currentIndex++;
          });

          setPokemonWeightCards(newCards);
          setPokemonWeightPositions(newPositions);
        } catch (err) {
          console.error(err);
          alert("Erreur en lisant le fichier JSON : " + err.message);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  // -------------------------------
  // Fonction import JSON
  // -------------------------------
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      e.target.value = null; // Reset input pour permettre de réimporter le même fichier
      try {
        const data = JSON.parse(event.target.result);

        // Support new pokopia_data structure: { habitats: [ { name, hab, lvl }, ... ], capacities: [...] }
        if (data && Array.isArray(data.habitats)) {
          // Créer un Map des habitats pour accès rapide
          const habitatMap = new Map();
          data.habitats.forEach(h => {
            habitatMap.set(h.name, h);
          });

          // Créer un Map des capacités
          const capacityMap = new Map();
          if (Array.isArray(data.capacities)) {
            data.capacities.forEach(c => {
              capacityMap.set(c.name, c);
            });
          }

          // Créer les règles depuis les habitats
          const rulesFromHabitats = data.habitats.map((h) => {
            const capacity = capacityMap.get(h.name);
            const rule = {
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
            // Importer itemPrice et maxValue pour stardust
            if (capacity?.ability === "stardust") {
              if (capacity.itemPrice !== undefined) {
                rule.itemPrice = capacity.itemPrice;
              }
              if (capacity.maxValue !== undefined) {
                rule.maxValue = capacity.maxValue;
              }
            }
            return rule;
          });

          // Créer les cartes pokémon/poids depuis les habitats
          const importedPokemonWeightCards = data.habitats
            .filter(h => h.pokemons && h.pokemons.length > 0)
            .map(h => {
              // Créer un tableau de 6 emplacements
              const cardPokemons = Array(6).fill(null).map(() => ({ name: null, weight: 1 }));

              // Remplir avec les pokémons de l'habitat
              h.pokemons.forEach((p, i) => {
                if (i < 6) {
                  cardPokemons[i] = {
                    name: p.name || null,
                    weight: p.weight || 1
                  };
                }
              });

              return { pokemons: cardPokemons };
            });

          // Trouver les Pokémon qui ont seulement des capacités mais pas d'habitat
          const rulesFromCapacitiesOnly = [];
          if (Array.isArray(data.capacities)) {
            data.capacities.forEach(c => {
              if (!habitatMap.has(c.name)) {
                // Ce Pokémon a une capacité mais pas d'habitat
                const rule = {
                  pattern: Array(9).fill(null),
                  pokemon: c.name,
                  level: 0,
                  ability: c.ability || null,
                  capacityBlocks: Array.isArray(c.blocks)
                    ? c.blocks.slice(0, 3).concat(Array(3 - c.blocks.length).fill(null))
                    : Array(3).fill(null),
                };
                // Importer itemPrice et maxValue pour stardust
                if (c.ability === "stardust") {
                  if (c.itemPrice !== undefined) {
                    rule.itemPrice = c.itemPrice;
                  }
                  if (c.maxValue !== undefined) {
                    rule.maxValue = c.maxValue;
                  }
                }
                rulesFromCapacitiesOnly.push(rule);
              }
            });
          }

          // Combiner les deux listes
          const importedRules = [...rulesFromHabitats, ...rulesFromCapacitiesOnly];

          // Import mega_habitats
          const importedMegaHabitats = [];
          if (Array.isArray(data.mega_habitats)) {
            data.mega_habitats.forEach(m => {
              // Prendre le premier bloc trouvé dans recipes ou blockList
              let block = null;

              // Support du nouveau format "recipes" et de l'ancien format "biomes" ou "blockList"
              if (Array.isArray(m.recipes) && m.recipes.length > 0) {
                // Nouveau format: prendre le premier ingrédient ou résultat
                const firstRecipe = m.recipes[0];
                if (Array.isArray(firstRecipe.ingredients) && firstRecipe.ingredients.length > 0) {
                  block = firstRecipe.ingredients[0];
                } else if (firstRecipe.result) {
                  block = firstRecipe.result;
                }
              } else {
                // Ancien format: prendre le premier bloc de la liste
                const sourceBlocks = m.blockList || m.biomes;
                if (Array.isArray(sourceBlocks) && sourceBlocks.length > 0) {
                  block = sourceBlocks[0];
                }
              }

              // Create pokemons array with 9 slots
              const pokemons = Array(9).fill(null);
              if (Array.isArray(m.pokemons)) {
                m.pokemons.slice(0, 9).forEach((p, i) => {
                  pokemons[i] = p;
                });
              }

              importedMegaHabitats.push({
                name: m.name || "",
                block,
                pokemons,
              });
            });
          }

          setRules(importedRules);
          setMegaHabitats(importedMegaHabitats);
          setPokemonWeightCards(importedPokemonWeightCards);
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
        // Déplacer le 5ème bloc (index 4) en première position
        const pattern = r.pattern || [];
        const block5 = pattern[4]; // Le 5ème bloc
        const reorderedPattern = block5
          ? [block5, ...pattern.slice(0, 4), ...pattern.slice(5, 9)]
          : pattern.slice(0, 9);
        const hab = reorderedPattern.filter((x) => x != null);

        return { name: r.pokemon, hab, lvl: r.level ?? 0 };
      })
      .filter(Boolean);

    const capacities = rules
      .map((r) => {
        if (!r.pokemon) return null;
        if (!r.ability && (!r.capacityBlocks || r.capacityBlocks.every(b => !b))) return null;
        const blocks = (r.capacityBlocks || []).slice(0, 3).filter((x) => x != null);
        const capacity = {
          name: r.pokemon,
          ability: r.ability || "none",
          blocks
        };
        // Ajouter itemPrice et maxValue pour stardust
        if (r.ability === "stardust") {
          if (r.itemPrice !== undefined && r.itemPrice !== "") {
            capacity.itemPrice = r.itemPrice;
          }
          if (r.maxValue !== undefined && r.maxValue !== "") {
            capacity.maxValue = r.maxValue;
          }
        }
        return capacity;
      })
      .filter(Boolean);

    const mega_habitats = megaHabitats
      .map((m) => {
        if (!m.name) return null; // export only entries with a name

        // Créer une recette avec un seul ingrédient si block est défini
        const recipes = [];
        if (m.block) {
          recipes.push({
            ingredients: [m.block],
            result: m.block
          });
        }

        const pokemons = (m.pokemons || []).slice(0, 9).filter((x) => x != null);
        return { name: m.name, recipes, pokemons };
      })
      .filter(Boolean);

    const out = {
      habitats,
      mega_habitats,
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

        <div style={{ borderLeft: '2px solid #ccc', height: 30, marginLeft: 10, marginRight: 10 }}></div>

        <button onClick={() => {
          const newRule = createRule();
          const newRules = [...rules, newRule];
          const newIndex = rules.length;
          setRules(newRules);
          setPositions(prev => ({
            ...prev,
            [newIndex]: { x: defaultX(newIndex), y: defaultY(newIndex), z: ++zRef.current }
          }));
        }}>
          New Rule
        </button>

        <button onClick={() => {
          const newMega = createMegaHabitat();
          const newMegaHabitats = [...megaHabitats, newMega];
          const newIndex = megaHabitats.length;
          setMegaHabitats(newMegaHabitats);
          setMegaPositions(prev => ({
            ...prev,
            [newIndex]: { x: defaultX(newIndex), y: defaultY(newIndex), z: ++zRef.current }
          }));
        }}>
          New MegaHabitat
        </button>

        <div style={{ borderLeft: '2px solid #ccc', height: 30, marginLeft: 10, marginRight: 10 }}></div>

        <button onClick={() => {
          const newCard = createPokemonWeightCard();
          const newCards = [...pokemonWeightCards, newCard];
          const newIndex = pokemonWeightCards.length;
          setPokemonWeightCards(newCards);
          setPokemonWeightPositions(prev => ({
            ...prev,
            [newIndex]: { x: defaultX(newIndex), y: defaultY(newIndex), z: ++zRef.current }
          }));
        }}>
          New Pokemon Weight Card
        </button>

        <button onClick={generateOtherPokemons}>
          Generate Other Pokemons
        </button>
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
                  key={`rule-${rIndex}`}
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
                  editingCard={editingCard}
                  setEditingCard={setEditingCard}
                />
              ))}

              {megaHabitats.map((mega, mIndex) => (
                <MegaHabitatCard
                  key={`mega-${mIndex}`}
                  index={mIndex}
                  megaHabitat={mega}
                  positions={megaPositions}
                  setPositions={setMegaPositions}
                  bringToFront={(idx) => {
                    setMegaPositions((prev) => {
                      const next = { ...(prev || {}) };
                      next[idx] = { ...(next[idx] || {}), z: ++zRef.current };
                      return next;
                    });
                  }}
                  selected={selected}
                  setSelected={setSelected}
                  editingCard={editingCard}
                  setEditingCard={setEditingCard}
                />
              ))}

              {pokemonWeightCards.map((card, pwIndex) => (
                <PokemonWeightCard
                  key={`pokemonweight-${pwIndex}`}
                  index={pwIndex}
                  card={card}
                  positions={pokemonWeightPositions}
                  setPositions={setPokemonWeightPositions}
                  bringToFront={(idx) => {
                    setPokemonWeightPositions((prev) => {
                      const next = { ...(prev || {}) };
                      const indices = Array.isArray(idx) ? idx : [idx];
                      indices.forEach((i) => {
                        next[i] = { ...(next[i] || {}), z: ++zRef.current };
                      });
                      return next;
                    });
                  }}
                  cards={pokemonWeightCards}
                  setCards={setPokemonWeightCards}
                  pokemonSuggestions={filteredPokemons}
                  selected={selected}
                  setSelected={setSelected}
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

      {/* Modal d'édition global */}
      {editingCard && editingCard.type === 'rule' && (
        <RuleCardEditor
          rule={rules[editingCard.index]}
          index={editingCard.index}
          onClose={() => setEditingCard(null)}
          rules={rules}
          setRules={setRules}
          pokemonSuggestions={filteredPokemons}
          blockSuggestions={filteredBlocks}
        />
      )}
      {editingCard && editingCard.type === 'mega' && (
        <MegaHabitatEditor
          megaHabitat={megaHabitats[editingCard.index]}
          index={editingCard.index}
          onClose={() => setEditingCard(null)}
          megaHabitats={megaHabitats}
          setMegaHabitats={setMegaHabitats}
          pokemonSuggestions={filteredPokemons}
          blockSuggestions={filteredBlocks}
        />
      )}
    </DndContext>
  );
}
