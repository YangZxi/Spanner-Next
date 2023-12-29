"use client";

import {useState} from "react";
import {Input, InputProps} from "@nextui-org/react";
import {Loading, SearchIcon} from "./Icon"

type Props = {
  className?: string;
  onSearch: (value: string) => Promise<void>;
} & InputProps;

// 尝试收起虚拟键盘
function hideKeyboard() {
  // document.activeElement?.blur(); // 将焦点从当前活动元素中移开
  const inputField = document.createElement('input');
  document.body.appendChild(inputField);
  inputField.focus();
  inputField.blur();
  document.body.removeChild(inputField);
}

export default function Search({defaultValue, onSearch, ...props}: Props) {
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const [loading, setLoading] = useState<boolean>(false);

  const searchHandler = () => {
    let val = value.trim();
    if (!val) return false;
    console.log(val);
    setLoading(true);
    onSearch(val).finally(() => {
      setValue("");
      setLoading(false);
    });
    hideKeyboard();
    return true;
  }

  return <form className={`w-full ${props.className ?? ""}`} action={() => {
      return searchHandler();
    }}>
    <Input
      value={value}
      {...props}
      readOnly={loading}
      size="sm"
      type="search"
      labelPlacement="outside"
      placeholder="歌曲名 / 歌手 / 歌单链接"
      startContent={
        loading ?
          <Loading className="text-2xl text-default-400 pointer-events-none flex-shrink-0" size="1.3rem" />
          : <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
      }
      onValueChange={setValue}
      onKeyUp={(event) => {
        if (event.key === "Enter") {
          searchHandler();
        }
      }}
    />
  </form>
}