"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";
import { useAuth } from "./AuthContext";

export type CartItem = {
  bundle: Bundle;
  recipient: string;
  price: number;
  network: string;
  subType?: string;
  size: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (bundle: Bundle, recipient: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string) => {
    const price = role === "agent" ? bundle.priceAgent : bundle.priceCustomer;
    setItems((prev) => [
      ...prev,
      {
        bundle,
        recipient,
        price,
        network: bundle.network,
        subType: bundle.subType,
        size: bundle.size,
      },
    ]);
    setIsOpen(true);
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setItems([]);
  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isOpen, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
