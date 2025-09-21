"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";
import { useAuth } from "@/context/AuthContext";  // ✅ get role from AuthContext

type CartItem = {
  bundle: Bundle;
  recipient: string;
  price: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (bundle: Bundle, recipient: string) => void; // ✅ no price param needed
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();  // ✅ use logged-in role
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string) => {
    // ✅ role-based pricing
    let price = bundle.priceGhs;
    if (role === "agent" && bundle.agentPriceGhs) {
      price = bundle.agentPriceGhs;
    }

    setItems((prev) => [...prev, { bundle, recipient, price }]);
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
