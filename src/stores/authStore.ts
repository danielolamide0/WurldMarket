import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { users } from '@/data/users'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
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

        const user = users.find(
          (u) => u.username === username && u.password === password
        )

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
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Invalid username or password',
          })
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
      name: 'afrimart-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
