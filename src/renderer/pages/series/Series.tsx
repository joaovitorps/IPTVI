import { Serie } from "@/shared/schemas";
import { Loader, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const Series = () => {
  const [series, setSeries] = useState<Serie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { categoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getSeriesCategory = async () => {
      try {
        setIsLoading(true);
        const res = await window.api.getSeriesCategory(Number(categoryId));
        let seriesData: Serie[] = [];
        if (Array.isArray(res)) {
          seriesData = res;
        } else if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          Array.isArray((res as { data: Serie[] }).data)
        ) {
          seriesData = (res as { data: Serie[] }).data;
        }
        setSeries(seriesData);
      } catch (error) {
        console.error("Failed to fetch series:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      void getSeriesCategory();
    }
  }, [categoryId]);

  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Series</h1>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search series..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin w-12 h-12 text-purple-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredSeries.map((serie) => (
              <div
                key={serie.series_id}
                onClick={() => {
                  void navigate(`/serie/${serie.series_id}/info`);
                }}
                className="group cursor-pointer bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all transform hover:-translate-y-1"
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={serie.cover}
                    alt={serie.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-xs line-clamp-3 text-gray-200">
                      {serie.plot}
                    </p>
                  </div>
                  {serie.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold">
                        {serie.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">
                    {serie.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {serie.releaseDate?.split("-")[0] || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredSeries.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No series found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
