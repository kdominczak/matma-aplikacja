// Bez importów Reacta – używane w serwerowym layout.tsx.

export const THEME_STORAGE_KEY = "theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Wstrzykiwany do <head> – ustawia klasę `.dark` przed pierwszym malowaniem,
 * żeby po starcie aplikacji ekran nie mignął jasnym motywem.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":matchMedia("${DARK_QUERY}").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}`;
