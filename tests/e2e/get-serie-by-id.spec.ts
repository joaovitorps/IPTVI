import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { GetSerieByIdUseCase } from "@/core/domain/use-cases/series/get-serie-by-id";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("Fetch categories e2e", () => {
  let mock: AxiosMockAdapter;

  beforeAll(() => {
    mock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  const successResponse = {
    seasons: [
      {
        air_date: "2021-01-09",
        episode_count: 10,
        id: 175591,
        name: "Especiais",
        overview: "",
        season_number: 1,
        vote_average: 0,
        cover:
          "http://image.tmdb.org/t/p/w600_and_h900_bestv2/eNWo1SAzHVnXNBYagafAm9yjMgJ.jpg",
        cover_big:
          "http://image.tmdb.org/t/p/w600_and_h900_bestv2/eNWo1SAzHVnXNBYagafAm9yjMgJ.jpg",
      },
    ],
    info: {
      name: "Jujutsu Kaisen",
      cover: "http://cdn23.in/logo/712-tv-cover.jpg",
      plot: "Jujutsu Kaisen Yuji é um gênio do atletismo, mas não tem interesse algum em ficar correndo em círculos. Ele é feliz como membro no Clube de Estudo de Fenômenos Psíquicos. Apesar de estar no clube apenas por diversão, tudo fica sério quando um espírito de verdade aparece na escola! A vida está prestes a se tornar muito interessante na Escola Sugisawa…",
      cast: "Junya Enoki, Yuma Uchida, Asami Seto, Yuichi Nakamura",
      director: "Sunghoo Park",
      genre: "Animação, Action & Adventure, Sci-Fi & Fantasy",
      releaseDate: "2020-10-03",
      last_modified: "1776459237",
      rating: "9",
      rating_5based: 4.5,
      backdrop_path: null,
      youtube_trailer: "ynr6gnyu9NE",
      episode_run_time: "24",
      category_id: "1135",
    },
    episodes: {
      "1": [
        {
          id: "67207",
          episode_num: 1,
          title: "Jujutsu Kaisen - S01E01 - Ryomen Sukuna",
          container_extension: "mkv",
          info: {
            tmdb_id: 1984409,
            releasedate: "2020-10-03",
            plot: "No leito de morte de seu avô, Yuuji Itadori promete que ajudará as pessoas sempre que puder. E a oportunidade vem na forma de acontecimentos sinistro ameaçando seus amigos da escola.",
            duration_secs: 1435,
            duration: "00:23:55",
            movie_image:
              "https://image.tmdb.org/t/p/w600_and_h900_bestv2/veG3J8KaBudM8omuGi58fYOMDTz.jpg",
            video: {
              index: 0,
              codec_name: "h264",
              codec_long_name: "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
              profile: "High",
              codec_type: "video",
              codec_time_base: "1001/48000",
              codec_tag_string: "[0][0][0][0]",
              codec_tag: "0x0000",
              width: 1280,
              height: 720,
              coded_width: 1280,
              coded_height: 720,
              has_b_frames: 2,
              sample_aspect_ratio: "1:1",
              display_aspect_ratio: "16:9",
              pix_fmt: "yuv420p",
              level: 41,
              color_range: "tv",
              color_space: "bt709",
              color_transfer: "bt709",
              color_primaries: "bt709",
              chroma_location: "left",
              field_order: "progressive",
              refs: 1,
              is_avc: "true",
              nal_length_size: "4",
              r_frame_rate: "24000/1001",
              avg_frame_rate: "24000/1001",
              time_base: "1/1000",
              start_pts: 23,
              start_time: "0.023000",
              bits_per_raw_sample: "8",
              disposition: {
                default: 1,
                dub: 0,
                original: 0,
                comment: 0,
                lyrics: 0,
                karaoke: 0,
                forced: 1,
                hearing_impaired: 0,
                visual_impaired: 0,
                clean_effects: 0,
                attached_pic: 0,
                timed_thumbnails: 0,
              },
              tags: {
                BPS: "1700459",
                DURATION: "00:23:55.017000000",
                NUMBER_OF_FRAMES: "34406",
                NUMBER_OF_BYTES: "305023510",
                _STATISTICS_WRITING_APP:
                  "mkvmerge v57.0.0 ('Till The End') 64-bit",
                _STATISTICS_WRITING_DATE_UTC: "2021-06-15 00:15:39",
                _STATISTICS_TAGS:
                  "BPS DURATION NUMBER_OF_FRAMES NUMBER_OF_BYTES",
              },
            },
            audio: {
              index: 1,
              codec_name: "aac",
              codec_long_name: "AAC (Advanced Audio Coding)",
              profile: "LC",
              codec_type: "audio",
              codec_time_base: "1/44100",
              codec_tag_string: "[0][0][0][0]",
              codec_tag: "0x0000",
              sample_fmt: "fltp",
              sample_rate: "44100",
              channels: 2,
              channel_layout: "stereo",
              bits_per_sample: 0,
              r_frame_rate: "0/0",
              avg_frame_rate: "0/0",
              time_base: "1/1000",
              start_pts: 0,
              start_time: "0.000000",
              disposition: {
                default: 1,
                dub: 0,
                original: 0,
                comment: 0,
                lyrics: 0,
                karaoke: 0,
                forced: 1,
                hearing_impaired: 0,
                visual_impaired: 0,
                clean_effects: 0,
                attached_pic: 0,
                timed_thumbnails: 0,
              },
              tags: {
                language: "por",
                title: "Portuguese",
                BPS: "128211",
                DURATION: "00:23:55.086000000",
                NUMBER_OF_FRAMES: "61804",
                NUMBER_OF_BYTES: "22999253",
                _STATISTICS_WRITING_APP:
                  "mkvmerge v57.0.0 ('Till The End') 64-bit",
                _STATISTICS_WRITING_DATE_UTC: "2021-06-15 00:15:39",
                _STATISTICS_TAGS:
                  "BPS DURATION NUMBER_OF_FRAMES NUMBER_OF_BYTES",
              },
            },
            bitrate: 1835,
            rating: 6.6,
            season: "1",
          },
          custom_sid: "",
          added: "1624249816",
          season: 1,
          direct_source: "",
        },
      ],
    },
  };

  let repository: APISeriesRepository;
  let sut: GetSerieByIdUseCase;

  it("should be able to fetch a serie by id with seasons and nested episodes", async () => {
    mock.onGet("/player_api.php").reply(200, successResponse);

    repository = new APISeriesRepository("server", "username", "pass");
    sut = new GetSerieByIdUseCase(repository);

    const { serie } = await sut.execute({ serieId: "1" });

    expect(serie.name).toEqual(successResponse.info.name);
    expect(serie.cast).toEqual(successResponse.info.cast);

    expect(serie.seasons).toHaveLength(1);
    expect(serie.seasons[0].name).toEqual("Especiais");
    expect(serie.seasons[0].seasonNumber).toEqual(1);

    expect(serie.seasons[0].episodes).toHaveLength(1);
    expect(serie.seasons[0].episodes[0].title).toEqual(
      "Jujutsu Kaisen - S01E01 - Ryomen Sukuna",
    );
    expect(serie.seasons[0].episodes[0].episodeNum).toEqual(1);
  });
});
