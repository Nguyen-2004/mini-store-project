import { useState } from "react";
import { StoreContext } from "./StoreContext";
import { initialUsers, initialProducts, initialOrders } from "../data/mockData";

function read(key, fallback, valid) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return valid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export default function StoreProvider({ children }) {
  const [data, setData] = useState(() =>
    read(
      "mini-store-data-v1",
      {
        users: initialUsers,
        products: initialProducts,
        orders: initialOrders,
      },
      (value) =>
        value &&
        Array.isArray(value.users) &&
        Array.isArray(value.products) &&
        Array.isArray(value.orders),
    ),
  );
  const [session, setSession] = useState(() =>
    read(
      "mini-store-session-v1",
      null,
      (value) =>
        value &&
        ["user", "admin"].includes(value.role) &&
        typeof value.id === "string",
    ),
  );
  const [storageError, setStorageError] = useState("");
  const account =
    data.users.find(
      (user) => user.id === session?.id && user.role === session?.role,
    ) || null;

  // Lưu tại thao tác người dùng; state vẫn hoạt động nếu storage bị chặn.
  function persist(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageError(
        "Trình duyệt không cho phép lưu dữ liệu. Thay đổi chỉ giữ trong phiên hiện tại.",
      );
    }
  }

  function login(username, password) {
    if (!["user", "admin"].includes(username) || password !== "123")
      return false;
    const user = data.users.find((item) => item.username === username);
    if (!user) return false;
    const next = { id: user.id, username: user.username, role: user.role };
    persist("mini-store-session-v1", next);
    setSession(next);
    return user.role;
  }

  function logout() {
    persist("mini-store-session-v1", null);
    setSession(null);
  }

  function save(collection, item) {
    const next = {
      ...data,
      [collection]: item.id
        ? data[collection].map((row) => (row.id === item.id ? item : row))
        : [...data[collection], { ...item, id: crypto.randomUUID() }],
    };
    persist("mini-store-data-v1", next);
    setData(next);
  }

  function remove(collection, id) {
    const next = {
      ...data,
      [collection]: data[collection].filter((row) => row.id !== id),
    };
    persist("mini-store-data-v1", next);
    setData(next);
  }

  return (
    <StoreContext.Provider
      value={{ ...data, account, login, logout, save, remove }}
    >
      {storageError && (
        <div className="alert alert-warning mb-0" role="alert">
          {storageError}
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
}
