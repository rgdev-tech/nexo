import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_TRANSACTIONS = "@nexo_balance_transactions";
const KEY_INITIAL_BALANCE = "@nexo_balance_initial";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  tag: string;
  label: string;
  date: string; // ISO
};

async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveTransactions(list: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(list));
}

async function loadInitialBalance(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY_INITIAL_BALANCE);
    if (raw == null) return 0;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function saveInitialBalance(value: number): Promise<void> {
  await AsyncStorage.setItem(KEY_INITIAL_BALANCE, String(value));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useBalance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalanceState] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadTransactions(), loadInitialBalance()]).then(([list, initial]) => {
      if (!cancelled) {
        setTransactions(list);
        setInitialBalanceState(initial);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const transactionsDelta = transactions.reduce((sum, t) => {
    return sum + (t.type === "income" ? t.amount : -t.amount);
  }, 0);
  const balance = initialBalance + transactionsDelta;

  const setInitialBalance = useCallback(async (value: number) => {
    setInitialBalanceState(value);
    await saveInitialBalance(value);
  }, []);

  const addTransaction = useCallback(
    async (type: TransactionType, amount: number, tag: string, label: string) => {
      const tx: Transaction = {
        id: generateId(),
        type,
        amount,
        tag,
        label,
        date: new Date().toISOString(),
      };
      const next = [tx, ...transactions];
      setTransactions(next);
      await saveTransactions(next);
    },
    [transactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const next = transactions.filter((t) => t.id !== id);
      setTransactions(next);
      await saveTransactions(next);
    },
    [transactions]
  );

  return {
    transactions,
    initialBalance,
    balance,
    loaded,
    setInitialBalance,
    addTransaction,
    deleteTransaction,
  };
}

export const BALANCE_TAGS = [
  { icon: "restaurant-outline" as const, label: "Comida", id: "comida" },
  { icon: "car-outline" as const, label: "Carro", id: "carro" },
  { icon: "home-outline" as const, label: "Casa", id: "casa" },
  { icon: "briefcase-outline" as const, label: "Trabajo", id: "trabajo" },
  { icon: "film-outline" as const, label: "Ocio", id: "ocio" },
  { icon: "bus-outline" as const, label: "Transporte", id: "transporte" },
  { icon: "cart-outline" as const, label: "Super", id: "super" },
  { icon: "flash-outline" as const, label: "Servicios", id: "servicios" },
] as const;
