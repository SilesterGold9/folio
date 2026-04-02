import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Palette, Moon, Info, Check, Type, Globe, Download, Upload, Trash2, Database, Github, Linkedin, MessageSquare, Bug, Instagram, Sparkles, RefreshCw, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { UserPreferences } from '../types';
import { THEMES } from '../constants';
import { t } from '../i18n';
import { Modal } from './Modal';

type SettingsTab = 'general' | 'appearance' | 'ai' | 'data' | 'about';

import { useFolio } from '../context/FolioContext';

export const Settings = ({ 
  onBack,
}: { 
  onBack: () => void,
}) => {
  const {
    prefs,
    savePrefs,
    replayOnboarding,
    handleExport: onExport,
    handleImport: onImport,
    handleDeleteAll: onDeleteAll
  } = useFolio();

  if (!prefs) return null;

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [name, setName] = useState(prefs.name);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<'feature' | 'bug' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const lang = prefs.language;

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    alert(t('settings.feedback.success', lang));
    setFeedbackModalOpen(null);
    setFeedbackText('');
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    savePrefs({ 
      ...prefs, 
      themeId: theme.id, 
      themeColor: theme.color 
    });
  };

  const tabs = [
    { id: 'general', icon: SettingsIcon, label: t('settings.profile', lang) },
    { id: 'appearance', icon: Palette, label: t('settings.appearance', lang) },
    { id: 'ai', icon: Sparkles, label: t('settings.magic', lang) },
    { id: 'data', icon: Database, label: t('settings.data', lang) },
    { id: 'about', icon: Info, label: t('settings.about', lang) },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Delete All Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        title={t('settings.delete_all.title', lang)}
        actions={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-xl font-medium text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors">{t('settings.cancel', lang)}</button>
            <button onClick={() => { setDeleteModalOpen(false); onDeleteAll(); }} className="px-5 py-2 rounded-xl font-medium text-white shadow-md transition-transform active:scale-95 bg-red-500">{t('settings.delete_all.confirm', lang)}</button>
          </>
        }
      >
        <p className="text-[14px] text-[var(--text-muted)]">{t('settings.delete_all.desc', lang)}</p>
      </Modal>

      {/* Feedback Modal */}
      <Modal 
        isOpen={feedbackModalOpen !== null} 
        onClose={() => setFeedbackModalOpen(null)}
        title={feedbackModalOpen === 'feature' ? t('settings.feature_request', lang) : t('settings.report_bug', lang)}
        actions={
          <>
            <button onClick={() => setFeedbackModalOpen(null)} className="px-4 py-2 rounded-xl font-medium text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors">{t('settings.cancel', lang)}</button>
            <button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim()} className="px-5 py-2 rounded-xl font-medium text-white shadow-md transition-transform active:scale-95 disabled:opacity-50" style={{ backgroundColor: prefs.themeColor }}>{t('settings.submit', lang)}</button>
          </>
        }
      >
        <p className="text-[13px] text-[var(--text-muted)] mb-4">{feedbackModalOpen === 'feature' ? t('settings.feature_request.desc', lang) : t('settings.report_bug.desc', lang)}</p>
        <textarea 
          className="w-full bg-[var(--bg-secondary)] rounded-xl p-3 text-[14px] text-[var(--text-main)] outline-none focus:ring-2 resize-none h-32 border border-[var(--border-subtle)]"
          style={{ '--tw-ring-color': prefs.themeColor } as React.CSSProperties}
          placeholder="..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-primary)]/90 backdrop-blur-xl z-10 sticky top-0 border-b border-[var(--border-subtle)]">
        <button onClick={onBack} className="flex items-center text-[14px] active:opacity-70 transition-opacity p-1.5 pr-3 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)]">
          <ChevronLeft className="w-5 h-5 mr-1" strokeWidth={2} />
          <span className="font-medium">{t('settings.back', lang)}</span>
        </button>
        <h2 className="font-bold text-[18px] text-[var(--text-main)] font-display">{t('settings.title', lang)}</h2>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-colors text-[14px] font-medium ${activeTab === tab.id ? 'bg-[var(--bg-card)] shadow-sm border border-[var(--border-subtle)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] border border-transparent'}`}
              >
                <tab.icon className="w-4 h-4 mr-3" style={activeTab === tab.id ? { color: prefs.themeColor } : {}} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-primary)]">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {activeTab === 'general' && (
                  <>
                    <section>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.profile', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.name', lang)}</span>
                          <input 
                            type="text" 
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              savePrefs({ ...prefs, name: e.target.value });
                            }}
                            className="text-right text-[var(--text-muted)] outline-none text-[14px] bg-transparent w-1/2 focus:text-[var(--text-main)] transition-colors"
                          />
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.language', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.language.label', lang)}</span>
                          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-subtle)]">
                            <button
                              onClick={() => savePrefs({ ...prefs, language: 'en' })}
                              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${prefs.language === 'en' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-main)]' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'}`}
                            >
                              EN
                            </button>
                            <button
                              onClick={() => savePrefs({ ...prefs, language: 'pt' })}
                              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${prefs.language === 'pt' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-main)]' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'}`}
                            >
                              PT
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === 'appearance' && (
                  <>
                    <section>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.appearance', lang)}</h3>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {THEMES.map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme)}
                            className={`flex flex-col p-4 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${prefs.themeId === theme.id ? 'bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border-transparent'}`}
                            style={prefs.themeId === theme.id ? { borderColor: theme.color } : {}}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-bold text-[14px] font-display ${prefs.themeId === theme.id ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{theme.name}</span>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }} />
                            </div>
                            <p className="text-[11px] text-[var(--text-faint)] leading-tight">{theme.description}</p>
                            {prefs.themeId === theme.id && (
                              <div className="absolute top-2 right-2">
                                <Check className="w-3 h-3" style={{ color: theme.color }} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.dark_mode', lang)}</span>
                            <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('onboarding.personalize.dark', lang)}</span>
                          </div>
                          <button 
                            onClick={() => savePrefs({ ...prefs, darkMode: !prefs.darkMode })}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${prefs.darkMode ? 'bg-green-500' : 'bg-[var(--border-subtle)]'}`}
                          >
                            <motion.div 
                              layout
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                              initial={false}
                              animate={{ x: prefs.darkMode ? 20 : 0 }}
                            />
                          </button>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.show_splash', lang)}</span>
                            <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('settings.show_splash.desc', lang)}</span>
                          </div>
                          <button 
                            onClick={() => savePrefs({ ...prefs, showSplash: !prefs.showSplash })}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${prefs.showSplash ? 'bg-green-500' : 'bg-[var(--border-subtle)]'}`}
                          >
                            <motion.div 
                              layout
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                              initial={false}
                              animate={{ x: prefs.showSplash ? 20 : 0 }}
                            />
                          </button>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.typography', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.font_size', lang)}</span>
                          <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-subtle)]">
                            {['small', 'medium', 'large'].map(size => (
                              <button
                                key={size}
                                onClick={() => savePrefs({ ...prefs, fontSize: size as any })}
                                className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${prefs.fontSize === size ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-main)]' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'}`}
                              >
                                {t(`settings.font_size.${size}`, lang)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {activeTab === 'ai' && (
                  <section>
                    <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.magic', lang)}</h3>
                    <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                      <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.magic.toggle', lang)}</span>
                          <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('settings.magic.desc', lang)}</span>
                        </div>
                        <button 
                          onClick={() => savePrefs({ ...prefs, enableAI: !prefs.enableAI })}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${prefs.enableAI ? 'bg-green-500' : 'bg-[var(--border-subtle)]'}`}
                        >
                          <motion.div 
                            layout
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            initial={false}
                            animate={{ x: prefs.enableAI ? 20 : 0 }}
                          />
                        </button>
                      </div>
                      
                      {prefs.enableAI && (
                        <div className="px-5 py-4 flex flex-col bg-[var(--bg-primary)] space-y-4">
                          <div className="space-y-2">
                            <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 font-display">{t('settings.ai.provider', lang)}</span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => savePrefs({ ...prefs, aiProvider: 'gemini' })}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${prefs.aiProvider === 'gemini' ? 'bg-[var(--bg-secondary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)]'}`}
                                style={prefs.aiProvider === 'gemini' ? { borderColor: prefs.themeColor } : {}}
                              >
                                <span className={`text-[13px] font-bold font-display ${prefs.aiProvider === 'gemini' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{t('settings.ai.gemini', lang)}</span>
                              </button>
                              <button
                                onClick={() => savePrefs({ ...prefs, aiProvider: 'openai' })}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${prefs.aiProvider === 'openai' ? 'bg-[var(--bg-secondary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-[var(--bg-secondary)]'}`}
                                style={prefs.aiProvider === 'openai' ? { borderColor: prefs.themeColor } : {}}
                              >
                                <span className={`text-[13px] font-bold font-display ${prefs.aiProvider === 'openai' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{t('settings.ai.openai', lang)}</span>
                              </button>
                            </div>
                          </div>

                          {prefs.aiProvider === 'gemini' ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.api_key', lang)}</span>
                                <a 
                                  href="https://aistudio.google.com/app/apikey" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[12px] font-medium text-blue-500 hover:underline"
                                >
                                  {t('settings.ai.get_key', lang)}
                                </a>
                              </div>
                              <input 
                                type="password" 
                                placeholder={t('settings.api_key.placeholder', lang)}
                                value={prefs.geminiApiKey || ''}
                                onChange={(e) => savePrefs({ ...prefs, geminiApiKey: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 transition-all text-[var(--text-main)] placeholder:text-[var(--text-faint)] border border-[var(--border-subtle)]"
                                style={{ '--tw-ring-color': prefs.themeColor } as React.CSSProperties}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.ai.openai.key', lang)}</span>
                                <a 
                                  href="https://platform.openai.com/api-keys" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[12px] font-medium text-blue-500 hover:underline"
                                >
                                  {t('settings.ai.get_key', lang)}
                                </a>
                              </div>
                              <input 
                                type="password" 
                                placeholder={t('settings.ai.openai.placeholder', lang)}
                                value={prefs.openaiApiKey || ''}
                                onChange={(e) => savePrefs({ ...prefs, openaiApiKey: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 transition-all text-[var(--text-main)] placeholder:text-[var(--text-faint)] border border-[var(--border-subtle)]"
                                style={{ '--tw-ring-color': prefs.themeColor } as React.CSSProperties}
                              />
                            </div>
                          )}

                          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[12px] text-amber-800 dark:text-amber-200 leading-relaxed">
                              <strong className="font-display">{t('settings.ai.security_note', lang)}:</strong> {t('settings.ai.security_note.desc', lang)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {activeTab === 'data' && (
                  <section className="space-y-6">
                    <div>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.data', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)]">
                        <button 
                          onClick={onExport}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.export', lang)}</span>
                            <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('settings.data.export.desc', lang)}</span>
                          </div>
                          <Download className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-muted)]" />
                        </button>
                        <label className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors cursor-pointer group">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.import', lang)}</span>
                            <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('settings.data.import.desc', lang)}</span>
                          </div>
                          <Upload className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-muted)]" />
                          <input type="file" accept=".json" className="hidden" onChange={onImport} />
                        </label>
                        <button 
                          onClick={() => setDeleteModalOpen(true)}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-red-500">{t('settings.delete_all', lang)}</span>
                            <span className="text-[12px] text-[var(--text-faint)] mt-0.5">{t('settings.data.delete.desc', lang)}</span>
                          </div>
                          <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'about' && (
                  <section className="space-y-6">
                    <div className="flex flex-col items-center text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 shadow-sm">
                        <span className="text-2xl font-bold font-display" style={{ color: prefs.themeColor }}>F</span>
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-main)] font-display">Folio</h2>
                      <p className="text-[13px] text-[var(--text-faint)] mt-1">{t('settings.about.tagline', lang)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">v1.2.0</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-600 uppercase tracking-wider">{t('settings.about.latest', lang)}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.feedback', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)]">
                        <button 
                          onClick={() => setFeedbackModalOpen('feature')}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.feature_request', lang)}</span>
                          <MessageSquare className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-muted)]" />
                        </button>
                        <button 
                          onClick={() => setFeedbackModalOpen('bug')}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.report_bug', lang)}</span>
                          <Bug className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-muted)]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 font-display">{t('settings.about', lang)}</h3>
                      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)]">
                        <div className="w-full text-left px-5 py-4 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.developer', lang)}</span>
                          <span className="text-[13px] text-[var(--text-muted)] font-medium">Silvestre Dourado</span>
                        </div>
                        <a 
                          href="https://github.com/SilesterGold9" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.github', lang)}</span>
                          <Github className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                        </a>
                        <a 
                          href="https://www.linkedin.com/in/silvestre-dourado-b45425307/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.linkedin', lang)}</span>
                          <Linkedin className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                        </a>
                        <a 
                          href="https://instagram.com/silvestre_dourado16" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.instagram', lang)}</span>
                          <Instagram className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                        </a>
                        <button 
                          onClick={replayOnboarding}
                          className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-primary)] transition-colors group"
                        >
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.about.replay_onboarding', lang)}</span>
                          <RefreshCw className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-muted)]" />
                        </button>
                        <div className="w-full text-left px-5 py-4 flex items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--text-main)]">{t('settings.version', lang)}</span>
                          <span className="text-[13px] text-[var(--text-faint)] font-mono">1.2.0</span>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
