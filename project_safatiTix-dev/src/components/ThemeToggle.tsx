import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-[#F4A261]" />
      ) : (
        <Moon className="w-5 h-5 text-[#0077B6]" />
      )}
    </Button>
  );
}
