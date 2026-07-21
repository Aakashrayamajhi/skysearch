import ResultCard from "./ResultCard";

export default function ResultList() {
  const results = [
    {
      title:
        "Quantum Computing for Aerospace: Optimization & Simulation Breakthroughs",
      description:
        "NASA and IBM explore quantum algorithms to revolutionize aerodynamic simulations, trajectory optimization, and material science.",
      url: "https://www.nasa.gov/quantum-research",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      source: "NASA",
      tag: "Research",
    },
    {
      title:
        "How Quantum Algorithms Are Transforming Fluid Dynamics in Aviation",
      description:
        "New hybrid quantum-classical models significantly reduce simulation time for turbulence and airflow analysis.",
      url: "https://www.ibm.com/quantum/blog/aerospace",
      image:
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e",
      source: "IBM Quantum",
      tag: "Technology",
    },
    {
      title:
        "Next-Gen Aircraft Design Powered by Quantum Computing",
      description:
        "Boeing and Google Quantum AI collaborate to push limits of structural optimization and energy efficiency.",
      url: "https://quantumai.google/research",
      image:
        "https://images.unsplash.com/photo-1474302770737-173ee21bab63",
      source: "Google Quantum AI",
      tag: "Innovation",
    },
  ];

  return (
    <div className="space-y-6 mt-6">
      {results.map((item, index) => (
        <ResultCard key={index} {...item} />
      ))}
    </div>
  );
}