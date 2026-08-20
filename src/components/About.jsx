import { ShieldCheck, Users, TrendingUp, MapPin } from "lucide-react";

const POINTS = [
  {
    icon: MapPin,
    title: "Pinpoint Reporting",
    text: "Mark the exact location of an issue on the map so the right department can find it fast."
  },
  {
    icon: TrendingUp,
    title: "Real-Time Tracking",
    text: "Follow every report from submission to resolution, with status updates along the way."
  },
  {
    icon: ShieldCheck,
    title: "Transparent Process",
    text: "Public statistics and a live map keep the municipality accountable to residents."
  },
  {
    icon: Users,
    title: "Community Driven",
    text: "Every report helps prioritize where municipal resources are needed most."
  }
];

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="section-container">
        <div className="section-heading">
          <h2>About FixMyTown</h2>
          <p>
            FixMyTown connects residents directly with their municipality,
            turning everyday problems — potholes, water leaks, faulty
            street lights — into tracked, actionable reports.
          </p>
        </div>

        <div className="about-grid">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div className="about-card" key={point.title}>
                <div className="about-icon">
                  <Icon size={20} />
                </div>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}