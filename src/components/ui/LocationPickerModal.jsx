import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Modal from './Modal'
import { getBrowserLocation } from '../../lib/geo'

// Fix Leaflet default marker icon (broken by Vite bundling)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const NORWAY_CENTER = { lat: 64.5, lng: 12.0 }
const FALLBACK_ZOOM = 5

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    // Leaflet needs a size recalc when rendered inside a modal
    const timer = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function FitToCircle({ lat, lng, radiusKm }) {
  const map = useMap()
  useEffect(() => {
    if (lat == null || lng == null) return
    const latOffset = radiusKm / 111
    const lngOffset = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
    const bounds = L.latLngBounds(
      [lat - latOffset, lng - lngOffset],
      [lat + latOffset, lng + lngOffset]
    )
    map.fitBounds(bounds, { padding: [30, 30], animate: false })
  }, [lat, lng, radiusKm, map])
  return null
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialRadiusKm = 4,
}) {
  const [center, setCenter] = useState(null)
  const [radiusKm, setRadiusKm] = useState(initialRadiusKm)
  const [loading, setLoading] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  // Determine initial position when modal opens
  useEffect(() => {
    if (!isOpen) return

    setRadiusKm(initialRadiusKm)
    setIsFallback(false)

    if (initialLat != null && initialLng != null) {
      setCenter({ lat: initialLat, lng: initialLng })
    } else {
      setLoading(true)
      getBrowserLocation().then((loc) => {
        setLoading(false)
        if (loc) {
          setCenter(loc)
        } else {
          setCenter(NORWAY_CENTER)
          setIsFallback(true)
        }
      })
    }
  }, [isOpen, initialLat, initialLng, initialRadiusKm])

  const handleMapClick = useCallback((latlng) => {
    setCenter({ lat: latlng.lat, lng: latlng.lng })
    setIsFallback(false)
  }, [])

  const handleUseMyLocation = async () => {
    setLoading(true)
    const loc = await getBrowserLocation()
    setLoading(false)
    if (loc) {
      setCenter(loc)
      setIsFallback(false)
    }
  }

  const handleConfirm = () => {
    if (center) {
      onConfirm({ lat: center.lat, lng: center.lng, radiusKm })
    }
  }

  const handleClear = () => {
    onConfirm(null)
  }

  if (!center && !loading) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Velg område" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {loading ? (
          <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100">
            <p className="text-sm text-gray-500">Henter posisjon...</p>
          </div>
        ) : center ? (
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={isFallback ? FALLBACK_ZOOM : 13}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                key={`${center.lat}-${center.lng}-${radiusKm}`}
                center={[center.lat, center.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#6366f1',
                  fillColor: '#6366f1',
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />
              <Marker
                position={[center.lat, center.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng()
                    setCenter({ lat, lng })
                    setIsFallback(false)
                  },
                }}
              />
              <InvalidateSize />
              <MapClickHandler onMapClick={handleMapClick} />
              {!isFallback && (
                <FitToCircle lat={center.lat} lng={center.lng} radiusKm={radiusKm} />
              )}
            </MapContainer>
          </div>
        ) : null}

        {/* Radius slider */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Radius: {radiusKm} km
          </label>
          <input
            type="range"
            min={1}
            max={200}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Bruk min posisjon
          </button>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
            >
              Alle steder
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 cursor-pointer"
            >
              Bekreft
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
