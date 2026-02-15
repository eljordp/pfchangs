'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <Sun className="w-4 h-4 text-gray-400" />
      ) : (
        <Moon className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );
}
