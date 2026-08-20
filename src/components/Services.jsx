import {
  Construction,
  Droplet,
  Zap,
  Trash2,
  Lightbulb,
  Trees,
  SprayCan,
  MoreHorizontal
} from "lucide-react";

const SERVICES = [
  { icon: Construction, name: "Potholes", text: "Road damage that puts drivers and pedestrians at risk." },
  { icon: Droplet, name: "Water Supply", text: "Leaks, outages, and water quality concerns." },
  { icon: Zap, name: "Electricity", text: "Power outages, damaged poles, and faulty connections." },
  { icon: Trash2, name: "Sanitation", text: "Illegal dumping, blocked drains, and waste collection." },
  { icon: Lightbulb, name: "Street Lights", text: "Broken or non-functioning public lighting." },
  { icon: Trees, name: "Parks", text: "Maintenance issues in public parks and green spaces." },
  { icon: SprayCan, name: "Graffiti", text: "Vandalism on public property and infrastructure." },
  { icon: MoreHorizontal, name: "Other", text: "Any other municipal issue affecting your community." }
];

export default function Services() {
  return (
    <section id="services" className="services-section">
      <div className="section-container">
        <div className="section-heading">
          <h2>What You Can Report</h2>
          <p>FixMyTown covers the everyday issues that affect your neighborhood.</p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div className="service-card" key={service.name}>
                <div className="service-icon">
                  <Icon size={20} />
                </div>
                <h3>{service.name}</h3>
                <p>{service.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}