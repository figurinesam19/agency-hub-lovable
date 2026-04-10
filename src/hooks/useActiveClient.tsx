import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CrmClient {
  id: number;
  entreprise: string | null;
  email: string | null;
  telephone: string | null;
  siret: string | null;
}

interface ActiveClientContextType {
  clients: CrmClient[];
  activeClient: CrmClient | null;
  setActiveClientId: (id: number | null) => void;
  refreshClients: () => Promise<void>;
}

const ActiveClientContext = createContext<ActiveClientContextType>({
  clients: [],
  activeClient: null,
  setActiveClientId: () => {},
  refreshClients: async () => {},
});

export function ActiveClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [activeClientId, setActiveClientId] = useState<number | null>(null);

  const refreshClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("clients")
      .select("id, entreprise, email, telephone, siret")
      .order("entreprise");
    const list = data ?? [];
    setClients(list);
    // If current active client no longer exists, reset
    if (activeClientId && !list.find((c) => c.id === activeClientId)) {
      setActiveClientId(list.length > 0 ? list[0].id : null);
    }
    // Auto-select first if none selected
    if (!activeClientId && list.length > 0) {
      setActiveClientId(list[0].id);
    }
  }, [user, activeClientId]);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const activeClient = clients.find((c) => c.id === activeClientId) ?? null;

  return (
    <ActiveClientContext.Provider value={{ clients, activeClient, setActiveClientId, refreshClients }}>
      {children}
    </ActiveClientContext.Provider>
  );
}

export function useActiveClient() {
  return useContext(ActiveClientContext);
}
