// context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "../types";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;

  // UI state for opening/closing the cart
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // UI open/close
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((v) => !v);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCartItems(JSON.parse(stored));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    openCart(); // auto open on add (optional, but nice UX)
  };

  const clearCart = () => setCartItems([]);

  if (!isLoaded) return null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        clearCart,
        setCartItems,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
