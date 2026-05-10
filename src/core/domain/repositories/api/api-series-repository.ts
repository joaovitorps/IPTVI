import { axiosInstance } from "@/shared/axios";
import { Series as SeriesSchema } from "@/shared/schemas";

import { Serie } from "../../entities/series/serie";
import { SeriesRepository } from "../series-repository";

export class APISeriesRepository implements SeriesRepository {
  constructor(
    private readonly server: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchByCategoryId(categoryId: number) {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series",
        category_id: categoryId,
      }).get("/player_api.php");

      const parsed = SeriesSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return [];
      }

      const series: Serie[] = parsed.data.map((item) =>
        Serie.create(
          {
            num: item.num,
            name: item.name,
            cover: item.cover,
            plot: item.plot,
            cast: item.cast,
            director: item.director,
            genre: item.genre,
            releaseDate: item.releaseDate,
            lastModified: item.last_modified,
            rating: item.rating,
            rating5based: item.rating_5based,
            backdropPath: item.backdrop_path,
            youtubeTrailer: item.youtube_trailer,
            episodeRunTime: item.episode_run_time,
            categoryId: item.category_id,
          },
          item?.series_id,
        ),
      );

      return series;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getById(serieId: number): Promise<Serie> {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series_info",
        series_id: serieId,
      }).get("/player_api.php");
      const parsed = SerieInfoSchema.safeParse(response.data);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new Error("Failed to parse serie info");
      }
      const { seasons, info, episodes } = response.data;
      const mappedSeasons = seasons.map((season) =>
        Season.create(
          {
            airDate: season.air_date,
            episodeCount: season.episode_count,
            name: season.name,
            overview: season.overview,
            seasonNumber: season.season_number,
            voteAverage: season.vote_average,
            cover: season.cover,
            coverBig: season.cover_big,
          },
          season.id.toString(),
        ),
      );
      const mappedInfo = Serie.create(
        {
          num: info.num,
          name: info.name,
          cover: info.cover,
          plot: info.plot,
          cast: info.cast,
          director: info.director,
          genre: info.genre,
          releaseDate: info.releaseDate,
          lastModified: info.last_modified,
          rating: info.rating,
          rating5based: info.rating_5based,
          backdropPath: info.backdrop_path,
          youtubeTrailer: info.youtube_trailer,
          episodeRunTime: info.episode_run_time,
          categoryId: info.category_id,
        },
        info.series_id,
      );
      const mappedEpisodes: Record<
        number,
        ReturnType<typeof Episode.create>[]
      > = {};
      Object.entries(episodes).forEach(([seasonNum, seasonEpisodes]) => {
        mappedEpisodes[Number(seasonNum)] = seasonEpisodes.map((episode) =>
          Episode.create(
            {
              episodeNum: episode.episode_num,
              title: episode.title,
              containerExtension: episode.container_extension,
              info: {
                tmdbId: episode.info.tmdb_id,
                releasedate: episode.info.releasedate,
                plot: episode.info.plot,
                durationSecs: episode.info.duration_secs,
                duration: episode.info.duration,
                movieImage: episode.info.movie_image,
                video: {
                  width: episode.info.video.width,
                  height: episode.info.video.height,
                  codecName: episode.info.video.codec_name,
                },
                audio: {
                  codecName: episode.info.audio.codec_name,
                  language: episode.info.audio.tags.language,
                },
              },
              customSid: episode.custom_sid,
              added: episode.added,
              season: episode.season,
              directSource: episode.direct_source,
            },
            episode.id.toString(),
          ),
        );
      });
      return SerieInfo.create({
        seasons: mappedSeasons,
        info: mappedInfo,
        episodes: mappedEpisodes,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
