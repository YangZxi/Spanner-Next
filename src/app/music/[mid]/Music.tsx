'use client';

import {useState, useRef, useEffect, ReactElement} from "react";
import {Button, Card, CardBody, Image, Slider} from "@nextui-org/react";
import {
  HeartIcon,
  NextIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  PreviousIcon,
  RepeatOneIcon,
  ShuffleIcon, ListIcon
} from "./Icon";
import {MusicInfo} from "@/app/api/music/type";
import {ResponsiveText} from "@/components/ResponsiveText";
import RollText from "@/components/RollText";
import type {MusicAndPlatform} from "./page"

type Props = {
  info: MusicInfo;
  onRotateMusic: (type: "prev" | "next" | "random", platform?: MusicAndPlatform) => void;
}

type PlayMode = "list" | "single" | "random";

const playModeIcon: {
  [key in PlayMode]: ReactElement
} = {
  list: <ListIcon />,
  single: <RepeatOneIcon />,
  random: <ShuffleIcon />
}

export default function Music({ info, onRotateMusic }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [liked, setLiked] = useState(false);
  const [paused, setPaused] = useState<boolean>(true);

  const [currentLyric, setCurrentLyric] = useState<string>(() => {
    console.log(info)
    if (info.lyric.length > 0) {
      return info.lyric[0].text;
    }
    return "当前歌曲暂无歌词提供";
  });
  const [dragging, setDragging] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playingMode, setPlayingMode] = useState<PlayMode>("list");
  const [loop, setLoop] = useState<boolean>(false);

  useEffect(() => {
    const mode = localStorage.getItem("playingMode") as PlayMode;
    setPlayingMode(mode ? mode : "list");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    audio?.play().then(() => {
      setPaused(false);
    }).catch(() => {
      setPaused(true);
    });
    if (isNaN(audio?.duration)) {
      setDuration(info.duration);
    } else {
      setDuration(audio?.duration);
    }
  }, [info]);

  const calcTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  const displayLyrics = (_curTime: number) => {
    const lyricsArray = info.lyric;
    if (lyricsArray?.length === 0) {
      setCurrentLyric("当前歌曲暂无歌词提供");
      return;
    }
    const curTime = _curTime + 0.5;
    for (let i = 0; i < lyricsArray.length; i++) {
      const lyric = lyricsArray[i];
      if (lyric.time <= curTime && (i === lyricsArray.length - 1 || lyricsArray[i + 1].time > curTime)) {
        // 高亮显示当前歌词
        setCurrentLyric(lyric.text);
        break;
      }
    }
  }

  const changePlayingMode = () => {
    const modeList = Object.keys(playModeIcon) as PlayMode[];
    const index = modeList.indexOf(playingMode);
    const nextIndex = (index + 1) % modeList.length;
    const mode = modeList[nextIndex];
    setPlayingMode(mode);
    if (mode === "single") {
      setLoop(true);
    } else {
      setLoop(false);
    }
    localStorage.setItem("playingMode", mode);
  }

  return (
    <Card
      isBlurred
      className="border-none bg-background/60 dark:bg-default-100/50 w-full"
      shadow="sm"
    >
      <div className="hidden">
        <audio
          ref={audioRef}
          loop={loop}
          onTimeUpdate={(event) => {
            const time = (event.target as HTMLAudioElement).currentTime
            displayLyrics(time);
            if (dragging) return;
            setCurrentTime(time);
          }}
          onLoadedData={() => {
            setCurrentLyric(info.title + " - " + info.singer.map(el => el.name).join(" & "));
          }}
          onEnded={() => {
            console.log(currentTime, duration)
            onRotateMusic("next");
          }}
          onError={(err) => {
            console.log(err)
            setCurrentLyric("歌曲加载出错");
          }}
        >
          <source src={info.musicUrl} type="audio/mp3" />
        </audio>
      </div>
      <CardBody>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-6 sm:gap-4 items-center justify-center">
          <div className="relative col-span-6 hidden sm:col-span-4 sm:block">
            <Image
              // https://y.qq.com/music/photo_new/T002R300x300M0000049MVh824D7bM.jpg?max_age=2592000
              src={info.imageUrl}
              height={200}
              width={200}
              fallbackSrc="/404.png"
              alt="Album cover"
              classNames={{
                img: "w-full object-cover",
                wrapper: "bg-contain"
              }}
              shadow="sm"
            />
          </div>

          <div className="flex flex-col col-span-6 sm:col-span-8">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-12 gap-1">
                <div className="col-span-4 block sm:hidden">
                  <Image
                    // https://y.qq.com/music/photo_new/T002R300x300M0000049MVh824D7bM.jpg?max_age=2592000
                    src={info.imageUrl}
                    height={200}
                    width={200}
                    removeWrapper
                    fallbackSrc="/404.png"
                    alt="Album cover"
                    className="w-full object-cover"
                    shadow="sm"
                  />
                </div>
                <div className="flex flex-col gap-0 col-span-8 sm:col-span-12">
                  <RollText className="font-semibold text-foreground/90">{info.title}
                    {(info.subtitle && <span className="text-small"> - {info.subtitle}</span>)}
                  </RollText>
                  <p className="text-small text-foreground/80">{(info.singer ?? []).map(el => el.name).join(" & ")}</p>
                  <ResponsiveText className="text-large font-medium mt-2 h-[28px]" text={currentLyric} defaultSize={18} />
                </div>
              </div>
              <Button
                isIconOnly
                className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-1 translate-x-1"
                radius="full"
                variant="light"
                size="sm"
                onPress={() => setLiked((v) => !v)}
              >
                <HeartIcon
                  className={liked ? "[&>path]:stroke-transparent" : ""}
                  fill={liked ? "currentColor" : "none"}
                />
              </Button>
            </div>

            <div className="flex flex-col mt-3 gap-1">
              <Slider
                value={currentTime}
                maxValue={duration}
                step={1}
                aria-label="Music progress"
                classNames={{
                  track: "bg-default-500/30",
                }}
                color="foreground"
                size="sm"
                onChange={(value) => {
                  if (isNaN(Number(value))) return;
                  setDragging(true);
                  setCurrentTime(Number(value));
                }}
                onChangeEnd={() => {
                  setDragging(false);
                  if (audioRef.current) {
                    audioRef.current.currentTime = currentTime;
                    audioRef.current.play();
                    setPaused(false);
                  }
                }}
              />
              <div className="flex justify-between">
                <p className="text-small">{calcTime(currentTime)}</p>
                <p className="text-small text-foreground/50">{calcTime(duration)}</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-center">
              <Button
                isIconOnly
                className="invisible"
                radius="full"
                variant="light"
              />
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onClick={() => onRotateMusic(playingMode === "random" ? "random" : "prev")}
              >
                <PreviousIcon />
              </Button>
              <Button
                isIconOnly
                className="w-auto h-auto data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onClick={() => {
                  if (paused) {
                    audioRef.current?.play();
                  } else {
                    audioRef.current?.pause();
                  }
                  setPaused((v) => !v);
                }}
              >
                {paused ? <PlayCircleIcon size={54} /> : <PauseCircleIcon size={54} />}
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onClick={() => onRotateMusic(playingMode === "random" ? "random" : "next")}
              >
                <NextIcon />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onClick={changePlayingMode}
              >
                {playModeIcon[playingMode]}
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}