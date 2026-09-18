/**
 * City-center coordinates for the Find Merchants map view. No geocoding
 * service is wired up (merchants only ever supply a city name, not an
 * address lookup), so markers are grouped by city rather than exact
 * address — good enough for "where roughly are merchants near me" without
 * needing a paid geocoding API.
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Ghana
  Accra: [5.6037, -0.187],
  Kumasi: [6.6885, -1.6244],
  Tema: [5.6698, -0.0166],
  Takoradi: [4.8845, -1.7554],
  Tamale: [9.4008, -0.8393],
  "Cape Coast": [5.1053, -1.2466],

  // United Kingdom
  London: [51.5074, -0.1278],
  Manchester: [53.4808, -2.2426],
  Birmingham: [52.4862, -1.8904],
  Liverpool: [53.4084, -2.9916],
  Leeds: [53.8008, -1.5491],
  Glasgow: [55.8642, -4.2518],
  Bristol: [51.4545, -2.5879],
  Edinburgh: [55.9533, -3.1883],
};

/** Each market's flagship city — where a member's own map view focuses by default. */
export const MARKET_DEFAULT_VIEW: Record<"GH" | "UK", [number, number]> = {
  GH: CITY_COORDINATES.Accra,
  UK: CITY_COORDINATES.London,
};
