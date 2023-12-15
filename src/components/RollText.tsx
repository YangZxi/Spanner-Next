import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "./RollText.css";

const Container = styled.div<{ size: number, $hiddenWidth: number }>`
  --hidden-width: ${props => -(props.$hiddenWidth + 10)}px;
  font-size: ${props => props.size}px;
  > div {
    animation: ${props => props.$hiddenWidth > 0 ? "text-roll" : "none"} ${props => Math.max((props.$hiddenWidth + 10) / 10, 2)}s linear 2s infinite alternate;
  }
`;

type Props = {
  size?: number;
  className?: string;
  children: React.ReactNode;
};

export default function RollText({ size = 14, className = "", children, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hiddenWidth, setHiddenWidth] = useState(0);

  useEffect(() => {
    const dom = ref.current;
    if (!dom) return;

    const updateWidth = () => {
      setHiddenWidth(dom.clientWidth - (dom.parentElement?.clientWidth ?? dom.clientWidth));
    }

    // 初始化宽度
    updateWidth();

    // 创建ResizeObserver来监视尺寸变化
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(dom);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <Container
      size={size}
      $hiddenWidth={hiddenWidth}
      className={`${className} roll-text`}
      {...props}
    >
      <div
        ref={ref}
      >{children}</div>
    </Container>
  );
}
