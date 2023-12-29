"use client";

import Search from "@/app/music/[mid]/Search";
import SongList from "@/app/music/[mid]/SongList";
import {useState} from "react";
import {Song} from "@/app/api/music/type";
import {searchSong} from "@/app/music/searchSong";
import ClientOnly from "@/components/ClientOnly";


export default function Page() {
  const [songList, setSongList] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      const songList = localStorage.getItem("songList");
      try {
        return songList ? JSON.parse(songList) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  return <>
    <ClientOnly>
      <div className="max-w-[610px]" style={{margin: "10rem auto"}}>
        <Search
          defaultValue={songList.length > 0 ? undefined : "晴天"}
          onSearch={async (word) => {
            return searchSong(word).then(data => {
              console.log(data)
              setSongList(data ?? []);
            });
          }}
        />
        <div className="mt-4">
          <SongList songList={songList} />
        </div>
      </div>
    </ClientOnly>
  </>;
}