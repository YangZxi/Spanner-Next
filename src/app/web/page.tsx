import {title} from "@/components/primitives";
import {getInfo} from "@/app/api/web/[handler]/handler";
import InputBox from "./input";
import {Image, Card, CardHeader, CardBody, CardFooter, Divider, Link} from "@nextui-org/react";

export default async function Page({searchParams}: {
  searchParams: { url: string | undefined }
}) {

  const url = searchParams.url ?? "";
  const data = await getInfo(url);

  return (
    <div>
      <h1 className={title()}>获取网站 OG 信息</h1>

      <div className="mt-5">
        <InputBox url={url}/>
      </div>
      {data == null ? url == "" ? null : <div>获取信息失败</div> : (
        <div className="mt-10 flex flex-wrap justify-center gap-unit-2">
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Image
                classNames={{
                  wrapper: "bg-cover",
                }}
                alt="og image"
                height={80}
                radius="sm"
                src={data.image ?? ""}
                fallbackSrc={"https://proxy.xiaosm.cn/" + data?.image}
                width={80}
              />
              <div className="flex flex-col">
                <p className="text-md">{data.title}</p>
                <p className="text-small text-default-500">{data.origin}</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody>
              <p>{data.description}</p>
            </CardBody>
            <Divider/>
            <CardFooter>
              <Link
                isExternal
                showAnchorIcon
                href={url}
              >
                网站链接
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
