import ImageCard from "./ImageCard";

const images = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
];

export default function ImageGrid() {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {images.map((img, i) => (
        <ImageCard key={i} src={img} />
      ))}
    </div>
  );
}