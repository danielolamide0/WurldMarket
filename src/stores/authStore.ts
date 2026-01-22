import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { users } from '@/data/users'
import { generateId } from '@/lib/utils'

interface SignupOptions {
  username: string
  password: string
  name: string
  email?: string
  role?: 'customer' | 'vendor'
  companyName?: string // Required for vendor signup
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (options: SignupOptions) => Promise<{ success: boolean; error?: string; vendorId?: string }>
  checkUsernameExists: (username: string) => boolean
  resetPassword: (username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check in-memory users first (for demo users)
        let user = users.find(
          (u) => u.username === username && u.password === password
        )

        // If not found, check localStorage for registered users
        if (!user) {
          const storedUsers = localStorage.getItem('wurldbasket-users')
          if (storedUsers) {
            const registeredUsers: User[] = JSON.parse(storedUsers)
            user = registeredUsers.find(
              (u) => u.username === username && u.password === password
            )
          }
        }

        if (user) {
          // Don't store password in state
          const { password: _, ...safeUser } = user
          set({
            user: user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } else {
          // Check if username exists but password is wrong
          const usernameExists = users.some((u) => u.username === username) ||
            (() => {
              const storedUsers = localStorage.getItem('wurldbasket-users')
              if (storedUsers) {
                const registeredUsers: User[] = JSON.parse(storedUsers)
                return registeredUsers.some((u) => u.username === username)
              }
              return false
            })()

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: usernameExists
              ? 'Incorrect password. Please try again or reset your password.'
              : 'Invalid username or password',
          })
          return false
        }
      },

      signup: async (options: SignupOptions) => {
        const { username, password, name, email, role = 'customer', companyName } = options
        set({ isLoading: true, error: null })

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if username already exists
        const usernameExists = users.some((u) => u.username === username) ||
          (() => {
            const storedUsers = localStorage.getItem('wurldbasket-users')
            if (storedUsers) {
              const registeredUsers: User[] = JSON.parse(storedUsers)
              return registeredUsers.some((u) => u.username === username)
            }
            return false
          })()

        if (usernameExists) {
          set({
            isLoading: false,
            error: 'Username already exists. Please choose a different username.',
          })
          return { success: false, error: 'Username already exists' }
        }

        // For vendor signup, create vendor profile
        let vendorId: string | undefined
        if (role === 'vendor') {
          if (!companyName) {
            set({
              isLoading: false,
              error: 'Company name is required for vendor signup.',
            })
            return { success: false, error: 'Company name required' }
          }

          // Create vendor ID based on company name
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          vendorId = `vendor-${slug}-${generateId()}`

          // Store vendor in localStorage
          const storedVendors = localStorage.getItem('wurldbasket-vendors')
          const registeredVendors = storedVendors ? JSON.parse(storedVendors) : []
          const newVendor = {
            id: vendorId,
            name: companyName,
            slug,
            description: '',
            storeIds: [],
            contactEmail: email || '',
            contactPhone: '',
            isLive: false,
            createdAt: new Date().toISOString(),
          }
          registeredVendors.push(newVendor)
          localStorage.setItem('wurldbasket-vendors', JSON.stringify(registeredVendors))
        }

        // Create new user
        const newUser: User = {
          id: role === 'vendor' ? `vendor-user-${generateId()}` : `cust-${generateId()}`,
          username,
          password, // In production, this should be hashed
          role,
          name,
          email,
          vendorId, // Will be undefined for customers
          createdAt: new Date().toISOString(),
        }

        // Store in localStorage (for demo - will be replaced with database)
        const storedUsers = localStorage.getItem('wurldbasket-users')
        const registeredUsers: User[] = storedUsers ? JSON.parse(storedUsers) : []
        registeredUsers.push(newUser)
        localStorage.setItem('wurldbasket-users', JSON.stringify(registeredUsers))

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        return { success: true, vendorId }
      },

      checkUsernameExists: (username: string) => {
        const existsInMemory = users.some((u) => u.username === username)
        if (existsInMemory) return true

        const storedUsers = localStorage.getItem('wurldbasket-users')
        if (storedUsers) {
          const registeredUsers: User[] = JSON.parse(storedUsers)
          return registeredUsers.some((u) => u.username === username)
        }
        return false
      },

      resetPassword: async (username: string) => {
        set({ isLoading: true, error: null })

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const usernameExists = users.some((u) => u.username === username) ||
          (() => {
            const storedUsers = localStorage.getItem('wurldbasket-users')
            if (storedUsers) {
              const registeredUsers: User[] = JSON.parse(storedUsers)
              return registeredUsers.some((u) => u.username === username)
            }
            return false
          })()

        if (!usernameExists) {
          set({
            isLoading: false,
            error: 'Username not found',
          })
          return { success: false, error: 'Username not found' }
        }

        // In a real app, this would send an email with reset link
        // For demo, we'll just show a success message
        set({
          isLoading: false,
          error: null,
        })

        return { success: true }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'wurldbasket-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
