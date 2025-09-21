// context/CartContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";

type CartItem = {
  bundle: Bundle;
  price: number;       // ✅ final price (based on role)
  recipient: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (bundle: Bundle, price: number, recipient: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (bundle: Bundle, price: number, recipient: string) => {
    setItems((prev) => [...prev, { bundle, price, recipient }]);
    setIsOpen(true); // auto-open cart when adding item
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
