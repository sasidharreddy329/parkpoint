import { Clock, Shield, CreditCard } from "lucide-react";
import Reveal from "@/components/Reveal";

const features = [
  {
    icon: Clock,
    title: "Real-time Availability",
    description:
      "Know exactly where spots are open before you arrive. Our sensors update availability instantly to save you time.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description:
      "Your spot is guaranteed once booked. Park in safe, monitored locations with verified partners.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description:
      "Cashless and contactless. Pay securely through the app using your preferred payment method.",
    color: "bg-green-100 text-green-600",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="features">
      <Reveal direction="up" className="text-center mb-14">
        <p className="section-label">WHY CHOOSE US</p>
        <h2 className="section-title">Smart parking made simple</h2>
        <p className="section-desc">
          We provide the technology to make your parking experience seamless from finding a spot to payment.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <Reveal key={f.title} direction="up" delay={i * 120}>
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
