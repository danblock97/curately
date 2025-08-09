"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/lib/supabase/types";
import { SocialIcons } from "./social-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	ExternalLink,
	QrCode,
	Type,
	Image as ImageIcon,
	Mic,
	Package,
	Smartphone,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getPlatformLogoUrl, getOptimalLogoSize } from "@/lib/qr-code";
import { BrandedQRCode } from "@/components/ui/branded-qr-code";
import { TwitchEmbed } from "@/components/ui/twitch-embed";
import { YouTubeLiveEmbed } from "@/components/ui/youtube-live-embed";
import { KickEmbed } from "@/components/ui/kick-embed";

// Platform definitions matching widget-modal exactly
const platforms = [
  { name: 'Instagram', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', value: 'instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500' },
  { name: 'Facebook', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg', value: 'facebook', color: 'bg-blue-600' },
  { name: 'TikTok', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', value: 'tiktok', color: 'bg-black' },
  { name: 'LinkedIn', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', value: 'linkedin', color: 'bg-blue-700' },
  { name: 'YouTube', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', value: 'youtube', color: 'bg-red-500' },
  { name: 'X (Twitter)', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg', value: 'twitter', color: 'bg-black' },
  { name: 'GitHub', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', value: 'github', color: 'bg-gray-800' },
  { name: 'Spotify', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', value: 'spotify', color: 'bg-green-500' },
  { name: 'Twitch', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitch.svg', value: 'twitch', color: 'bg-purple-600' },
  { name: 'Kick', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kick.svg', value: 'kick', color: 'bg-green-600' },
  { name: 'Threads', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/threads.svg', value: 'threads', color: 'bg-black' },
  { name: 'Snapchat', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/snapchat.svg', value: 'snapchat', color: 'bg-yellow-400' },
  { name: 'Discord', logoUrl: '/platform-logos/discord.webp', value: 'discord', color: 'bg-indigo-600' },
  { name: 'Website', logoUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googlechrome.svg', value: 'website', color: 'bg-blue-500' },
];

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Page = Database["public"]["Tables"]["pages"]["Row"];
type Link = Database["public"]["Tables"]["links"]["Row"] & {
	qr_codes?: {
		qr_code_data: string;
		format: string;
		size: number;
		foreground_color: string;
		background_color: string;
	} | null;
};
type SocialLink = Database["public"]["Tables"]["social_media_links"]["Row"];

interface ProfilePageProps {
	page: Page;
	profile: Profile;
	links: Link[];
	socialLinks: SocialLink[];
}

export interface Widget {
	id: string;
	type:
		| "social"
		| "link"
		| "qr_code"
		| "image"
		| "text"
		| "voice"
		| "product"
		| "app"
		| "media";
	size:
		| "thin"
		| "small-circle"
		| "small-square"
		| "medium-square"
		| "large-square"
		| "wide"
		| "tall"
		| "extra-large";
	data: {
		platform?: string;
		username?: string;
		display_name?: string;
		url?: string;
		title?: string;
		type?: string;
		description?: string;
		favicon?: string;
		isPopularApp?: boolean;
		appName?: string;
		appLogo?: string;
		profile_image_url?: string;
		content?: string;
		caption?: string;
		file?: File;
		price?: string;
		appStoreUrl?: string;
		playStoreUrl?: string;
		fileUrl?: string;
		customLogoUrl?: string;
		logo_url?: string;
	};
	position: { x: number; y: number };
	webPosition: { x: number; y: number };
	mobilePosition: { x: number; y: number };
}

export function ProfilePage({ page, profile, links, socialLinks }: ProfilePageProps) {
	const supabase = createClient();
	const [widgets, setWidgets] = useState<Widget[]>([]);
	const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);
	const [isHydrated, setIsHydrated] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
		
		// Mobile detection - only on client side to prevent hydration mismatch
		const checkMobile = () => {
			if (typeof window !== 'undefined') {
				setIsMobile(window.innerWidth <= 768);
			}
		};
		
		checkMobile();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', checkMobile);
			return () => window.removeEventListener('resize', checkMobile);
		}
	}, []);

	// Memoize links to prevent unnecessary re-renders
	const memoizedLinks = useMemo(
		() => links,
		[links?.length, links?.map((l) => l.id).join(",")]
	);

	// Convert links to widgets exactly like the appearance editor
	useEffect(() => {
		const loadWidgets = async () => {
			try {
				setIsLoadingWidgets(true);


				if (memoizedLinks && memoizedLinks.length > 0) {
					// Convert links to widgets with proper positioning and fetch metadata
					const linkWidgets: Widget[] = await Promise.all(
						memoizedLinks.map(async (link, index) => {
							let metadata = {
								description: "",
								favicon: "",
								isPopularApp: false,
								appName: "",
								appLogo: "",
							};

							try {
								// Only fetch metadata if URL exists and is valid
								if (link.url && typeof link.url === "string") {
									const metadataResponse = await fetch(
										`/api/metadata?url=${encodeURIComponent(link.url)}`
									);
                                    if (metadataResponse.ok) {
                                        metadata = await metadataResponse.json();
                                        if (
                                            (link.url?.includes('discord.com') || link.url?.includes('discord.gg'))
                                        ) {
                                            console.log('[profile-page] Discord metadata', metadata);
                                        }
                                    }
								}
							} catch (error) {
								console.error(
									"Failed to fetch metadata for link:",
									link.url,
									error
								);
							}

							// Extract platform and username from URL to fetch display name
							let platform = "";
							let username = "";
							let displayName = "";

							try {
								// Only process URL if it exists and is valid
								if (link.url && typeof link.url === "string") {
									const urlObj = new URL(link.url);
									const hostname = urlObj.hostname.toLowerCase();

									if (hostname.includes("github.com")) {
										platform = "github";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0];
										}
									} else if (
										hostname.includes("twitter.com") ||
										hostname.includes("x.com")
									) {
										platform = "twitter";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0];
										}
									} else if (hostname.includes("instagram.com")) {
										platform = "instagram";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0];
										}
									} else if (hostname.includes("tiktok.com")) {
										platform = "tiktok";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0].replace("@", "");
										}
									} else if (hostname.includes("linkedin.com")) {
										platform = "linkedin";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 1 && pathSegments[0] === "in") {
											username = pathSegments[1];
										}
									} else if (hostname.includes("youtube.com")) {
										platform = "youtube";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0].replace("@", "");
										}
                  } else if (hostname.includes("facebook.com")) {
										platform = "facebook";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0];
										}
                  } else if (hostname.includes("spotify.com")) {
										platform = "spotify";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 1 && pathSegments[0] === "user") {
											username = pathSegments[1]; // Extract just the user ID, ignore query params
										}
                  } else if (hostname.includes("discord.com") || hostname.includes("discord.gg")) {
                    platform = "discord";
                    const pathSegments = urlObj.pathname
                      .split("/")
                      .filter(Boolean);
                    if (pathSegments.length > 0) {
                      username = pathSegments[0];
                    }
									} else if (hostname.includes("music.apple.com")) {
										platform = "apple_music";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (
											pathSegments.length > 1 &&
											pathSegments[0] === "profile"
										) {
											username = pathSegments[1];
										}
									} else if (hostname.includes("soundcloud.com")) {
										platform = "soundcloud";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0];
										}
									} else if (hostname.includes("threads.net")) {
										platform = "threads";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 0) {
											username = pathSegments[0].replace("@", "");
										}
									} else if (hostname.includes("snapchat.com")) {
										platform = "snapchat";
										const pathSegments = urlObj.pathname
											.split("/")
											.filter(Boolean);
										if (pathSegments.length > 1 && pathSegments[0] === "add") {
											username = pathSegments[1];
										}
									}
								}

								// Fetch display name if we have platform and username
								if (platform && username) {
									try {
										const profileMetadata = await fetchProfileMetadata(
											platform,
											username
										);
										displayName = profileMetadata.displayName;
									} catch (error) {
										console.warn(
											"Failed to fetch display name for existing widget:",
											error
										);
									}
								}
							} catch (error) {
								console.warn(
									"Failed to extract platform info from URL:",
									link.url,
									error
								);
							}

							// Safe JSON parsing with fallback
							let widgetPosition = { x: 20, y: index * 80 + 20 };
							let webPosition = { x: 20, y: index * 80 + 20 };
							let mobilePosition = { x: 20, y: index * 80 + 20 };

							// Use default positions for widgets

							try {
								if (
									link.widget_position &&
									typeof link.widget_position === "string"
								) {
									widgetPosition = JSON.parse(link.widget_position);
								} else if (
									link.widget_position &&
									typeof link.widget_position === "object"
								) {
									widgetPosition = link.widget_position as { x: number; y: number };
								}
							} catch (error) {
								console.warn(
									"Failed to parse widget_position:",
									link.widget_position,
									error
								);
							}

							try {
								if (
									link.web_position &&
									typeof link.web_position === "string"
								) {
									webPosition = JSON.parse(link.web_position);
								} else if (
									link.web_position &&
									typeof link.web_position === "object"
								) {
									webPosition = link.web_position as { x: number; y: number };
								}
							} catch (error) {
								console.warn(
									"Failed to parse web_position:",
									link.web_position,
									error
								);
							}

							try {
								if (
									link.mobile_position &&
									typeof link.mobile_position === "string"
								) {
									mobilePosition = JSON.parse(link.mobile_position);
								} else if (
									link.mobile_position &&
									typeof link.mobile_position === "object"
								) {
									mobilePosition = link.mobile_position as { x: number; y: number };
								}
							} catch (error) {
								console.warn(
									"Failed to parse mobile_position:",
									link.mobile_position,
									error
								);
							}

							return {
								id: link.id,
								type: (link.widget_type || link.link_type || "link") as Widget['type'],
								size: (link.size || "thin") as Widget['size'],
                                data: {
									title: link.title || "",
									url: link.url || "",
									description: metadata.description || "",
									favicon: metadata.favicon || "",
									isPopularApp: metadata.isPopularApp || false,
									appName: metadata.appName || "",
									appLogo: metadata.appLogo || metadata.favicon || "",
									platform: link.platform || platform || undefined,
									username: link.username || username || undefined,
                                    display_name: link.display_name || displayName || metadata.displayName || "",
                                    profile_image_url: link.profile_image_url || metadata.profileImage || "",
									content: link.content || "",
									caption: link.caption || "",
									price: link.price || "",
									appStoreUrl: link.app_store_url || "",
									playStoreUrl: link.play_store_url || "",
									fileUrl: link.file_url || "",
									customLogoUrl: link.custom_logo_url || "",
									logo_url: link.logo_url || "",
									link_type: link.link_type || undefined,
									qr_codes: link.qr_codes || undefined,
								},
								position: widgetPosition,
								webPosition: webPosition,
								mobilePosition: mobilePosition,
							};
						})
					);

					setWidgets(linkWidgets);
				} else {
					// No links found, start with empty widgets
					setWidgets([]);
				}
			} catch (error) {
				console.error("Error loading widgets:", error);
			} finally {
				setIsLoadingWidgets(false);
			}
		};

		if (profile) {
			loadWidgets();
		} else {
			// If no profile, just finish loading
			setIsLoadingWidgets(false);
		}
	}, [profile, memoizedLinks]);


	const fetchProfilePicture = async (platform: string, username: string) => {
		try {
			// Generate profile picture URLs for different platforms
			const profileUrls: { [key: string]: string } = {
				github: `https://github.com/${username}.png`,
				twitter: `https://unavatar.io/twitter/${username}`,
				instagram: `https://unavatar.io/instagram/${username}`,
				linkedin: `https://unavatar.io/linkedin/${username}`,
				tiktok: `https://unavatar.io/tiktok/${username}`,
				youtube: `https://unavatar.io/youtube/${username}`,
				facebook: `https://unavatar.io/facebook/${username}`,
				spotify: `https://unavatar.io/spotify/${username}`,
				apple_music: `https://unavatar.io/apple-music/${username}`,
				soundcloud: `https://unavatar.io/soundcloud/${username}`,
				kick: `https://unavatar.io/kick/${username}`,
				twitch: `https://unavatar.io/twitch/${username}`,
				threads: `https://unavatar.io/threads/${username}`,
				snapchat: `https://unavatar.io/snapchat/${username}`,
			};

			const profileUrl = profileUrls[platform.toLowerCase()];
			if (!profileUrl) {
				console.warn(`No profile URL template for platform: ${platform}`);
				return "";
			}


			// For GitHub, we can reliably return the URL since GitHub always provides a profile picture
			if (platform.toLowerCase() === "github") {
				return profileUrl;
			}

			// For other platforms, try to load the image to verify it exists
			return new Promise<string>((resolve) => {
				const img = new Image();
				img.onload = () => {
					resolve(profileUrl);
				};
				img.onerror = () => {
					resolve("");
				};
				img.src = profileUrl;

				// Set timeout to avoid hanging
				setTimeout(() => {
					console.warn(`Profile picture timeout for ${platform}/${username}`);
					resolve("");
				}, 5000);
			});
		} catch (error) {
			console.warn("Failed to fetch profile picture:", error);
			return "";
		}
	};

	const fetchProfileMetadata = async (
		platform: string,
		username: string
	): Promise<{ profileImage: string; displayName: string }> => {
		try {
			const profileImage = await fetchProfilePicture(platform, username);
			let displayName = username;

			// Fetch display names from platform APIs where possible
			if (platform.toLowerCase() === "github") {
				try {
					const response = await fetch(
						`https://api.github.com/users/${username}`
					);
					if (response.ok) {
						const data = await response.json();
						displayName = data.name || data.login || username;
					}
				} catch (error) {
					console.warn("Failed to fetch GitHub display name:", error);
				}
			} else if (platform.toLowerCase() === "twitter") {
				// For Twitter/X, we can try to extract display name from metadata
				// Since we don't have direct API access, we'll use a heuristic approach
				try {
					const response = await fetch(
						`https://unavatar.io/twitter/${username}`
					);
					if (response.ok) {
						// If unavatar works, we have a valid user - use username as display name for now
						displayName = `@${username}`;
					} else {
						displayName = `@${username}`;
					}
				} catch (error) {
					console.warn("Failed to fetch Twitter display name:", error);
					displayName = `@${username}`;
				}
			} else if (platform.toLowerCase() === "instagram") {
				displayName = `@${username}`;
			} else if (platform.toLowerCase() === "tiktok") {
				displayName = `@${username}`;
			} else if (platform.toLowerCase() === "linkedin") {
				displayName = username;
			} else if (platform.toLowerCase() === "youtube") {
				displayName = `@${username}`;
			} else if (platform.toLowerCase() === "spotify") {
				// For Spotify, try to extract display name from metadata or clean username
				const cleanUsername = username.split("?")[0]; // Remove query parameters
				displayName = cleanUsername;
			} else if (platform.toLowerCase() === "apple_music") {
				displayName = username;
			} else if (platform.toLowerCase() === "soundcloud") {
				displayName = username;
			} else if (platform.toLowerCase() === "threads") {
				displayName = `@${username}`;
			} else if (platform.toLowerCase() === "snapchat") {
				displayName = username;
			} else if (platform.toLowerCase() === "podcast") {
				displayName = username;
			} else {
				displayName = username;
			}

			return { profileImage, displayName };
		} catch (error) {
			console.warn("Failed to fetch profile metadata:", error);
			return { profileImage: "", displayName: username };
		}
	};

	const handleLinkClick = async (linkId: string, url: string) => {
		// Track click
		await supabase
			.from("links")
			.update({
				clicks: (memoizedLinks.find((l) => l.id === linkId)?.clicks || 0) + 1,
			})
			.eq("id", linkId);

		// Open link
		if (typeof window !== "undefined") {
			window.open(url, "_blank", "noopener,noreferrer");
		}
	};

	const getWidgetSizeClass = (size: Widget["size"]) => {
		// Mobile view classes (smaller sizes)
		if (isMobile) {
			switch (size) {
				case "thin":
					return "w-full min-h-12 h-auto"; // Full width with flexible height for text wrapping
				case "small-circle":
					return "w-16 h-16"; // Small circle keeps its size on mobile
				case "small-square":
					return "w-32 h-32"; // ~128px for 2 per row with margins
				case "medium-square":
					return "w-32 h-32"; // Convert to small for mobile
				case "large-square":
					return "w-32 h-32"; // Convert to small for mobile
				case "extra-large":
					return "w-full h-48"; // Special handling for Twitch embeds on mobile
				case "wide":
					return "w-full min-h-12 h-auto"; // Convert to thin for mobile with text wrapping
				case "tall":
					return "w-full min-h-12 h-auto"; // Convert to thin for mobile with text wrapping
				default:
					return "w-full min-h-12 h-auto";
			}
		}

		// Web view classes (original sizes)
		switch (size) {
			case "thin":
				return "w-80 min-h-12 h-auto";
			case "small-circle":
				return "w-16 h-16";
			case "small-square":
				return "w-48 h-48";
			case "medium-square":
				return "w-56 h-56";
			case "large-square":
				return "w-80 h-80";
			case "extra-large":
				return "w-96 h-72"; // 384x288px - optimal for Twitch embeds
			case "wide":
				return "w-80 h-36";
			case "tall":
				return "w-52 h-80";
			default:
				return "w-80 min-h-14 h-auto";
		}
	};

	const renderWidget = (widget: Widget) => {
		// In mobile view, force all widgets except small-circle to be treated as small-square for consistent behavior
		const effectiveSize = isMobile && widget.size !== 'small-circle' ? 'small-square' : widget.size;
		const sizeClass = getWidgetSizeClass(effectiveSize);
		const currentPosition = widget.webPosition;

		const widgetContent = () => {
			const renderSocialWidget = () => {
				// Handle QR Code widgets first - QR codes only support square layouts
				// Type assertion for extended widget data that includes database fields
				const extendedData = widget.data as typeof widget.data & {
					link_type?: string;
					qr_codes?: {
						qr_code_data: string;
						format: string;
						[key: string]: unknown;
					};
				};
				
				if ((extendedData.link_type === 'qr_code' || widget.type === 'qr_code') && extendedData.qr_codes) {
					const qrData = extendedData.qr_codes
					
					// Ensure minimum QR code size for scannability - never go below 200px
					const qrSize = Math.max(widget.data.size || 200, 200) // Minimum 200px for good scannability
					
					// Get platform logo if it's a social media link
					let logoUrl = ''
					if (widget.data.platform) {
						logoUrl = getPlatformLogoUrl(widget.data.platform) || ''
					}
					
					// For custom branding, check if user has uploaded a custom logo
					// This is stored in the logo_url field from the database
					const customLogoUrl = widget.data.logo_url || widget.data.customLogoUrl || ''
					
					// Use custom logo if available, otherwise platform logo
					const finalLogoUrl = customLogoUrl || logoUrl
					
					// Ensure good color contrast for scannability
					const foregroundColor = qrData.foreground_color || '#000000'
					const backgroundColor = qrData.background_color || '#FFFFFF'
					
					// Validate color contrast - ensure sufficient difference
					const isValidContrast = (fg: string, bg: string) => {
						// Simple contrast check - ensure colors are different enough
						const fgLuminance = parseInt(fg.replace('#', ''), 16)
						const bgLuminance = parseInt(bg.replace('#', ''), 16)
						const contrast = Math.abs(fgLuminance - bgLuminance)
						return contrast > 0x888888 // Require significant contrast
					}
					
					// Use default colors if contrast is too low
					const finalForegroundColor = isValidContrast(foregroundColor, backgroundColor) ? foregroundColor : '#000000'
					const finalBackgroundColor = isValidContrast(foregroundColor, backgroundColor) ? backgroundColor : '#FFFFFF'
					
					// Square layouts only - match exact AppearanceCustomizer styling
					return (
						<div className={`relative h-full w-full overflow-hidden ${
							isMobile ? 'rounded-lg' : 'rounded-xl'
						}`}>
							{/* QR Code with branding */}
							<div className="absolute inset-0 bg-white flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
								<BrandedQRCode
									url={widget.data.url || ''}
									size={qrSize}
									logoUrl={finalLogoUrl}
									logoSize={Math.min(getOptimalLogoSize(qrSize) * 0.8, qrSize * 0.25)} // Reduce logo size by 20% and cap at 25% of QR size
									errorCorrection="H"
									foregroundColor={finalForegroundColor}
									backgroundColor={finalBackgroundColor}
									className={effectiveSize === 'large-square' ? 'w-56 h-56' : 'w-28 h-28'}
								/>
							</div>
							
							{/* QR Code Title */}
							{widget.data.title && (
								<div className={`absolute ${
									isMobile ? 'bottom-1 left-1 right-1' : 'bottom-2 left-2 right-2'
								} z-10`}>
									<div className="text-xs text-gray-700 text-center break-words leading-tight">
										{widget.data.title}
									</div>
								</div>
							)}
						</div>
					)
				}
				
				// Check for Twitch embed widget (special case) - handle both legacy and new sizes
				if (widget.data.platform === 'twitch' && (widget.size === 'extra-large' || widget.size === 'large-square')) {
					return (
						<div className="h-full w-full">
							<TwitchEmbed
								channel={widget.data.username || ''}
								size={(effectiveSize === 'extra-large' || effectiveSize === 'large-square') ? 'large' : 'medium'}
								className="w-full h-full"
								profileImage={widget.data.profile_image_url}
							/>
						</div>
					);
				}

				// Check for YouTube Live embed widget (special case) - handle both legacy and new sizes
				if (widget.data.platform === 'youtube' && (widget.size === 'extra-large' || widget.size === 'large-square')) {
					return (
						<div className="h-full w-full">
							<YouTubeLiveEmbed
								channelHandle={widget.data.username?.startsWith('@') || !widget.data.username?.startsWith('UC') ? widget.data.username : undefined}
								channelId={widget.data.username?.startsWith('UC') && widget.data.username?.length === 24 ? widget.data.username : undefined}
								size={(effectiveSize === 'extra-large' || effectiveSize === 'large-square') ? 'large' : 'medium'}
								className="w-full h-full"
							/>
						</div>
					);
				}
				
				// Check for Kick embed widget (special case) - handle both legacy and new sizes
				if (widget.data.platform === 'kick' && (widget.size === 'extra-large' || widget.size === 'large-square')) {
					return (
						<div className="h-full w-full">
							<KickEmbed
								channel={widget.data.username || ''}
								size={(effectiveSize === 'extra-large' || effectiveSize === 'large-square') ? 'large' : 'medium'}
								className="w-full h-full"
								profileImage={widget.data.profile_image_url}
							/>
						</div>
					);
				}

				const getSocialInfo = (platform: string) => {
					// Use the same platform data as widget-modal
					const platformData = platforms.find(p => p.value === platform.toLowerCase());
					if (platformData) {
						return {
							logoUrl: platformData.logoUrl,
							color: platformData.color,
							name: platformData.name,
							fallback: platformData.name.charAt(0)
						};
					}
					// Fallback for unknown platforms
					return {
						logoUrl: "",
						color: "bg-gray-500",
						name: platform,
						fallback: platform.charAt(0).toUpperCase()
					};
				};

				// Helper function to get the appropriate image for a platform
				const getWidgetImage = (platform: string, widget: any, socialInfo: any) => {
					// Check if profile image is available for supported platforms (except small-circle)
					const supportedPlatforms = ['twitch', 'spotify', 'tiktok', 'youtube', 'kick', 'discord'];
					const shouldUseProfileImage = widget.size !== 'small-circle';
					
					if (supportedPlatforms.includes(platform) && shouldUseProfileImage && widget.data.profile_image_url) {
						return {
							src: widget.data.profile_image_url,
							alt: widget.data.username || `${platform} Profile`,
							className: "object-cover rounded-full",
							fallbackSrc: socialInfo.logoUrl,
							fallbackClassName: "object-contain filter invert brightness-0"
						};
					}
					// For small widgets or when profile image is not available, use platform logo
					return {
						src: socialInfo.logoUrl,
						alt: platform || widget.data.title || "External Link",
						className: "object-contain filter invert brightness-0"
					};
				};

				// Extract platform from URL if not provided
				let platform = widget.data.platform || "";
				if (!platform && widget.data.url) {
					try {
						const urlObj = new URL(widget.data.url);
						const hostname = urlObj.hostname.toLowerCase();
						if (hostname.includes("github.com")) platform = "GitHub";
						else if (
							hostname.includes("twitter.com") ||
							hostname.includes("x.com")
						)
							platform = "Twitter";
						else if (hostname.includes("instagram.com")) platform = "Instagram";
						else if (hostname.includes("facebook.com")) platform = "Facebook";
						else if (hostname.includes("linkedin.com")) platform = "LinkedIn";
						else if (hostname.includes("youtube.com")) platform = "YouTube";
						else if (hostname.includes("tiktok.com")) platform = "TikTok";
						else if (hostname.includes("spotify.com")) platform = "Spotify";
						else if (hostname.includes("music.apple.com"))
							platform = "Apple Music";
						else if (hostname.includes("soundcloud.com"))
							platform = "SoundCloud";
						else if (hostname.includes("threads.net"))
							platform = "Threads";
						else if (hostname.includes("snapchat.com"))
							platform = "Snapchat";
					} catch (e) {
						// Invalid URL, use default
					}
				}
				
				// Ensure platform name is properly capitalized
				const getCapitalizedPlatform = (platformName: string) => {
					const platformMap: { [key: string]: string } = {
						'github': 'GitHub',
						'twitter': 'Twitter', 
						'x': 'X',
						'instagram': 'Instagram',
						'facebook': 'Facebook',
						'linkedin': 'LinkedIn',
						'youtube': 'YouTube',
						'tiktok': 'TikTok',
						'spotify': 'Spotify',
						'apple_music': 'Apple Music',
						'soundcloud': 'SoundCloud',
						'website': 'Website'
					}
					return platformMap[platformName.toLowerCase()] || platformName.charAt(0).toUpperCase() + platformName.slice(1)
				}
				
				const capitalizedPlatform = getCapitalizedPlatform(platform)
				const socialInfo = getSocialInfo(platform);

				// Different layouts based on effective size (mobile view forces small-square)
				if (effectiveSize === "thin") {
					return (
						<div className={`flex items-center h-full ${
							isMobile ? 'space-x-2 px-2' : 'space-x-3'
						}`}>
							<div
								className={`${
									isMobile ? 'w-6 h-6 rounded-lg' : 'w-8 h-8 rounded-xl'
								} flex items-center justify-center ${socialInfo.color} ${
									isMobile ? 'p-1' : 'p-1.5'
								}`}
							>
								{(() => {
									const imageInfo = getWidgetImage(platform, widget, socialInfo);
									return (
										<img
											src={imageInfo.src}
											alt={imageInfo.alt}
											className={`w-4 h-4 ${imageInfo.className}`}
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												if (imageInfo.fallbackSrc) {
													target.src = imageInfo.fallbackSrc;
													target.className = `w-4 h-4 ${imageInfo.fallbackClassName || imageInfo.className}`;
												} else {
													target.style.display = 'none';
												}
											}}
										/>
									);
								})()}
								<div className="w-4 h-4 flex items-center justify-center text-white text-sm font-bold hidden">
									{socialInfo.fallback}
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className={`font-medium ${
									isMobile ? 'text-gray-900 text-xs' : 'text-gray-900 text-sm'
								} break-words leading-tight`}>
									{widget.data.display_name ||
										(widget.data.username
											? `@${widget.data.username}`
											: widget.data.title || capitalizedPlatform || "Link")}
								</div>
							</div>
						</div>
					);
				}

				if (effectiveSize === "small-circle") {
					return (
						<div className="relative h-full w-full overflow-hidden rounded-full">
							{/* Background - Platform Logo Only */}
							<div className={`absolute inset-0 ${socialInfo.color} flex items-center justify-center`}>
								<img
									src={socialInfo.logoUrl}
									alt={platform || widget.data.title || "External Link"}
									className="w-6 h-6 object-contain filter invert brightness-0"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = 'none';
										const fallback = target.nextElementSibling as HTMLElement;
										if (fallback) fallback.style.display = 'block';
									}}
								/>
								<div className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold hidden">
									{socialInfo.fallback}
								</div>
							</div>
						</div>
					);
				}

				if (effectiveSize === "small-square") {
					return (
						<div className={`relative h-full w-full overflow-hidden ${
							isMobile ? 'rounded-lg' : 'rounded-xl'
						}`}>
							{/* Background - Profile Picture or Platform Logo */}
							{widget.data.profile_image_url ? (
								<div className="absolute inset-0">
									<img
										src={widget.data.profile_image_url}
										alt={widget.data.username || platform}
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = "none";
										}}
									/>
									<div className={`absolute inset-0 ${
										isMobile 
											? 'bg-gradient-to-t from-black/80 to-transparent' 
											: 'bg-gradient-to-t from-black/60 to-transparent'
									}`}></div>
								</div>
							) : (
								<div className={`absolute inset-0 ${socialInfo.color} flex items-center justify-center`}>
									{(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? (
										<img
											src={socialInfo.logoUrl}
											alt={platform || widget.data.title || "External Link"}
											className={`${
												isMobile ? 'w-24 h-24' : 'w-32 h-32'
											} object-contain filter invert brightness-0 opacity-20`}
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												const fallback =
													target.parentElement?.querySelector(".fallback-text");
												if (fallback) fallback.classList.remove("hidden");
											}}
										/>
									) : null}
									<span
										className={`fallback-text ${
											isMobile ? 'text-sm' : 'text-lg'
										} font-bold text-white ${
											(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? "hidden" : ""
										}`}
									>
										{socialInfo.fallback}
									</span>
								</div>
							)}

							{/* Content */}
							<div className={`absolute ${
								isMobile ? 'bottom-1 left-1 right-1' : 'bottom-2 left-2 right-2'
							} z-10`}>
								<div className={`${
									isMobile ? 'text-xs' : 'text-xs'
								} font-medium text-white leading-tight`}>
									{widget.data.display_name ||
										(widget.data.username
											? `@${widget.data.username}`
											: widget.data.title || capitalizedPlatform || "Link")}
								</div>
								{widget.data.username && platform && !isMobile && (
									<div className="text-xs text-white/80 mt-0.5 capitalize">
										{platform}
									</div>
								)}
							</div>
						</div>
					);
				}

				if (effectiveSize === "medium-square") {
					return (
						<div className="relative h-full w-full overflow-hidden rounded-2xl">
							{/* Background - Profile Picture or Platform Logo */}
							{widget.data.profile_image_url ? (
								<div className="absolute inset-0">
									<img
										src={widget.data.profile_image_url}
										alt={widget.data.username || platform}
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = "none";
										}}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
								</div>
							) : (
								<div
									className={`absolute inset-0 ${socialInfo.color} flex items-center justify-center`}
								>
									{(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? (
										<img
											src={socialInfo.logoUrl}
											alt={platform || widget.data.title || "External Link"}
											className="w-28 h-28 object-contain filter invert brightness-0 opacity-20"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												const fallback =
													target.parentElement?.querySelector(".fallback-text");
												if (fallback) fallback.classList.remove("hidden");
											}}
										/>
									) : null}
									<span
										className={`fallback-text text-2xl font-bold text-white ${
											(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? "hidden" : ""
										}`}
									>
										{socialInfo.fallback}
									</span>
								</div>
							)}

							{/* Content */}
							<div className="absolute bottom-3 left-3 right-3">
								<div className="text-sm font-medium text-white">
									{widget.data.display_name ||
										(widget.data.username
											? `@${widget.data.username}`
											: widget.data.title || platform || "Link")}
								</div>
								{widget.data.username && platform && (
									<div className="text-xs text-white/80 mt-1 capitalize">
										{platform}
									</div>
								)}
							</div>
						</div>
					);
				}

				if (effectiveSize === "large-square") {
					return (
						<div className="relative h-full w-full overflow-hidden rounded-3xl">
							{/* Background - Profile Picture or Platform Logo */}
							{widget.data.profile_image_url ? (
								<div className="absolute inset-0">
									<img
										src={widget.data.profile_image_url}
										alt={widget.data.username || platform}
										className="w-full h-full object-cover"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
											// Find parent container and add fallback
											const parent = target.parentElement;
											if (parent) {
												parent.innerHTML = `
                          <div class="absolute inset-0 ${socialInfo.color} flex items-center justify-center">
                            ${
															socialInfo.logoUrl
																? `<img src="${socialInfo.logoUrl}" alt="${platform}" class="w-40 h-40 object-contain filter invert brightness-0" />`
																: ""
														}
                            <span class="text-3xl font-bold text-white ${
															socialInfo.logoUrl ? "hidden" : ""
														}">${socialInfo.fallback}</span>
                          </div>
                        `;
											}
										}}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
								</div>
							) : (
								<div
									className={`absolute inset-0 ${socialInfo.color} flex items-center justify-center`}
								>
									{(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? (
										<img
											src={socialInfo.logoUrl}
											alt={platform || widget.data.title || "External Link"}
											className="w-40 h-40 object-contain filter invert brightness-0 opacity-20"
											onError={(e) => {
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												const fallback =
													target.parentElement?.querySelector(".fallback-text");
												if (fallback) fallback.classList.remove("hidden");
											}}
										/>
									) : null}
									<span
										className={`fallback-text text-3xl font-bold text-white ${
											(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? "hidden" : ""
										}`}
									>
										{socialInfo.fallback}
									</span>
								</div>
							)}

							{/* Content */}
							<div className="absolute bottom-4 left-4 right-4 z-10">
								<div className="text-base font-semibold text-white">
									{widget.data.display_name ||
										(widget.data.username
											? `@${widget.data.username}`
											: widget.data.title || platform || "Link")}
								</div>
								{widget.data.username && platform && (
									<div className="text-sm text-white/80 mt-1 capitalize">
										{platform}
									</div>
								)}
							</div>
						</div>
					);
				}

				// Default wide layout (for wide and tall rectangles)
				return (
					<div className="relative h-full w-full overflow-hidden rounded-2xl">
						{/* Background - Profile Picture or Platform Logo */}
						{widget.data.profile_image_url ? (
							<div className="absolute inset-0">
								<img
									src={widget.data.profile_image_url}
									alt={widget.data.username || platform}
									className="w-full h-full object-cover"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.style.display = "none";
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							</div>
						) : (
							<div
								className={`absolute inset-0 ${socialInfo.color} flex items-center justify-center`}
							>
								{(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? (
									<img
										src={socialInfo.logoUrl}
										alt={platform || widget.data.title || "External Link"}
										className="w-24 h-24 object-contain filter invert brightness-0 opacity-20"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
											const fallback =
												target.nextElementSibling as HTMLElement;
											if (fallback) fallback.style.display = 'block';
										}}
									/>
								) : null}
								<span
									className={`fallback-text text-2xl font-bold text-white ${
										(widget.data.favicon || widget.data.appLogo || socialInfo.logoUrl) ? "hidden" : ""
									}`}
								>
									{socialInfo.fallback}
								</span>
							</div>
						)}

						{/* Content */}
						<div className="absolute bottom-3 left-3 right-3 z-10">
							<div className="text-sm font-medium text-white">
								{widget.data.display_name ||
									(widget.data.username
										? `@${widget.data.username}`
										: widget.data.title || platform || "Link")}
							</div>
							{widget.data.username && platform && (
								<div className="text-xs text-white/80 mt-1 capitalize">
									{platform}
								</div>
							)}
						</div>
					</div>
				);
			};

			const renderOtherWidget = () => {
				switch (widget.type) {
					case "text":
						return (
							<div className="flex flex-col h-full p-2">
								<div className="flex items-center space-x-2 mb-2">
									<div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
										<Type className="w-3 h-3 text-white" />
									</div>
									<div className="text-xs text-gray-500">Text</div>
								</div>
								<div className="flex-1 text-sm text-gray-900 break-words">
									{widget.data.content ||
										widget.data.title ||
										"Text content..."}
								</div>
							</div>
						);
					case "media":
						return (
							<div className="flex flex-col h-full relative">
								{widget.data.fileUrl ? (
									<>
										<img
											src={widget.data.fileUrl}
											alt={widget.data.caption || "Media"}
											className="w-full h-full object-cover rounded"
										/>
										{widget.data.caption && effectiveSize !== "thin" && (
											<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
												<div className="text-white text-xs">
													{widget.data.caption}
												</div>
											</div>
										)}
									</>
								) : (
									<div className="flex items-center justify-center h-full bg-gray-100 rounded">
										<ImageIcon className="w-8 h-8 text-gray-400" />
									</div>
								)}
							</div>
						);
					case "voice":
						return (
							<div className="flex items-center space-x-3 h-full">
								<div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
									<Mic className="w-5 h-5 text-white" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-gray-900 text-sm">
										Voice Message
									</div>
									<div className="text-xs text-gray-500">Click to play</div>
								</div>
							</div>
						);
					case "product":
						return (
							<div className="flex items-center space-x-3 h-full">
								<div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
									<Package className="w-5 h-5 text-white" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-gray-900 text-sm">
										{widget.data.title || "Product"}
									</div>
									{widget.data.price && (
										<div className="text-sm text-green-600 font-semibold">
											{widget.data.price}
										</div>
									)}
									{effectiveSize !== "thin" && (
										<div className="text-xs text-gray-500">Product</div>
									)}
								</div>
							</div>
						);
					case "app":
						return (
							<div className="flex items-center space-x-3 h-full">
								<div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
									<Smartphone className="w-5 h-5 text-white" />
								</div>
								<div className="flex-1">
									<div className="font-medium text-gray-900 text-sm">
										{widget.data.title || "App"}
									</div>
									{effectiveSize !== "thin" && (
										<div className="text-xs text-gray-500">Download App</div>
									)}
								</div>
							</div>
						);
					default:
						return renderSocialWidget();
				}
			};

			switch (widget.type) {
				case "social":
					return renderSocialWidget();
				case "link":
					return renderSocialWidget();
				case "qr_code":
					return renderSocialWidget();
				default:
					return renderOtherWidget();
			}
		};

		return (
			<div
				key={widget.id}
				className={`${
					isMobile 
						? `${sizeClass} transition-all duration-150 ease-out ${widget.data.link_type !== 'qr_code' && widget.type !== 'qr_code' ? 'cursor-pointer' : ''} mb-2 ${
							effectiveSize === 'small-circle' || effectiveSize === 'small-square' || effectiveSize === 'medium-square' || effectiveSize === 'large-square' 
								? 'mr-2' : ''
						}` 
						: `absolute ${sizeClass} transition-all duration-150 ease-out ${widget.data.link_type !== 'qr_code' && widget.type !== 'qr_code' ? 'cursor-pointer' : ''}`
				}`}
				style={isMobile ? {} : {
					transform: `translate(${currentPosition.x}px, ${currentPosition.y}px)`,
					zIndex: 1,
				}}
				{...(widget.data.link_type !== 'qr_code' && widget.type !== 'qr_code' && { onClick: () => handleLinkClick(widget.id, widget.data.url || "") })}
			>
				<Card className={`h-full relative ${
					isMobile 
						? 'bg-transparent border-none shadow-none' 
						: '!bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
				} transition-all duration-150`}>
					<CardContent className={`h-full flex items-center justify-center ${
						isMobile ? 'p-0' : 'p-4'
					}`}>
						{widgetContent()}
					</CardContent>
				</Card>
			</div>
		);
	};

	// Prevent hydration mismatch by ensuring client-side rendering for mobile detection
	if (!isHydrated) {
		return (
			<div className="min-h-screen !bg-white flex items-center justify-center">
				<div className="text-gray-500">Loading...</div>
			</div>
		);
	}

	return (
		<div 
			className="min-h-screen" 
			style={{ 
				backgroundColor: page.background_color || '#ffffff',
				backgroundImage: page.background_image_url ? `url(${page.background_image_url})` : 'none',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				backgroundAttachment: 'fixed'
			}}
		>
			{/* Main Content */}
			<div className={`${
				isMobile 
					? 'flex flex-col' 
					: 'flex flex-col items-center justify-start max-w-7xl mx-auto px-4 py-8 lg:py-12'
			} min-h-screen`}>
				{/* Profile Section */}
				<div className={`${
					isMobile 
						? 'w-full p-4' 
						: 'w-full max-w-lg lg:max-w-xl mb-12'
				} flex flex-col items-center`}>
					<div className={`w-full ${
						isMobile 
							? 'max-w-md' 
							: 'max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl'
					}`}>
						{/* Profile Section */}
						<div className="text-center mb-6">
							<div className="mb-6">
								<Avatar className={`${
									isMobile ? 'w-24 h-24' : 'w-32 h-32 lg:w-36 lg:h-36'
								} mx-auto mb-6 ring-4 ring-white shadow-2xl`}>
									<AvatarImage
										src={profile?.avatar_url || ""}
										alt={profile?.display_name || page.page_title}
									/>
									<AvatarFallback className={`${
										isMobile ? 'text-2xl' : 'text-4xl'
									} bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold`}>
										{(profile?.display_name || page.page_title || page.username)
											.charAt(0)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</div>

							<h1 className={`${
								isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'
							} font-black mb-4 !text-gray-900`}>
								{profile?.display_name || page.page_title || page.username}
							</h1>

							{profile?.bio && (
								<p className={`${
									isMobile ? 'text-base' : 'text-lg lg:text-xl'
								} !text-gray-700 font-medium mb-8 leading-relaxed max-w-lg mx-auto`}>
									{profile.bio}
								</p>
							)}

							{/* Page title - show if exists */}
							{(page.page_title && page.page_title.trim()) && (
								<div className="mb-4 max-w-md mx-auto">
									<div className={`${
										isMobile ? 'text-lg' : 'text-xl'
									} font-semibold text-gray-800`}>
										{page.page_title}
									</div>
								</div>
							)}
							
							{/* Page description - always show if exists */}
							{(page.page_description && page.page_description.trim()) && (
								<div className="mb-6 max-w-md mx-auto">
									<p className={`${
										isMobile ? 'text-sm' : 'text-base'
									} text-gray-600 leading-relaxed`}>
										{page.page_description}
									</p>
								</div>
							)}
						</div>

						{socialLinks.length > 0 && (
							<div className="text-center mb-6">
								<SocialIcons socialLinks={socialLinks} theme="light" />
							</div>
						)}

						{/* Branding - only show on desktop */}
						{!isMobile && (
							<div className="text-center mt-8 pt-8 border-t border-gray-200">
								<p className="text-xs !text-gray-500">
									Created with{" "}
									<a
										href="https://curately.co.uk"
										target="_blank"
										rel="noopener noreferrer"
										className="underline !text-gray-700 hover:!text-gray-900"
									>
										Curately
									</a>
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Widgets Section */}
				<div className={`${isMobile ? 'w-full p-4' : 'w-full max-w-5xl lg:max-w-6xl p-4 relative'}`}>
					{isMobile ? (
						<div className="flex justify-center">
							<div
								className="relative w-80 rounded-lg p-6"
								style={{
									maxWidth: "320px",
									overflow: "visible",
									minHeight: widgets.length > 0 ? Math.max(
										600,
										widgets.reduce((max, w) => {
											const pos = w.mobilePosition || { y: 0 };
											return Math.max(max, pos.y + 128 + 40); // widget height + padding
										}, 600)
									) + "px" : "600px",
								}}
							>
								{!isHydrated || isLoadingWidgets ? (
									<div className="flex items-center justify-center h-40">
										<div className="!text-gray-500">Loading widgets...</div>
									</div>
								) : widgets.length === 0 ? (
									<div className="flex items-center justify-center h-40">
										<div className="text-center !text-gray-500">
											<div className="text-lg font-medium mb-2">No widgets yet</div>
											<div className="text-sm">
												This profile has no links to display
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-wrap justify-start" suppressHydrationWarning>
										{widgets.map((widget) => renderWidget(widget))}
									</div>
								)}
								
								{/* CTA Button - Mobile */}
								<div className="mt-6 pt-6 border-t border-gray-200">
									<div className="text-center space-y-3">
										<p className="text-sm font-medium !text-gray-900">
											Create your own link-in-bio page
										</p>
										<div className="relative group">
											{/* Pulse animation background */}
											<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
											
											{/* Main button */}
											<Button 
												className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold border-2 border-white/20"
												onClick={() => window.open('https://curately.co.uk', '_blank', 'noopener,noreferrer')}
											>
												<span className="flex items-center justify-center gap-2">
													✨ Create Your Page
													<svg 
														className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
														fill="none" 
														stroke="currentColor" 
														viewBox="0 0 24 24"
													>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
													</svg>
												</span>
											</Button>
											
											{/* Floating badge */}
											<div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
												FREE
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div
							className="relative w-full rounded-lg p-6 mx-auto"
							style={{
								maxWidth: "100%",
								overflow: "visible",
								minHeight: widgets.length > 0 ? Math.max(
									600,
									widgets.reduce((max, w) => {
										const pos = w.position || { y: 0 };
										return Math.max(max, pos.y + 128 + 40); // widget height + padding
									}, 600)
								) + "px" : "600px",
							}}
						>
							{!isHydrated || isLoadingWidgets ? (
								<div className="flex items-center justify-center h-40">
									<div className="!text-gray-500">Loading widgets...</div>
								</div>
							) : widgets.length === 0 ? (
								<div className="flex items-center justify-center h-40">
									<div className="text-center !text-gray-500">
										<div className="text-lg font-medium mb-2">No widgets yet</div>
										<div className="text-sm">
											This profile has no links to display
										</div>
									</div>
								</div>
							) : (
								<div suppressHydrationWarning>
									{widgets.map((widget) => renderWidget(widget))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
			
			{/* CTA Button - Web (bottom-center or bottom-right of page) */}
			{!isMobile && (
				<div className="fixed bottom-6 right-6 z-10 group">
					<div className="relative">
						{/* Pulse animation background */}
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
						
						{/* Main button */}
						<Button 
							className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-semibold text-base border-2 border-white/20"
							onClick={() => window.open('https://curately.co.uk', '_blank', 'noopener,noreferrer')}
						>
							<span className="flex items-center gap-2">
								✨ Create Your Page
								<svg 
									className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						</Button>
						
						{/* Floating badge */}
						<div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
							FREE
						</div>
					</div>
				</div>
			)}
			
			{/* Mobile Branding Credit - Bottom */}
			{isMobile && (
				<div className="w-full p-4 bg-gray-50 border-t border-gray-200">
					<div className="text-center">
						<p className="text-xs !text-gray-500">
							Created with{" "}
							<a
								href="https://curately.co.uk"
								target="_blank"
								rel="noopener noreferrer"
								className="underline !text-gray-700 hover:!text-gray-900"
							>
								Curately
							</a>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
