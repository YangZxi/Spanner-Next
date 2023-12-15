"use client";

import {Image, Listbox, ListboxItem} from "@nextui-org/react";
import type {Song} from "@/app/api/music/type";

type Props = {
  songList?: Song[];
  playingMid?: string;
  onRotateMusic?: (mid: string) => void;
}

export default function SongList({songList = [], playingMid, onRotateMusic}: Props) {
  // console.log(songList)

  return <>
    <Listbox
      aria-label="Sons list"
      variant="flat"
    >
      {songList?.length ? (songList.map((item) => (
        <ListboxItem
          key={item.mid}
          textValue={item.title}
          href={onRotateMusic ? undefined : `/music/qq/${item.mid}`}
          className={`${playingMid === item.mid ? "bg-default-100 dark:bg-default-100" : ""}`}
          onClick={() => {
            if (onRotateMusic) {
              onRotateMusic(item.mid);
            }
          }}
        >
          <div className="flex gap-2 items-center">
            <Image
              radius="sm"
              fallbackSrc="/404.png"
              src={`https://y.qq.com/music/photo_new/T002R300x300M000${item.album.mid ?? ""}.jpg?max_age=2592000`}
              alt={item.album.title}
              classNames={{
                img: "w-[48px] h-[48px] min-w-[48px]",
                wrapper: "bg-contain"
              }}
            />
            <div className="flex flex-col flex-grow overflow-hidden">
              <span className="text-small">{item.title}</span>
              <span className="text-tiny text-default-400">{item.singer[0]} - {item.album.title}</span>
            </div>
          </div>
        </ListboxItem>
      ))) : (<ListboxItem key="none">暂无歌曲</ListboxItem>)}
    </Listbox>
  </>
}