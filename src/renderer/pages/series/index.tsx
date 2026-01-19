import { ArrowLeft, HomeIcon } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((pathname) => pathname);

  return (
    <>
      {pathnames.length > 0 && (
        <div className="flex">
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

export default Index;
