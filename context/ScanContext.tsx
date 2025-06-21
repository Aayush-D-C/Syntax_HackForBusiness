// context/ScanContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ScanContextType = {
  scanData: string;
  setScanData: (data: string) => void;
  clearScanData: () => void;
};

const ScanContext = createContext<ScanContextType>({
  scanData: '',
  setScanData: () => {},
  clearScanData: () => {},
});

export const ScanProvider = ({ children }: { children: ReactNode }) => {
  const [scanData, setScanData] = useState('');

  const clearScanData = () => setScanData('');

  return (
    <ScanContext.Provider value={{ scanData, setScanData, clearScanData }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);