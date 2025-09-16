"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Bundle } from "@/components/Bundles";

type CartItem = {
  bundle: Bundle;
  recipient: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (bundle: Bundle, recipient: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string) => {
    if (cart.some((c) => c.recipient === recipient && c.bundle.id === bundle.id)) {
      alert("This recipient already has that bundle in the cart!");
      return;
    }
    setCart((prev) => [...prev, { bundle, recipient }]);
    setIsOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const toggleCart = () => setIsOpen((o) => !o);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, isOpen, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
