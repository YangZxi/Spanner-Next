import { NextResponse } from 'next/server';
import {NextResponseBody} from "@/types";

export function ok(data: any = null, {msg = "ok", code = 1} = {}): NextResponseBody {
  return NextResponse.json({ code, message: msg, data });
}

export function fail(msg: string): NextResponseBody {
  return NextResponse.json({ code: -1, message: msg, data: null });
}

const d = {
  ok, fail
}

export default d;