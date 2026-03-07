export default function DashboardCard({ title, desc, buttonText, onClick }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p>{desc}</p>
      <button onClick={onClick}>{buttonText}</button>
    </div>
  );
}
