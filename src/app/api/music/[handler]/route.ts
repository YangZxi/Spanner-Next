import {NextResponse} from 'next/server';
import Response from "@/util/Response";
import { type NextRequest } from 'next/server';
import { getMusicInfoByQQ, searchMusicByQQ, getPlaylistByQQ } from "./QQMusic";
import {PlaylistInfo} from "@/app/api/music/type";

const handlers: {
  [key: string]: (request: NextRequest) => Promise<NextResponse<any>>;
} = {
  search: searchMusic,
  info: getMusicInfo,
  playlist: getPlaylistInfo,
}

type Platform = "qq" | "netease";

export async function GET(request: NextRequest, { params }: { params: { handler: string } }) {
  const { handler } = params;
  return handlers[handler]?.(request) ?? NextResponse.json("Not Found", { status: 404 });
}

async function getMusicInfo(request: NextRequest) {
  const { mid, platform } = getSearchParams(request);
  if (!mid) return Response.fail("Need a parameter named mid");
  else if (!platform) return Response.fail("Need a parameter named platform");
  const musicInfo = await getMusicInfoByQQ(mid);
  return Response.ok(musicInfo);
}

async function searchMusic(request: NextRequest) {
  const { w } = getSearchParams(request);
  if (!w) return Response.fail("Need a parameter named w");
  const qqDataList = await searchMusicByQQ(w);
  return Response.ok(qqDataList);
}

async function getPlaylistInfo(request: NextRequest) {
  const { id, platform } = getSearchParams(request);
  if (!id) return Response.fail("Need a parameter named Playlist id");
  else if (!platform) return Response.fail("Need a parameter named platform");
  console.log(id)
  let data: PlaylistInfo | null = null;
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