/**
 * useAI — AI and market intelligence hooks
 *
 * useAI()          → market recommendation, price prediction, buyer matching
 *                     (POST mutations — user-triggered, not auto-fetched)
 *
 * useNetValue()    → net value / price calculator
 *                     POST /api/market/net-value
 *
 * AI endpoints are POST calls proxied through Node.js.
 * The browser never calls the Python service directly.
 */

import { useState } from 'react';
import { api } from '../services/api';
import { priceRecommendations } from '../data/mockMandi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// ─── useAI ────────────────────────────────────────────────────────────────────

/**
 * AI service functions.
 * All functions are async and return data (or null on failure).
 * A single shared `loading` / `error` state is managed per hook instance.
 *
 * @returns {{
 *   getMarketRecommendation,
 *   predictPrice,
 *   matchBuyers,
 *   loading,
 *   error
 * }}
 */
export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  function startCall() { setLoading(true); setError(null); }
  function endCall()   { setLoading(false); }
  function failCall(err) { setError(err); setLoading(false); }

  // ── POST /api/ai/market-recommendation ──────────────────────────────────────
  /**
   * Get a sell / wait recommendation for a crop.
   *
   * @param {{ cropType, quantity, currentPrice, district, state }} params
   * @returns {{ action, confidence, reasonHi, reason, priceOutlook } | null}
   */
  async function getMarketRecommendation(params) {
    if (USE_MOCK) {
      const rec = priceRecommendations[params.cropType?.toLowerCase()];
      if (!rec) return null;
      return {
        action:       rec.action,
        confidence:   0.85,
        reasonHi:     rec.reasonHi,
        reason:       rec.reason,
        priceOutlook: rec.action === 'sell' ? 'bearish' : 'bullish',
      };
    }
    startCall();
    try {
      const res = await api.post('/ai/market-recommendation', params);
      return res.data;
    } catch (err) {
      failCall(err);
      return null;
    } finally {
      endCall();
    }
  }

  // ── POST /api/ai/predict-price ───────────────────────────────────────────────
  /**
   * Get AI-predicted price for a crop at a future date.
   *
   * @param {{ cropType, state, district, targetDate, quantity }} params
   * @returns {{ predictedPrice, trend, reasonHi, reason } | null}
   */
  async function predictPrice(params) {
    if (USE_MOCK) {
      // Minimal mock: price prediction unavailable in demo mode
      return {
        predictedPrice: params.currentPrice ? Math.round(params.currentPrice * 1.03) : null,
        trend:          'up',
        confidence:     null,
        reasonHi:       'डेमो मोड में AI मूल्य अनुमान उपलब्ध नहीं।',
        reason:         'Price prediction not available in demo mode.',
      };
    }
    startCall();
    try {
      const res = await api.post('/ai/predict-price', params);
      return res.data;
    } catch (err) {
      failCall(err);
      return null;
    } finally {
      endCall();
    }
  }

  // ── POST /api/ai/match-buyers ────────────────────────────────────────────────
  /**
   * Find buyers whose requirements best match a farmer's lot.
   *
   * @param {string} lotId
   * @returns {{ matches: Array } | null}
   */
  async function matchBuyers(lotId) {
    if (USE_MOCK) {
      // No mock matching data yet — returns empty matches
      return { matches: [] };
    }
    startCall();
    try {
      const res = await api.post('/ai/match-buyers', { lotId });
      return res.data;
    } catch (err) {
      failCall(err);
      return null;
    } finally {
      endCall();
    }
  }

  return { getMarketRecommendation, predictPrice, matchBuyers, loading, error };
}

// ─── useNetValue ──────────────────────────────────────────────────────────────

/**
 * Net value / price calculator.
 * POST /api/market/net-value
 *
 * In mock mode: performs the calculation client-side (same formula as backend).
 * In real mode: delegates to backend which may use more accurate cost data.
 *
 * Usage:
 *   const { calculate, data, loading, error } = useNetValue();
 *   const result = await calculate({ quantity: 50, sellingPrice: 2280, ... });
 *
 * @returns {{ calculate, data, loading, error }}
 */
export function useNetValue() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  async function calculate(params) {
    const { quantity = 1, sellingPrice = 0, storageMonths = 0 } = params;

    if (USE_MOCK) {
      const gross      = quantity * sellingPrice;
      const transport  = 3500;
      const storage    = Math.round(storageMonths * quantity * 12);
      const commission = Math.round(gross * 0.01);
      const other      = 700;
      const total      = transport + storage + commission + other;
      const result = {
        grossValue:        gross,
        deductions:        { transportCost: transport, storageCost: storage, commissionFee: commission, other },
        totalDeductions:   total,
        estimatedNetValue: gross - total,
        netPricePerQuintal: Math.round((gross - total) / quantity),
      };
      setData(result);
      return result;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/market/net-value', params);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { calculate, data, loading, error };
}
