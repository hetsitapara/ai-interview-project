export default function ProgressBar({ label, percent }) {
  return (
    <div className="progress-item">
      <div className="progress-item-header">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
