export type Player = {
  id: number;
  name: string;
  position: "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "ATA";
  number: number;
  rare: boolean; // foil sticker
  wiki: string; // Wikipedia article title (en.wikipedia.org) for photo lookup
};

// A equipe mantém uma seleção enxuta de 26 nomes reconhecidos entre ídolos e estrelas atuais.
// wiki = título exato do artigo em inglês, usado para buscar uma foto livre em alta resolução.
const NAMES: ReadonlyArray<readonly [string, Player["position"], number, string]> = [
  ["Alisson", "GOL", 1, "Alisson"],
  ["Dida", "GOL", 12, "Dida_(footballer)"],
  ["Marquinhos", "ZAG", 4, "Marquinhos"],
  ["Thiago Silva", "ZAG", 3, "Thiago_Silva"],
  ["Éder Militão", "ZAG", 2, "Éder_Militão"],
  ["Roberto Carlos", "LAT", 6, "Roberto_Carlos_(footballer)"],
  ["Cafú", "LAT", 13, "Cafu"],
  ["Casemiro", "VOL", 5, "Casemiro"],
  ["Bruno Guimarães", "VOL", 8, "Bruno_Guimarães"],
  ["Lucas Paquetá", "MEI", 7, "Lucas_Paquetá"],
  ["Rodrygo", "MEI", 9, "Rodrygo"],
  ["Raphinha", "MEI", 11, "Raphinha"],
  ["Neymar Jr.", "ATA", 10, "Neymar"],
  ["Vinícius Jr.", "ATA", 20, "Vinícius_Júnior"],
  ["Endrick", "ATA", 21, "Endrick"],
  ["Pelé", "ATA", 10, "Pelé"],
  ["Romário", "ATA", 11, "Romário"],
  ["Ronaldo Fenômeno", "ATA", 9, "Ronaldo_(Brazilian_footballer)"],
  ["Ronaldinho Gaúcho", "MEI", 10, "Ronaldinho"],
  ["Rivaldo", "MEI", 10, "Rivaldo"],
  ["Kaká", "MEI", 8, "Kaká"],
  ["Sócrates", "MEI", 8, "Sócrates_(footballer)"],
  ["Zico", "MEI", 10, "Zico"],
  ["Garrincha", "ATA", 7, "Garrincha"],
  ["Bebeto", "ATA", 7, "Bebeto"],
  ["Falcão", "MEI", 5, "Paulo_Roberto_Falcão"],
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
