import {PlaylistInfo, Song} from "@/app/api/music/type";
import {NextResponseBody, ResponseBody} from "@/types";

async function search(word: string) {
  const res = await fetch(`/api/music/search?w=${word}`);
  const data = await res.json() as ResponseBody<Song[]>;
  // console.log(data)
  if (data.code) {
    localStorage.setItem("songList", JSON.stringify(data.data ?? []));
  } else {
    console.error(data);
  }
  return data.data;
}

async function searchPlaylist(id: string) {
  if (!id) return null;
  const res = await fetch(`/api/music/playlist?id=${id}`);
  const data = await res.json() as ResponseBody<PlaylistInfo>;
  const songList = data.data.songList ?? [];
  // console.log(songList)
  if (data.code) {
    localStorage.setItem("songList", JSON.stringify(songList));
  } else {
    console.error(data);
  }
  return songList;
}

export async function searchSong(word: string) {
  if (word.startsWith("http")) {
    let id = "";
    // https://y.qq.com/n/ryqq/playlist/8715942454
    if (word.startsWith("https://y.qq.com/n/ryqq/playlist/")) {
      id = word.replace("https://y.qq.com/n/ryqq/playlist/", "");
    }
    // https://i.y.qq.com/n2/m/share/details/taoge.html?hosteuin=oK-FowoFoK-s7n**&id=7767362229&appversion=111005&ADTAG=wxfshare&appshare=iphone_wx
    else if (word.startsWith("https://i.y.qq.com/n2/m/share/details/taoge.html")) {
      id = new URL(word).searchParams.get("id") ?? "";
    }
    return searchPlaylist(id);
  } else {
    return search(word);
  }
}