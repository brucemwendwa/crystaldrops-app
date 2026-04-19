import React, { createContext, useState, useContext, useEffect } from 'react';
import { products } from '../data/products';

const CartContext = createContext();
const LAST_ORDER_KEY = 'lastOrderSnapshot';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  /** Replace cart with the last successfully placed order (from checkout). */
  const repeatLastOrder = () => {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) {
      return { ok: false, message: 'No previous order yet. Add items from the shop first.' };
    }
    let lines;
    try {
      lines = JSON.parse(raw);
    } catch {
      return { ok: false, message: 'Could not read your last order.' };
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      return { ok: false, message: 'No previous order yet.' };
    }
    const newCart = [];
    lines.forEach((line) => {
      const p = products.find((x) => x.id === line.id);
      if (p) {
        newCart.push({ ...p, quantity: Math.max(1, Number(line.quantity) || 1) });
      }
    });
    if (newCart.length === 0) {
      return { ok: false, message: 'Products from your last order are no longer available.' };
    }
    setCart(newCart);
    return { ok: true, message: 'Your last order was added to the cart.' };
  };

  const hasLastOrder = () => {
    try {
      const raw = localStorage.getItem(LAST_ORDER_KEY);
      if (!raw) return false;
      const lines = JSON.parse(raw);
      return Array.isArray(lines) && lines.length > 0;
    } catch {
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      repeatLastOrder,
      hasLastOrder
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
