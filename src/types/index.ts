import {SVGProps} from "react";
import {NextResponse} from "next/server";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type ResponseBody<D> = {
  code: number;
  message: string;
  data: D;
};

export type NextResponseBody = NextResponse<ResponseBody<any>>;