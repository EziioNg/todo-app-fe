'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type User = {
  id: string;
  email: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch('https://api.eziio.site/auth/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const result = await res.json();
      setUser(result.data);
    } catch (error) {
      setUser(null);
      console.log('error: ', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('https://api.eziio.site/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refetchUser: fetchMe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
