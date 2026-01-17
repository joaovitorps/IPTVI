import { BrowserRouter, Route, Routes } from "react-router";

import "./styles/global.css";

import SeriesCategories from "./pages/SeriesCategories";
import SeriesCategory from "./pages/SeriesCategory";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<SeriesCategories />} />
        <Route path=":categoryId" element={<SeriesCategory />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
