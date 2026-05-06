import { BrowserRouter, Route, Routes } from "react-router";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Player } from "./pages/Player";
import { Categories } from "./pages/series/Categories";
import { SeasonInfo } from "./pages/series/SeasonInfo";
import { SerieInfoView } from "./pages/series/SerieInfo";
import { Series } from "./pages/series/Series";
import { Index } from "./pages/series/index";
import "./styles/global.css";

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />}>
              <Route index element={<Categories />} />
              <Route path="category/:categoryId/series" element={<Series />} />
              <Route path="serie/:serieId/info" element={<SerieInfoView />}>
                <Route index element={<SeasonInfo />} />
              </Route>
            </Route>
            <Route path="/play/stream/:streamId/" element={<Player />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
