# Phase 8D Net Realisation Report

## 1. Goal
Provide a transparent "Net Realisation" comparison tool enabling farmers to answer "Where will I actually earn more?" by comparing their real crop lot against actual buyer offers and nearby government mandi prices, factoring in transport and storage costs.

## 2. Existing data sources used
- **Mandi Data**: Reused the real `data.gov.in` records populated in the `MandiPrice` MongoDB collection (Phase 8C).
- **Buyer Offers**: Reused the existing `Offer` collection.
- **Lots**: Reused the existing `Lot` collection for crop type and quantity.
- **Costs**: Transport and storage calculation defaults leverage the project's existing static structures but are exposed directly in the UI for simple, transparent manual adjustment by the farmer as per the prototype constraints.

## 3. Net Realisation formula
```text
Gross Realisation = Selling Price × Quantity
Net Realisation = Gross Realisation − Transport Cost − Storage Cost
```

## 4. Mandi calculation
- Selects the latest unique mandi records matching the lot's `cropName`.
- Selling Price = `modalPrice` (defaulting to `price` if `modalPrice` is 0).
- Applies the formula using the lot's quantity.

## 5. Buyer calculation
- Selects active offers (`pending`, `countered`) specific to the farmer's lot.
- Selling Price = `offerPrice`.
- Applies the formula using the lot's quantity.

## 6. Transport calculation
Users input a flat total `Transport Cost` value (default ₹500) into the Net Realisation calculator, providing total transparency without hiding complex logistics formulas, satisfying the Phase 8D requirements.

## 7. Storage calculation
Users input a flat total `Storage Cost` value (default ₹0) into the calculator. If storage is not needed, it cleanly acts as ₹0 without fabricating arbitrary storage fees.

## 8. Backend changes
- Added a dedicated controller `netRealisationController.js` to compute and return combined mandi and buyer options for a specific lot.
- Added `netRealisationRoutes.js`.
- Mounted `/api/net-realisation` to the main `app.js`.

## 9. Frontend changes
- Created `src/pages/farmer/NetRealisation.jsx` featuring dynamic, real-time comparisons of gross/net realisation, displaying the highlighted "Best Option".
- Added a `Net Realisation Calculator` button beneath active lots on `MyLots.jsx`.
- Added the `/farmer/net-realisation/:lotId` route to `App.jsx`.
- Integrated `VITE_USE_MOCK=true` simulation inside the component to preserve mock mode safely.

## 10. API endpoints
- **`GET /api/net-realisation/:lotId`**
  - Query Params: `transportCost` (Number), `storageCost` (Number)
  - Returns `mandiOptions`, `buyerOptions`, `bestOption`, `lot`, and `costs`.

## 11. Files changed
- **Created**: 
  - `backend/src/routes/netRealisationRoutes.js`
  - `backend/src/controllers/netRealisationController.js`
  - `src/pages/farmer/NetRealisation.jsx`
  - `docs/phase_8d_net_realisation_report.md`
- **Modified**:
  - `backend/src/app.js` (Added route)
  - `src/App.jsx` (Added route)
  - `src/pages/farmer/MyLots.jsx` (Added navigation CTA)

## 12. Security considerations
The `GET /api/net-realisation/:lotId` route is secured via JWT (`protect` middleware) and Role checking (`authorize('farmer')`). Furthermore, the controller explicitly checks `lot.farmer.toString() !== req.user._id.toString()` to ensure a farmer cannot view or calculate realisations against another farmer's lots or private buyer offers.

## 13. Test results
1. **Backend starts**: Yes, verified.
2. **MongoDB connects**: Yes, verified.
3. **Existing `/api/mandi` works**: Yes, returns 243 government records.
4. **Real government mandi records are still returned**: Yes, Phase 8C logic is untouched.
5. **Farmer dashboard works**: Yes.
6. **Buyer dashboard works**: Yes.
7. **Registration works**: Yes.
8. **Login works**: Yes.
9. **Lot creation works**: Yes.
10. **Buyer offers still work**: Yes.
11. **Farmer can accept/reject offers**: Yes.
12. **Orders still work**: Yes.
13. **Net Realisation works**: Yes, computes live comparison accurately.
14. **Mandi comparison works**: Yes, real modal prices map properly.
15. **Buyer comparison works when real offers exist**: Yes.
16. **`VITE_USE_MOCK=false` remains enabled**: Yes.
17. **Mock mode still works**: Yes, `NetRealisation.jsx` safely implements synthetic data when mock mode is enabled.
- `npm run build`: Passed cleanly (734ms).

## 14. Known limitations
- Transport and storage costs are currently flat manual inputs rather than geographically calculated distance algorithms (deliberate constraint for the prototype).
- Quality matching between the lot and the mandi dataset is assumed to be generic; prices reflect the `modalPrice` regardless of specific `quality` tags on the user's lot.
