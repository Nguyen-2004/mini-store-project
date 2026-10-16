import { useCallback, useEffect, useState } from "react";
import api, { TOKEN_KEY, itemsOf, unwrap } from "../services/api";
import { StoreContext } from "./StoreContext";

const initial = { users: [], products: [], orders: [], addresses: [], cart: [], wishlist: [], categories: [], dashboard: null };
const rows = (response) => itemsOf(unwrap(response));
export default function StoreProvider({ children }) {
  const [data, setData] = useState(initial);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const report = (error) => { const message = error?.userMessage || error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."; setApiError(message); return null; };
  const refreshCatalog = useCallback(async () => {
    const [products, categories] = await Promise.all([api.get("/products?limit=100"), api.get("/categories")]);
    setData((current) => ({ ...current, products: rows(products), categories: rows(categories) }));
  }, []);
  const refreshPrivate = useCallback(async (user) => {
    if (!user) return;
    const [orders, addresses, wishlist, cart] = await Promise.all([
      api.get("/orders?limit=100"), api.get("/users/addresses"), api.get("/users/wishlist"), api.get("/cart"),
    ]);
    const next = { orders: rows(orders), addresses: rows(addresses), wishlist: rows(wishlist).map((item) => item.id), cart: rows(cart) };
    let users = [], adminProducts = [], adminOrders = [], dashboard = null;
    if (user.role === "admin") {
      const [u, p, o, d, c] = await Promise.all([api.get("/admin/users?limit=100"), api.get("/admin/products?status=all&limit=100"), api.get("/admin/orders?limit=100"), api.get("/admin/dashboard"), api.get("/admin/categories")]);
      users = rows(u); adminProducts = rows(p); adminOrders = rows(o); dashboard = unwrap(d);
      setData((current) => ({ ...current, categories: rows(c) }));
    }
    setData((current) => ({ ...current, ...next, ...(user.role === "admin" ? { users, products: adminProducts, orders: adminOrders, dashboard } : {}) }));
  }, []);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshCatalog();
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          try {
            const user = unwrap(await api.get("/auth/me"));
            if (active) { setAccount(user); await refreshPrivate(user); }
          } catch { localStorage.removeItem(TOKEN_KEY); }
        }
      } catch (error) { if (active) report(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [refreshCatalog, refreshPrivate]);
  const run = async (operation) => { setApiError(""); try { return await operation(); } catch (error) { return report(error); } };
  const login = (identifier, password) => run(async () => {
    const result = unwrap(await api.post("/auth/login", { identifier, password }));
    localStorage.setItem(TOKEN_KEY, result.token); setAccount(result.user); await refreshPrivate(result.user); return result.user.role;
  });
  const register = (payload) => run(async () => {
    const result = unwrap(await api.post("/auth/register", payload));
    localStorage.setItem(TOKEN_KEY, result.token); setAccount(result.user); await refreshPrivate(result.user); return true;
  });
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setAccount(null); setData((current) => ({ ...current, orders: [], addresses: [], wishlist: [], cart: [], users: [], dashboard: null })); refreshCatalog().catch(report); };
  const refresh = () => run(async () => { if (account?.role === "admin") await refreshPrivate(account); else await refreshCatalog(); return true; });
  const save = (collection, item) => run(async () => {
    let saved;
    if (collection === "users") {
      if (account?.role !== "admin") {
        saved = unwrap(await api.patch("/users/me", item)); setAccount(saved);
      } else saved = item.id ? unwrap(await api.patch(`/admin/users/${item.id}`, item)) : unwrap(await api.post("/admin/users", item));
    } else if (collection === "products") {
      const body = { ...item, category: item.category || data.categories.find((category) => category.id === item.categoryId)?.name };
      saved = item.id ? unwrap(await api.patch(`/admin/products/${item.id}`, body)) : unwrap(await api.post("/admin/products", body));
    } else if (collection === "orders") {
      saved = unwrap(await api.patch(`/admin/orders/${item.orderId || item.id}/status`, { status: item.status }));
    } else return null;
    await refreshPrivate(account); if (account?.role !== "admin") await refreshCatalog(); return saved?.id || saved?.orderId || saved?.id;
  });
  const remove = (collection, id) => run(async () => {
    const paths = { users: `/admin/users/${id}`, products: `/admin/products/${id}`, addresses: `/users/addresses/${id}` };
    await api.delete(paths[collection]); await refreshPrivate(account); if (account?.role !== "admin") await refreshCatalog(); return true;
  });
  const addToCart = (productId) => run(async () => { await api.post("/cart/items", { productId, quantity: 1 }); await refreshPrivate(account); return true; });
  const setCartQuantity = (productId, quantity) => run(async () => { if (quantity <= 0) await api.delete(`/cart/items/${productId}`); else await api.patch(`/cart/items/${productId}`, { quantity }); await refreshPrivate(account); return true; });
  const removeFromCart = (productId) => setCartQuantity(productId, 0);
  const toggleWishlist = (productId) => run(async () => { if (data.wishlist.includes(productId)) await api.delete(`/users/wishlist/items/${productId}`); else await api.post("/users/wishlist/items", { productId }); await refreshPrivate(account); return true; });
  const setDefaultAddress = (id) => run(async () => { await api.patch(`/users/addresses/${id}/default`); await refreshPrivate(account); return true; });
  const saveAddress = (address) => run(async () => {
    const body = { ...address }; delete body.userId;
    const saved = address.id ? unwrap(await api.patch(`/users/addresses/${address.id}`, body)) : unwrap(await api.post("/users/addresses", body));
    await refreshPrivate(account); return saved.id;
  });
  const placeOrder = (address) => run(async () => {
    const payload = address?.id ? { addressId: address.id } : { shippingAddress: { ...address, name: address.name || "Giao hàng" } };
    const order = unwrap(await api.post("/orders", payload)); await refreshPrivate(account); await refreshCatalog(); return order;
  });
  const changePassword = (payload) => run(async () => { await api.post("/auth/change-password", payload); return true; });
  const cart = data.cart;
  const value = { ...data, account, loading, apiError, clearApiError: () => setApiError(""), login, register, logout, save, remove, addToCart, setCartQuantity, removeFromCart, toggleWishlist, setDefaultAddress, saveAddress, placeOrder, changePassword, refresh, cart };
  return <StoreContext.Provider value={value}>{apiError && <div className="alert alert-danger mb-0" role="alert">{apiError}<button type="button" className="btn-close float-end" aria-label="Đóng" onClick={() => setApiError("")} /></div>}{children}</StoreContext.Provider>;
}
