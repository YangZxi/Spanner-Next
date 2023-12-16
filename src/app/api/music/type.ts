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
}

export type MusicInfo = {
  mid: string;
  title: string;
  subtitle: string;
  singer: Singer[];
  imageUrl: string;
  musicUrl: string;
  duration: number;
  lyric: {
    time: number,
    text: string
  }[];
}

export type PlaylistInfo = {
  playlistId: string;
  name: string;
  logo: string;
  songList: Song[]
}