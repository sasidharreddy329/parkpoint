type RouterMode = "browser" | "hash";

const routerMode = import.meta.env.VITE_ROUTER_MODE;

const PLACEHOLDER_SUPABASE_URLS = new Set([
  "https://your-project-ref.supabase.co",
]);

const PLACEHOLDER_SUPABASE_KEYS = new Set([
  "your-supabase-anon-key",
]);

const isValidSupabaseUrl = (value?: string) => {
  if (!value || PLACEHOLDER_SUPABASE_URLS.has(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
};

const isValidSupabasePublishableKey = (value?: string) => {
  if (!value || PLACEHOLDER_SUPABASE_KEYS.has(value)) return false;
  return value.length > 20;
};

export const getRouterMode = (): RouterMode => {
  return routerMode === "hash" ? "hash" : "browser";
};

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  const hasValidUrl = isValidSupabaseUrl(url);
  const hasValidPublishableKey = isValidSupabasePublishableKey(publishableKey);

  return {
    url,
    publishableKey,
    isConfigured: hasValidUrl && hasValidPublishableKey,
  };
};

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;
