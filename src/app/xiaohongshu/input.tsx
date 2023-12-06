'use client';

import { useState } from "react";
import {Button, Input} from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export default function Page({ url: _url }: {url: string}) {
  const [url, setUrl] = useState(_url)
  const router = useRouter();

  return <>
    <div>
      <Input
        value={url} type="url" variant="underlined" label="链接"
        onValueChange={(val) => {
        	console.log(val)
          setUrl(val);
        }}
      />
    </div>
    <div className="text-right mt-2">
      <Button
        onClick={() => {
        	if (!url) return;
          router.push('/xiaohongshu?url=' + url);
        }}
        radius="none"
        spinner={
          <svg
            className="animate-spin h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        }
      >
        提交
      </Button>
    </div>
  </>
}