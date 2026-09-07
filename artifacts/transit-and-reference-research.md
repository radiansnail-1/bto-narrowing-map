# Transit and reference research — 7 September 2026

Read-only research; no registration, credentials, deployment, or production changes.

## Reference post: verified content and access limits

[Original post](https://x.com/synabreu/status/2096557555086725159) is a Seoul 3D city exploration project. X's public [syndication response](https://cdn.syndication.twimg.com/tweet-result?id=2096557555086725159&lang=en&token=1) and [oEmbed](https://publish.twitter.com/oembed?url=https://twitter.com/synabreu/status/2096557555086725159) both returned HTTP 200 and verified the author, post ID, date, intro, and attached video. These official responses truncate the long-form text after the start of the feature list.

The [public FxTwitter mirror](https://api.fxtwitter.com/synabreu/status/2096557555086725159) returned the long-form text: about 267,000 simplified building models across 25 districts; rotate/pan/zoom; a 14-landmark fly-through; day/sunset/night; mobile touch; 4× terrain and height exaggeration; explicit estimated-height and historical-boundary caveats; Three.js and OSM/OpenFreeMap/OpenMapTiles/terrain attribution. Its opening matches the official response. The full body is mirror-verified, not independently confirmed in X's logged-in UI.

The linked [Seoul project](https://seoul-3d-atlas.synabreu.chatgpt.site/) returned HTTP 403 to a direct HTTP read. No live UI or video inspection was completed; do not claim a visual comparison or reproduction. No remote media was downloaded.

Worthwhile transfer to BTO (our judgment): deliberate camera tours between selected projects or towns; simplified geometry that preserves interaction speed; clear height/footprint provenance; good touch controls. Day/night modes are decorative and low priority for a housing decision tool. A landmark sightseeing tour is less useful here than a short guided comparison of selected homes. Do not infer any transit-routing feature from this reference.

## Recommended integration

Immediate no-key, no-billing option: create a Google Maps transit directions link for each BTO→selected hub/custom workplace. [Google Maps URLs documentation](https://developers.google.com/maps/documentation/urls/get-started) explicitly says no API key is required and supports coordinates plus `travelmode=transit`:

`https://www.google.com/maps/dir/?api=1&origin=LAT,LON&destination=LAT,LON&travelmode=transit`

Use URLSearchParams. These links open a route in Google Maps; they do not return a travel-time value to this app. The documented universal URL has no departure-time parameter: let people choose timing within Google Maps. Do not scrape Google results into local scores.

For actual in-app minutes, OneMap is the smallest Singapore-specific free API option. SLA's [August 2025 workshop presentation](https://www.onemap.gov.sg/apidocs/static/media/OneMap_API_Workshop_Presentation_260825.04f72136081dd249c5ee.pdf) describes its APIs as free to use. [Registration](https://www.onemap.gov.sg/apidocs/) and a token are required. [Authentication docs](https://www.onemap.gov.sg/apidocs/authentication) describe a three-day token with UNIX expiry, renewed by authenticating again; never ship account credentials to browser code.

[Routing docs](https://www.onemap.gov.sg/apidocs/routing) contain a public-transport endpoint. The website is a client-rendered app; its publicly served JS bundle was read to verify the PT section, which the search index only partially exposes. Contract: GET `/api/public/routingsvc/route`, authorization header, `start` and `end` in latitude,longitude; `routeType=pt`; `date=MM-DD-YYYY`; `time=07:35:00` in the official example; `mode=TRANSIT`; optional `maxWalkDistance` and `numItineraries`. Response includes `plan.itineraries`, `duration` seconds, start/end times, walking/transit/waiting durations, transfers, and legs. Documentation's prose mentions bearer authorization while code samples use the raw token: confirm against an authorized live request during integration. No authenticated routing call was made in this lane.

Recommended behavior: an explicit “Check transit” action for selected project/destination, Singapore departure date/time, minutes and walk/transfer breakdown, provider and retrieval date, and unavailable/error state. Do not turn a failed route into a miss or silently substitute straight-line minutes. Keep screening separate until a consistent departure-time rule and maximum commute preference exist.

## Reliability, reuse, and costs

OneMap's [API terms](https://www.onemap.gov.sg/legal/apitermsofservice.html) require secure credentials and permit endpoint-specific restrictions. The endpoint documents 401/403/429 failures. A current numerical PT rate limit was not verified; do not repeat a historical 250/min figure as a universal PT quota. Use bounded requests, deduplication, conservative caching, and backoff. Its [Open Data Licence](https://www.onemap.gov.sg/legal/opendatalicence.html) permits reuse/copying with source and licence attribution, excludes unlicensed third-party rights, and does not warrant accuracy. No blanket cache TTL was verified; cache by origin/destination/departure parameters and show the retrieval time.

[Google Routes API](https://developers.google.com/maps/documentation/routes/usage-and-billing) requires billing and an API key or OAuth token. Even if usage fits a free allowance, it is not a no-billing dependency and is unnecessary for the user's requested free path.

Routing is a departure-time-dependent estimate on currently available network data. It cannot promise the commute when an unbuilt BTO opens years later. BTO map pins may represent an approximate site rather than its eventual pedestrian entrance; show that scope near route results.

## LTA / self-hosted option

Important current change: the [official DataMall homepage](https://datamall.lta.gov.sg/) announces three GTFS APIs launched 3 August 2026. The [current catalog](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html) identifies them as **Train** schedule, trip updates, and service alerts. This is not a complete bus-plus-walking door-to-door route endpoint. Bus Arrival supplies stop-level arrival predictions; “Estimated Travel Times” is for expressway segments, not public transport. DataMall dynamic data requires a registered Account Key.

[LTA API terms](https://datamall.lta.gov.sg/content/datamall/en/api-terms-of-service.html) specify a ten-million daily ceiling, subject to change and individual API restrictions, and secure credentials. Do not treat that ceiling as an appropriate request target.

[OpenTripPlanner](https://docs.opentripplanner.org/en/latest/Data-Sources/) consumes GTFS, realtime feeds, and OSM. It would require graph building, feed quality/completeness checks, ongoing updates, and a hosted Java service. Software can be open source while hosting and maintenance still cost money. It is disproportionate here. Unofficial generated Singapore GTFS schedules are not equivalent to verified official timetables.

## Current code fit

`lib/matching.ts` averages straight-line distance for up to two hubs, using ≤5 km, with a custom pin replacing hubs. It does not contain transit estimates. `ExplorerAnswers` has no commute duration or departure-time setting. Hubs/project points use scene coordinates; `lib/geo.ts` defines scale 85 and origin (latitude 1.37, longitude 103.87). Inverse conversion: latitude = 1.37 − z/85; longitude = 103.87 + x/85. Add a named inverse helper for route links. Preserve unknown for unpublished project coordinates. Destination coordinates represent hub anchors, not exact workplaces.
