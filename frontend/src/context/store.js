import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      initialize: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ token, isAuthenticated: true });
        }
      }
    }),
    { name: 'auth-storage' }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          item => item.productId === product.id && item.variantId === variant.id
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [...items, {
              productId: product.id,
              variantId: variant.id,
              title: product.title,
              price: product.new_price,
              color: variant.color,
              colorHex: variant.color_hex,
              image: product.images[0],
              quantity
            }]
          });
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            item => !(item.productId === productId && item.variantId === variantId)
          )
        });
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map(item =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    { name: 'cart-storage' }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId) => {
        const items = get().items;
        if (items.includes(productId)) {
          set({ items: items.filter(id => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(id => id !== productId) });
      },

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },

      setItems: (items) => set({ items })
    }),
    { name: 'wishlist-storage' }
  )
);
