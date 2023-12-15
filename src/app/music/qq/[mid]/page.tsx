"use client";

import {useEffect, useState} from "react";
import SongList from "@/app/music/qq/[mid]/SongList";
import Search from "@/app/music/qq/[mid]/Search";
import Music from "@/app/music/qq/[mid]/Music";
import {MusicInfo, Song} from "@/app/api/music/type";
import ClientOnly from "@/components/ClientOnly";
import { searchSong } from "@/app/music/searchSong";

type Props = {
  params: {
    mid: string
  }
}

export default function Page({params}: Props) {
  const [mid, setMid] = useState<string>(params.mid);
  const [musicInfo, setMusicInfo] = useState<MusicInfo>(() => {
    if (typeof window !== 'undefined') {
      // Perform localStorage action
      const musicInfo = localStorage.getItem("musicInfo");
      return musicInfo ? JSON.parse(musicInfo) : undefined;
    }
  });
  const [songList, setSongList] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      const songList = localStorage.getItem("songList");
      return songList ? JSON.parse(songList) : [];
    }
  });

  useEffect(() => {
    if (!mid) return;
    // else if (musicInfo && musicInfo.mid === mid) return;
    getMusicInfo(mid);
    history.pushState(null, "", `/music/qq/${mid}`);
  }, [mid])

  const getMusicInfo = (mid: string) => {
    fetch(`/api/music/info?mid=${mid}`).then(res => res.json()).then(data => {
      if (data.code) {
        const musicInfo = data.data as MusicInfo;
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

  const rotateMusic = (type: "prev" | "next" | "random" | string) => {
    if (songList.length === 1) {
      setMid(songList[0].mid);
      return;
    }
    if (type.length > 6) {
      setMid(type);
      return;
    }
    let index = 0;
    const len = songList.length;
    if (type === "random") {
      index = Math.floor(Math.random() * len);
    } else if (type === "prev" || type === "next") {
      for (let i = 0; i < len; i++) {
        if (songList[i].mid === mid) {
          index = type === "prev" ? i - 1 : i + 1;
          if (index < 0) index = len - 1;
          else if (index >= len) index = 0;
          break;
        }
      }
    }
    const newMid = songList[index].mid;
    setMid(newMid);
  }

  return <div className="flex flex-wrap justify-center gap-4">
    <div className="flex justify-center w-full">
      <Search className="max-w-[610px]" onSearch={(value) => {
        searchSong(value).then(data => {
          setSongList(data ?? []);
        });
      }} />
    </div>
    <div className="w-[610px] max-h-[324px] overflow-y-auto border-small px-1 py-2 order-1
      md:order-3 xl:max-w-[420px]
      rounded-small border-default-200 dark:border-default-100">
      <ClientOnly>
        <SongList songList={songList} playingMid={mid} onRotateMusic={rotateMusic} />
      </ClientOnly>
    </div>
    <div className="w-full max-w-[610px] flex justify-center order-2 items-start" >
      <ClientOnly>
        {musicInfo && <Music info={musicInfo} onRotateMusic={rotateMusic} />}
      </ClientOnly>
    </div>
  </div>;
}
