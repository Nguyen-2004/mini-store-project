import { Link } from "react-router-dom";
export default function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-icon">
        <i aria-hidden="true" className="bi bi-shop" />
      </span>
      mini<span className="brand-light">store</span>
      <span className="brand-dot">.</span>
    </Link>
  );
}
