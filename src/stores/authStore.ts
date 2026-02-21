import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface SignupOptions {
  email: string
  verificationCode: string
  password: string
  name: string
  phone?: string
  role?: 'customer' | 'vendor'
  companyName?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  // Login with email or username
  login: (identifier: string, password: string) => Promise<boolean>
  // Email verification flow
  sendVerificationCode: (email: string, type: 'signup' | 'password-reset' | 'email-change', options?: { userId?: string }) => Promise<{ success: boolean; error?: string; timeRemaining?: number }>
  verifyCode: (email: string, code: string, type: 'signup' | 'password-reset') => Promise<{ success: boolean; error?: string }>
  // Signup with email verification
  signup: (options: SignupOptions) => Promise<{ success: boolean; error?: string; vendorId?: string }>
  // Password reset
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  // Change email (send code to new email, then confirm with code)
  sendEmailChangeCode: () => Promise<{ success: boolean; error?: string; timeRemaining?: number }>
  updateEmailWithCode: (newEmail: string, code: string) => Promise<{ success: boolean; error?: string }>
  // Legacy support
  checkUsernameExists: (username: string) => Promise<boolean>
  checkEmailExists: (email: string) => Promise<boolean>
  // User management
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

      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: data.error || 'Invalid credentials',
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

      sendVerificationCode: async (email: string, type: 'signup' | 'password-reset' | 'email-change', options?: { userId?: string }) => {
        set({ isLoading: true, error: null })

        try {
          const body: { email: string; type: string; userId?: string } = { email, type }
          if (type === 'email-change' && options?.userId) body.userId = options.userId
          const response = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

          const data = await response.json()

          if (!response.ok) {
            set({ isLoading: false, error: data.error })
            return { success: false, error: data.error, timeRemaining: data.timeRemaining }
          }

          set({ isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to send verification code' })
          return { success: false, error: 'Failed to send verification code' }
        }
      },

      verifyCode: async (email: string, code: string, type: 'signup' | 'password-reset') => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, type }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({ isLoading: false, error: data.error })
            return { success: false, error: data.error }
          }

          set({ isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to verify code' })
          return { success: false, error: 'Failed to verify code' }
        }
      },

      signup: async (options: SignupOptions) => {
        const { email, verificationCode, password, name, phone, role = 'customer', companyName } = options
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              verificationCode,
              password,
              name,
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

      resetPassword: async (email: string, code: string, newPassword: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
          })

          const data = await response.json()

          if (!response.ok) {
            set({ isLoading: false, error: data.error })
            return { success: false, error: data.error }
          }

          set({ isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to reset password' })
          return { success: false, error: 'Failed to reset password' }
        }
      },

      sendEmailChangeCode: async () => {
        const user = get().user
        if (!user?.id) {
          return { success: false, error: 'You must be signed in to change your email' }
        }
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'email-change', userId: user.id }),
          })
          const data = await response.json()
          if (!response.ok) {
            set({ isLoading: false, error: data.error })
            return { success: false, error: data.error, timeRemaining: data.timeRemaining }
          }
          set({ isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to send verification code' })
          return { success: false, error: 'Failed to send verification code' }
        }
      },

      updateEmailWithCode: async (newEmail: string, code: string) => {
        const user = get().user
        if (!user?.id) {
          set({ error: 'You must be signed in to change your email' })
          return { success: false, error: 'You must be signed in to change your email' }
        }
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/update-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, newEmail, code }),
          })
          const data = await response.json()
          if (!response.ok) {
            set({ isLoading: false, error: data.error })
            return { success: false, error: data.error }
          }
          set({ user: data.user, isLoading: false, error: null })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: 'Failed to update email' })
          return { success: false, error: 'Failed to update email' }
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

      checkEmailExists: async (email: string) => {
        try {
          const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
          const data = await response.json()
          return data.exists
        } catch {
          return false
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
          const response = await fetch('/api/auth/delete-account', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })

          if (!response.ok) {
            const data = await response.json()
            set({ isLoading: false, error: data.error || 'Failed to delete account' })
            return false
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
      // Don't restore the old test account "John Customer" — treat as logged out
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { user?: User | null; isAuthenticated?: boolean } | undefined
        const user = persisted?.user
        const isTestUser =
          user?.email === 'customer@example.com' || user?.name === 'John Customer'
        if (persisted?.isAuthenticated && user && isTestUser) {
          return { ...currentState, user: null, isAuthenticated: false }
        }
        return { ...currentState, ...persisted }
      },
    }
  )
)
