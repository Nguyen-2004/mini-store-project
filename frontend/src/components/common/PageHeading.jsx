export default function PageHeading({ eyebrow, title, children, action }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p className="text-secondary mb-0">{children}</p>}
      </div>
      {action}
    </div>
  );
}
