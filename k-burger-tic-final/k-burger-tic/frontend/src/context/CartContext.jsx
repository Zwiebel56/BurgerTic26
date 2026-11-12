import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'kburger_cart';

export function CartProvider({ children }) {
  // items: [{ id, nombre, tipo, precio, cantidad }]
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

  const add = (plato, cantidad = 1) =>
    setItems((prev) => {
      const existe = prev.find((i) => i.id === plato.id);
      if (existe) return prev.map((i) => (i.id === plato.id ? { ...i, cantidad: i.cantidad + cantidad } : i));
      return [...prev, { id: plato.id, nombre: plato.nombre, tipo: plato.tipo, precio: plato.precio, cantidad }];
    });

  const setQty = (id, cantidad) =>
    setItems((prev) =>
      cantidad < 1 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const { count, total } = useMemo(() => ({
    count: items.reduce((a, i) => a + i.cantidad, 0),
    total: items.reduce((a, i) => a + i.cantidad * i.precio, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, count, total, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
