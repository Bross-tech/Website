import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Bundle } from "@/components/Bundles";

type CartItem = { bundle: Bundle; recipient: string };
type CartContextType = {
  cart: CartItem[];
  addToCart: (bundle: Bundle, recipient: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (bundle: Bundle, recipient: string) => {
    setCart((cart) => [...cart, { bundle, recipient }]);
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
