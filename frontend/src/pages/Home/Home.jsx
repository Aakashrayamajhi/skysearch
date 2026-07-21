import HeroSearch from "./components/HeroSearch";
import Navbar from "../../components/layout/Navbar";
import CardsSection from "./components/CardSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-[#0a2540] text-white">
      <Navbar />
      <HeroSearch />
      <CardsSection /> 
    </div>
  );
}