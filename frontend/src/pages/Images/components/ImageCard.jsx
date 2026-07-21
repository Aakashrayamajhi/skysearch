export default function ImageCard({ src }) {
  return (
    <div className="relative group break-inside-avoid overflow-hidden rounded-2xl">
      
      <img
        src={src}
        alt=""
        className="w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300" />

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
        <button className="bg-white/90 text-black text-xs px-3 py-1 rounded-full">
          View
        </button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition text-xs text-white">
        Unsplash • Nature
      </div>

    </div>
  );
}