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

const SeriesCategory = z.object({
  category_id: z.coerce.number(),
  category_name: z.string(),
  parent_id: z.coerce.number(),
});

export const SeriesCategories = z.array(SeriesCategory);

const Serie = z.object({
  num: z.coerce.number().optional(),
  name: z.string(),
  series_id: z.coerce.number().optional(),
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

export const Series = z.array(Serie);

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
  index: z.coerce.number(),
  codec_name: z.string(),
  codec_long_name: z.string(),
  profile: z.string(),
  codec_type: z.string(),
  codec_time_base: z.string(),
  codec_tag_string: z.string(),
  codec_tag: z.string(),
  width: z.coerce.number(),
  height: z.coerce.number(),
  coded_width: z.coerce.number(),
  coded_height: z.coerce.number(),
  has_b_frames: z.coerce.number(),
  sample_aspect_ratio: z.string(),
  display_aspect_ratio: z.string(),
  pix_fmt: z.string(),
  level: z.coerce.number(),
  color_range: z.string(),
  color_space: z.string(),
  chroma_location: z.string(),
  field_order: z.string(),
  refs: z.coerce.number(),
  is_avc: z.coerce.boolean(),
  nal_length_size: z.coerce.number(),
  r_frame_rate: z.string(),
  avg_frame_rate: z.string(),
  time_base: z.string(),
  start_pts: z.coerce.number(),
  start_time: z.string(),
  bits_per_raw_sample: z.coerce.number(),
  disposition: z.object({
    default: z.coerce.number(),
    dub: z.coerce.number(),
    original: z.coerce.number(),
    comment: z.coerce.number(),
    lyrics: z.coerce.number(),
    karaoke: z.coerce.number(),
    forced: z.coerce.number(),
    hearing_impaired: z.coerce.number(),
    visual_impaired: z.coerce.number(),
    clean_effects: z.coerce.number(),
    attached_pic: z.coerce.number(),
    timed_thumbnails: z.coerce.number(),
  }),
  tags: z.object({
    BPS: z.string(),
    DURATION: z.string(),
    NUMBER_OF_FRAMES: z.string(),
    NUMBER_OF_BYTES: z.string(),
    _STATISTICS_WRITING_APP: z.string(),
    _STATISTICS_WRITING_DATE_UTC: z.string(),
    _STATISTICS_TAGS: z.string(),
  }),
});
const AudioInfo = z.object({
  index: z.coerce.number(),
  codec_name: z.string(),
  codec_long_name: z.string(),
  profile: z.string(),
  codec_type: z.string(),
  codec_time_base: z.string(),
  codec_tag_string: z.string(),
  codec_tag: z.string(),
  sample_fmt: z.string(),
  sample_rate: z.string(),
  channels: z.coerce.number(),
  channel_layout: z.string(),
  bits_per_sample: z.coerce.number(),
  r_frame_rate: z.string(),
  avg_frame_rate: z.string(),
  time_base: z.string(),
  start_pts: z.coerce.number(),
  start_time: z.string(),
  disposition: z.object({
    default: z.coerce.number(),
    dub: z.coerce.number(),
    original: z.coerce.number(),
    comment: z.coerce.number(),
    lyrics: z.coerce.number(),
    karaoke: z.coerce.number(),
    forced: z.coerce.number(),
    hearing_impaired: z.coerce.number(),
    visual_impaired: z.coerce.number(),
    clean_effects: z.coerce.number(),
    attached_pic: z.coerce.number(),
    timed_thumbnails: z.coerce.number(),
  }),
  tags: z.object({
    language: z.string(),
    title: z.string(),
    BPS: z.string(),
    DURATION: z.string(),
    NUMBER_OF_FRAMES: z.string(),
    NUMBER_OF_BYTES: z.string(),
    _STATISTICS_WRITING_APP: z.string(),
    _STATISTICS_WRITING_DATE_UTC: z.string(),
    _STATISTICS_TAGS: z.string(),
  }),
});

const EpisodeInfo = z.object({
  tmdb_id: z.coerce.number().nullable(),
  releasedate: z.string(),
  plot: z.string(),
  duration_secs: z.coerce.number(),
  duration: z.string(),
  movie_image: z.string().optional(),
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

export const SerieInfo = z.object({
  seasons: z.array(Season),
  info: Serie,
  episodes: z.record(z.coerce.number(), z.array(Episode)),
});

export type AccountInfo = z.infer<typeof AccountInfo>;
export type SeriesCategory = z.infer<typeof SeriesCategory>;
export type Serie = z.infer<typeof Serie>;
export type Series = z.infer<typeof Series>;
export type Season = z.infer<typeof Season>;
export type EpisodeInfo = z.infer<typeof EpisodeInfo>;
export type Episode = z.infer<typeof Episode>;
export type SerieInfo = z.infer<typeof SerieInfo>;
