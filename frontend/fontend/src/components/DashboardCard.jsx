export default function DashboardCard({ title, desc, buttonText }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{desc}</p>
      <button>{buttonText}</button>
    </div>
  );
}
