import { ArrowLeft, HomeIcon } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

export const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((pathname) => pathname);

  window.location.href =
    "http://localhost:5173/play/stream/66491/?seriesId=16&season=1";

  return (
    <>
      {pathnames.length > 0 && (
        <div className="flex">
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <button className="cursor-pointer" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <Link to="/">
            <HomeIcon />
          </Link>
        </div>
      )}
      <Outlet />
    </>
  );
};
