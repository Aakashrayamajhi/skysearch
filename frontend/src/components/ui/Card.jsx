export default function Card({ title, desc }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400 mt-2">{desc}</p>
    </div>
  );
}