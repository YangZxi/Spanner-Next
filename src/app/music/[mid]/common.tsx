import {Platform} from "@/app/api/music/type";
import React from "react";
import {NeteaseIcon, QQMusicIcon} from "./Icon";

export const PLATFORM_ICON: Record<Platform, React.ReactNode> = {
  qq: <QQMusicIcon />,
  netease: <NeteaseIcon />,
}