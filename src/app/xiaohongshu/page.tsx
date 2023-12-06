
import { title } from "@/components/primitives";
import InputBox from "./input";
import { Image } from "@nextui-org/react";

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

async function getXhsImage(url: string) {
	const res = await fetch(url, {
		cache: "no-store"
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
	// console.log(contentStr)
	if (!contentStr) {
		return [];
	}
	// contentStr = contentStr.substring(contentStr.length / 3);
	// const regex = /(?<="imageList":)\[.*}]}]/;
	// const images = contentStr?.match(regex);
	const images = getJsonValue(contentStr, "imageList");
	if (images == null) {
		console.log(contentStr)
		return [];
	}
	const content = JSON.parse(images);
	// console.log(content);
	// console.log(content.map((el: any) => el.infoList[1].url));
	return content.map((el: any) => el.infoList[1].url);
}

export default async function Page({ searchParams }: {
	searchParams: {url: string | undefined}
}) {

	const url = searchParams.url ?? "";
	console.log("xiaohongshu:", url);
	const images = url ? await getXhsImage(url) : [];

	return (
		<div>
			<h1 className={title()}>小红书</h1>

			<div className="mt-5">
				<InputBox url={url} />
			</div>
			<div className="mt-10 flex flex-wrap gap-unit-2">
				{ images.map((url: string) => (
					<Image
						width={300}
						alt="NextUI hero Image"
						src={url}
						key={url}
					/>
				)) }
			</div>
		</div>
	);
}
