import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Profile } from '../types';

// MOCK usuarios para demo
const MOCK_USERS: Record<string, { password: string; profile: Profile }> = {
  'admin@velza.pe': {
    password: 'Velza2025!',
    profile: {
      id: '21c2295a-ca42-4979-bca5-84d7e8ff1049',
      user_id: '28097abc-16ff-495b-afd7-4285060883f8',
      full_name: 'Carlos Admin',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  'vendedor1@velza.pe': {
    password: 'Velza2025!',
    profile: {
      id: '0eb8ca83-7f15-492a-b93d-c3609fde22e6',
      user_id: '55fff170-b0f4-46ea-ab74-006f8de80a9d',
      full_name: 'María García',
      role: 'vendor',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
};

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(email: string, password: string) {
    const user = MOCK_USERS[email];
    if (!user) {
      return { error: 'Correo o contraseña incorrectos' };
    }
    setSession({ user: { id: user.profile.user_id } } as Session);
    setProfile(user.profile);
    return { error: null };
  }

  async function signOut() {
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
