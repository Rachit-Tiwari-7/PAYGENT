"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "./supabase-client";

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  name?: string | null;
  role: "CLIENT" | "DEVELOPER" | "AUDITOR" | "ADMIN";
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithPassword: async () => ({ error: null }),
  signUpWithPassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string, userEmail?: string | null) => {
    try {
      const { data, error } = await supabaseBrowser
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          id: data.id,
          email: data.email || userEmail || null,
          fullName: data.full_name || null,
          name: data.full_name || null,
          role: data.role || "CLIENT",
          avatarUrl: data.avatar_url || null,
        });
      } else {
        // Fallback default profile if not found
        setProfile({
          id: userId,
          email: userEmail || null,
          fullName: userEmail ? userEmail.split("@")[0] : "Client",
          name: userEmail ? userEmail.split("@")[0] : "Client",
          role: "CLIENT",
          avatarUrl: null,
        });
      }
    } catch {
      // Ignored: keep default
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initial session load
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data } = await supabaseBrowser.auth.getSession();
      if (data?.session?.user) {
        await fetchProfile(data.session.user.id, data.session.user.email);
      }
    }
    return { error };
  };

  const signUpWithPassword = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split("@")[0],
          role: "CLIENT",
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

