// Currency code mapping for countries
const countryCurrencyMap: Record<string, string> = {
  // Europe
  "Germany": "EUR",
  "France": "EUR",
  "Spain": "EUR",
  "Italy": "EUR",
  "Netherlands": "EUR",
  "Belgium": "EUR",
  "Austria": "EUR",
  "Ireland": "EUR",
  "Portugal": "EUR",
  "Finland": "EUR",
  "Greece": "EUR",
  "Kosovo": "EUR",
  "United Kingdom": "GBP",
  "Norway": "NOK",
  "Sweden": "SEK",
  "Denmark": "DKK",
  "Switzerland": "CHF",
  "Poland": "PLN",
  "Czech Republic": "CZK",
  "Hungary": "HUF",
  "Romania": "RON",
  
  // Asia
  "Philippines": "PHP",
  "India": "INR",
  "Singapore": "SGD",
  "Japan": "JPY",
  "South Korea": "KRW",
  "China": "CNY",
  "Hong Kong": "HKD",
  "Taiwan": "TWD",
  "Thailand": "THB",
  "Vietnam": "VND",
  "Malaysia": "MYR",
  "Indonesia": "IDR",
  
  // Americas
  "United States": "USD",
  "Canada": "CAD",
  "Mexico": "MXN",
  "Brazil": "BRL",
  "Argentina": "ARS",
  "Colombia": "COP",
  "Chile": "CLP",
  
  // Oceania
  "Australia": "AUD",
  "New Zealand": "NZD",
  
  // Middle East & Africa
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  "Israel": "ILS",
  "South Africa": "ZAR",
  "Nigeria": "NGN",
  "Egypt": "EGP",
};

/**
 * Get the currency code for a given country and employment type.
 * Contractors always use USD, employees use local currency.
 */
export function getCurrencyCode(country: string, employmentType: "employee" | "contractor"): string {
  if (employmentType === "contractor") {
    return "EUR";
  }
  return countryCurrencyMap[country] || "USD";
}

/**
 * Strip currency symbols, codes, and suffixes from a salary string to get just the numeric value.
 */
export function parseSalaryValue(salary: string | undefined): string {
  if (!salary) return '';
  return salary
    .replace(/^[$₱€£₹¥₩]|^kr\s?|^S\$\s?|^[A-Z]{3}\s?/gi, '')
    .replace(/\/mo$/i, '')
    .replace(/,/g, '')
    .trim();
}
