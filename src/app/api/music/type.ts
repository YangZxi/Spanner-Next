export type Platform = "qq" | "netease";

export type Singer = {
  mid: string;
  name: string;
}

export type Song = {
  mid: string;
  title: string;
  subtitle: string;
  album: {
    mid: string;
    title: string;
    subtitle: string;
  },
  singer: Singer[];
  imageUrl: string;
  platform: Platform;
  vip: boolean;
}

export type MusicDetail = {
  mid: string;
  title: string;
  subtitle: string;
  singer: Singer[];
  imageUrl: string;
  musicUrl: string;
  duration: number;
  lyrics: {
    lyric: string;
    lyricAdvance?: string;
    trans?: string;
  };
  vip: boolean;
  platform: Platform;
}

export type PlaylistInfo = {
  playlistId: string;
  name: string;
  logo: string;
  songList: Song[]
}

export type SearchMusicResponse = {
  songList: Song[];
  platform: Platform;
}[]