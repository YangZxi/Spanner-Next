import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  defaultSize?: number;
  className?: string;
};

export function ResponsiveText({ text, defaultSize = 14, className = "", ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const adjustFontSize = () => {
      const dom = ref.current;
      if (!dom) return;

      let minSize = 1, maxSize = 100, newSize;
      while (minSize <= maxSize) {
        newSize = Math.floor((minSize + maxSize) / 2);
        dom.style.fontSize = `${newSize}px`;

        if (dom.scrollWidth > dom.clientWidth) {
          maxSize = newSize - 1;
        } else {
          minSize = newSize + 1;
        }
      }

      // 如果计算出的最大字体大小小于默认字体大小，则使用默认字体大小
      dom.style.fontSize = maxSize > defaultSize ? `${defaultSize}px` : `${maxSize}px`;
    };

    adjustFontSize();
  }, [text, contentWidth, defaultSize]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContentWidth(entry.contentRect.width);
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} whitespace-nowrap overflow-hidden`}
      {...props}
    >
      {text}
    </div>
  );
}
