'use client';

import { useRouter } from 'next/navigation';
import LinkInput from "@/components/LinkInput";

const regex = /https?:\/\/[\w\\.-]+(?:\.[\w\\.-]+)+[\w\\.-_~:/?#[\]@!$&'()*+,;=]+/;

export default function Page({ url }: {
  url: string | undefined
}) {
  const router = useRouter();

  return <LinkInput url={url ?? ""} plachholder={"请输入链接，或含有小红书链接的口令"} onClick={(val) => {
    // 提取口令中的链接
    const re = regex.exec(val);
    if (re == null) return;
    const url = re[0];
    router.push('/xiaohongshu?url=' + url);
  }} />;
}
