import enUS from "./locales/en-US";
import deDE from "./locales/de-DE";
import esES from "./locales/es-ES";
import frFR from "./locales/fr-FR";
import jaJP from "./locales/ja-JP";
import zhCN from "./locales/zh-CN";

const locales: Record<string, typeof enUS> = {
  "en-US": enUS,
  "de-DE": deDE,
  "es-ES": esES,
  "fr-FR": frFR,
  "ja-JP": jaJP,
  "zh-CN": zhCN,
};

export function i18n(locale: string) {
  return locales[locale] || enUS;
}
