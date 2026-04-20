import Reveal from "@/components/Reveal";

const steps = [
  {
    num: "1",
    title: "Search Location",
    description: "Enter your destination and desired time to see all available parking spots nearby.",
  },
  {
    num: "2",
    title: "Select & Book",
    description: "Compare prices and amenities, then book your preferred spot instantly.",
  },
  {
    num: "3",
    title: "Park & Go",
    description: "Follow the navigation to your spot. Scan your digital pass to enter and exit.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="how-it-works">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <Reveal direction="right">
          <p className="section-label">HOW IT WORKS</p>
          <h2 className="section-title">Get parked in 3 simple steps</h2>
          <p className="text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
            Our process is designed to be as quick and frictionless as possible, getting you off your phone and into a spot.
          </p>

          <div className="mt-10 space-y-8">
            {steps.map((step, i) => (
              <Reveal key={step.num} direction="up" delay={150 + i * 120}>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Right - Phone Mockup */}
        <Reveal direction="left" delay={150} className="hidden lg:flex justify-center">
          <div className="w-72 bg-card border border-border rounded-[2rem] p-3 shadow-2xl">
            <div className="bg-muted rounded-[1.5rem] overflow-hidden">
              <div className="p-5">
                <h3 className="font-bold text-lg mb-4">Find Parking</h3>
                <div className="flex items-center gap-2 bg-background rounded-xl p-3 mb-4 border border-border">
                  <span className="text-muted-foreground text-sm">🔍 Search location...</span>
                </div>
                <div className="bg-primary/10 rounded-xl h-40 mb-4 flex items-center justify-center">
                  <span className="text-primary text-4xl">🗺️</span>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-sm">Orders</p>
                  {["Central Garage - $4.50/h", "Market St - $3.20/h"].map((o) => (
                    <div key={o} className="bg-background rounded-lg p-3 border border-border text-xs text-muted-foreground">
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorksSection;
