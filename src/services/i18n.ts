// Hindi is provided for navigation and key headings only. Add languages by adding a column.
import { useStore } from "./store";

const dict = {
  overview: { en: "Overview", hi: "अवलोकन" },
  map: { en: "Emergency Map", hi: "आपातकालीन नक्शा" },
  route: { en: "Find a Safe Route", hi: "सुरक्षित मार्ग खोजें" },
  shelters: { en: "Shelters", hi: "आश्रय स्थल" },
  report: { en: "Report an Issue", hi: "समस्या की रिपोर्ट करें" },
  reports: { en: "Report History", hi: "रिपोर्ट इतिहास" },
  alerts: { en: "Alerts", hi: "चेतावनियाँ" },
  profile: { en: "My Accessibility Profile", hi: "मेरी सुगम्यता प्रोफ़ाइल" },
  settings: { en: "Settings", hi: "सेटिंग्स" },
  about: { en: "About SURAKSHA PATH", hi: "सुरक्षा पथ के बारे में" },
  demo: { en: "Demo mode · simulated data", hi: "डेमो मोड · नकली डेटा" },
  official: {
    en: "In an emergency, follow official instructions and call 112.",
    hi: "आपात स्थिति में आधिकारिक निर्देशों का पालन करें और 112 पर कॉल करें।",
  },
  search: { en: "Search shelters or areas", hi: "आश्रय या क्षेत्र खोजें" },
} as const;

export type TKey = keyof typeof dict;

export function useT() {
  const { profile } = useStore();
  return (k: TKey) => dict[k][profile.language] ?? dict[k].en;
}
