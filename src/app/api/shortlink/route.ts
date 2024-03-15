import {NextRequest, NextResponse} from "next/server";
import Response, {getSearchParams} from "@/util/Response";

const handlers: {
  [key: string]: (request: NextRequest) => Promise<NextResponse<any>>;
} = {
  index: index,
}

const urlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[\w-]+(?:\/\S*)?$/;

export async function GET(request: NextRequest, { params }: { params: { handler: string } }) {
  // const { handler } = params;
  return handlers["index"]?.(request) ?? NextResponse.json("Not Found", { status: 404 });
}

async function index(request: NextRequest) {
  const { url } = getSearchParams(request);
  if (!url) return Response.fail("Need a url", 400);
  if (!urlRegex.test(url)) return Response.fail("Invalid url", 400);

  return Response.ok(generateShortCode(url, 5));
}

function generateShortCode(url: string, length: number): string {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let hash = 0;

  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }

  const hashCode = Math.abs(hash).toString();
  let shortCode = '';

  // Generate short code from hash
  for (let i = 0; i < length; i++) {
    const index = parseInt(hashCode.charAt(i), 10) % characters.length;
    shortCode += characters[index];
  }

  return shortCode;
}
