// Minimal stub to satisfy imports and point to backend API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Very small fake supabase client so existing code won't crash
export function createClient() {
  return {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        // Replace with real backend call if needed
        return { data: { session: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
    },
  };
}
