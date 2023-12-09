import "@/styles/globals.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import { Link } from "@nextui-org/react";
import clsx from "clsx";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	// themeColor: [
	// 	{ media: "(prefers-color-scheme: light)", color: "white" },
	// 	{ media: "(prefers-color-scheme: dark)", color: "black" },
	// ],
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={clsx(
					"min-h-screen bg-background font-sans antialiased",
					fontSans.variable
				)}
			>
				<Providers themeProps={{ attribute: "class", defaultTheme: "system" }}>
					<div className="relative flex flex-col h-screen">
						<Navbar />
						<main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
							{children}
						</main>
						<footer className="w-full text-center py-3">
							<div className="text-default-600 text-[14px]">
								<span>Copyright © 2023 </span>
								<Link
									isExternal
									className="text-[14px] hover:underline"
									href="//www.xiaosm.cn"
									title="www.xiaosm.cn"
								>
									WWW.XIAOSM.CN
								</Link>
							</div>
						</footer>
					</div>
				</Providers>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
