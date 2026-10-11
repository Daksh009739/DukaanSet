# Shop weather configuration

Set `OPENWEATHER_API_KEY` on the durable Node backend, and save a precise city (for example `Delhi,IN`) in the business settings. The secret stays on the server. Vercel gateway deployments need this on their backend, not in a `NEXT_PUBLIC_*` variable.

The authenticated weather route uses the saved shop location, resolves it with [OpenWeather's direct geocoding API](https://openweathermap.org/api/geocoding-api), then requests [current metric weather by latitude/longitude](https://openweathermap.org/current). It caches successful observations for 15 minutes and bounds the entire provider call to eight seconds. Concurrent requests for the same location share a lookup. It does not request device location permission.

Unconfigured keys, absent/ambiguous cities, stale or invalid readings, timeouts and provider failures produce a neutral unavailable state. They never block the dashboard or replace its business values. Provider keys/URLs are not returned to the browser or logged. Membership is checked before using the public weather cache.

The current development environment has no configured provider key. Ready-weather cases in automated tests are explicitly mocked; delivered application screenshots show the real fallback. No live provider result or microphone accuracy is claimed from those tests.
