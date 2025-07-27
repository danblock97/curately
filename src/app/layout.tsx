import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/cookie-banner";
import {
	WebApplicationStructuredData,
	OrganizationStructuredData,
	WebSiteStructuredData,
} from "@/components/structured-data";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "Curately - Your Professional Link-in-Bio Tool",
		template: "%s | Curately",
	},
	description:
		"Create stunning, personalized link-in-bio pages with Curately. Boost your online presence with custom QR codes, deep links, and professional analytics. Perfect for creators, businesses, and influencers.",
	keywords: [
		"link in bio",
		"bio link",
		"link tree",
		"social media links",
		"QR codes",
		"deep links",
		"creator tools",
		"influencer tools",
		"business links",
	],
	authors: [{ name: "Curately Team" }],
	creator: "Curately",
	publisher: "Curately",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_GB",
		url: "https://curately.co.uk",
		siteName: "Curately",
		title: "Curately - Your Professional Link-in-Bio Tool",
		description:
			"Create stunning, personalized link-in-bio pages with Curately. Boost your online presence with custom QR codes, deep links, and professional analytics.",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Curately - Professional Link-in-Bio Tool",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Curately - Your Professional Link-in-Bio Tool",
		description:
			"Create stunning, personalized link-in-bio pages with Curately. Boost your online presence with custom QR codes, deep links, and professional analytics.",
		images: ["/og-image.png"],
		creator: "@curately",
		site: "@curately",
	},
	icons: {
		icon: [
			{ url: "/logo-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/logo-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/logo-180x180.png", sizes: "180x180", type: "image/png" }],
		other: [
			{
				rel: "apple-touch-icon-precomposed",
				url: "/logo-180x180.png",
			},
		],
	},
	manifest: "/manifest.json",
	category: "technology",
	classification: "Business Tools",
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1,
	},
	verification: {
		google: "your-google-site-verification-code",
	},
	alternates: {
		canonical: "https://curately.co.uk",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
					<>
						<script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}></script>
						<script
							dangerouslySetInnerHTML={{
								__html: `
									window.dataLayer = window.dataLayer || [];
									function gtag(){dataLayer.push(arguments);}
									gtag('js', new Date());
									gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
								`,
							}}
						/>
					</>
				)}
				<WebApplicationStructuredData />
				<OrganizationStructuredData />
				<WebSiteStructuredData />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<CookieBanner />
				<Toaster richColors />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
