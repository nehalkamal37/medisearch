// src/pages/CartPageWithContext.tsx
import React from "react";
import { useCart } from "../components/CartContext";
import type { CartItem } from "../types";
import CartPage from "./cart";

export default function CartPageWithContext() {
  const { cartItems, clearCart, setCartItems } = useCart();

  const onUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, newQty) } : i))
    );
  };

  const onRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <CartPage
      cartItems={cartItems}
      onClearCart={clearCart}
      onUpdateQuantity={onUpdateQuantity}
      onRemoveItem={onRemoveItem}
    />
  );
}
