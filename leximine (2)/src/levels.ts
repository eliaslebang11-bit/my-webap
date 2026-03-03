export interface LevelData {
  id: number;
  letters: string[];
  words: string[];
  targetScore: number;
}

// A collection of word sets (Base word -> Sub words)
// We will generate levels from these.
const WORD_SETS = [
  {
    base: "SILENT",
    words: ["SILENT", "LISTEN", "INLET", "LIST", "LINE", "LENT", "SITE", "TIE", "LIE", "NET", "SET", "SIT", "TIN", "SIN"]
  },
  {
    base: "GARDEN",
    words: ["GARDEN", "DANGER", "RANGED", "GRADE", "RAGE", "GEAR", "NEAR", "DEAR", "READ", "RED", "EAR", "AGE", "RAN", "DEN"]
  },
  {
    base: "PLANET",
    words: ["PLANET", "PLATE", "PLANT", "PLANE", "LATE", "LANE", "PANT", "TALE", "NEAT", "PLAN", "NET", "TEA", "TAN", "TAP"]
  },
  {
    base: "MASTER",
    words: ["MASTER", "STREAM", "TAMERS", "TEAMS", "RATES", "TEARS", "MEAT", "TEAM", "RATE", "SEAT", "EAST", "REST", "ART", "MAT"]
  },
  {
    base: "ROCKET",
    words: ["ROCKET", "COTE", "CORE", "CORK", "ROCK", "ROTE", "TORE", "ROT", "COT", "TOE", "ORE"]
  },
  {
    base: "FOREST",
    words: ["FOREST", "FORTES", "FOSTER", "SOFTER", "STORE", "FORT", "REST", "ROSE", "SOFT", "TOE", "FOR", "SET"]
  },
  {
    base: "WINTER",
    words: ["WINTER", "WRITE", "TWINE", "WIRE", "RENT", "TIRE", "WINE", "TIE", "WIN", "NET", "TEN", "WET"]
  },
  {
    base: "SUMMER",
    words: ["SUMMER", "MUSE", "USER", "SURE", "RUSE", "SUM", "RUM", "USE", "EMS"]
  },
  {
    base: "SPRING",
    words: ["SPRING", "RINGS", "GRIPS", "SPIN", "RING", "SING", "SIGN", "PIG", "PIN", "RIG", "SIR"]
  },
  {
    base: "AUTUMN",
    words: ["AUTUMN", "TUNA", "AUNT", "NUT", "ANT", "TAN", "MAN", "MAT"]
  },
  {
    base: "TRAVEL",
    words: ["TRAVEL", "LATER", "ALTER", "RATE", "TEAR", "REAL", "LATE", "TALE", "ART", "RAT", "EAR", "EAT"]
  },
  {
    base: "FRIEND",
    words: ["FRIEND", "FINDER", "FIEND", "FINE", "RIDE", "FIND", "FIRE", "DIRE", "END", "RED", "RID", "FIN"]
  },
  {
    base: "FAMILY",
    words: ["FAMILY", "FILMY", "FILM", "MAIL", "FAIL", "LAY", "MAY", "AIM", "FLY"]
  },
  {
    base: "SCHOOL",
    words: ["SCHOOL", "COOL", "SOLO", "SHOO", "LOOS", "COO"]
  },
  {
    base: "OFFICE",
    words: ["OFFICE", "COIF", "FIEF", "OFF", "ICE", "FIE"]
  },
  {
    base: "MARKET",
    words: ["MARKET", "MAKER", "TAKER", "TEAM", "MEAT", "MAKE", "TAKE", "MARK", "ART", "ARM", "TEA", "EAT"]
  },
  {
    base: "DOCTOR",
    words: ["DOCTOR", "CORD", "ROOT", "DOOR", "ROT", "COT", "TOO", "DOC"]
  },
  {
    base: "POLICE",
    words: ["POLICE", "COIL", "CLIP", "POLE", "LICE", "PILE", "COP", "OIL", "LIE", "ICE", "LIP"]
  },
  {
    base: "DRIVER",
    words: ["DRIVER", "DRIVE", "DIVER", "RIDE", "DIRE", "DIVE", "RED", "RID", "DIE"]
  },
  {
    base: "ARTIST",
    words: ["ARTIST", "TRAIT", "STAIR", "START", "STAR", "STIR", "ARTS", "SIT", "SIR", "ART", "RAT"]
  },
  {
    base: "ORANGE",
    words: ["ORANGE", "RANGE", "ANGER", "GEAR", "GONE", "NEAR", "EARN", "AGE", "RAN", "ONE", "NOR", "EGO"]
  },
  {
    base: "PURPLE",
    words: ["PURPLE", "PULP", "PURE", "LURE", "RULE", "PREP"]
  },
  {
    base: "YELLOW",
    words: ["YELLOW", "YELL", "WELL", "LOW", "OWL", "WOE"]
  },
  {
    base: "VIOLET",
    words: ["VIOLET", "OLIVE", "TOIL", "LIVE", "LOVE", "VOTE", "VET", "LOT", "LIE", "OIL", "TOE"]
  },
  {
    base: "SILVER",
    words: ["SILVER", "LIVER", "RISE", "LIVE", "VEIL", "VILE", "LIE", "SIR", "IRE"]
  },
  {
    base: "GOLDEN",
    words: ["GOLDEN", "LODGE", "LONG", "GOLD", "GONE", "LEND", "DONE", "OLD", "DOG", "GOD", "ONE", "DEN"]
  },
  {
    base: "COPPER",
    words: ["COPPER", "PROP", "CROP", "COPE", "CORE", "ROPE", "PORE", "COP", "ORE", "PER", "PRO"]
  },
  {
    base: "BRONZE",
    words: ["BRONZE", "ZONE", "BONE", "ROBE", "BORE", "ZERO", "ONE", "ORE", "ROB"]
  },
  {
    base: "NICKEL",
    words: ["NICKEL", "NICE", "NECK", "LICK", "LIKE", "LINE", "INK", "ICE", "KIN", "NIL"]
  },
  {
    base: "RADIUM",
    words: ["RADIUM", "DRUM", "MAID", "RAID", "DRAM", "ARM", "DIM", "MAD", "RAM", "RIM", "RUM"]
  },
  {
    base: "OXYGEN",
    words: ["OXYGEN", "GONE", "EGO", "ONE"]
  },
  {
    base: "CARBON",
    words: ["CARBON", "BACON", "COBRA", "BARN", "BORN", "CORN", "CRAB", "ROAN", "BAN", "BAR", "BRA", "CAB", "CAN", "CAR", "COB", "CON", "NAB", "NOR", "OAR", "ORB", "RAN", "ROB"]
  },
  {
    base: "HELIUM",
    words: ["HELIUM", "HELM", "LIME", "MILE", "MULE", "ELM", "EMU", "HEM", "HIM", "HUM", "LIE"]
  },
  {
    base: "IODINE",
    words: ["IODINE", "DINED", "DIODE", "DINE", "DONE", "NODE", "DEN", "DIE", "DIN", "DOE", "DON", "END", "ION", "NOD", "ODE", "ONE"]
  },
  {
    base: "SULFUR",
    words: ["SULFUR", "FURS", "SLUR", "FLU", "FUR"]
  },
  {
    base: "COFFEE",
    words: ["COFFEE", "FEE", "FOE", "OFF"]
  },
  {
    base: "DINNER",
    words: ["DINNER", "INNER", "DINE", "DIRE", "NINE", "REIN", "RIDE", "RIND", "DEN", "DIE", "DIN", "END", "INN", "IRE", "RED", "RID"]
  },
  {
    base: "SUPPER",
    words: ["SUPPER", "PREPS", "PURSE", "SUPER", "PREP", "PUPS", "PURE", "RUSE", "SPUR", "SURE", "USER", "PER", "PUP", "PUS", "REP", "RUE", "SUP", "UPS", "USE"]
  },
  {
    base: "LUNCH",
    words: ["LUNCH"]
  },
  {
    base: "BRUNCH",
    words: ["BRUNCH", "BUNCH", "BURN", "CURB", "RUB", "RUN", "URN", "BUN", "CUB", "HUB", "HUN", "NUB"]
  },
  {
    base: "SNACK",
    words: ["SNACK", "CANS", "SACK", "SANK", "SCAN", "ASK", "CAN", "SAC"]
  },
  {
    base: "FEAST",
    words: ["FEAST", "FATE", "FAST", "FEAT", "SAFE", "SEAT", "EAST", "EAT", "FAT", "SAT", "SEA", "SET", "TEA"]
  },
  {
    base: "PICNIC",
    words: ["PICNIC"]
  },
  {
    base: "BANQUET",
    words: ["BANQUET", "BEAUT", "BENT", "BETA", "TUBE", "TUNA", "TUNE", "ANT", "BAN", "BAT", "BET", "BUN", "BUT", "EAT", "NAB", "NET", "NUT", "TAB", "TAN", "TEA", "TEN", "TUB"]
  },
  {
    base: "BUFFET",
    words: ["BUFFET", "TUBE", "BET", "BUT", "TUB"]
  },
  {
    base: "WAITER",
    words: ["WAITER", "WATER", "WRITE", "RATE", "TEAR", "TIRE", "WAIT", "WARE", "WEAR", "WIRE", "AIR", "ART", "ATE", "EAR", "EAT", "ERA", "IRE", "RAT", "RAW", "TAR", "TEA", "TIE", "WAR", "WET", "WIT"]
  },
  {
    base: "SERVER",
    words: ["SERVER", "SERVE", "SEVER", "VERSE", "EVER", "SEER", "VEER", "EVE", "REV", "SEE"]
  },
  {
    base: "BUTLER",
    words: ["BUTLER", "BRUTE", "TUBER", "BELT", "BLUE", "BLUR", "LURE", "LUTE", "RULE", "TRUE", "TUBE", "BET", "BUR", "BUT", "LET", "RUB", "RUE", "RUT", "TUB"]
  },
  {
    base: "COOKER",
    words: ["COOKER", "COOK", "CORE", "CORK", "ROCK", "ROOK", "COO", "ORE", "REC", "ROE"]
  },
  {
    base: "CHEF",
    words: ["CHEF"]
  }
];

// Generate 100 levels by cycling through the word sets
// and adding difficulty modifiers (e.g. higher target score)
export const LEVELS: LevelData[] = Array.from({ length: 100 }, (_, i) => {
  const wordSet = WORD_SETS[i % WORD_SETS.length];
  const difficultyMultiplier = 1 + Math.floor(i / WORD_SETS.length) * 0.5;
  
  // Scramble letters
  const letters = wordSet.base.split('').sort(() => Math.random() - 0.5);
  
  return {
    id: i + 1,
    letters: letters,
    words: wordSet.words,
    targetScore: Math.floor(wordSet.words.join('').length * 10 * difficultyMultiplier)
  };
});
