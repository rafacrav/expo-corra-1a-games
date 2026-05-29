export type Player = {
  id: number;
  name: string;
  position: "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "ATA";
  number: number;
  rare: boolean; // foil sticker
  wiki: string; // Wikipedia article title (en.wikipedia.org) for photo lookup
};

// 50 stylized Brazil-themed squad — mix of real legends and recent stars
// wiki = exact Wikipedia (EN) article title — used to fetch real player photo
const NAMES: ReadonlyArray<readonly [string, Player["position"], number, string]> = [
  // Goleiros
  ["Alisson", "GOL", 1, "Alisson"],
  ["Ederson", "GOL", 23, "Ederson_(footballer,_born_1993)"],
  ["Weverton", "GOL", 12, "Weverton"],
  // Zagueiros
  ["Marquinhos", "ZAG", 4, "Marquinhos"],
  ["Thiago Silva", "ZAG", 3, "Thiago_Silva"],
  ["Éder Militão", "ZAG", 2, "Éder_Militão"],
  ["Bremer", "ZAG", 14, "Bremer_(footballer)"],
  ["Gabriel Magalhães", "ZAG", 22, "Gabriel_Magalhães"],
  ["Lucas Beraldo", "ZAG", 24, "Lucas_Beraldo"],
  // Laterais
  ["Danilo", "LAT", 13, "Danilo_(footballer,_born_1991)"],
  ["Alex Sandro", "LAT", 6, "Alex_Sandro"],
  ["Dani Alves", "LAT", 17, "Dani_Alves"],
  ["Alex Telles", "LAT", 16, "Alex_Telles"],
  ["Vanderson", "LAT", 25, "Vanderson_(footballer,_born_2001)"],
  ["Yan Couto", "LAT", 21, "Yan_Couto"],
  // Volantes / Meias
  ["Casemiro", "VOL", 5, "Casemiro"],
  ["Fabinho", "VOL", 18, "Fabinho_(footballer,_born_1993)"],
  ["Bruno Guimarães", "VOL", 8, "Bruno_Guimarães"],
  ["Fred", "VOL", 26, "Fred_(footballer,_born_1993)"],
  ["André", "VOL", 15, "André_(footballer,_born_2001)"],
  ["João Gomes", "VOL", 27, "João_Gomes_(footballer,_born_2001)"],
  ["Lucas Paquetá", "MEI", 7, "Lucas_Paquetá"],
  ["Rodrygo", "MEI", 9, "Rodrygo"],
  ["Raphinha", "MEI", 11, "Raphinha"],
  ["Andreas Pereira", "MEI", 28, "Andreas_Pereira"],
  ["Everton Ribeiro", "MEI", 19, "Everton_Ribeiro"],
  // Atacantes
  ["Neymar Jr.", "ATA", 10, "Neymar"],
  ["Vinícius Jr.", "ATA", 20, "Vinícius_Júnior"],
  ["Richarlison", "ATA", 29, "Richarlison"],
  ["Gabriel Jesus", "ATA", 30, "Gabriel_Jesus"],
  ["Antony", "ATA", 31, "Antony_(footballer)"],
  ["Pedro", "ATA", 32, "Pedro_(footballer,_born_1997)"],
  ["Gabriel Martinelli", "ATA", 33, "Gabriel_Martinelli"],
  ["Endrick", "ATA", 34, "Endrick"],
  ["Estêvão", "ATA", 35, "Estêvão_Willian"],
  // Lendas
  ["Pelé", "ATA", 36, "Pelé"],
  ["Romário", "ATA", 37, "Romário"],
  ["Ronaldo Fenômeno", "ATA", 38, "Ronaldo_(Brazilian_footballer)"],
  ["Ronaldinho Gaúcho", "MEI", 39, "Ronaldinho"],
  ["Rivaldo", "MEI", 40, "Rivaldo"],
  ["Kaká", "MEI", 41, "Kaká"],
  ["Roberto Carlos", "LAT", 42, "Roberto_Carlos_(footballer)"],
  ["Cafú", "LAT", 43, "Cafu"],
  ["Sócrates", "MEI", 44, "Sócrates_(footballer)"],
  ["Zico", "MEI", 45, "Zico"],
  ["Garrincha", "ATA", 46, "Garrincha"],
  ["Bebeto", "ATA", 47, "Bebeto"],
  ["Tostão", "ATA", 48, "Tostão"],
  ["Falcão", "MEI", 49, "Paulo_Roberto_Falcão"],
  ["Dida", "GOL", 50, "Dida_(footballer)"],
];

// Padrão Copa 2026: lendas douradas (apenas Neymar e Pelé)
const GOLD_WIKIS = new Set(["Neymar", "Pelé"]);

export const PLAYERS: Player[] = NAMES.map(([name, position, number, wiki], i) => ({
  id: i,
  name,
  position,
  number,
  wiki,
  rare: GOLD_WIKIS.has(wiki),
}));

export const TOTAL_PLAYERS = PLAYERS.length;
export const TOTAL_RARE = PLAYERS.filter((p) => p.rare).length;
// Padrão Copa 2026
export const PACK_SIZE = 7;
export const PACK_PRICE_BRL = 7.0;
