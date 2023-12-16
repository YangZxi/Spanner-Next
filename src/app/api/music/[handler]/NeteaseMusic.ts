import {Song} from "@/app/api/music/type";

const forge = require("node-forge");
const CryptoJS = require("crypto-js");

const iv = "0102030405060708";
const presetKey = "0CoJUm6Qyw8W8jud";
const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`;
const platform = "netease";

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
  const data = await fetch(`${url}`, {
    method: "POST",
    headers: {
      "Referer": "https://music.163.com",
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.code !== 200) return null;
      return res.result?.songs.map((el: any) => {
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
          platform
        }
        return info;
      });
    }).catch(err => {
      console.log(err)
      return null;
    });
  return data ?? [];
}

// searchMusicByNetease("有何不可")