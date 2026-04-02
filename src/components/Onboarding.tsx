import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Feather, Command, Maximize, Sparkles, Check, Moon, Sun, Keyboard, Zap, ArrowRight, Focus, ArrowLeft, FolderIcon, Hash, ListTree } from 'lucide-react';
import { UserPreferences } from '../types';
import { THEMES } from '../constants';
import { t } from '../i18n';

import { useFolio } from '../context/FolioContext';

export const Onboarding = () => {
  const { completeOnboarding: onComplete } = useFolio();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [themeColor, setThemeColor] = useState(THEMES[0].color);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<'en' | 'pt'>('en');
  const [enableAI, setEnableAI] = useState(true);

  // Apply dark mode to document body for preview
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else if (step === 6) {
      onComplete({ 
        name: name.trim(), 
        themeId,
        themeColor, 
        darkMode, 
        language, 
        fontSize: 'medium', 
        enableAI, 
        showSplash: true,
        aiProvider: 'gemini'
      });
    }
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setThemeId(theme.id);
    setThemeColor(theme.color);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const VisualContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="v1"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-white"
          >
            <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <Feather className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-display font-bold tracking-tight">Folio</h2>
            <p className="text-white/70 mt-4 font-medium tracking-wide uppercase text-sm">Desktop Edition</p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="v2"
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-4"
          >
            {[
              { icon: Command, label: t('onboarding.command_palette', language), shortcut: '⌘ K', desc: "Access everything instantly" },
              { icon: Focus, label: t('onboarding.zen_mode', language), shortcut: '⌘ /', desc: "Distraction-free writing" },
              { icon: Sparkles, label: "AI Metadata", shortcut: '⌘ M', desc: "Auto-generate tags & summaries" },
              { icon: Zap, label: t('onboarding.global_search', language), shortcut: '⌘ F', desc: "Find any note in milliseconds" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] p-5 flex items-center justify-between text-white shadow-lg"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-[0.8rem] bg-white/10 flex items-center justify-center mr-4">
                    <item.icon className="w-5 h-5 opacity-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px]">{item.label}</span>
                    <span className="text-white/60 text-[12px]">{item.desc}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-black/40 rounded-lg text-xs font-mono tracking-widest font-bold shadow-inner border border-white/10">{item.shortcut}</div>
              </motion.div>
            ))}
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="v3"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-6"
          >
            <div className="grid grid-cols-2 gap-4 w-full">
              {[
                { icon: FolderIcon, label: "Folders", color: "#3B82F6" },
                { icon: Hash, label: "Tags", color: "#10B981" },
                { icon: ListTree, label: "TOC", color: "#F59E0B" },
                { icon: Sparkles, label: "AI Meta", color: "#8B5CF6" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-white shadow-lg"
                >
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center mb-3" style={{ backgroundColor: item.color + '30', border: `1px solid ${item.color}50` }}>
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <span className="font-bold text-sm">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="v4"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto"
          >
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center mr-4 border border-yellow-400/30">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{t('onboarding.ai_assistant', language)}</span>
                  <span className="text-white/60 text-sm">{t('onboarding.ai_assistant.powered', language)}</span>
                </div>
              </div>
              <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/10">
                <div className="h-4 w-3/4 bg-white/20 rounded-full animate-pulse"></div>
                <div className="h-4 w-full bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="h-4 w-5/6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-3">
                <span className="text-sm font-medium text-white/80">{t('onboarding.ai_assistant.tags', language)}</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#ideas</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#writing</span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold shadow-sm">#journal</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            key="v5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto"
          >
            <div className="w-full aspect-[4/3] bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col transition-colors duration-150 relative">
              <div className="absolute inset-0 pointer-events-none border-[8px] border-black/5 dark:border-white/5 rounded-2xl z-20"></div>
              <div className="h-12 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2 bg-[var(--bg-secondary)] transition-colors duration-150">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
              </div>
              <div className="flex-1 flex">
                <div className="w-1/3 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 transition-colors duration-150">
                  <div className="h-4 w-1/2 rounded-full mb-6 shadow-sm transition-colors duration-150" style={{ backgroundColor: themeColor }}></div>
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-[var(--border-subtle)] rounded-full transition-colors duration-150"></div>
                    <div className="h-3 w-3/4 bg-[var(--border-subtle)] rounded-full transition-colors duration-150"></div>
                    <div className="h-3 w-5/6 bg-[var(--border-subtle)] rounded-full transition-colors duration-150"></div>
                  </div>
                </div>
                <div className="flex-1 p-8 bg-[var(--bg-primary)] transition-colors duration-150">
                  <div className="h-8 w-3/4 bg-[var(--text-main)] rounded-lg mb-8 opacity-20 transition-colors duration-150"></div>
                  <div className="space-y-4">
                    <div className="h-3 w-full bg-[var(--text-muted)] rounded-full opacity-20 transition-colors duration-150"></div>
                    <div className="h-3 w-5/6 bg-[var(--text-muted)] rounded-full opacity-20 transition-colors duration-150"></div>
                    <div className="h-3 w-full bg-[var(--text-muted)] rounded-full opacity-20 transition-colors duration-150"></div>
                    <div className="h-3 w-4/6 bg-[var(--text-muted)] rounded-full opacity-20 transition-colors duration-150"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            key="v6"
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center justify-center h-full text-white"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-8 shadow-2xl">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-display">{t('onboarding.allset.visual.title', language)}</h2>
            <p className="text-white/70 mt-4 font-medium text-lg">{t('onboarding.allset.visual.desc', language)}</p>
          </motion.div>
        );
      default:
        return null;
    }
  }, [step, themeColor, darkMode, language]);

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-main)] overflow-hidden">
      {/* Left Panel - Content */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-10 md:px-16 lg:px-24 relative z-10">
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
                  {t('onboarding.welcome', language)}
                </div>
                <h1 className="text-5xl font-bold tracking-tight mb-6 font-display leading-tight">{t('onboarding.welcome.title', language)}</h1>
                <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-10">
                  {t('onboarding.welcome.desc', language)}
                </p>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('onboarding.welcome.lang', language)}</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${language === 'en' ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                      style={{ borderColor: language === 'en' ? themeColor : 'transparent' }}
                    >
                      <span className="font-bold text-[18px]">EN</span> 
                      <span className="font-bold text-[14px]">English</span>
                    </button>
                    <button
                      onClick={() => setLanguage('pt')}
                      className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${language === 'pt' ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                      style={{ borderColor: language === 'pt' ? themeColor : 'transparent' }}
                    >
                      <span className="font-bold text-[18px]">PT</span> 
                      <span className="font-bold text-[14px]">Português</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--border-subtle)] shadow-sm">
                  <Keyboard className="w-7 h-7 text-[var(--text-main)]" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-display">{t('onboarding.keyboard.title', language)}</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  {t('onboarding.keyboard.desc', language)}
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--border-subtle)] shadow-sm">
                  <FolderIcon className="w-7 h-7 text-[var(--text-main)]" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-display">Smart Organization</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  Keep your thoughts organized with nested folders, powerful tags, and AI-generated metadata.
                </p>
                
                <div className="space-y-3">
                  {[
                    { icon: FolderIcon, label: "Nested Folders", desc: "Structure your projects deeply" },
                    { icon: Hash, label: "Global Tags", desc: "Connect ideas across folders" },
                    { icon: Sparkles, label: "AI Auto-Tagging", desc: "Folio suggests tags for you" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[var(--text-main)]" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{item.label}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-[var(--border-subtle)] shadow-sm">
                  <Sparkles className="w-7 h-7 text-[var(--text-main)]" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-display">{t('onboarding.magic.title', language)}</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  {t('onboarding.magic.desc', language)}
                </p>
                
                <div 
                  onClick={() => setEnableAI(!enableAI)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${enableAI ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent'}`}
                  style={{ borderColor: enableAI ? themeColor : 'transparent' }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[16px] text-[var(--text-main)]">{t('onboarding.magic.enable', language)}</span>
                    <span className="text-[13px] text-[var(--text-muted)] mt-1">{t('onboarding.magic.later', language)}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${enableAI ? 'bg-green-500 border-green-500' : 'border-[var(--text-faint)]'}`}>
                    {enableAI && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-4xl font-bold tracking-tight mb-4 font-display">{t('onboarding.personalize.title', language)}</h2>
                <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-8">
                  {t('onboarding.personalize.desc', language)}
                </p>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('onboarding.personalize.name', language)}</label>
                    <input 
                      type="text"
                      placeholder={t('onboarding.personalize.name.placeholder', language)}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] rounded-xl px-5 py-4 text-[16px] outline-none focus:ring-2 transition-all text-[var(--text-main)] placeholder:text-[var(--text-faint)] border border-[var(--border-subtle)] shadow-sm"
                      style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('onboarding.personalize.theme', language)}</label>
                    <div className="grid grid-cols-2 gap-3 bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeSelect(theme)}
                          className={`flex flex-col p-3 rounded-xl border-2 transition-all text-left relative overflow-hidden ${themeId === theme.id ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border-transparent'}`}
                          style={themeId === theme.id ? { borderColor: theme.color } : {}}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold text-[12px] ${themeId === theme.id ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{theme.name}</span>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
                          </div>
                          {themeId === theme.id && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-2.5 h-2.5" style={{ color: theme.color }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">{t('onboarding.personalize.appearance', language)}</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${!darkMode ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                        style={{ borderColor: !darkMode ? themeColor : 'transparent' }}
                      >
                        <Sun className={`w-6 h-6 ${!darkMode ? 'text-[var(--text-main)]' : ''}`} /> 
                        <span className="font-bold text-[14px]">{t('onboarding.personalize.light', language)}</span>
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`flex-1 py-4 px-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${darkMode ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'}`}
                        style={{ borderColor: darkMode ? themeColor : 'transparent' }}
                      >
                        <Moon className={`w-6 h-6 ${darkMode ? 'text-[var(--text-main)]' : ''}`} /> 
                        <span className="font-bold text-[14px]">{t('onboarding.personalize.dark', language)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-5xl font-bold tracking-tight mb-6 font-display">{t('onboarding.allset.title', language, { name })}</h2>
                <p className="text-xl text-[var(--text-muted)] leading-relaxed mb-12">
                  {t('onboarding.allset.desc', language)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pb-12 pt-8 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-6">
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-10' : 'w-2 opacity-30'}`}
                  style={{ backgroundColor: step === i ? themeColor : 'var(--text-muted)' }}
                />
              ))}
            </div>
            
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('onboarding.back', language)}
              </button>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={step === 5 && !name.trim()}
            className="px-8 py-3.5 rounded-xl text-white font-bold shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-[15px]"
            style={{ backgroundColor: themeColor }}
          >
            {step === 5 ? t('onboarding.enter', language) : t('onboarding.continue', language)}
            {step !== 5 && <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />}
          </motion.button>
        </div>
      </div>

      {/* Right Panel - Visuals */}
      <div 
        className="hidden md:block w-1/2 h-full relative overflow-hidden transition-colors duration-150 shadow-2xl"
        style={{ backgroundColor: themeColor }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl -ml-64 -mb-64"></div>
        
        <div className="relative z-10 h-full w-full p-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {VisualContent}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
