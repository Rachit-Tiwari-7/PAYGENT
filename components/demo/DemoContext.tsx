"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { QuickDemoModal } from "./QuickDemoModal";

interface DemoContextType {
  openDemo: () => void;
  closeDemo: () => void;
  isDemoOpen: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <DemoContext.Provider
      value={{
        openDemo: () => setIsDemoOpen(true),
        closeDemo: () => setIsDemoOpen(false),
        isDemoOpen,
      }}
    >
      {children}
      <QuickDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

