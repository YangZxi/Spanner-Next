// 正则表达式用于匹配时间戳和歌词文本
const regex = /\[([\d:.]*)](.*)/;

export function parseLyrics(lyricsText: string) {
  // console.log(lyricsText,11)
  const lyricsArray = [];

  // 分割歌词文本为行
  const lines = lyricsText.replaceAll("\r", "\n").split("\n");
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