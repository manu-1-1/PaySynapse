"use client";

import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Load initial state from localStorage on client mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('merchant_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order) => {
    setOrders((prev) => {
      const newOrders = [order, ...prev];
      localStorage.setItem('merchant_orders', JSON.stringify(newOrders));
      return newOrders;
    });
  };

  const markOrderRefunded = (paymentId) => {
    setOrders((prev) => {
      const updated = prev.map(o => o.paymentId === paymentId ? { ...o, status: 'Refunded' } : o);
      localStorage.setItem('merchant_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <StoreContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, orders, addOrder, markOrderRefunded }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
