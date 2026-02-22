import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useLocationStore = create(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      radiusKm: 4,
      locationLabel: '',
      isSet: false,

      setLocation: ({ lat, lng, radiusKm, locationLabel }) =>
        set({ lat, lng, radiusKm, locationLabel, isSet: true }),

      clearLocation: () =>
        set({ lat: null, lng: null, radiusKm: 4, locationLabel: '', isSet: false }),
    }),
    { name: 'hverdagshjelp-location' }
  )
)

export default useLocationStore
