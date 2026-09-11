import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { money } from "../../data/mockData";
import PageHeading from "../common/PageHeading";
const productFields = [
  ["name", "Tên sản phẩm", "text"],
  ["category", "Danh mục", "text"],
  ["price", "Giá (VNĐ)", "number"],
  ["stock", "Tồn kho", "number"],
  ["unit", "Đơn vị", "text"],
  ["description", "Mô tả", "textarea"],
];
const userFields = [
  ["username", "Username", "text"],
  ["fullName", "Họ tên", "text"],
  ["email", "Email", "email"],
  ["phone", "Số điện thoại", "tel"],
];
export default function ResourceManager({ type }) {
  const store = useStore();
  const isProduct = type === "products";
  const rows = store[type];
  const fields = isProduct ? productFields : userFields;
  const label = isProduct ? "sản phẩm" : "người dùng";
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const filtered = rows.filter((row) =>
    (isProduct
      ? [row.name, row.category]
      : [row.username, row.fullName, row.email]
    )
      .join(" ")
      .toLocaleLowerCase("vi")
      .includes(search.trim().toLocaleLowerCase("vi")),
  );
  function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    for (const key in values) values[key] = values[key].trim();
    if (fields.some(([name]) => !values[name])) {
      setError("Vui lòng nhập đầy đủ thông tin, không chỉ khoảng trắng.");
      return;
    }
    if (
      !isProduct &&
      rows.some(
        (row) =>
          row.id !== editing.id &&
          row.username.toLowerCase() === values.username.toLowerCase(),
      )
    ) {
      setError("Username đã tồn tại.");
      return;
    }
    if (isProduct) {
      values.price = Number(values.price);
      values.stock = Number(values.stock);
      if (
        ![values.price, values.stock].every(
          (value) => Number.isSafeInteger(value) && value >= 0,
        )
      ) {
        setError("Giá và tồn kho phải là số nguyên không âm hợp lệ.");
        return;
      }
      values.image = editing.image || "/products/milk.svg";
    }
    store.save(type, {
      ...editing,
      ...values,
      ...(!isProduct && { role: editing.role || "user" }),
    });
    setEditing(null);
    setError("");
    setNotice("Đã lưu " + label + ".");
  }
  function deleteRow(row) {
    if (
      window.confirm("Bạn có chắc muốn xóa " + (row.name || row.fullName) + "?")
    ) {
      store.remove(type, row.id);
      setNotice("Đã xóa " + label + ".");
      if (editing?.id === row.id) setEditing(null);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="QUẢN LÝ CỬA HÀNG"
        title={isProduct ? "Quản lý sản phẩm" : "Quản lý người dùng"}
        action={
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing({});
              setError("");
              setNotice("");
            }}
          >
            <i aria-hidden="true" className="bi bi-plus-lg me-2" />
            Thêm {label}
          </button>
        }
      >
        Quản lý thông tin {label} một cách dễ dàng.
      </PageHeading>
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      {editing && (
        <section className="panel p-4 mb-4">
          <h2 className="h5">
            {editing.id ? "Chỉnh sửa" : "Thêm"} {label}
          </h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form key={editing.id || "new"} onSubmit={submit}>
            <div className="row g-3">
              {fields.map(([name, title, inputType]) => (
                <div
                  className={inputType === "textarea" ? "col-12" : "col-md-6"}
                  key={name}
                >
                  <label className="form-label" htmlFor={"edit-" + name}>
                    {title}
                  </label>
                  {inputType === "textarea" ? (
                    <textarea
                      className="form-control"
                      id={"edit-" + name}
                      name={name}
                      defaultValue={editing[name] || ""}
                      required
                      maxLength={1000}
                      rows={3}
                    />
                  ) : (
                    <input
                      className="form-control"
                      id={"edit-" + name}
                      name={name}
                      type={inputType}
                      defaultValue={editing[name] ?? ""}
                      required
                      min={inputType === "number" ? "0" : undefined}
                      max={inputType === "number" ? "1000000000000" : undefined}
                      step={inputType === "number" ? "1" : undefined}
                      maxLength={120}
                      readOnly={
                        name === "username" && ["u1", "u2"].includes(editing.id)
                      }
                      pattern={
                        name === "phone" ? "[+0-9 ()-]{8,20}" : undefined
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            {isProduct && (
              <p className="small text-secondary mt-3">
                Ảnh placeholder được gán tự động cho sản phẩm mới.
              </p>
            )}
            {!isProduct && (
              <p className="small text-secondary mt-3">
                Tài khoản mới dùng để quản lý danh sách. Chỉ hai tài khoản demo
                có thể đăng nhập.
              </p>
            )}
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary">Lưu {label}</button>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setEditing(null)}
              >
                Hủy
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <span className="text-secondary">
            {filtered.length} {label}
          </span>
          <input
            className="form-control search-input"
            aria-label={"Tìm " + label}
            placeholder={"Tìm " + label + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                {(isProduct
                  ? ["Sản phẩm", "Danh mục", "Giá", "Tồn kho", "Thao tác"]
                  : ["Người dùng", "Username", "Email", "Vai trò", "Thao tác"]
                ).map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      {isProduct ? (
                        <img className="table-product" src={row.image} alt="" />
                      ) : (
                        <span className="avatar">{row.fullName.charAt(0)}</span>
                      )}
                      <strong>{row.name || row.fullName}</strong>
                    </div>
                  </td>
                  <td>{isProduct ? row.category : row.username}</td>
                  <td>{isProduct ? money(row.price) : row.email}</td>
                  <td>
                    {isProduct ? (
                      row.stock
                    ) : (
                      <span className="status status-2">{row.role}</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-light"
                        aria-label={"Sửa " + (row.name || row.username)}
                        onClick={() => {
                          setEditing(row);
                          setError("");
                          setNotice("");
                        }}
                      >
                        <i aria-hidden="true" className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={!isProduct && ["u1", "u2"].includes(row.id)}
                        title={
                          !isProduct && ["u1", "u2"].includes(row.id)
                            ? "Giữ lại tài khoản demo"
                            : "Xóa"
                        }
                        aria-label={"Xóa " + (row.name || row.username)}
                        onClick={() => deleteRow(row)}
                      >
                        <i aria-hidden="true" className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="empty-state">Không tìm thấy {label}.</p>
          )}
        </div>
      </section>
    </>
  );
}
