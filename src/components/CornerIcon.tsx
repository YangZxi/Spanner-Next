import { useEffect, useRef } from "react";
import styled from "styled-components"; // 导入样式文件，用于设置三角形旗帜的样式

type Props = {
  children: React.ReactNode;
};

const Flag = styled("div")`
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 50px;
  z-index: 1;
  transform: translateX(50%) translateY(-50%) rotate(45deg);
  
  .flag-content {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    transform: rotate(-45deg);
    
    > div {
      display: flex;
      justify-content: center;
    }
  }
`;

export default function CornerIcon({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const classList = ref.current.parentElement?.classList;
      if (!classList) return;
      // console.log(ref.current.parentElement);
      classList.add("relative");
      classList.add("overflow-hidden");
      classList.add("w-full");
    }
  }, []);

  return (
    <Flag ref={ref} className="absolute top-0 right-0 z-[1] ">
      <div className="z-[1] flag-content"><div>{children}</div></div>
    </Flag>
  );
}
