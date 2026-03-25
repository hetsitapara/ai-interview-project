export default function ProgressBar({ label, percent }) {
  // Clean up label if it's a long comma-separated string
  const cleanLabel = label.split(',').length > 2 
    ? label.split(',').slice(0, 2).join(', ') + '...'
    : label.replace(/,/g, ', ');

  return (
    <div className="progress-item">
      <div className="progress-item-header">
        <span className="progress-label" title={label}>{cleanLabel}</span>
        <span className="progress-percent">{percent}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
