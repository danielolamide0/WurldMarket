import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface SignupOptions {
  username: string
  password: string
  name: string
  email?: string
  phone?: string
  role?: 'customer' | 'vendor'
  companyName?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (options: SignupOptions) => Promise<{ success: boolean; error?: string; vendorId?: string }>
  checkUsernameExists: (username: string) => Promise<boolean>
  resetPassword: (username: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (updates: Partial<User>) => Promise<boolean>
  deleteAccount: (userId: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: data.error || 'Invalid username or password',
            })
            return false
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to connect to server',
          })
          return false
        }
      },

      signup: async (options: SignupOptions) => {
        const { username, password, name, email, phone, role = 'customer', companyName } = options
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              password,
              name,
              email,
              phone,
              role,
              companyName,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({
              isLoading: false,
              error: data.error || 'Signup failed',
            })
            return { success: false, error: data.error }
          }

        set({
            user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

          return { success: true, vendorId: data.vendorId }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to connect to server',
          })
          return { success: false, error: 'Failed to connect to server' }
        }
      },

      checkUsernameExists: async (username: string) => {
        try {
          const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
          const data = await response.json()
          return data.exists
        } catch {
        return false
        }
      },

      resetPassword: async (username: string) => {
        set({ isLoading: true, error: null })

        // For now, just check if username exists
        // In production, this would send an email with reset link
        try {
          const exists = await get().checkUsernameExists(username)

          if (!exists) {
          set({
            isLoading: false,
            error: 'Username not found',
          })
          return { success: false, error: 'Username not found' }
        }

        set({
          isLoading: false,
          error: null,
        })
        return { success: true }
        } catch {
          set({
            isLoading: false,
            error: 'Failed to reset password',
          })
          return { success: false, error: 'Failed to reset password' }
        }
      },

      updateUser: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null })

        const currentUser = get().user
        if (!currentUser) {
          set({ isLoading: false, error: 'No user logged in' })
          return false
        }

        try {
          const response = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...updates }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Failed to update profile' })
            return false
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          })
          return true
        } catch (error) {
          set({ isLoading: false, error: 'Failed to connect to server' })
          return false
        }
      },

      deleteAccount: async (userId: string) => {
        set({ isLoading: true, error: null })

        try {
          // Remove from localStorage
          const storedUsers = localStorage.getItem('wurldbasket-users')
          if (storedUsers) {
            let registeredUsers: User[] = JSON.parse(storedUsers)
            registeredUsers = registeredUsers.filter((u) => u.id !== userId)
            localStorage.setItem('wurldbasket-users', JSON.stringify(registeredUsers))
          }

          // Clear auth state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          set({ isLoading: false, error: 'Failed to delete account' })
          return false
        }
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
