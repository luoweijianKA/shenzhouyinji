import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { ContextPath } from './constants'

function getCookie(name: any){
    var strcookie = document.cookie;
    var arrcookie = strcookie.split("; ");

    for ( var i = 0; i < arrcookie.length; i++) {
        var arr = arrcookie[i].split("=");
        if (arr[0] === name){
            return arr[1];
        }
    }
    return "zh_CN";
}

i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `${ContextPath}/locales/{{lng}}.json`
    },
    react: {
      useSuspense: true
    },
    lng: getCookie('locale'),
    fallbackLng: 'zh_CN',
    preload: ['zh_CN'],
    keySeparator: false,
    interpolation: { escapeValue: false }
  })

export default i18next
