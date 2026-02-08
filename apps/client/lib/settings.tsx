import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_API_URL = "@precios_api_url";
const KEY_DEFAULT_CURRENCY = "@precios_default_currency";
const KEY_FAVORITE_CRYPTOS = "@precios_favorite_cryptos";
const KEY_THEME = "@precios_theme";

export type ThemeMode = "light" | "dark";

function getDefaultApiUrl(): string {
  const env = typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL;
  if (env) return env.replace(/\/+$/, "");
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  if (Platform.OS === "ios") return "http://127.0.0.1:3000";
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }
  return "http://127.0.0.1:3000";
}

export type Settings = {
  apiUrl: string;
  defaultCurrency: string;
  favoriteCryptos: string[];
  theme: ThemeMode;
};

type SettingsContextValue = {
  settings: Settings;
  setApiUrl: (url: string) => Promise<void>;
  setDefaultCurrency: (currency: string) => Promise<void>;
  setFavoriteCryptos: (list: string[]) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoaded: boolean;
};

const defaultSettings: Settings = {
  apiUrl: getDefaultApiUrl(),
  defaultCurrency: "USD",
  favoriteCryptos: ["BTC", "ETH", "SOL", "AVAX"],
  theme: "dark",
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [url, currency, cryptos, theme] = await Promise.all([
          AsyncStorage.getItem(KEY_API_URL),
          AsyncStorage.getItem(KEY_DEFAULT_CURRENCY),
          AsyncStorage.getItem(KEY_FAVORITE_CRYPTOS),
          AsyncStorage.getItem(KEY_THEME),
        ]);
        setSettings({
          apiUrl: url ?? defaultSettings.apiUrl,
          defaultCurrency: currency ?? defaultSettings.defaultCurrency,
          favoriteCryptos: cryptos ? JSON.parse(cryptos) : defaultSettings.favoriteCryptos,
          theme: theme === "light" || theme === "dark" ? theme : defaultSettings.theme,
        });
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setApiUrl = useCallback(async (url: string) => {
    const trimmed = url.trim().replace(/\/+$/, "") || getDefaultApiUrl();
    await AsyncStorage.setItem(KEY_API_URL, trimmed);
    setSettings((s) => ({ ...s, apiUrl: trimmed }));
  }, []);

  const setDefaultCurrency = useCallback(async (currency: string) => {
    await AsyncStorage.setItem(KEY_DEFAULT_CURRENCY, currency);
    setSettings((s) => ({ ...s, defaultCurrency: currency }));
  }, []);

  const setFavoriteCryptos = useCallback(async (list: string[]) => {
    const valid = list.map((s) => s.trim().toUpperCase()).filter(Boolean);
    await AsyncStorage.setItem(KEY_FAVORITE_CRYPTOS, JSON.stringify(valid));
    setSettings((s) => ({ ...s, favoriteCryptos: valid.length ? valid : defaultSettings.favoriteCryptos }));
  }, []);

  const setTheme = useCallback(async (theme: ThemeMode) => {
    await AsyncStorage.setItem(KEY_THEME, theme);
    setSettings((s) => ({ ...s, theme }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setApiUrl,
        setDefaultCurrency,
        setFavoriteCryptos,
        setTheme,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
