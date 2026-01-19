import { Serie } from "../types";

export const getSeriesCategories = async (): Promise<Array<Serie>> => {
  const response = await fetch(process.env.VITE_GET_SERIES_CATEGORIES_URL);

  return await response.json();
};

export const getSeriesCategory = async (category_id: number) => {
  const response = await fetch(
    process.env.VITE_GET_SERIES_CATEGORY_URL + category_id,
  );

  return await response.json();
};

export const getSerieInfo = async (series_id: number) => {
  const response = await fetch(process.env.VITE_GET_SERIE_INFO_URL + series_id);

  return await response.json();
};
