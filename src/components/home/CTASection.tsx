import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <Reveal direction="scale" className="max-w-4xl mx-auto">
        <div className="bg-primary rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to park smarter?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Download the app today and get 50% off your first booking. Join millions of drivers saving time and money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 h-auto gap-3 hover:scale-105 transition-transform">
              <span className="text-left">
                <span className="text-[10px] block uppercase tracking-wider opacity-80">Download on the</span>
                <span className="font-semibold text-base">App Store</span>
              </span>
            </Button>
            <Button variant="outline" className="bg-white text-black hover:bg-gray-100 border-0 rounded-xl px-6 py-3 h-auto gap-3 hover:scale-105 transition-transform">
              <span className="text-left">
                <span className="text-[10px] block uppercase tracking-wider opacity-60">Get it on</span>
                <span className="font-semibold text-base">Google Play</span>
              </span>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default CTASection;
