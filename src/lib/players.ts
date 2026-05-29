export type Player = {
  id: number;
  name: string;
  position: "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "ATA";
  number: number;
  rare: boolean; // foil sticker
};

// 50 stylized Brazil-themed squad — mix of real legends and recent stars
const NAMES = [
  // Goleiros
  ["Alisson", "GOL", 1], ["Ederson", "GOL", 23], ["Weverton", "GOL", 12],
  // Zagueiros
  ["Marquinhos", "ZAG", 4], ["Thiago Silva", "ZAG", 3], ["Éder Militão", "ZAG", 2],
  ["Bremer", "ZAG", 14], ["Gabriel Magalhães", "ZAG", 22], ["Beraldo", "ZAG", 24],
  // Laterais
  ["Danilo", "LAT", 13], ["Alex Sandro", "LAT", 6], ["Daniel Alves", "LAT", 17],
  ["Alex Telles", "LAT", 16], ["Vanderson", "LAT", 25], ["Yan Couto", "LAT", 21],
  // Volantes / Meias
  ["Casemiro", "VOL", 5], ["Fabinho", "VOL", 18], ["Bruno Guimarães", "VOL", 8],
  ["Fred", "VOL", 26], ["André", "VOL", 15], ["João Gomes", "VOL", 27],
  ["Lucas Paquetá", "MEI", 7], ["Rodrygo", "MEI", 9], ["Raphinha", "MEI", 11],
  ["Andreas Pereira", "MEI", 28], ["Everton Ribeiro", "MEI", 19],
  // Atacantes
  ["Neymar Jr.", "ATA", 10], ["Vinícius Jr.", "ATA", 20], ["Richarlison", "ATA", 29],
  ["Gabriel Jesus", "ATA", 30], ["Antony", "ATA", 31], ["Pedro", "ATA", 32],
  ["Gabriel Martinelli", "ATA", 33], ["Endrick", "ATA", 34], ["Estêvão", "ATA", 35],
  // Lendas
  ["Pelé", "ATA", 36], ["Romário", "ATA", 37], ["Ronaldo Fenômeno", "ATA", 38],
  ["Ronaldinho Gaúcho", "MEI", 39], ["Rivaldo", "MEI", 40], ["Kaká", "MEI", 41],
  ["Roberto Carlos", "LAT", 42], ["Cafú", "LAT", 43], ["Sócrates", "MEI", 44],
  ["Zico", "MEI", 45], ["Garrincha", "ATA", 46], ["Bebeto", "ATA", 47],
  ["Tostão", "ATA", 48], ["Falcão", "MEI", 49], ["Dida", "GOL", 50],
] as const;

export const PLAYERS: Player[] = NAMES.map(([name, position, number], i) => ({
  id: i,
  name: name as string,
  position: position as Player["position"],
  number: number as number,
  // Every 7th player is rare/foil (≈ 14%)
  rare: i % 7 === 6,
}));

export const TOTAL_PLAYERS = PLAYERS.length;
export const PACK_SIZE = 5;
export const PACK_PRICE_BRL = 4.0;
