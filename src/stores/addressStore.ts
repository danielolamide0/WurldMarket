import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SavedAddress } from '@/types'
import { generateId } from '@/lib/utils'

interface AddressState {
  addresses: SavedAddress[]
  addAddress: (
    userId: string,
    label: string,
    fullAddress: string,
    city: string,
    postcode: string,
    isPrimary?: boolean
  ) => SavedAddress
  updateAddress: (
    addressId: string,
    updates: Partial<Omit<SavedAddress, 'id' | 'userId' | 'createdAt'>>
  ) => void
  deleteAddress: (addressId: string) => void
  setPrimaryAddress: (userId: string, addressId: string) => void
  getAddressesByUser: (userId: string) => SavedAddress[]
  getPrimaryAddress: (userId: string) => SavedAddress | undefined
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (userId, label, fullAddress, city, postcode, isPrimary = false) => {
        const newAddress: SavedAddress = {
          id: `addr-${generateId()}`,
          userId,
          label,
          fullAddress,
          city,
          postcode,
          isPrimary: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => {
          let updatedAddresses = [...state.addresses, newAddress]

          // If this is the first address for the user or isPrimary is true, make it primary
          const userAddresses = updatedAddresses.filter((a) => a.userId === userId)
          if (userAddresses.length === 1 || isPrimary) {
            updatedAddresses = updatedAddresses.map((a) => ({
              ...a,
              isPrimary: a.userId === userId ? a.id === newAddress.id : a.isPrimary,
            }))
            newAddress.isPrimary = true
          }

          return { addresses: updatedAddresses }
        })

        return newAddress
      },

      updateAddress: (addressId, updates) => {
        set((state) => ({
          addresses: state.addresses.map((address) =>
            address.id === addressId ? { ...address, ...updates } : address
          ),
        }))
      },

      deleteAddress: (addressId) => {
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
      },

      setPrimaryAddress: (userId, addressId) => {
        set((state) => ({
          addresses: state.addresses.map((address) => ({
            ...address,
            isPrimary:
              address.userId === userId ? address.id === addressId : address.isPrimary,
          })),
        }))
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
