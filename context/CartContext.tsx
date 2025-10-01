"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";
import { useAuth } from "./AuthContext"; // Assumes AuthContext provides user role

// Each item in the cart
export type CartItem = {
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
  const { role } = useAuth(); // Get user role from AuthContext
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Add item to cart
  const addToCart = (bundle: Bundle, recipient: string) => {
    const price = role === "agent" ? bundle.priceAgent : bundle.priceCustomer;

    setItems((prev) => [...prev, { bundle, recipient, price }]);
    setIsOpen(true); // Auto-open cart when adding
  };

  // Remove an item by index
  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear entire cart
  const clearCart = () => setItems([]);

  // Toggle cart sidebar
  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, isOpen, toggleCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
