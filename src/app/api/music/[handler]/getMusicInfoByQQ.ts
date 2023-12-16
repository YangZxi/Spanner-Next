import base64 from "base64-js";
import {MusicInfo} from "../type";

const myHeaders = new Headers();
// todo 由前端提供，或存入数据库
myHeaders.append("Cookie", process.env.QQ_MUSIC_COOKIE ?? "");

async function getMusicInfo(mid: string) {
  const url = "https://u.y.qq.com/cgi-bin/musicu.fcg"
  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      "songinfo": {
        "method": "get_song_detail_yqq",
        "module": "music.pf_song_detail_svr",
        "param": {
          "song_mid": `${mid}`
        }
      }
    })
  })
    .then(response => response.json())
    .then(result => {
      // console.log(result.songinfo)
      return result.songinfo.data;
    })
    .catch(error => console.log('error', error));
}

async function getMusicUrl(mid: string) {
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    // redirect: 'follow'
  };
  const uin = "110110";
  const midStr = `"${mid}"`;
  const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?-=getplaysongvkey&g_tk=5381&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0&data=%7B"req_0"%3A%7B"module"%3A"vkey.GetVkeyServer"%2C"method"%3A"CgiGetVkey"%2C"param"%3A%7B"guid"%3A"2796982635"%2C"songmid"%3A%5B${midStr}%5D%2C"songtype"%3A%5B0%5D%2C"uin"%3A"${uin}"%2C"loginflag"%3A1%2C"platform"%3A"20"%7D%7D%2C"comm"%3A%7B"uin"%3A${uin}%2C"format"%3A"json"%2C"ct"%3A24%2C"cv"%3A0%7D%7D`;
  // console.log(url)
  const res = await fetch(url, requestOptions)
    .then(response => response.json())
    .then(result => result.req_0.data)
    .catch(error => console.log('error', error));
  // console.log(res)
  return res.sip[1] + res.midurlinfo[0].purl;
}

async function getMusicLyric(mid: string) {
  const uin = "1282381264";
  const url = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=${mid}&g_tk=5381&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0`;
  return await fetch(url, {
    headers: {
      "Referer": "https://y.qq.com"
    }
  })
    .then(response => response.json())
    .then(result => {
      return {
        lyric: parseLyrics(result.lyric),
        trans: result.trans
      };
    })
    .catch(error => console.log('error', error));
}

// 正则表达式用于匹配时间戳和歌词文本
const regex = /\[([\d:.]*)](.*)$/;

function parseLyrics(lyricRaw: string) {
  const lyricsText = new TextDecoder('utf-8').decode(base64.toByteArray(lyricRaw))
  // console.log(lyricsText)
  const lyricsArray = [];

  // 分割歌词文本为行
  const lines = lyricsText.split('\n');
  // console.log(lines)
  for (const line of lines) {
    const match = line.match(regex);
    // console.log(match, line)
    if (match) {
      const timestamp = match[1];
      const lyricText = match[2];
      if (lyricText.length === 0) continue;

      // 解析时间戳为秒数
      const [minutes, seconds] = timestamp.split(':').map(parseFloat);
      const timeInSeconds = minutes * 60 + seconds;

      // 将时间戳和歌词文本添加到数组中
      lyricsArray.push({
        time: timeInSeconds,
        text: lyricText,
      });
    }
  }

  // 根据时间戳排序歌词数组
  lyricsArray.sort((a, b) => a.time - b.time);

  return lyricsArray;
}

export default async function info(mid: string) {
  const musicInfo = await getMusicInfo(mid);
  const { track_info: trackInfo } = musicInfo;
  const title = trackInfo.title;
  const subtitle = trackInfo.subtitle;
  const singer = trackInfo.singer.map((singer: any) => ({
    mid: singer.mid,
    name: singer.name
  }));

  const musicUrl = await getMusicUrl(mid);
  const lyric = await getMusicLyric(mid);
  // console.log(lyric)

  let imageUrl = "";
  const albumId = musicInfo.track_info.album.mid;
  if (albumId) {
    imageUrl = `https://y.qq.com/music/photo_new/T002R300x300M000${albumId}.jpg?max_age=2592000`;
  } else {
    imageUrl = `https://y.qq.com/music/photo_new/T001R300x300M000${singer[0].mid}.jpg?max_age=2592000`;
  }

  const info: MusicInfo = {
    mid,
    title,
    subtitle,
    singer,
    imageUrl,
    musicUrl,
    duration: trackInfo.interval,
    lyric: lyric?.lyric ?? []
  }
  return info;
}