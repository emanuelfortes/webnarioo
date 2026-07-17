import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { sb } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError('');
    const { error: authError } = await sb.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Login inválido: ' + authError.message);
      return false;
    }
    const { data } = await sb.auth.getSession();
    setSession(data.session);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await sb.auth.signOut();
    setSession(null);
  }, []);

  return { session, checking, error, login, logout, isAuthenticated: !!session };
}
