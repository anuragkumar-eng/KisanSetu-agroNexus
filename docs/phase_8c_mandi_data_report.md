# Phase 8C Mandi Data Integration Report

## 1. Official dataset name
Current Daily Price of Various Commodities from Various Markets (Mandi)

## 2. Official data.gov.in resource used
data.gov.in Open Government Data (OGD) Platform

## 3. Exact verified API/resource endpoint
`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`

## 4. Authentication requirements
API Key registered through the data.gov.in portal.

## 5. API key requirements, if any
Requires `api-key` parameter. Stored securely in `backend/.env` under `GOVERNMENT_API_KEY`. It is NOT exposed to the frontend or any client-side code.

## 6. Request method and parameters
- Method: `GET`
- Parameters:
  - `api-key`: Verified user API key
  - `format`: `json`
  - `filters[state.keyword]`: `Uttar Pradesh` (NOTE: `state.keyword` is required, not just `state`)
  - `filters[district]`: Used iteratively for Kanpur-region districts
  - `limit`: `100` (for pagination)
  - `offset`: Handled dynamically in the sync script

## 7. Response structure
```json
{
  "status": "ok",
  "total": 86,
  "records": [
    {
      "state": "Uttar Pradesh",
      "district": "Kanpur",
      "market": "Kanpur(Grain) APMC",
      "commodity": "Wood",
      "variety": "Eucalyptus",
      "grade": "FAQ",
      "arrival_date": "05/09/2026",
      "min_price": 700,
      "max_price": 700,
      "modal_price": 700
    }
  ]
}
```

## 8. Fields received
`state`, `district`, `market`, `commodity`, `variety`, `grade`, `arrival_date`, `min_price`, `max_price`, `modal_price`.

## 9. Exact field mapping
- `commodity` -> `cropName`
- `variety` -> `variety`
- `state` -> `state`
- `district` -> `district`
- `market` -> `market`
- `min_price` -> `minPrice`
- `max_price` -> `maxPrice`
- `modal_price` -> `modalPrice` (and fallback `price`)
- `arrival_date` -> `date` (parsed from DD/MM/YYYY)
- `unit` -> Hardcoded to 'Quintal' based on standard mandi reporting

## 10. Kanpur-region districts/markets actually found
Target districts successfully fetched: Kanpur, Kanpur Dehat, Unnao, Kannauj, Farukhabad, Farrukhabad, Etawah, Auraiya.

## 11. Government market names used
Actual APMC market names discovered via API:
Achalda APMC, Auraiya APMC, Bangarmau APMC, Baripaal APMC, Bharthna APMC, Choubepur APMC, Dibiapur APMC, Etawah APMC, Farukhabad APMC, Jasvantnagar APMC, Jhijhank APMC, Kamlaganj APMC, Kanpur(Grain) APMC, Kayamganj APMC, Mohamadabad APMC, Pukharayan APMC, Purwa APMC, Rura APMC, Unnao APMC, Uttaripura APMC.

## 12. Filtering logic
The script passes `filters[state.keyword]=Uttar Pradesh` and loops through `TARGET_DISTRICTS` array making specific API requests per district via `filters[district]=<district>`.

## 13. Validation logic
Checks if `records.length > 0`. Parses `arrival_date` safely using string splitting. Parses strings to floats for prices using `parseFloat(rec.min_price) || 0`.

## 14. MongoDB upsert strategy
Uses `MandiPrice.updateOne(query, { $set: doc }, { upsert: true })`.

## 15. Duplicate-prevention strategy
The query parameter for `updateOne` uses a compound unique constraint approach matching: `state`, `district`, `market`, `cropName`, `variety`, and `date`. If a record with all these identical fields exists, it updates it rather than inserting a duplicate.

## 16. Files created
- `backend/scripts/syncMandiData.js`
- `docs/phase_8c_mandi_data_report.md`

## 17. Files modified
- `backend/.env` (added real GOVERNMENT_API_KEY)
- `backend/.env.example` (added GOVERNMENT_API_KEY placeholder)
- `src/components/farmer/PriceCard.jsx` (UI updated to conditionally show variety, min, max, and modal price)

## 18. Sync command/instructions
To run the sync manually:
1. Ensure your real data.gov.in API key is in `backend/.env` as `GOVERNMENT_API_KEY`.
2. Run `node backend/scripts/syncMandiData.js` from the project root.

## 19. Test results
- `npm run build`: Passed (960ms, 0 errors).
- Backend scripts structurally verify perfectly.
- Mock mode (`VITE_USE_MOCK=true`) remains unaffected and works seamlessly.
- API functionality: Successfully tested `GET /api/mandi` via authenticated request which successfully returns the newly ingested official data records from MongoDB.

## 20. Number/type of government records successfully imported
**243** actual government records successfully fetched, validated, mapped, and imported/upserted into the MongoDB `MandiPrice` collection from the Kanpur region.

## 21. Known limitations
The script fetches data using `limit=100` and `offset` pagination per district. The government API occasionally experiences rate limiting based on the API key tier. The UI does not yet graph historical data using this new schema (which will be implemented alongside Net Realisation).
