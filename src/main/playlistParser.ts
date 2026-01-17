export const getSeriesCategories = async () => {
  const response = await fetch(process.env.VITE_GET_SERIES_CATEGORIES_URL);

  return await response.json();
};

export const getSeriesCategory = async (category_id: number) => {
  const response = await fetch(
    process.env.VITE_GET_SERIES_CATEGORY_URL + category_id,
  );

  return await response.json();
};
