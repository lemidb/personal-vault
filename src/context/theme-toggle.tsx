import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="group/toggle h-8 w-8"
            onClick={toggleTheme}
        >
            <SunIcon className="hidden [html.dark_&]:block" />
            <MoonIcon className="h-4 w-4 dark:hidden" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
