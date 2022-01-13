import { createI18n } from 'vue-i18n';
import messages from "./i18n";

const DEFAULT_LANG = 'zh';
const LOCALE_KEY = 'localeLanguage';

let lang = window.localStorage.getItem(LOCALE_KEY);
if (lang === undefined) {
    lang = DEFAULT_LANG;
    window.localStorage.setItem(LOCALE_KEY, lang);
}

const i18n = new createI18n({
    locale: lang || DEFAULT_LANG,
    messages,
    globalInjection: true,
    fallbackLocale: "ch"
})

export default i18n;