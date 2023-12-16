import {NextResponse} from 'next/server';
import Response from "@/util/Response";
import { type NextRequest } from 'next/server';
import getMusicInfoByQQ from "./getMusicInfoByQQ";
import type {PlaylistInfo, Song} from "@/app/api/music/type";

const handlers: {
  [key: string]: (request: NextRequest) => Promise<NextResponse<any>>;
} = {
  search: searchMusicByQQ,
  info: getMusicInfo,
  playlist: getPlaylistInfo,
}

export async function GET(request: NextRequest, { params }: { params: { handler: string } }) {
  const { handler } = params;
  return handlers[handler]?.(request) ?? NextResponse.json("Not Found", { status: 404 });
}

async function getMusicInfo(request: NextRequest) {
  const { mid } = getSearchParams(request);
  if (!mid) return Response.fail("Need a parameter named mid");
  const musicInfo = await getMusicInfoByQQ(mid);
  return Response.ok(musicInfo);
}

function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const map: {
    [key: string]: string | undefined;
  } = {

  }
  searchParams.forEach((value, key) => {
    map[key] = value;
  });
  return map;
}

async function searchMusicByQQ(request: NextRequest) {
  const { w } = getSearchParams(request);
  if (!w) return Response.fail("Need a parameter named w");
  const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
  const data = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      "req_1": {
        "method": "DoSearchForQQMusicDesktop",
        "module": "music.search.SearchCgiService",
        "param": {
          "num_per_page": 20,
          "page_num": 1,
          "query": w,
          "search_type": 0
        }
      }
    }),
    headers: {
      "Referer": "https://y.qq.com",
    }
  })
    .then(response => {
      return response.json();
    })
    .then(result => {
      if (result.code !== 0) return null;
      const data = result.req_1.data?.body ?? {};
      console.log('data', data?.song)
      return (data?.song?.list as any[]).map(song => {
        let imageUrl = "";
        const albumId = song.album.mid;
        console.log(song)
        if (albumId) {
          imageUrl = `https://y.qq.com/music/photo_new/T002R300x300M000${albumId}.jpg?max_age=2592000`;
        } else {
          imageUrl = `https://y.qq.com/music/photo_new/T001R300x300M000${song.singer[0].mid}.jpg?max_age=2592000`;
        }
        const info: Song = {
          mid: song.mid,
          title: song.title,
          subtitle: song.subtitle,
          album: {
            mid: song.album.mid,
            title: song.album.title,
            subtitle: song.album.subtitle,
          },
          singer: (song.singer ?? []).map((singer: any) => ({
            mid: singer.mid,
            name: singer.name,
          })),
          imageUrl,
        };
        return info;
      });
    })
    .catch(error => {
      console.log('error', error)
      return null;
    });
  if (data === null) return Response.ok([]);
  return Response.ok(data);
}

async function getPlaylistInfo(request: NextRequest) {
  const { id } = getSearchParams(request);
  if (!id) return Response.fail("Need a parameter named Playlist id");
  console.log(id)
  const url = `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&utf8=1&disstid=${id}&loginUin=110110&format=json`;
  const data = await fetch(url, {
    headers: {
      "Referer": "https://y.qq.com/n/yqq/playlist"
    }
  })
    .then(response => response.json())
    .then(result => {
      if (!result || result.code !== 0) return null;
      const cdlist = result.cdlist[0];
      const data: PlaylistInfo = {
        playlistId: cdlist.disstid,
        name: cdlist.dissname,
        logo: cdlist.logo,
        songList: cdlist.songlist.map((song: any) => {
          let imageUrl = "";
          const albumId = song.album.mid;
          if (albumId) {
            imageUrl = `https://y.qq.com/music/photo_new/T002R300x300M000${albumId}.jpg?max_age=2592000`;
          } else {
            imageUrl = `https://y.qq.com/music/photo_new/T001R300x300M000${song[0].mid}.jpg?max_age=2592000`;
          }
          const info: Song = {
            mid: song.songmid,
            title: song.songname,
            subtitle: song.subtitle,
            album: {
              mid: song.albummid,
              title: song.albumname,
              subtitle: "",
            },
            singer: song.singer.map((singer: any) => ({
              mid: singer.mid,
              name: singer.name
            })),
            imageUrl,
          };
          return info;
        })
      }
      return data;
    })
    .catch(error => {
      return null;
    });
  return Response.ok(data);
}