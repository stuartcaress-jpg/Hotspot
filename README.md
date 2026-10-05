# ZELVUN — Meet. Share. Belong.

ZELVUN is a lightweight public beta for discovering local groups and events around shared interests.

## Beta scope

- Browse curated groups and events
- Search by hobby, activity and category
- Filter groups or events
- Save an “Interested” / “Going” choice locally on the device
- No account required
- No precise location permission
- No private messaging
- No public profile or photo uploads
- No dating or stranger-matching features
- No payments or subscriptions in this first beta
- 18+ community beta

## Important beta limitation

This release is intentionally a **curated static beta**. It does not yet provide shared accounts, server-side membership, or live user-created groups. Local interest/attendance choices are stored only in the visitor’s browser.

That limitation is deliberate: it keeps the first public release substantially simpler while we validate the concept. A later multi-user release can add accounts, Host moderation, group applications, reporting/blocking, shared data, and paid organiser tools once the required privacy, safety, moderation and deletion systems are in place.

## Deployment

The repository includes a GitHub Pages workflow at `.github/workflows/pages.yml`. A successful workflow run is required before claiming the public site is live.

## Brand

**ZELVUN**  
**Meet. Share. Belong.**

The name is being treated as a provisional brand until formal trademark, app-store, company-name and domain clearance are completed.

## Current beta experience

The public beta now includes:
- searchable groups and events
- category filters, including Languages and Music
- individual group and event detail views
- curated upcoming events inside group views
- a device-local **My ZELVUN** area for saved groups and events
- local "I'm Going" and saved-group state
- responsive mobile-first presentation
- no account, private messaging, precise location, payments, dating/matching, or public profiles

The next production stage is an account-backed service with shared membership/attendance, organiser tools, reporting/blocking, moderation, privacy controls and data deletion. Those features should be introduced together with the required backend and safety infrastructure rather than simulated in the static beta.


## Local Group Index

The homepage now makes local-group discovery the primary ZELVUN experience. The local finder accepts an interest, town/city/postcode and radius, then calls `/api/groups` for live directory results.

### Vercel setup for live results

The server-side endpoint is ready for Google Places API (New). It geocodes the chosen area, searches the Places Text Search endpoint with a radius bias, calculates distance, and returns group/place name, address, rating, review count, official website and Google Maps link.

To enable it on Vercel:

1. Create/enable Google Maps Platform **Places API (New)** and the Geocoding API for the project.
2. Create a restricted server API key.
3. In the Vercel project, add the environment variable `GOOGLE_MAPS_API_KEY` for the Production environment.
4. Redeploy the current `main` branch.

The key is read only on the server from `process.env.GOOGLE_MAPS_API_KEY`; it is never placed in the browser code.

The current UI also provides an external Google Maps fallback if the live directory has not been configured.

### Reviews and community comments

The first live directory version shows the source rating/review count and links users to the original Google Maps listing/reviews. ZELVUN's own comments and reviews should be added only after account identity, reporting, moderation, blocking and content-removal systems are in place.

Google Places data is subject to Google's applicable attribution and data-use policies.
