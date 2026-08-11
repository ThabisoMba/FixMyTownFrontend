import {
  Circle,
  AlertTriangle,
  UserCheck,
  Wrench,
  CheckCircle
} from "lucide-react";

export default function MapLegend() {
  return (
    <div className="map-legend">

      <h4>Map Legend</h4>

      <div className="legend-item">
        <AlertTriangle size={15} color="#ef4444" />
        <span>Reported</span>
      </div>

      <div className="legend-item">
        <UserCheck size={15} color="#f59e0b" />
        <span>Assigned</span>
      </div>

      <div className="legend-item">
        <Wrench size={15} color="#3b82f6" />
        <span>In Progress</span>
      </div>

      <div className="legend-item">
        <CheckCircle size={15} color="#22c55e" />
        <span>Resolved</span>
      </div>

    </div>
  );
}