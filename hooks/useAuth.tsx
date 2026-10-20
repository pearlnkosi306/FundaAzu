import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { configurationError, isConfigured, supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  first_name: string;
  surname: string;
  mode: string;
  mode_variant: string | null;
  language: string;
  music: boolean;
  visuals: boolean;
  theme: string;
  onboarded: boolean;
}

type ProfileUpdate = Partial<Omit<Profile, "id">>;

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (details: { firstName: string; surname: string; email: string; password: string }) => Promise<string | "CHECK_EMAIL" | null>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function defaultProfile(id: string, firstName = "", surname = ""): Profile {
  return {
    id,
    first_name: firstName,
    surname,
    mode: "friend",
    mode_variant: null,
    language: "en",
    music: false,
    visuals: true,
    theme: "savanna",
    onboarded: false,
  };
}

function errorMessage(error: { message: string }): string {
  return error.message || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (currentSession: Session | null) => {
    setSession(currentSession);
    setError(null);
    if (!currentSession) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentSession.user.id)
      .maybeSingle();
    if (readError) {
      setProfile(null);
      setError(errorMessage(readError));
      setLoading(false);
      return;
    }
    if (data) {
      setProfile(data as Profile);
      setLoading(false);
      return;
    }

    const metadata = currentSession.user.user_metadata;
    const initial = defaultProfile(
      currentSession.user.id,
      typeof metadata.first_name === "string" ? metadata.first_name : "",
      typeof metadata.surname === "string" ? metadata.surname : ""
    );
    const { data: created, error: createError } = await supabase
      .from("profiles")
      .upsert(initial)
      .select("*")
      .single();
    if (createError) {
      setProfile(null);
      setError(errorMessage(createError));
    } else {
      setProfile(created as Profile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    let active = true;
    const applySession = (nextSession: Session | null) => {
      if (active) void loadProfile(nextSession);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(errorMessage(sessionError));
        setLoading(false);
        return;
      }
      applySession(data.session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) return configurationError();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    return signInError ? errorMessage(signInError) : null;
  }, []);

  const signUp = useCallback(async ({ firstName, surname, email, password }: {
    firstName: string; surname: string; email: string; password: string;
  }) => {
    if (!isConfigured) return configurationError();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, surname } },
    });
    if (signUpError) return errorMessage(signUpError);
    return data.session ? null : "CHECK_EMAIL";
  }, []);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw new Error(errorMessage(signOutError));
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!session) throw new Error("You must be signed in to update your profile.");
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select("*")
      .single();
    if (updateError) throw new Error(errorMessage(updateError));
    setProfile(data as Profile);
  }, [session]);

  const value = useMemo(() => ({
    session, profile, loading, error, signIn, signUp, signOut, updateProfile,
  }), [session, profile, loading, error, signIn, signUp, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
