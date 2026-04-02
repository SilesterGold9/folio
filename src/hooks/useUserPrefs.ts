import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '../types';
import { safeLocalStorage } from '../utils';
import { STORAGE_KEYS, DEFAULT_PREFS } from '../constants';

export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('storage-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('storage-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    const onboarded = safeLocalStorage.getItem(STORAGE_KEYS.ONBOARDED);
    setShowOnboarding(onboarded !== 'true');

    const savedPrefs = safeLocalStorage.getItem(STORAGE_KEYS.PREFS);
    
    // Simulate loading for skeleton demo
    const timer = setTimeout(() => {
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPrefs({
            ...DEFAULT_PREFS,
            ...parsed,
          });
        } catch (e) {
          setPrefs(DEFAULT_PREFS);
        }
      } else {
        setPrefs(DEFAULT_PREFS);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const savePrefs = useCallback((newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    safeLocalStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(newPrefs));
    safeLocalStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  }, []);

  const completeOnboarding = useCallback((newPrefs: UserPreferences) => {
    savePrefs(newPrefs);
    setShowOnboarding(false);
  }, [savePrefs]);

  const replayOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  const hideSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return {
    prefs,
    showOnboarding,
    showSplash,
    quotaExceeded,
    setQuotaExceeded,
    savePrefs,
    completeOnboarding,
    replayOnboarding,
    hideSplash,
  };
}
