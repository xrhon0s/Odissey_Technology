import {
  createSocialImage,
  socialImageSize,
} from "@/features/seo/social-image";

export const alt =
  "Odissey Technology, accesorios tecnológicos con envíos a Colombia";
export const contentType = "image/png";
export const size = socialImageSize;

export default function OpenGraphImage() {
  return createSocialImage();
}
