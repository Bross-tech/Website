"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";
import { useAuth } from "@/context/AuthContext"; // ✅ assumes you have AuthContext providing role

type CartItem = {
  bundle: Bundle;
  recipient: string;
  price: number;
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
  const { role } = useAuth(); // ✅ get current user's role
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string) => {
    // Determine price based on role
    const price = role === "agent" ? bundle.priceAgent : bundle.priceCustomer;

    setItems((prev) => [...prev, { bundle, recipient, price }]);
    setIsOpen(true); // auto-open cart
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
