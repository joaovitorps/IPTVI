import * as z from "zod";

const UserInfo = z.object({
  username: z.string(),
  password: z.string(),
  message: z.string(),
  auth: z.number(),
  status: z.enum(["Active"]),
  exp_date: z.coerce.number(),
  is_trial: z.coerce.boolean(),
  active_cons: z.coerce.number(),
  created_at: z.string(),
  max_connections: z.coerce.number(),
  allowed_output_formats: z.array(z.enum(["ts"])),
});

const ServerInfo = z.object({
  url: z.string(),
  port: z.coerce.number(),
  https_port: z.coerce.number(),
  server_protocol: z.enum(["https", "http"]),
  rtmp_port: z.coerce.number(),
  timezone: z.string(),
  timestamp_now: z.number(),
  time_now: z.string(),
});

export const AccountInfo = z.object({
  user_info: UserInfo,
  server_info: ServerInfo,
});

const SerieSchema = z.object({
  num: z.coerce.number().optional(),
  name: z.string(),
  series_id: z.coerce.string().optional(),
  cover: z.string(),
  plot: z.string(),
  cast: z.string(),
  director: z.string(),
  genre: z.string(),
  releaseDate: z.string(),
  last_modified: z.string(),
  rating: z.coerce.number(),
  rating_5based: z.number(),
  backdrop_path: z.array(z.string()).nullable(),
  youtube_trailer: z.string(),
  episode_run_time: z.coerce.number(),
  category_id: z.coerce.string(),
});

export const SeriesSchema = z.array(SerieSchema);

const Season = z.object({
  air_date: z.string(),
  episode_count: z.coerce.number(),
  id: z.coerce.number(),
  name: z.string(),
  overview: z.string(),
  season_number: z.coerce.number(),
  vote_average: z.coerce.number().optional(),
  cover: z.string(),
  cover_big: z.string(),
});

const VideoInfo = z.object({
  index: z.coerce.number().catch(0),
  codec_name: z.string().catch(""),
  codec_long_name: z.string().catch(""),
  profile: z.string().catch(""),
  codec_type: z.string().catch(""),
  codec_time_base: z.string().catch(""),
  codec_tag_string: z.string().catch(""),
  codec_tag: z.string().catch(""),
  width: z.coerce.number().catch(0),
  height: z.coerce.number().catch(0),
  coded_width: z.coerce.number().catch(0),
  coded_height: z.coerce.number().catch(0),
  has_b_frames: z.coerce.number().catch(0),
  sample_aspect_ratio: z.string().catch(""),
  display_aspect_ratio: z.string().catch(""),
  pix_fmt: z.string().catch(""),
  level: z.coerce.number().catch(0),
  color_range: z.string().catch(""),
  color_space: z.string().catch(""),
  chroma_location: z.string().catch(""),
  field_order: z.string().catch(""),
  refs: z.coerce.number().catch(0),
  is_avc: z.coerce.boolean().catch(false),
  nal_length_size: z.coerce.number().catch(0),
  r_frame_rate: z.string().catch(""),
  avg_frame_rate: z.string().catch(""),
  time_base: z.string().catch(""),
  start_pts: z.coerce.number().catch(0),
  start_time: z.string().catch(""),
  bits_per_raw_sample: z.coerce.number().catch(0),
  disposition: z.object({
    default: z.coerce.number().catch(0),
    dub: z.coerce.number().catch(0),
    original: z.coerce.number().catch(0),
    comment: z.coerce.number().catch(0),
    lyrics: z.coerce.number().catch(0),
    karaoke: z.coerce.number().catch(0),
    forced: z.coerce.number().catch(0),
    hearing_impaired: z.coerce.number().catch(0),
    visual_impaired: z.coerce.number().catch(0),
    clean_effects: z.coerce.number().catch(0),
    attached_pic: z.coerce.number().catch(0),
    timed_thumbnails: z.coerce.number().catch(0),
  }),
  tags: z
    .object({
      BPS: z.string().catch(""),
      DURATION: z.string().catch(""),
      NUMBER_OF_FRAMES: z.string().catch(""),
      NUMBER_OF_BYTES: z.string().catch(""),
      _STATISTICS_WRITING_APP: z.string().catch(""),
      _STATISTICS_WRITING_DATE_UTC: z.string().catch(""),
      _STATISTICS_TAGS: z.string().catch(""),
    })
    .optional(),
});
const AudioInfo = z.object({
  index: z.coerce.number().catch(0),
  codec_name: z.string().catch(""),
  codec_long_name: z.string().catch(""),
  profile: z.string().catch(""),
  codec_type: z.string().catch(""),
  codec_time_base: z.string().catch(""),
  codec_tag_string: z.string().catch(""),
  codec_tag: z.string().catch(""),
  sample_fmt: z.string().catch(""),
  sample_rate: z.string().catch(""),
  channels: z.coerce.number().catch(0),
  channel_layout: z.string().catch(""),
  bits_per_sample: z.coerce.number().catch(0),
  r_frame_rate: z.string().catch(""),
  avg_frame_rate: z.string().catch(""),
  time_base: z.string().catch(""),
  start_pts: z.coerce.number().catch(0),
  start_time: z.string().catch(""),
  disposition: z.object({
    default: z.coerce.number().catch(0),
    dub: z.coerce.number().catch(0),
    original: z.coerce.number().catch(0),
    comment: z.coerce.number().catch(0),
    lyrics: z.coerce.number().catch(0),
    karaoke: z.coerce.number().catch(0),
    forced: z.coerce.number().catch(0),
    hearing_impaired: z.coerce.number().catch(0),
    visual_impaired: z.coerce.number().catch(0),
    clean_effects: z.coerce.number().catch(0),
    attached_pic: z.coerce.number().catch(0),
    timed_thumbnails: z.coerce.number().catch(0),
  }),
  tags: z
    .object({
      language: z.string().catch(""),
      title: z.string().catch(""),
      BPS: z.string().catch(""),
      DURATION: z.string().catch(""),
      NUMBER_OF_FRAMES: z.string().catch(""),
      NUMBER_OF_BYTES: z.string().catch(""),
      _STATISTICS_WRITING_APP: z.string().catch(""),
      _STATISTICS_WRITING_DATE_UTC: z.string().catch(""),
      _STATISTICS_TAGS: z.string().catch(""),
    })
    .optional(),
});

const EpisodeInfo = z.object({
  tmdb_id: z.coerce.number().nullable().catch(null),
  releasedate: z.string().catch(""),
  plot: z.string().catch(""),
  duration_secs: z.coerce.number(),
  duration: z.string(),
  movie_image: z.string().catch(""),
  video: VideoInfo,
  audio: AudioInfo,
});

const Episode = z.object({
  id: z.coerce.number(),
  episode_num: z.coerce.number(),
  title: z.string(),
  container_extension: z.string(),
  info: EpisodeInfo,
  custom_sid: z.string(),
  added: z.string(),
  season: z.coerce.number(),
  direct_source: z.string(),
});

export const SerieInfoSchema = z.object({
  seasons: z.array(Season),
  info: SerieSchema,
  episodes: z.record(z.coerce.number(), z.array(Episode)),
});

export type AccountInfo = z.infer<typeof AccountInfo>;
export type Serie = z.infer<typeof SerieSchema>;
export type Series = z.infer<typeof SeriesSchema>;
export type Season = z.infer<typeof Season>;
export type EpisodeInfo = z.infer<typeof EpisodeInfo>;
export type Episode = z.infer<typeof Episode>;
export type SerieInfo = z.infer<typeof SerieInfoSchema>;
