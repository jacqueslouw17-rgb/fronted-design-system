const countryNameToCode: Record<string, string> = {
  singapore: "SG",
  spain: "ES",
  philippines: "PH",
  norway: "NO",
  portugal: "PT",
  germany: "DE",
  france: "FR",
  usa: "US",
  "united states": "US",
  uk: "GB",
  "united kingdom": "GB",
  italy: "IT",
  japan: "JP",
  india: "IN",
  ireland: "IE",
  netherlands: "NL",
  sweden: "SE",
  denmark: "DK",
  brazil: "BR",
  mexico: "MX",
  egypt: "EG",
};

const codeAliasToIso2: Record<string, string> = {
  uk: "GB",
  el: "GR",
};

const isAlpha2Code = (value: string) => /^[A-Z]{2}$/.test(value);

const iso2ToFlag = (iso2: string): string => {
  const codePoints = [...iso2].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const getCountryFlag = (countryOrCode: string | undefined | null): string => {
  if (!countryOrCode) return "";

  const normalized = countryOrCode.trim();
  if (!normalized) return "";

  const upper = normalized.toUpperCase();
  const lower = normalized.toLowerCase();

  const iso2 =
    (isAlpha2Code(upper) ? upper : undefined) ??
    codeAliasToIso2[lower] ??
    countryNameToCode[lower];

  return iso2 ? iso2ToFlag(iso2) : "";
};
