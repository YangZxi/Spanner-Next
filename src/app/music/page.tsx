"use client";

import Search from "@/app/music/[mid]/Search";
import SongList from "@/app/music/[mid]/SongList";
import {useState} from "react";
import {Song} from "@/app/api/music/type";
import {searchSong} from "@/app/music/searchSong";


export default function Page() {
  const [songList, setSongList] = useState<Song[]>([]);

  return <div className="max-w-[610px]" style={{margin: "10rem auto"}}>
    <Search
      defaultValue="晴天"
      placeholder="歌曲名 / 歌手 / 歌单链接"
      onSearch={(word) => {
        searchSong(word).then(data => {
          console.log(data)
          setSongList(data ?? []);
        });
      }}
    />
    <div className="mt-4">
      <SongList songList={songList} />
    </div>
  </div>;
}