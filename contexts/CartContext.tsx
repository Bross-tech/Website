"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";

type CartItem = { bundle: Bundle; recipient: string };

type CartContextType = {
  items: CartItem[];
  addItem: (bundle: Bundle, recipient: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (bundle: Bundle, recipient: string) => {
    setItems((prev) => [...prev, { bundle, recipient }]);
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
