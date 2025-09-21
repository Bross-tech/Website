// context/CartContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";

type CartItem = {
  bundle: Bundle;
  recipient: string;
  price: number; // ✅ final role-based price
};

type CartContextType = {
  items: CartItem[];
  addToCart: (bundle: Bundle, recipient: string, price: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, recipient: string, price: number) => {
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
