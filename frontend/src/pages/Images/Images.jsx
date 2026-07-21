import Navbar from "../../components/layout/Navbar";
import Filters from "../Search/components/Filters";
import ImageGrid from "./components/ImageGrid";
import ImageChips from "./components/ImageChips";

export default function Images() {
  return (
    <div className="bg-[#020617] min-h-screen text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">

        <Filters />

        <ImageChips />

        <div className="mt-6">
          <ImageGrid />
        </div>

      </div>

    </div>
  );
}