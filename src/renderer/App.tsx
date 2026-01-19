import { BrowserRouter, Route, Routes } from "react-router";

import "./styles/global.css";

import SerieInfo from "./pages/series/SerieInfo";
import Categories from "./pages/series/Categories";
import Index from "./pages/series";
import Series from "./pages/series/Series";
import SeasonInfo from "./pages/series/SeasonInfo";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route index element={<Categories />} />
          <Route path="category/:categoryId/series" element={<Series />} />
          <Route path="serie/:serieId/info" element={<SerieInfo />}>
            <Route index element={<SeasonInfo />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
