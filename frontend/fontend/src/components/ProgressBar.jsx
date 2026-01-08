export default function ProgressBar({ label, percent }) {
  return (
    <div className="progress-item">
      <span>{label}</span>
      <div className="progress-bar">
        <div style={{ width: `${percent}%` }}></div>
      </div>
      <span>{percent}%</span>
    </div>
  );
}
