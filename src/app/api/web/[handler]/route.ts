import {NextRequest, NextResponse} from "next/server";
import Response, {getSearchParams} from "@/util/Response";
import { getInfo } from "./handler";

const handlers: {
  [key: string]: (request: NextRequest) => Promise<NextResponse<any>>;
} = {
  info: async (request: NextRequest) => {
    const { url } = getSearchParams(request);
    if (!url) return Response.fail("Need a parameter named shortlink");
    const data = await getInfo(url);
    return Response.ok(data);
  },
}

export async function GET(request: NextRequest, { params }: { params: { handler: string } }) {
  const { handler } = params;
  return handlers[handler]?.(request) ?? NextResponse.json("Not Found", { status: 404 });
}
