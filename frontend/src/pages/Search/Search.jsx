import Navbar from "../../components/layout/Navbar";
import SearchHeader from "./components/SearchHeader";
import Filters from "./components/Filters";
import ResultList from "./components/ResultList";
import AISidebar from "./components/AISidebar";

export default function Search() {
  return (
    <div className="min-h-screen">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-6">

        <SearchHeader />
        <Filters />

        <div className="grid grid-cols-12 gap-8 mt-6">

          <div className="col-span-8">
            <ResultList />
          </div>

          <div className="col-span-4">
            <AISidebar />
          </div>

        </div>

      </div>
    </div>
  );
}