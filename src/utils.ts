import { THEMES } from './constants';

export const applyTheme = (themeId: string, darkMode: boolean) => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  root.style.setProperty('--theme-color', theme.color);
  root.style.setProperty('--theme-color-rgb', hexToRgb(theme.color));
  
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    '79, 70, 229';
};

export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = 
    date.getDate() === now.getDate() && 
    date.getMonth() === now.getMonth() && 
    date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const stripHtml = (html: string) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
};

export const extractTags = (html: string): string[] => {
  const text = stripHtml(html);
  const matches = text.match(/#[\w]+/g) || [];
  return Array.from(new Set(matches));
};

export const getStats = (html: string) => {
  const text = stripHtml(html);
  if (!text) return { chars: 0, words: 0, sentences: 0, readingTime: 0 };
  
  const chars = text.length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const readingTime = Math.ceil(words / 225); // Average reading speed 225 wpm
  
  return { chars, words, sentences, readingTime };
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch(e) {}
  }
};

export const shortenName = (name: string, maxLength: number = 12) => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  const first = name.split(' ')[0];
  if (first.length <= maxLength) return first;
  return first.substring(0, maxLength - 1) + '…';
};

export const calculateStreak = (notes: { updatedAt: number }[]) => {
  if (!notes.length) return 0;
  
  const uniqueDays = Array.from(new Set(notes.map(n => {
    const d = new Date(n.updatedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) return 0;

  let checkDate = uniqueDays[0] === todayStr ? today : yesterday;

  for (const dayStr of uniqueDays) {
    const expectedStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (dayStr === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const getLast7DaysActivity = (notes: { updatedAt: number }[]) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    const hasActivity = notes.some(n => {
      const noteDate = new Date(n.updatedAt);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate.getTime() === d.getTime();
    });

    days.push({
      date: d,
      hasActivity,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' })
    });
  }
  return days;
};

export const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e instanceof DOMException && (
        e.code === 22 || 
        e.code === 1014 || 
        e.name === 'QuotaExceededError' || 
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error('LocalStorage quota exceeded!', e);
        // Dispatch a custom event so the app can show a warning
        window.dispatchEvent(new CustomEvent('storage-quota-exceeded', { detail: { key } }));
        return false;
      }
      throw e;
    }
  },
  getItem: (key: string) => localStorage.getItem(key),
  removeItem: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

export const compressImage = (base64: string, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
  });
};
