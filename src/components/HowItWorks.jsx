import {
  FileText,
  ClipboardCheck,
  Wrench,
  CheckCircle
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileText size={28} />,
      title: "1. Report an Issue",
      text: "Citizens report potholes, water leaks, illegal dumping, broken street lights and other municipal issues."
    },
    {
      icon: <ClipboardCheck size={28} />,
      title: "2. Municipality Reviews",
      text: "Municipal officials verify the report and assign it to the appropriate department."
    },
    {
      icon: <Wrench size={28} />,
      title: "3. Worker Resolves",
      text: "A municipal worker receives the assignment, updates progress and completes the repair."
    },
    {
      icon: <CheckCircle size={28} />,
      title: "4. Citizen Notified",
      text: "Once resolved, the citizen receives a notification and can view the completed work."
    }
  ];

  return (
    <section className="landing-section">
      <div className="section-title">
        <h2>How FixMyTown Works</h2>
        <p>
          Reporting municipal issues is simple, transparent and trackable from
          start to finish.
        </p>
      </div>

      <div className="how-grid">
        {steps.map((step, index) => (
          <div className="how-card" key={index}>
            <div className="how-icon">{step.icon}</div>

            <h3>{step.title}</h3>

            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}