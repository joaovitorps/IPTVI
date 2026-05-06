import { Category } from "@/core/domain/entities/category";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSeriesCategories = async () => {
      try {
        setIsLoading(true);
        const res = await window.api.getSeriesCategories();

        setCategories(res);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void getSeriesCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Series Categories</h1>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => navigate(`/category/${category.id}/series`)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500 p-6 rounded-xl text-left transition-all group"
              >
                <h3 className="text-lg font-semibold group-hover:text-purple-400 transition-colors">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        )}

        {!isLoading && filteredCategories.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No categories found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};
