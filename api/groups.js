export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'GOOGLE_MAPS_API_KEY is not configured.',
      setup: 'Add GOOGLE_MAPS_API_KEY to the Vercel project environment variables.'
    });
  }

  const interest = String(req.query.interest || 'local groups').trim().slice(0, 120);
  const area = String(req.query.area || '').trim().slice(0, 160);
  const radiusMiles = Math.min(Math.max(Number(req.query.radius || 10), 1), 50);

  if (!area) return res.status(400).json({ error: 'An area is required.' });

  try {
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      encodeURIComponent(area) + '&key=' + encodeURIComponent(key);
    const geoResponse = await fetch(geocodeUrl);
    const geo = await geoResponse.json();

    if (!geo.results?.length) {
      return res.status(502).json({
        error: 'Google could not resolve that area.',
        geocodingStatus: geo.status || 'UNKNOWN',
        details: geo.error_message || null,
        hint: 'Check that the Geocoding API is enabled for the same Google Cloud project as the API key.'
      });
    }

    const center = geo.results[0].geometry.location;
    // Places API (New) limits a single searchText location-bias circle to 50 km.
    // For a 50-mile ZELVUN search, use the centre plus four nearby centres and
    // merge/dedupe the results so the full requested radius is covered.
    const searchCenters = buildSearchCenters(center, radiusMiles);
    const radiusMeters = Math.min(radiusMiles * 1609.344, 50000);

    const placeResponses = await Promise.all(searchCenters.map(searchCenter =>
      fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri'
      },
      body: JSON.stringify({
        textQuery: interest + ' groups clubs communities near ' + area,
        pageSize: 20,
        locationBias: {
          circle: {
            center: { latitude: searchCenter.lat, longitude: searchCenter.lng },
            radius: radiusMeters
          }
        }
      })
    }));

    const placePayloads = await Promise.all(placeResponses.map(response => response.json()));
    const failed = placeResponses.findIndex(response => !response.ok);
    if (failed !== -1) {
      return res.status(502).json({ error: 'The local places service returned an error.', details: placePayloads[failed]?.error?.message || null });
    }

    const uniquePlaces = new Map();
    for (const payload of placePayloads) {
      for (const place of (payload.places || [])) {
        if (place.id && !uniquePlaces.has(place.id)) uniquePlaces.set(place.id, place);
      }
    }

    const groups = Array.from(uniquePlaces.values()).map(place => {
      const lat = place.location?.latitude;
      const lng = place.location?.longitude;
      const distanceMiles = (lat == null || lng == null) ? null : haversineMiles(center.lat, center.lng, lat, lng);
      return {
        id: place.id,
        name: place.displayName?.text || 'Local group',
        address: place.formattedAddress || '',
        distanceMiles,
        distanceLabel: distanceMiles == null ? 'Distance unavailable' : distanceMiles < 0.1 ? 'Less than 0.1 miles away' : distanceMiles.toFixed(1) + ' miles away',
        rating: place.rating || null,
        userRatingCount: place.userRatingCount || 0,
        websiteUri: place.websiteUri || null,
        googleMapsUri: place.googleMapsUri || null
      };
    }).filter(group => group.distanceMiles == null || group.distanceMiles <= radiusMiles)
      .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));

    return res.status(200).json({
      query: interest,
      area,
      radiusMiles,
      count: groups.length,
      groups,
      attribution: 'Place information provided by Google Maps Platform.'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to search the local directory right now.' });
  }
}

function buildSearchCenters(center, radiusMiles) {
  if (radiusMiles <= 31) return [center];
  const offsetMiles = 20;
  const latOffset = offsetMiles / 69;
  const lonOffset = offsetMiles / (69 * Math.max(Math.cos(center.lat * Math.PI / 180), 0.2));
  return [
    center,
    { lat: center.lat + latOffset, lng: center.lng },
    { lat: center.lat - latOffset, lng: center.lng },
    { lat: center.lat, lng: center.lng + lonOffset },
    { lat: center.lat, lng: center.lng - lonOffset }
  ];
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.7613;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
