import Navbar from "../../components/layout/Navbar";
import Filters from "./components/Filters";
import ResultList from "./components/ResultList";
import AISidebar from "./components/AISidebar";
import SearchBar from "./components/SearchBar";

export default function Search() {
  return (
    <div className="bg-[#020617] min-h-screen text-white">

      {/* Top Nav */}
      <Navbar />

      {/*  Sticky Header (Search + Filters) */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-white/10">

        {/* Search Row */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* Filters Row */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex items-center justify-between">

            {/* Left Filters */}
            <Filters />

            {/* Right Side (Result Info / Sort) */}
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">

              <span>About 12,300 results</span>

              <button className="hover:text-cyan-400 transition">
                Sort: Relevance
              </button>

            </div>

          </div>
        </div>

      </div>

      {/*  Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-6">

        <div className="grid grid-cols-12 gap-8">

          {/* Results Section */}
          <div className="col-span-12 lg:col-span-8">

            {/* Optional Section Title */}
            <p className="text-xs text-gray-500 mb-4">
              Showing results for <span className="text-cyan-400">“quantum aerospace”</span>
            </p>

            <ResultList />

          </div>

          {/* Sidebar */}
          <div className="hidden lg:block col-span-4">
            <div className="sticky top-28">
              <AISidebar />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}