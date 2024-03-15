import {MusicDetail, Song} from "../type";

const forge = require("node-forge");
const CryptoJS = require("crypto-js");

const iv = "0102030405060708";
const presetKey = "0CoJUm6Qyw8W8jud";
const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`;
const eapiKey = "e82ckenh8dichen8";
const platform = "netease";

const cookieStr = process.env.NETEASE_MUSIC_COOKIE ?? "";

const aesEncrypt = (text: string, mode: string, key: string, iv: string, format = 'base64') => {
  let encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(text),
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode[mode.toUpperCase()],
      padding: CryptoJS.pad.Pkcs7,
    },
  )
  if (format === 'base64') {
    return encrypted.toString()
  }

  return encrypted.ciphertext.toString().toUpperCase()
}

const rsaEncrypt = (str: string, key: string) => {
  const forgePublicKey = forge.pki.publicKeyFromPem(key)
  const encrypted = forgePublicKey.encrypt(str, 'NONE')
  return forge.util.bytesToHex(encrypted)
}

const eapi = (url: string, object: object) => {
  const text = typeof object === 'object' ? JSON.stringify(object) : object
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = CryptoJS.MD5(message).toString()
  const data = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`
  return {
    params: aesEncrypt(data, 'ecb', eapiKey, '', 'hex'),
  }
}

const weapi = (object: Record<string, any>) => {
  const text = JSON.stringify(object)
  // console.log(text)
  let secretKey = ''
  for (let i = 0; i < 16; i++) {
    secretKey += base62.charAt(Math.round(Math.random() * 61))
  }
  return {
    params: aesEncrypt(
      aesEncrypt(text, 'cbc', presetKey, iv),
      'cbc',
      secretKey,
      iv,
    ),
    encSecKey: rsaEncrypt(secretKey.split('').reverse().join(''), publicKey),
  }
}

const defaultHeaders: Record<string, string> = {
  "Referer": "https://music.163.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69",
  "X-Real-IP": "211.161.244.70",
}

export async function searchMusicByNetease(word: string) {
  const body = {
    "s": word,
    "type": 1,
    "limit": 20,
    "offset": 0,
    "csrf_token": ""
  }
  const encryptData = weapi(body);
  const { params, encSecKey } = {
    params: encodeURIComponent(encryptData.params),
    encSecKey: encodeURIComponent(encryptData.encSecKey)
  };
  const url = `https://music.163.com/weapi/search/get?params=${params}&encSecKey=${encSecKey}`;

  console.log(params)
  console.log(encSecKey)
  const data: Song[] | null = await fetch(`${url}`, {
    method: "POST",
    headers: defaultHeaders
  })
    .then(res => res.json())
    .then(res => {
      if (res.code !== 200) return null;
      const songList: Song[] = res.result?.songs.map((el: any) => {
        const info: Song = {
          mid: el.id + "",
          title: el.name,
          subtitle: el.alias[0] ?? "",
          album: {
            mid: el.album.id + "",
            title: el.album.name,
            subtitle: ""
          },
          singer: el.artists.map((singer: any) => ({
            mid: singer.id + "",
            name: singer.name
          })),
          imageUrl: "",
          vip: el.fee === 1,
          platform
        }
        return info;
      });
      return songList;
    }).catch(err => {
      console.log(err)
      return null;
    });
  return data ?? [];
}

async function getMusicUrl(id: string) {
  const body = {
    ids: [String(id)],
    br: 320000 // 999000
  }
  const encryptData = eapi("/api/song/enhance/player/url", body);
  const params = encodeURIComponent(encryptData.params);
  // console.log(params);
  const url = `https://interface3.music.163.com/eapi/song/enhance/player/url?params=${params}`;
  const musicUrl = fetch(url, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      cookie: cookieStr,
    }
  }).then(res => res.json())
    .then(res => {
      if (res.code !== 200) return null;
      return res.data[0].url;
    })
    .catch(err => {
      console.log(err)
      return "";
    });
  return musicUrl ?? "";
}

async function getMusicInfo(id: string) {
  const body = {
    c: `[{"id":${id}}]`,
  }
  const encryptData = weapi(body);
  const { params, encSecKey } = {
    params: encodeURIComponent(encryptData.params),
    encSecKey: encodeURIComponent(encryptData.encSecKey)
  }
  const url = `https://music.163.com/weapi/v3/song/detail?params=${params}&encSecKey=${encSecKey}`;
  // console.log(shortlink)
  const musicInfo = fetch(url, {
    method: "POST",
    headers: defaultHeaders
  }).then(res => res.json())
    .then(({songs, code}) => {
      if (code !== 200) return null;
      const song = songs[0];
      const info: MusicDetail = {
        mid: song.id + "",
        title: song.name,
        subtitle: song.alia[0] ?? "",
        singer: song.ar.map((singer: any) => ({
          mid: singer.id + "",
          name: singer.name
        })),
        imageUrl: song.al.picUrl,
        musicUrl: "",
        lyrics: {
          lyric: "",
        },
        duration: song.dt / 1000,
        vip: song.fee === 1,
        platform
      }
      return info;
    })
    .catch(err => {
      console.log(err)
      return null;
    })
  return musicInfo ?? null;
}

async function getMusicLyric(id: string): Promise<MusicDetail["lyrics"]> {
  const body = {
    id: String(id),
    cp: false,
    tv: 0,
    lv: 0,
    rv: 0,
    kv: 0,
    yv: 0,
    ytv: 0,
    yrv: 0,
  }
  const encryptData = eapi("/api/song/lyric/v1", body);
  const params = encodeURIComponent(encryptData.params);
  const url = "https://interface3.music.163.com/eapi/song/lyric/v1";
  return await fetch(`${url}?params=${params}`, {
    method: "POST",
    headers: defaultHeaders
  }).then(res => res.json())
    .then(({lrc, yrc}) => {
      return {
        lyric: lrc.lyric as string,
        trans: ""
      };
    })
    .catch(err => {
      console.log(err)
      return {
        lyric: "",
      };
    });
}

export async function getMusicInfoByNetease(id: string) {
  const promise = Promise.all([getMusicInfo(id), getMusicUrl(id), getMusicLyric(id)]);
  return await promise.then(([info, url, lyric]) => {
    return {
      ...info,
      musicUrl: url,
      lyrics: lyric,
    }
  });
}
