import { useState } from "react";
import { StoreContext } from "./StoreContext";
import { initialAddresses, initialOrders, initialProducts, initialUsers } from "../data/mockData";

const emptyData = () => ({ users: initialUsers, products: initialProducts, orders: initialOrders, addresses: initialAddresses, cart: {}, wishlist: {} });
function read(key, fallback, valid) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return valid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export default function StoreProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = read("mini-store-data-v1", null, (v) => v && Array.isArray(v.users) && Array.isArray(v.products) && Array.isArray(v.orders));
    return saved ? { ...emptyData(), ...saved } : emptyData();
  });
  const [session, setSession] = useState(() => read("mini-store-session-v1", null, (v) => v && ["user", "admin"].includes(v.role) && typeof v.id === "string"));
  const [storageError, setStorageError] = useState("");
  const account = data.users.find((user) => user.id === session?.id && user.role === session?.role) || null;
  const cart = data.cart[account?.id || "guest"] || [];
  const wishlist = data.wishlist[account?.id || "guest"] || [];

  function persist(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageError("Trình duyệt không cho phép lưu dữ liệu. Thay đổi chỉ giữ trong phiên hiện tại.");
    }
  }
  function commit(next) {
    persist("mini-store-data-v1", next);
    setData(next);
  }
  function login(username, password) {
    if (!["user", "admin"].includes(username) || password !== "123") return false;
    const user = data.users.find((item) => item.username === username && item.active !== false);
    if (!user) return false;
    const next = { id: user.id, username: user.username, role: user.role };
    if (data.cart.guest?.length || data.wishlist.guest?.length) {
      const merged = [...(data.cart[user.id] || [])];
      for (const line of data.cart.guest || []) {
        const existing = merged.find((item) => item.productId === line.productId);
        if (existing) existing.quantity += line.quantity;
        else merged.push(line);
      }
      const byStock = merged.map((line) => ({ ...line, quantity: Math.min(line.quantity, data.products.find((product) => product.id === line.productId)?.stock || 0) })).filter((line) => line.quantity > 0);
      const nextData = { ...data, cart: { ...data.cart, [user.id]: byStock, guest: [] }, wishlist: { ...data.wishlist, [user.id]: [...new Set([...(data.wishlist[user.id] || []), ...(data.wishlist.guest || [])])], guest: [] } };
      commit(nextData);
    }
    persist("mini-store-session-v1", next);
    setSession(next);
    return user.role;
  }
  function logout() { persist("mini-store-session-v1", null); setSession(null); }
  function save(collection, item) {
    const rows = data[collection] || [];
    const next = { ...data, [collection]: item.id ? rows.map((row) => row.id === item.id ? item : row) : [...rows, { ...item, id: crypto.randomUUID() }] };
    commit(next);
    return item.id || next[collection].at(-1).id;
  }
  function remove(collection, id) { commit({ ...data, [collection]: (data[collection] || []).filter((row) => row.id !== id) }); }
  function changeCart(productId, delta) {
    const product = data.products.find((item) => item.id === productId);
    if (!product) return;
    const current = cart.find((item) => item.productId === productId)?.quantity || 0;
    const quantity = Math.min(product.stock, current + delta);
    const nextCart = cart.filter((item) => item.productId !== productId);
    if (quantity > 0) nextCart.push({ productId, quantity });
    commit({ ...data, cart: { ...data.cart, [account?.id || "guest"]: nextCart } });
  }
  function setCartQuantity(productId, quantity) {
    const current = cart.find((item) => item.productId === productId)?.quantity || 0;
    changeCart(productId, quantity - current);
  }
  function removeFromCart(productId) { changeCart(productId, -(cart.find((item) => item.productId === productId)?.quantity || 0)); }
  function toggleWishlist(productId) {
    const items = wishlist.includes(productId) ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    commit({ ...data, wishlist: { ...data.wishlist, [account?.id || "guest"]: items } });
  }
  function setDefaultAddress(addressId) {
    if (!account) return;
    commit({ ...data, addresses: data.addresses.map((address) => address.userId === account.id ? { ...address, isDefault: address.id === addressId } : address) });
  }
  function saveAddress(address) {
    if (!account) return null;
    const saved = { ...address, id: address.id || crypto.randomUUID(), userId: account.id };
    const addresses = data.addresses.filter((item) => item.id !== saved.id).map((item) => saved.isDefault && item.userId === account.id ? { ...item, isDefault: false } : item);
    commit({ ...data, addresses: [...addresses, saved] });
    return saved.id;
  }
  function placeOrder(address) {
    if (!account || !cart.length) return null;
    if (cart.some((line) => line.quantity > (data.products.find((item) => item.id === line.productId)?.stock || 0))) return null;
    const items = cart.map(({ productId, quantity }) => {
      const product = data.products.find((item) => item.id === productId);
      return { productId, name: product.name, image: product.image, price: product.price, quantity };
    });
    const order = { id: `MS-${Date.now().toString().slice(-8)}`, userId: account.id, customer: account.fullName, date: new Date().toISOString().slice(0, 10), status: "Đang xử lý", items, address };
    commit({ ...data, orders: [order, ...data.orders], cart: { ...data.cart, [account?.id || "guest"]: [] }, products: data.products.map((p) => {
      const ordered = items.find((item) => item.productId === p.id);
      return ordered ? { ...p, stock: Math.max(0, p.stock - ordered.quantity) } : p;
    }) });
    return order;
  }
  const value = { ...data, account, cart, wishlist, login, logout, save, remove, addToCart: (id) => changeCart(id, 1), changeCart, setCartQuantity, removeFromCart, toggleWishlist, setDefaultAddress, saveAddress, placeOrder };
  return <StoreContext.Provider value={value}>{storageError && <div className="alert alert-warning mb-0" role="alert">{storageError}</div>}{children}</StoreContext.Provider>;
}
