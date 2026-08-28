# Official-data research pack — BTO narrowing map

Checked: **2026-08-27 (Singapore time)**
Data policy: **official Singapore sources only**. No third-party property portals, broker pages, or inferred prices were used.

The machine-readable companion is [`official-data-snapshot.json`](official-data-snapshot.json). It contains 21 records: 13 named projects from the February and June 2026 BTO exercises, and eight records for officially announced upcoming/planned supply. Unknown or unpublished values are `null`; an empty amenity list means no defensible official record was selected for that project, not that no amenity exists.

## Coverage and inventory

### Named 2026 launches

The February 2026 launch article and its Annex A, plus the June 2026 launch article and its Annex A, establish the following 13 named projects. Prices below are the official published minimum-to-maximum ranges in SGD by flat type; the JSON also preserves units and floor-area fields.

| Project | Town / region | Exercise | Classification | Estimated wait | Official published price ranges |
|---|---|---|---|---:|---|
| Sembawang Voyage | Sembawang / North | Feb 2026 | Standard | 44 months | 2R Flexi T1 $150–187k; T2 $175–228k; 4R $304–422k; 5R $439–582k |
| Sembawang Deck | Sembawang / North | Feb 2026 | Standard | 33 months | 2R Flexi T1 $158–190k; T2 $175–237k; 3R $261–343k; 4R $338–426k; 5R $479–585k |
| Tampines Bliss | Tampines / East | Feb 2026 | Standard | 23 months | 3R $363–444k; 4R $481–600k |
| Tampines Nova | Tampines / East | Feb 2026 | Plus | 32 months | 2R Flexi T1 $197–235k; T2 $214–292k; 4R $459–602k |
| Kim Keat Crest | Toa Payoh / Central | Feb 2026 | Plus | 37 months | 2R Flexi T1 $203–253k; T2 $229–304k; 3R $356–450k; 4R $455–624k |
| Redhill Peaks (second parcel) | Bukit Merah / Central | Feb 2026 | Prime | 55 months | 2R Flexi T1 $215–295k; T2 $257–373k; 3R $385–537k; 4R $563–783k |
| Sembawang Portico | Sembawang / North | Jun 2026 | Standard | 31 months | 2R Flexi T1 $142–184k; T2 $157–225k; 3R $250–344k; 4R $320–437k; 5R $465–579k |
| Sembawang Brook | Sembawang / North | Jun 2026 | Standard | 33 months | 2R Flexi T1 $139–187k; T2 $164–218k; 3R $257–333k; 4R $302–428k; 5R $420–571k; 3Gen $468–567k |
| Woodgrove Acres | Woodlands / North | Jun 2026 | Standard | 42 months | 2R Flexi T1 $137–170k; T2 $164–211k; 3R $260–325k; 4R $353–437k; 5R $472–582k |
| Kebun Baru Ridge | Ang Mo Kio / Central | Jun 2026 | Plus | 37 months | 3R $380–492k; 4R $543–693k |
| Kebun Baru Breeze | Ang Mo Kio / Central | Jun 2026 | Plus | 52 months | 2R Flexi T1 $191–275k; T2 $255–349k; 4R $547–746k |
| Lakeview Cascadia | Bishan / Central | Jun 2026 | Prime | 51 months | 2R Flexi T1 $216–287k; T2 $257–361k; 4R $534–742k |
| Berlayar Rise | Bukit Merah / Central | Jun 2026 | Prime | 49 / 54 months* | 2R Flexi T1 $247–341k; T2 $296–406k; 3R $435–591k; 4R $592–810k |

\* HDB reports two waiting times for Berlayar Rise blocks. The JSON retains this as an object rather than silently choosing one number.

All 13 named records have approximate OneMap search centroids. These are useful map anchors only; they are not HDB site polygons, block centroids, or a claim that the full project lies inside a 1 km radius.

### Officially announced upcoming / planned supply

On 2026-08-22 HDB moved the next BTO exercise from October to **November 2026** and announced about **7,960 flats** across Bedok, Geylang, Sembawang, Tengah, Toa Payoh and Yishun. HDB has not yet published project names, flat-level prices, classifications, coordinates, or waiting times for the generic town supply. The snapshot represents the announcement as five generic town buckets plus the separately described Toa Payoh West site:

| Record | Official facts captured | Not published / therefore `null` |
|---|---|---|
| Bedok — Nov 2026 release | Town; November 2026 exercise | Project name, units by project, flat types, classification, price, wait, coordinates |
| Geylang — Nov 2026 release | Town; November 2026 exercise | Same gaps |
| Sembawang — Nov 2026 release | Town; November 2026 exercise | Same gaps |
| Tengah — Nov 2026 release | Town; November 2026 exercise | Same gaps |
| Yishun — Nov 2026 release | Town; November 2026 exercise | Same gaps |
| Toa Payoh West near Caldecott MRT | Originally October, now November 2026; approx. 1,600 total units, including approx. 590 2-room Flexi, 580 4-room, 240 Community Care Apartments and 230 public-rental units; planned 1.1 ha neighbourhood park | Project name, classification, official prices, official wait/completion, project boundary/centroid |
| Lakeview — second planned BTO | HDB says Lakeview Cascadia is the first of two planned Lakeview BTO projects | Name, launch date, units, flat types, classification, price, wait, coordinates |
| Pearl’s Hill BTO | HDB says a future project at the former Outram Park Complex site; approx. 1,700 BTO units across 2-room Flexi, 3-room and 4-room, plus over 140 public-rental units; “within the next few years” | Name, launch date, classification, prices, wait/completion, project boundary/centroid |

The November town announcement gives only aggregate upcoming supply, not a one-project-per-town assertion. The exact project inventory should be refreshed when HDB publishes the November sales exercise materials.

## Amenities and 1 km handling

The JSON includes a small, deliberately conservative set of official records across the requested categories: MRT stations; NEA hawker centres; NParks parks; MOE school records; Sport Singapore facilities; selected OneMap-geocoded shopping and healthcare anchors. Records are attached only where an official source and a defensible map anchor were available. Bus stops were consulted during source review but are intentionally excluded because they are out of product scope.

This is **not** a comprehensive amenity directory. Coordinates are approximate for projects and some amenities. The data pack does not claim verified walking distance or exact 1 km inclusion: a product implementation may screen approximate straight-line distance from the stored anchors, then label it as an approximate map-screening result. It must not present that as an official walking route or HDB boundary calculation.

Official datasets/pages consulted:

- [NEA Hawker Centres (GEOJSON)](https://data.gov.sg/datasets/d_4a086da0a5553be1d89383cd90d07ecd/view)
- [NParks Parks](https://data.gov.sg/datasets/d_0542d48f0991541706b58059381a6eca/view)
- [LTA Bus Stops (GEOJSON) — consulted only; excluded from the snapshot](https://data.gov.sg/datasets/d_3f172c6feb3f4f92a2f47d93eed2908a/view)
- [Sport Singapore Sport Facilities (2026)](https://data.gov.sg/datasets/d_2cfb0867cdeb2b7303068995699dc33b/view)
- [MOE General information of schools (2026)](https://data.gov.sg/datasets/d_688b934f82c1059ed0a6993d2a829089/view)
- [SLA OneMap](https://www.onemap.gov.sg/)

Where no useful official record could be established near a project, the JSON leaves `amenityIds` empty. That is an evidence gap, not a negative amenity finding. Shopping and healthcare are especially incomplete because no single official, current, machine-readable nationwide directory with consistent coordinates was identified in the allowed source set.

## Work hubs and travel time

The snapshot provides a small curated set of common work-hub anchors: Raffles Place CBD, Tanjong Pagar/Maxwell, one-north, Mapletree Business City and Changi Business Park. These are proposed comparison anchors, not HDB recommendations. `travelTime` is intentionally `null` for every project/hub pair. LTA’s [Plan Your Journey](https://www.lta.gov.sg/content/ltagov/en/getting_around/public_transport/plan_your_journey.html) is the official route-planning source, but it does not publish a static project-to-hub time matrix that can be verified in this snapshot. Any UI time should be obtained dynamically through the official planner (with origin/destination and departure assumptions shown) or labelled as a curated estimate.

## Source register

- [HDB — February 2026 BTO and SBF launch](https://www.hdb.gov.sg/sitecore/content/hdbinfoweb/home/hdb-pulse/news/2026/hdb-launches-9012-flats-in-february-2026-bto-and-sbf-exercises) and [Annex A](https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/hdb-launches-9012-flats-in-february-2026-bto-and-sbf-exercises/Annex-A.pdf)
- [HDB — June 2026 BTO launch](https://www.hdb.gov.sg/hdb-pulse/news/2026/hdb-launches-6952-flats-across-7-projects-in-june-2026-bto-sales-exercise) and [Annex A](https://www.hdb.gov.sg/-/media/hdb-pulse/news/2026/20260617-HDB-Launches-6952-Flats-Across-7-Projects-in-June-2026-BTO-Sales-Exercise/Annex-A.pdf)
- [HDB — November 2026 exercise moved from October](https://www.hdb.gov.sg/hdb-pulse/news/2026/increase-in-income-ceilings-and-greater-support-for-families-with-children)
- [HDB — Pearl’s Hill and Toa Payoh West](https://www.hdb.gov.sg/hdb-pulse/news/2026/public-housing-projects-will-be-developed-in-pearls-hill-and-toa-payoh-west)

Every source record in the JSON carries `checkedDate: "2026-08-27"` and the relevant URL(s). The JSON is the authority for exact flat-level fields, nulls, approximate coordinates and amenity IDs.

## Explicit scope gaps and confidence

1. “Current” is interpreted here as the latest two named 2026 BTO exercises plus officially announced future supply. Earlier 2025 launches are not added as active/current inventory because HDB does not expose a single official current/upcoming machine-readable roster in the allowed sources. If the product means “all projects still under construction,” that is a separate HDB project-status research pass.
2. HDB has not released the November 2026 project names, per-project supply, flat types, prices, classifications, site coordinates or waits.
3. HDB has not released detailed project facts for the second Lakeview project or Pearl’s Hill beyond the statements captured above; the Toa Payoh West anchor is Caldecott MRT, not a project centroid.
4. Exact HDB site boundaries, block-level coordinates, entrance points, and walking distances are unavailable from the sources used.
5. The amenity set is partial and screening-oriented; empty lists are not “none nearby.”
6. Static official commute times for all project/work-hub combinations are unavailable; no commute numbers are fabricated.

Confidence: **high** for the 13 named February/June launch names, classifications, launch dates, official price ranges and published waiting times; **medium** for approximate OneMap anchors and the selected amenity records; **low/unknown** for all unpublished upcoming-project fields and any exact 1 km or travel-time conclusion.
