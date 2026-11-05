/// <reference types="vite/client" />

declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.svg";
declare module "*.css";
declare module "*.webp";
declare module "*.lottie";

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_ERROR_REPORT_URL?: string;
}