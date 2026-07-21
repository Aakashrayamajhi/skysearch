import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Search from "./pages/Search/Search";
import Images from "./pages/Images/Images";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/search" element={<Search />} />
        <Route path="/search/images" element={<Images />} />

        <Route path="/videos" element={<div>Videos Results</div>} />
        <Route path="/news" element={<div>News Results</div>} />
        <Route path="/maps" element={<div>Maps Results</div>} />

      </Routes>
    </BrowserRouter>
  );
}