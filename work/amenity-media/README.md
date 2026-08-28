# Amenity media curation

Create `picks.json` with the official amenity ID, a Wikimedia Commons `File:` title, descriptive `alt`, `depicts` (`venue` or `area-context`), and optional `note`/`creatorOverride` for each chosen image. Keep the alt text factual and use `area-context` when the image shows the surrounding area rather than the amenity itself.

Run `npm run media:build`. The builder checks the Wikimedia metadata and permits only CC0, Public domain, CC BY x.x, or CC BY-SA x.x; NC, ND, GFDL-only, and non-free licences are rejected. It downloads no originals into `public/` and records source/cache details under `work/amenity-media/`.

`data/amenity-media.json` is generated output. Do not edit it by hand.
