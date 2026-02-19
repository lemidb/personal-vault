import * as React from "react";
import type { Theme, ThemeContextValue } from "./theme";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
    undefined
);

const STORAGE_KEY = "vault-theme";

function getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

    React.useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const value = React.useMemo<ThemeContextValue>(
        () => ({ theme, toggleTheme }),
        [theme, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = React.useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}
