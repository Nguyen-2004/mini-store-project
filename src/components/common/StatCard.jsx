export default function StatCard({ title, value, icon, note }) {
  return (
    <div className="stat-card">
      <div className="d-flex justify-content-between align-items-center">
        <span className="text-secondary small">{title}</span>
        <span className="stat-icon">
          <i aria-hidden="true" className={`bi bi-${icon}`} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <span className="small text-secondary">{note}</span>
    </div>
  );
}
