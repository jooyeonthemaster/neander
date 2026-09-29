'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface QuoteOptionFlowState {
  /** Zero-based position within the currently available pages. */
  index: number;
  total: number;
  label: string;
  nextLabel: string | null;
  visited: boolean[];
  visitedCount: number;
  allVisited: boolean;
  goPrevious: () => void;
  /** Advances in order. At the end, returns to the first missed page. */
  goNext: () => void;
  goFirstUnvisited: () => void;
}

interface Registration {
  register: (owner: string, state: QuoteOptionFlowState) => void;
  unregister: (owner: string) => void;
}

const FlowContext = createContext<QuoteOptionFlowState | null>(null);
const RegistrationContext = createContext<Registration | null>(null);

/** One popover owns one active flow. Inactive service panels can remain mounted
 * without replacing the navigation registered by its visible panel. */
export function QuoteOptionFlowProvider({ children }: { children: ReactNode }) {
  const [registered, setRegistered] = useState<{ owner: string; state: QuoteOptionFlowState } | null>(null);
  const register = useCallback((owner: string, state: QuoteOptionFlowState) => {
    setRegistered((current) => current?.owner === owner && current.state === state ? current : { owner, state });
  }, []);
  const unregister = useCallback((owner: string) => {
    // An old panel's cleanup must never clear a newly activated panel.
    setRegistered((current) => current?.owner === owner ? null : current);
  }, []);
  const registration = useMemo(() => ({ register, unregister }), [register, unregister]);

  return <RegistrationContext.Provider value={registration}>
    <FlowContext.Provider value={registered?.state ?? null}>{children}</FlowContext.Provider>
  </RegistrationContext.Provider>;
}

export function useQuoteOptionFlow(): QuoteOptionFlowState | null {
  return useContext(FlowContext);
}

/** Internal bridge for QuoteOptionPages. Reading registration separately keeps
 * page content from rerendering merely because footer navigation updates. */
export function useQuoteOptionFlowRegistration(): Registration | null {
  return useContext(RegistrationContext);
}
