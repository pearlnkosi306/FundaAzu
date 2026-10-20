export interface Language {
  id: string;
  name: string;
  native: string;
  region: string;
}

export const LANGUAGES: Language[] = [
  { id: "en", name: "English", native: "English", region: "Global" },
  { id: "sw", name: "Swahili", native: "Kiswahili", region: "East Africa" },
  { id: "ha", name: "Hausa", native: "Hausa", region: "West Africa" },
  { id: "yo", name: "Yoruba", native: "Yorùbá", region: "West Africa" },
  { id: "ig", name: "Igbo", native: "Asụsụ Igbo", region: "West Africa" },
  { id: "pcm", name: "Nigerian Pidgin", native: "Naijá", region: "West Africa" },
  { id: "am", name: "Amharic", native: "አማርኛ", region: "East Africa" },
  { id: "zu", name: "isiZulu", native: "isiZulu", region: "Southern Africa" },
  { id: "xh", name: "isiXhosa", native: "isiXhosa", region: "Southern Africa" },
  { id: "af", name: "Afrikaans", native: "Afrikaans", region: "Southern Africa" },
  { id: "st", name: "Sesotho", native: "Sesotho", region: "Southern Africa" },
  { id: "tn", name: "Setswana", native: "Setswana", region: "Southern Africa" },
  { id: "sn", name: "Shona", native: "chiShona", region: "Southern Africa" },
  { id: "rw", name: "Kinyarwanda", native: "Ikinyarwanda", region: "East Africa" },
  { id: "so", name: "Somali", native: "Soomaali", region: "East Africa" },
  { id: "ar", name: "Arabic", native: "العربية", region: "North Africa" },
  { id: "fr", name: "French", native: "Français", region: "Africa & global" },
  { id: "pt", name: "Portuguese", native: "Português", region: "Africa & global" },
];

export function languageName(id: string): string {
  return LANGUAGES.find((language) => language.id === id)?.name ?? "English";
}
