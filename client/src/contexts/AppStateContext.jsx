import { createContext, useContext, useEffect, useState } from 'react';

const AppStateContext = createContext(null);

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

const getStoredNumber = (key, fallback) => {
  if (!canUseStorage()) return fallback;
  const stored = localStorage.getItem(key);
  return stored ? Number(stored) : fallback;
};

export const AppStateProvider = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState(() =>
    getStoredNumber('saarthi-wallet-balance', 10000)
  );
  const [addedTransactions, setAddedTransactions] = useState(() => {
    if (!canUseStorage()) return [];
    try {
      return JSON.parse(localStorage.getItem('saarthi-added-transactions') || '[]');
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    if (canUseStorage()) {
      localStorage.setItem('saarthi-wallet-balance', walletBalance);
    }
  }, [walletBalance]);

  useEffect(() => {
    if (canUseStorage()) {
      localStorage.setItem('saarthi-added-transactions', JSON.stringify(addedTransactions));
    }
  }, [addedTransactions]);

  const syncWalletBalance = (remoteBalance) => {
    if (typeof remoteBalance === 'number' && !Number.isNaN(remoteBalance)) {
      setWalletBalance(remoteBalance);
    }
  };

  const addTransaction = (txn) => {
    setAddedTransactions((prev) => [txn, ...prev]);
  };

  const resetState = () => {
    setWalletBalance(10000);
    setAddedTransactions([]);
  };

  return (
    <AppStateContext.Provider
      value={{
        walletBalance,
        setWalletBalance,
        syncWalletBalance,
        addedTransactions,
        addTransaction,
        resetState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

