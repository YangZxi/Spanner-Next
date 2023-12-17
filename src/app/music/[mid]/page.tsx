"use client";

import {useEffect, useState} from "react";
import SongList from "@/app/music/[mid]/SongList";
import Search from "@/app/music/[mid]/Search";
import Music from "@/app/music/[mid]/Music";
import {MusicDetail, Platform, Song} from "@/app/api/music/type";
import ClientOnly from "@/components/ClientOnly";
import { searchSong } from "@/app/music/searchSong";

export type MusicAndPlatform = {id: string, platform: Platform | null};

type Props = {
  params: {
    mid: string
  };
  searchParams: { platform: Platform, [key: string]: string | string[] | undefined }
}

export default function Page({params, searchParams}: Props) {
  const [music, setMusic] = useState<MusicAndPlatform>({
    id: params.mid,
    platform: searchParams.platform ?? null,
  });
  const [musicInfo, setMusicInfo] = useState<MusicDetail>(() => {
    if (typeof window !== 'undefined') {
      // Perform localStorage action
      const musicInfo = localStorage.getItem("musicInfo");
      return musicInfo ? JSON.parse(musicInfo) : undefined;
    }
  });
  const [songList, setSongList] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      const songList = localStorage.getItem("songList");
      try {
        return songList ? JSON.parse(songList) : [];
      } catch (e) {
        return [];
      }
    }
  });

  useEffect(() => {
    if (!music.id) return;
    // else if (musicInfo && musicInfo.mid === mid) return;
    getMusicInfo(music);
    history.pushState(null, "", `/music/${music.id}?platform=${music.platform}`);
  }, [music])

  if (music.platform === null) {
    return <div>页面加载出错</div>;
  }

  const getMusicInfo = (music: MusicAndPlatform) => {
    fetch(`/api/music/info?mid=${music.id}&platform=${music.platform}`).then(res => res.json()).then(data => {
      if (data.code) {
        const musicInfo = data.data as MusicDetail;
        musicInfo.musicUrl = musicInfo.musicUrl.replace("http://", "https://");
        setMusicInfo(musicInfo);
        console.log(musicInfo)
        localStorage.setItem("musicInfo", JSON.stringify(musicInfo));
        document.title = musicInfo.title;
      } else {
        console.error(data);
      }
    }).catch(err => {
      console.error(err);
    });
  }

  const rotateMusic = (type: "prev" | "next" | "random" | "id", nextMusic: MusicAndPlatform | undefined) => {
    if (songList.length === 1) {
      setMusic({id: songList[0].mid, platform: songList[0].platform});
      return;
    }
    let index = 0;
    const len = songList.length;
    if (type === "id" && nextMusic) {
      setMusic(nextMusic);
      return;
    } else if (type === "random") {
      index = Math.floor(Math.random() * len);
    } else if (type === "prev" || type === "next") {
      for (let i = 0; i < len; i++) {
        if (songList[i].mid === music.id) {
          index = type === "prev" ? i - 1 : i + 1;
          if (index < 0) index = len - 1;
          else if (index >= len) index = 0;
          break;
        }
      }
    }
    const newMid = songList[index].mid;
    setMusic({id: newMid, platform: songList[index].platform});
  }

  return <div className="flex flex-wrap justify-center gap-4">
    <div className="flex justify-center w-full">
      <Search className="max-w-[610px]" onSearch={(value) => {
        searchSong(value).then(data => {
          setSongList(data ?? []);
        });
      }} />
    </div>
    <div className="w-full border-small px-1 py-2 order-1
      md:order-3 xl:max-w-[420px]
      rounded-small border-default-200 dark:border-default-100">
      <ClientOnly>
        <SongList songList={songList} playingMid={music.id} onRotateMusic={rotateMusic} maxHeight={300} />
      </ClientOnly>
    </div>
    <div className="w-full max-w-[610px] flex justify-center order-2 items-start" >
      <ClientOnly>
        {musicInfo && <Music info={musicInfo} onRotateMusic={rotateMusic} />}
      </ClientOnly>
    </div>
  </div>;
}
