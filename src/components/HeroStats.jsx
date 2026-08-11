import { useEffect, useState } from "react";
import {
  AlertTriangle,
  UserCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import api from "../api/api";

export default function HeroStats() {
  const [stats, setStats] = useState({
    totalReports: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });

  useEffect(() => {
    loadStats();

    const timer = setInterval(loadStats, 30000);

    return () => clearInterval(timer);
  }, []);

  async function loadStats() {
    try {
      const { data } = await api.get("/issues/public-stats");

      setStats({
        totalReports: data.TotalReports ?? 0,
        assigned: data.Assigned ?? 0,
        inProgress: data.InProgress ?? 0,
        resolved: data.Resolved ?? 0,
      });
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  }

  const cards = [
    {
      title: "Reported",
      value: stats.totalReports,
      color: "#e32e2e",
      icon: AlertTriangle,
    },
    {
      title: "Assigned",
      value: stats.assigned,
      color: "#a17934",
      icon: UserCheck,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      color: "#5c74a8",
      icon: Wrench,
    },
    {
      title: "Resolved",
      value: stats.resolved,
      color: "#22c55e",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="hero-stats">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.title} className="hero-stat-card glass-card">
            <div
              className="hero-stat-icon"
              style={{ background: item.color }}
            >
              <Icon size={22} color="white" />
            </div>

            <div>
              <h2>{item.value.toLocaleString()}</h2>
              <span>{item.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}