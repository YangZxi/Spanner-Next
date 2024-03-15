import * as cheerio from "cheerio";

export async function getInfo(url: string) {
  if (!url) return null;
  const urlObj = new URL(url);
  return await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "referer": urlObj.origin
    }
  }).then(res => {
    const contentType = res.headers.get("Content-Type");
    if (!contentType?.includes("text/html")) {
      throw new Error("Not a html");
    }
    return res.text();
  }).then(html => {
    const $ = cheerio.load(html);
    let title = $("meta[name='og:title']").attr("content");
    if (!title) {
      title = $("title").text();
    }
    const description = $("meta[name=description]").attr("content");
    const image = getImage($);

    let icon = $("link[rel='icon']").attr("href");
    if (icon === undefined) {
      icon = $("link[rel='shortcut icon']").attr("href");
    }
    const origin = urlObj.origin;
    return {
      title,
      description,
      origin,
      image: fullUrl(image, urlObj),
      icon: fullUrl(icon, urlObj),
    }
  }).catch(err => {
    console.log(err)
    return null;
  });
}

function getImage($: cheerio.CheerioAPI) {
  let image = $("meta[name='og:image']").attr("content");
  if (image === undefined) {
    image = $("meta[property='og:image']").attr("content");
  }
  if (image === undefined) {
    image = $("meta[name='twitter:image']").attr("content");
  }
  if (image === undefined) {
    image = $("link[rel='apple-touch-icon']").attr("href");
  }
  return image;
}

function fullUrl(url: string | undefined | null, urlObj: URL) {
  if (!url) return null;
  if (url.startsWith("//")) {
    return urlObj.protocol + url;
  }
  return url.startsWith("http") ? url : urlObj.origin + url;
}
