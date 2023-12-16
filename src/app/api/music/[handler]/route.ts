import {NextResponse} from 'next/server';
import Response from "@/util/Response";
import { type NextRequest } from 'next/server';
import { getMusicInfoByQQ, searchMusicByQQ, getPlaylistByQQ } from "./QQMusic";
import {getMusicInfoByNetease, searchMusicByNetease} from "./NeteaseMusic";
import {PlaylistInfo} from "@/app/api/music/type";
import {Song} from "@/app/api/music/type";

const handlers: {
  [key: string]: (request: NextRequest) => Promise<NextResponse<any>>;
} = {
  search: searchMusic,
  info: getMusicInfo,
  playlist: getPlaylistInfo,
}

export async function GET(request: NextRequest, { params }: { params: { handler: string } }) {
  const { handler } = params;
  return handlers[handler]?.(request) ?? NextResponse.json("Not Found", { status: 404 });
}

async function getMusicInfo(request: NextRequest) {
  const { mid, platform } = getSearchParams(request);
  if (!mid) return Response.fail("Need a parameter named mid");
  else if (!platform) return Response.fail("Need a parameter named platform");
  let musicInfo = null;
  if (platform === "qq") {
    musicInfo = await getMusicInfoByQQ(mid);
  } else if (platform === "netease") {
    musicInfo = await getMusicInfoByNetease(mid);
  }
  return Response.ok(musicInfo);
}

async function searchMusic(request: NextRequest) {
  const { w, platform } = getSearchParams(request);
  if (!w) return Response.fail("Need a parameter named w");

  let data: Song[];
  if (platform === "qq") {
    data = await searchMusicByQQ(w);
  } else if (platform === "netease") {
    data = await searchMusicByNetease(w);
  } else {
    const promise = Promise.all([searchMusicByQQ(w), searchMusicByNetease(w)]);
    data = await promise.then(([qq, netease]) => {
      return [...qq, ...netease]
    })
  }
  return Response.ok(data);
}

async function getPlaylistInfo(request: NextRequest) {
  const { id, platform } = getSearchParams(request);
  if (!id) return Response.fail("Need a parameter named Playlist id");
  else if (!platform) return Response.fail("Need a parameter named platform");
  console.log(id)
  let data: PlaylistInfo | null;
  if (platform === "qq") {
    data = await getPlaylistByQQ(id);
  } else {
    data = null;
  }
  return Response.ok(data);
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