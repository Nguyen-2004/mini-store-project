import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import PageHeading from "../../components/common/PageHeading";
export default function Profile() {
  const { account, save } = useStore();
  const [message, setMessage] = useState("");
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = form.get("fullName").trim();
    if (!fullName) {
      setMessage("Vui lòng nhập họ tên hợp lệ.");
      return;
    }
    const saved = await save("users", {
      ...account,
      fullName,
      email: form.get("email").trim(),
      phone: form.get("phone").trim(),
    });
    setMessage(saved ? "Đã lưu thông tin cá nhân." : "Không thể lưu hồ sơ. Vui lòng thử lại.");
  }
  return (
    <>
      <PageHeading eyebrow="TÀI KHOẢN CỦA BẠN" title="Hồ sơ cá nhân">
        Cập nhật thông tin để Mini Store hiểu bạn hơn.
      </PageHeading>
      <div className="panel p-4 profile-panel">
        <div className="d-flex gap-3 align-items-center mb-4">
          <span className="avatar avatar-lg">{account.fullName.charAt(0)}</span>
          <div>
            <h2 className="h5 mb-1">{account.fullName}</h2>
            <span className="text-secondary">Thành viên Mini Store</span>
          </div>
        </div>
        {message && (
          <div className="alert alert-info" role="status">
            {message}
          </div>
        )}
        <form onSubmit={submit}>
          <label className="form-label" htmlFor="profile-username">
            Username
          </label>
          <input
            id="profile-username"
            className="form-control mb-3"
            value={account.username}
            disabled
          />
          {[
            ["fullName", "Họ và tên", "text"],
            ["email", "Email", "email"],
            ["phone", "Số điện thoại", "tel"],
          ].map(([name, label, type]) => (
            <div className="mb-3" key={name}>
              <label className="form-label" htmlFor={name}>
                {label}
              </label>
              <input
                className="form-control"
                id={name}
                name={name}
                type={type}
                defaultValue={account[name]}
                required
                maxLength={100}
                pattern={name === "phone" ? "[+0-9 ()-]{8,20}" : undefined}
              />
            </div>
          ))}
          <button className="btn btn-primary mt-2">
            <i aria-hidden="true" className="bi bi-check2 me-2" />
            Lưu thay đổi
          </button>
        </form>
      </div>
    </>
  );
}
