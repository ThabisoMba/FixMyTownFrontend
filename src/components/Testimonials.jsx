import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "John Dlamini",
    role: "Resident",
    message:
      "Reporting a pothole was incredibly simple. I received updates throughout the process until it was fixed.",
  },
  {
    id: 2,
    name: "Nomsa Mbeki",
    role: "Community Member",
    message:
      "The live tracking feature helped me see exactly when the municipality assigned workers to my report.",
  },
  {
    id: 3,
    name: "Sipho Nkosi",
    role: "Resident",
    message:
      "A professional platform that makes communication between citizens and the municipality much easier.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="section-title">
        <h2>What Citizens Say</h2>
        <p>Trusted by communities across South Africa.</p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((item) => (
          <div className="testimonial-card" key={item.id}>
            <Quote className="quote-icon" size={34} />

            <div className="stars">
              <Star size={18} fill="#FBBF24" stroke="#FBBF24" />
              <Star size={18} fill="#FBBF24" stroke="#FBBF24" />
              <Star size={18} fill="#FBBF24" stroke="#FBBF24" />
              <Star size={18} fill="#FBBF24" stroke="#FBBF24" />
              <Star size={18} fill="#FBBF24" stroke="#FBBF24" />
            </div>

            <p className="testimonial-message">
              "{item.message}"
            </p>

            <div className="testimonial-user">
              <div className="avatar">
                {item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div>
                <h4>{item.name}</h4>
                <span>{item.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}