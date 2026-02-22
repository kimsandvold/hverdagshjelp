export const CITY_COORDS = {
  Oslo: { lat: 59.9139, lng: 10.7522 },
  Bergen: { lat: 60.3913, lng: 5.3221 },
  Trondheim: { lat: 63.4305, lng: 10.3951 },
  Stavanger: { lat: 58.9700, lng: 5.7331 },
  Tromsø: { lat: 69.6492, lng: 18.9553 },
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function searchPlace(query) {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=default&lat=62&lon=10`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return (data.features || [])
      .filter((f) => f.properties?.country === 'Norge')
      .map((f) => {
        const p = f.properties
        const parts = [p.name, p.city || p.county].filter(Boolean)
        return {
          label: parts.join(', '),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }
      })
  } catch {
    return []
  }
}

export function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  })
}
