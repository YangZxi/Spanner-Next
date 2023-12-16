"use client";

import {Image, Listbox as _Listbox, ListboxItem, ScrollShadow, Chip} from "@nextui-org/react";
import type {Platform, Song} from "@/app/api/music/type";
import type {MusicAndPlatform} from "./page"
import React, {useState, useEffect} from "react";
import {NeteaseIcon, QQMusicIcon} from "./Icon";
import styled from "styled-components";

type Props = {
  maxHeight?: number;
  songList?: Song[];
  playingMid?: string;
  onRotateMusic?: (type: "id", platform: MusicAndPlatform) => void;
}

const PLATFORM_LABEL: {
  [key in Platform]: string;
} = {
  qq: "QQ音乐",
  netease: "网易云"
}

const PLATFORM_ICON: Record<Platform, React.ReactNode> = {
  qq: <QQMusicIcon />,
  netease: <NeteaseIcon />,
}

const Listbox = styled(_Listbox)<{ $maxHeight?: number }>`
  ul[data-slot="list"] {
    max-height: ${props => props.$maxHeight ? props.$maxHeight + "px" : "none"};
  }
`;

export default function SongList({maxHeight, songList: _sonList = [], playingMid, onRotateMusic}: Props) {
  // console.log(songList)
  const [songList, setSongList] = useState<Song[]>(_sonList);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [filterPlatform, setFilterPlatform] = useState<Set<Platform>>(new Set());
  // console.log(songList)
  useEffect(() => {
    setSongList(_sonList);
    setFilterPlatform(new Set());
    if (!_sonList) return;
    const arr = _sonList.map(el => el.platform);
    const newPlatforms: Platform[] = [];
    new Set(arr).forEach(el => {
      newPlatforms.push(el);
    });
    setPlatforms(newPlatforms);
    // setFilterPlatform(new Set(newPlatforms));
  }, [_sonList]);

  const topContent = React.useMemo(() => {
    if (platforms.length <= 1) {
      return null;
    }
    setSongList(() => {
      return filterPlatform.size === 0 ? _sonList : _sonList.filter(el => filterPlatform.has(el.platform));
    });
    return (
      <ScrollShadow
        hideScrollBar
        className="w-full flex py-0.5 px-2 gap-1"
        orientation="horizontal"
      >
        {platforms.map((value) => (
          <Chip
            key={value}
            variant={filterPlatform.has(value) ? "flat" : "bordered"}
            startContent={PLATFORM_ICON[value]}
            className="cursor-pointer select-none border-medium border-success-100 dark:border-success-50"
            size="sm"
            color="success"
            onClick={() => {
              setFilterPlatform((prevState) => {
                const newState = new Set(prevState);
                if (newState.has(value)) {
                  newState.delete(value);
                } else {
                  newState.add(value);
                }
                console.log(value, newState)
                return newState;
              })
            }}
          >{PLATFORM_LABEL[value]}</Chip>
        ))}
      </ScrollShadow>
    );
  }, [platforms, _sonList, filterPlatform]);

  return <>
    <Listbox
      topContent={topContent}
      classNames={{
        list: 'overflow-y-auto',
      }}
      $maxHeight={maxHeight}
      aria-label="Sons list"
      variant="flat"
    >
      {songList?.length ? (songList.map((item) => (
        <ListboxItem
          key={item.mid}
          textValue={item.title}
          href={onRotateMusic ? undefined : `/music/${item.mid}?platform=${item.platform}`}
          className={`${playingMid === item.mid ? "bg-default-100 dark:bg-default-100" : ""}`}
          onClick={() => {
            if (onRotateMusic) {
              console.log(item.mid)
              onRotateMusic("id", {
                id: item.mid,
                platform: item.platform
              });
            }
          }}
        >
          <div className="flex gap-2 items-center relative">
            <Image
              radius="sm"
              fallbackSrc="/404.png"
              src={item.imageUrl}
              alt={item.album.title}
              classNames={{
                img: "w-[48px] h-[48px] min-w-[48px]",
                wrapper: "bg-contain"
              }}
            />
            <div className="flex flex-col flex-grow overflow-hidden">
              <span className="text-small">{item.title}</span>
              <span className="text-tiny text-default-400">{item.singer.map(el => el.name).join(" & ")}{item.album.title && ` - ${item.album.title}`}</span>
            </div>
            <div className="absolute top-0 right-0 text-xs">
              {PLATFORM_LABEL[item.platform]}
            </div>
          </div>
        </ListboxItem>
      ))) : (<ListboxItem key="none">暂无歌曲</ListboxItem>)}
    </Listbox>
  </>
}