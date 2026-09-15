import cellPhoneIcon from "@/presentation/assets/platforms/cell-phone.png";
import emailIcon from "@/presentation/assets/platforms/email.png";
import facebookIcon from "@/presentation/assets/platforms/facebook.png";
import instagramIcon from "@/presentation/assets/platforms/instagram.png";
import telegramIcon from "@/presentation/assets/platforms/telegram.png";
import tiktokIcon from "@/presentation/assets/platforms/tiktok.png";
import webpageIcon from "@/presentation/assets/platforms/webpage.png";
import whatsappIcon from "@/presentation/assets/platforms/whatsapp.png";
import youtubeIcon from "@/presentation/assets/platforms/youtube.png";

const PLATFORM_ICON_SRC: Record<string, string> = {
  whatsapp: whatsappIcon,
  facebook: facebookIcon,
  youtube: youtubeIcon,
  tiktok: tiktokIcon,
  email: emailIcon,
  cellphone: cellPhoneIcon,
  telegram: telegramIcon,
  instagram: instagramIcon,
  webpage: webpageIcon,
  url: webpageIcon,
};

export function getPlatformIconSrc(platform: string): string | undefined {
  return PLATFORM_ICON_SRC[platform.toLowerCase()];
}
