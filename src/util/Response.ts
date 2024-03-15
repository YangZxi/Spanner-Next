import {NextRequest, NextResponse} from 'next/server';
import {NextResponseBody} from "@/types";

export function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const map: {
    [key: string]: string | undefined;
  } = {

  }
  searchParams.forEach((value, key) => {
    map[key] = value;
  });
  return map;
}

export function ok(data: any = null, {msg = "ok", code = 1} = {}): NextResponseBody {
  return NextResponse.json({ code, message: msg, data });
}

export function fail(msg: string, code = -1): NextResponseBody {
  return NextResponse.json({ code: code, message: msg, data: null });
}

const d = {
  ok, fail
}

export default d;
