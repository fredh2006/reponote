import Navbar from "@/components/sections/navbar";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import Steps from "@/components/sections/steps";

export default function Home() {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <Features />
        <Steps />
      </main>
    </div>
    </>
  );
}
