import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "youth-circle-cart";

const CartContext = createContext(null);

const readStoredCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, size = "M") => {
    setItems((current) => {
      const existingItem = current.find(
        (item) => item.productId === product._id && item.size === size
      );

      if (existingItem) {
        return current.map((item) =>
          item.productId === product._id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: product.price,
          discount: product.discount || 0,
          quantity,
          size,
          vendorId: product.vendorId?._id || product.vendorId,
        },
      ];
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setItems((current) =>
      current.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const finalPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + finalPrice * item.quantity;
    }, 0);

    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    };
  }, [items]);

  const checkoutItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      checkoutItems,
      ...totals,
    }),
    [items, checkoutItems, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
