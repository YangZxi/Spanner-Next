<div align="center">
<h1>Spanner-Next</h1>

一个无需自建服务器的工具集合，[预览地址](https://tools.xiaosm.cn)  
在线版QQ音乐播放器，小红书去水印

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYangZxi%2FSpanner-Next&env=QQ_MUSIC_COOKIE&project-name=spanner-next&repository-name=Spanner-Next)
</div>



## 技术选型 / Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [NextUI v2](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### 环境变量 / Environment Variables
在项目根目录创建 `.env.local` 文件，添加以下内容：  

#### QQ音乐（可选）
用于获取 VIP 歌曲的播放地址
```ini
QQ_MUSIC_COOKIE=你的QQ音乐cookie
```

## License

Licensed under the [MIT license](https://github.com/nextui-org/next-app-template/blob/main/LICENSE).