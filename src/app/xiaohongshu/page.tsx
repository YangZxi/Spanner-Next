
import {subtitle, title} from "@/components/primitives";
import InputBox from "./input";
import { Image, Card } from "@nextui-org/react";

const table: {
	[key: string]: string
} = {
	"\"": "\"",
	"[": "]",
	"{": "}"
}

function getJsonValue(str: string, key: string) {
	if (!str || !key) return "";
	const keyName = `"${key}":`;
	const index = str.indexOf(keyName);
	str = str.substring(index + keyName.length).trim();
	const stack: string[] = [];
	let value = "";
	for (let i = 0; i < str.length; i++) {
		const char = str.charAt(i);
		switch (char) {
			case "[":
			case "{":
				stack.push(char);
				break;
			case "]":
			case "}":
			case "\"":
				if (stack.length === 0) {
					if (char !== "\"") return "";
					stack.push(char);
				} else if (table[stack[stack.length - 1]] === char) {
					stack.pop();
				}
				break;
		}
		value += char;
		if (stack.length === 0) {
			return value;
		}
	}
	console.log(value)
	return value;
}

const markText = "window.__INITIAL_STATE__=";
const realImageUrl = "http://sns-img-hw.xhscdn.net/{}?imageView2/2/w/1280/format/jpeg/q/90";

async function getXhsImage(url: string) {
	const res = await fetch(url, {
		cache: "no-store",
		headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
		}
	}).then(res => {
		if (!res.ok) {
			Promise.reject();
		}
		return res.text();
	}).catch(err => {
		return "";
	});
	// console.log(res)
	if (!res) return [];

	let contentStr = res.substring(res.lastIndexOf(markText));
	// console.log("contentStr", contentStr)
	if (!contentStr) {
		return [];
	}
	// contentStr = contentStr.substring(contentStr.length / 3);
	// const regex = /(?<="imageList":)\[.*}]}]/;
	// const images = contentStr?.match(regex);
	const images = getJsonValue(contentStr, "imageList");
	if (images == null) {
		console.log("images is null", contentStr)
		return [];
	}
	try {
		const content = JSON.parse(images);
		console.log(content.map((el: any) => el.infoList[1].url));
		return content.map((el: any) => el.infoList[1].url);
	} catch (err) {
		console.log(contentStr, images);
	}
	return [];
}

export default async function Page({ searchParams }: {
	searchParams: {url: string | undefined}
}) {

	const url = searchParams.url ?? "";
	console.log("xiaohongshu:", url);
	const rawImages = url ? await getXhsImage(url) : [];
	const images = rawImages.map((imgUrl: string) => {
		// http://sns-webpic-qc.xhscdn.com/202312082340/f73e5f571b9de708ce9a65c3c8c20f4b/1040g2sg30sdnetobja0g4be7cb3bmulepuv7q3o!nd_whgt34_nwebp_wm_1
		const end = imgUrl.lastIndexOf("!");
		const start = imgUrl.substring(0, end).lastIndexOf("/");
		if (start === -1 || end === -1) return imgUrl;
		return realImageUrl.replace("{}", imgUrl.substring(start + 1, end));
	});

	return (
		<div>
			<h1 className={title()}>小红书<span className={subtitle()}> - 去水印图片解析</span></h1>

			<div className="mt-5">
				<InputBox url={url} />
			</div>
			<div className="mt-10 flex flex-wrap justify-center gap-unit-2">
				{ images.length == 0 && url && <div className="w-full text-center">😢小红书链接有误，或文章已被删除</div> }
				{ images.length > 0 && images.map((url: string, i: number) => (
					<Card
						className="border-none"
						key={url}
					>
						<Image
							width={300}
							radius="lg"
							className="object-cover"
							alt={`image-${i}`}
							src={"https://proxy.xiaosm.cn/" + url}
						/>
					</Card>
				)) }
			</div>
		</div>
	);
}
