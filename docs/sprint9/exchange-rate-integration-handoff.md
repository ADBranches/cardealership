# Exchange-Rate Integration Handoff

## Purpose

This document defines the tested Sprint 9 exchange-rate integration contract for frontend and integration owners.

## Endpoint

`GET /api/exchange-rates?baseCurrency=UGX`

The endpoint returns HTTP `200` for fresh provider data, fresh cached data, and stale-cache fallback. It returns HTTP `503` when both the provider and cache are unavailable. Unexpected failures return controlled HTTP `500` responses.

## Stable success response

```json
{
  "success": true,
  "source": "mock_provider",
  "freshness": "fresh",
  "baseCurrency": "UGX",
  "rates": {
    "UGX": 1,
    "USD": 0.00027,
    "EUR": 0.00023,
    "GBP": 0.0002,
    "KES": 0.0348
  },
  "provider": "mock",
  "retrievedAt": "2026-09-18T10:00:00.000Z",
  "expiresAt": "2026-09-18T12:00:00.000Z"
}
```

> The rates above are deterministic mock values for integration testing. They are not production financial quotes.

## Outcome mapping

- Fresh provider: `source=mock_provider`, `freshness=fresh`, HTTP `200`.
- Fresh cache: `source=database_cache`, `freshness=fresh`, HTTP `200`.
- Stale-cache fallback: `source=database_cache`, `freshness=fallback`, HTTP `200`, with a `warning` object.
- Provider and cache unavailable: HTTP `503`, `success=false`, and `EXCHANGE_RATE_CACHE_UNAVAILABLE`.
- Unexpected error: HTTP `500` with a controlled error object.

## Fallback response

```json
{
  "success": true,
  "source": "database_cache",
  "freshness": "fallback",
  "baseCurrency": "UGX",
  "rates": { "UGX": 1, "USD": 0.00027 },
  "provider": "mock",
  "retrievedAt": "2026-09-18T10:00:00.000Z",
  "expiresAt": "2026-09-18T12:00:00.000Z",
  "warning": {
    "code": "EXCHANGE_RATE_PROVIDER_UNAVAILABLE",
    "message": "Cached exchange rates are being returned because the provider is unavailable."
  }
}
```

## Unavailable response

```json
{
  "success": false,
  "error": {
    "code": "EXCHANGE_RATE_CACHE_UNAVAILABLE",
    "message": "Exchange rates are temporarily unavailable."
  }
}
```

## Mock provider behavior

Supported scenarios are `success`, `timeout`, `unavailable`, and `malformed_response`. The service uses a fresh cache where possible, otherwise retrieves provider data, normalizes and persists it, or falls back to the latest cached snapshot.

## Provider replacement seam

A replacement provider must implement `fetchRates(baseCurrency)`. Validate the adapter through `createExchangeRateProvider` and inject it into `createExchangeRateService({ provider })`. The normalizer, repository, controller, route, worker, and frontend response handling do not need to be rewritten.

A successful provider result must contain `provider`, `baseCurrency`, `rates`, and `retrievedAt`.

## Environment names

- `EXCHANGE_RATE_PROVIDER`
- `EXCHANGE_RATE_BASE_CURRENCY`
- `EXCHANGE_RATE_SUPPORTED_CURRENCIES`
- `EXCHANGE_RATE_REFRESH_INTERVAL_MS`
- `EXCHANGE_RATE_REQUEST_TIMEOUT_MS`
- `EXCHANGE_RATE_CACHE_TTL_MS`
- `EXCHANGE_RATE_MOCK_SCENARIO`

Environment values must remain in local or deployment secrets and must not be committed.

## Known limitations and follow-up

- The current provider is mock-only and makes no external FX request.
- Mock values are unsuitable for financial settlement or pricing decisions.
- The integration owner must implement production timeout, retry, monitoring, licensing, and attribution requirements.
- The frontend should display fallback state while retaining the cached values.
