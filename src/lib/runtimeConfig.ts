type RouterMode = "browser" | "hash";

const routerMode = import.meta.env.VITE_ROUTER_MODE;

export const getRouterMode = (): RouterMode => {
  return routerMode === "hash" ? "hash" : "browser";
};

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  return {
    url,
    publishableKey,
    isConfigured: Boolean(url && publishableKey),
  };
};

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;
