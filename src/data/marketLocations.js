/**
 * marketLocations.js
 * Contains exact geographic coordinates for Mandi APMC markets to power OSRM driving distances.
 * 
 * If exact coordinates are not known, 'latitude' and 'longitude' are marked as "NEEDS_CONFIG".
 * The system should fall back to standard district distance estimates if coordinates are missing.
 */

export const marketLocations = {
  "Jhijhank APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Kanpur Dehat"
  },
  "Purwa APMC": {
    "latitude": 26.4863403,
    "longitude": 80.8367138,
    "district": "Unnao"
  },
  "Bangarmau APMC": {
    "latitude": 26.8916447,
    "longitude": 80.21506,
    "district": "Unnao"
  },
  "Uttaripura APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Kanpur"
  },
  "Achalda APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Auraiya"
  },
  "Rura APMC": {
    "latitude": 26.489896,
    "longitude": 79.9011355,
    "district": "Kanpur Dehat"
  },
  "Farukhabad APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Farukhabad"
  },
  "Etawah APMC": {
    "latitude": 26.7155629,
    "longitude": 79.0917098,
    "district": "Etawah"
  },
  "Pukharayan APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Kanpur Dehat"
  },
  "Bharthna APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Etawah"
  },
  "Kamlaganj APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Farukhabad"
  },
  "Kayamganj APMC": {
    "latitude": 27.5525036,
    "longitude": 79.343542,
    "district": "Farukhabad"
  },
  "Jasvantnagar APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Etawah"
  },
  "Dibiapur APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Auraiya"
  },
  "Mohamadabad APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Farukhabad"
  },
  "Choubepur APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Kanpur"
  },
  "Auraiya APMC": {
    "latitude": 26.6558215,
    "longitude": 79.5160757,
    "district": "Auraiya"
  },
  "Baripaal APMC": {
    "latitude": "NEEDS_CONFIG",
    "longitude": "NEEDS_CONFIG",
    "district": "Kanpur"
  },
  "Unnao APMC": {
    "latitude": 26.5673264,
    "longitude": 80.6198193,
    "district": "Unnao"
  },
  "Kanpur(Grain) APMC": {
    "latitude": 26.4609135,
    "longitude": 80.3217588,
    "district": "Kanpur"
  }
};

export const fallbackDistrictDistances = {
  "Kanpur": 0,
  "Kanpur Dehat": 50,
  "Unnao": 28,
  "Kannauj": 84,
  "Auraiya": 91,
  "Farukhabad": 143,
  "Etawah": 153
};
