import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, API_URL } from '../utils/supabase-client';
import { publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'company_admin' | 'commuter' | 'driver';
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, companyName?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        await fetchUserData(session.access_token);
        return;
      }

      // Fallback: if an auth token was stored in localStorage by the app (e.g., native backend login), use it
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken) {
        setAccessToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (err) {
            // ignore parse errors
          }
        } else {
          await fetchUserData(storedToken);
        }
      }
    } catch (error) {
      // Session check errors are handled silently
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserData(token: string) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const { user: userData } = await response.json();
        setUser(userData);
      }
    } catch (error) {
      // User data fetch errors are handled silently
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    if (data.session) {
      setAccessToken(data.session.access_token);
      await fetchUserData(data.session.access_token);
    }
  }

  async function signUp(email: string, password: string, name: string, role: string, companyName?: string) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name, role, companyName })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || 'Sign up failed');
    }

    // Return server response to caller (do not auto sign-in). Caller will
    // handle redirecting the user to the login view and showing messages.
    return data;
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // ignore errors from supabase signOut
    }
    // Clear local auth state and any stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);

    // Redirect to login page
    try {
      window.location.href = '/login';
    } catch (err) {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
