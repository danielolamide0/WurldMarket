import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SavedAddress } from '@/types'

interface AddressState {
  addresses: SavedAddress[]
  isLoading: boolean
  fetchAddresses: (userId: string) => Promise<void>
  addAddress: (
    userId: string,
    label: string,
    fullAddress: string,
    city: string,
    postcode: string,
    isPrimary?: boolean,
    coordinates?: { lat: number; lng: number }
  ) => Promise<SavedAddress | null>
  updateAddress: (
    addressId: string,
    updates: Partial<Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>>
  ) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  setPrimaryAddress: (userId: string, addressId: string) => Promise<void>
  getAddressesByUser: (userId: string) => SavedAddress[]
  getPrimaryAddress: (userId: string) => SavedAddress | undefined
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,

      fetchAddresses: async (userId: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/addresses?userId=${userId}`)
          const data = await response.json()
          if (response.ok) {
            set({ addresses: data.addresses || [], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      addAddress: async (userId, label, fullAddress, city, postcode, isPrimary = false, coordinates) => {
        try {
          const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, label, fullAddress, city, postcode, isPrimary, coordinates }),
          })

          const data = await response.json()

          if (response.ok) {
            const newAddress = data.address
            set((state) => {
              // If new address is primary, update others
              let updatedAddresses = state.addresses
              if (newAddress.isPrimary) {
                updatedAddresses = updatedAddresses.map((a) => ({
                  ...a,
                  isPrimary: a.userId === userId ? false : a.isPrimary,
                }))
              }
              return { addresses: [...updatedAddresses, newAddress] }
            })
            return newAddress
          }
          return null
        } catch {
          return null
        }
      },

      updateAddress: async (addressId, updates) => {
        try {
          const response = await fetch('/api/addresses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: addressId, ...updates }),
          })

          if (response.ok) {
            const data = await response.json()
            set((state) => ({
              addresses: state.addresses.map((address) =>
                address.id === addressId ? data.address : address
              ),
            }))
          }
        } catch {
          // Handle error silently
        }
      },

      deleteAddress: async (addressId) => {
        try {
          const response = await fetch(`/api/addresses?id=${addressId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            set((state) => {
              const addressToDelete = state.addresses.find((a) => a.id === addressId)
              let updatedAddresses = state.addresses.filter((a) => a.id !== addressId)

              // If deleted address was primary, make the first remaining address primary
              if (addressToDelete?.isPrimary) {
                const userAddresses = updatedAddresses.filter(
                  (a) => a.userId === addressToDelete.userId
                )
                if (userAddresses.length > 0) {
                  updatedAddresses = updatedAddresses.map((a) =>
                    a.id === userAddresses[0].id ? { ...a, isPrimary: true } : a
                  )
                }
              }

              return { addresses: updatedAddresses }
            })
          }
        } catch {
          // Handle error silently
        }
      },

      setPrimaryAddress: async (userId, addressId) => {
        try {
          const response = await fetch('/api/addresses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: addressId, isPrimary: true }),
          })

          if (response.ok) {
            set((state) => ({
              addresses: state.addresses.map((address) => ({
                ...address,
                isPrimary:
                  address.userId === userId ? address.id === addressId : address.isPrimary,
              })),
            }))
          }
        } catch {
          // Handle error silently
        }
      },

      getAddressesByUser: (userId) => {
        return get().addresses.filter((address) => address.userId === userId)
      },

      getPrimaryAddress: (userId) => {
        return get().addresses.find(
          (address) => address.userId === userId && address.isPrimary
        )
      },
    }),
    {
      name: 'wurldbasket-addresses',
    }
  )
)
