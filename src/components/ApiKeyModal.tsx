import React, { useEffect, useState } from 'react';
import { X, Key, ShieldCheck, Check, Info, ExternalLink, AlertTriangle } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/geminiApi';
import { isValidApiKeyFormat } from '../utils/validation';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setKeyInput(getStoredApiKey());
    setErrorMessage(null);
    setSavedSuccess(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = keyInput.trim();
    if (trimmed && !isValidApiKeyFormat(trimmed)) {
      setErrorMessage('Invalid API key format. Key should be 20–80 alphanumeric characters (e.g. starting with AIzaSy...).');
      return;
    }

    const success = saveApiKey(trimmed);
    if (!success && trimmed) {
      setErrorMessage('Could not store key. Please check your browser settings.');
      return;
    }

    onKeySaved(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    saveApiKey('');
    setKeyInput('');
    setErrorMessage(null);
    onKeySaved('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 id="api-key-modal-title" className="font-bold text-sm text-slate-900">Google Gemini API Configuration</h3>
              <p className="text-[11px] text-slate-500">Connect for live AI-powered responses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Offline Intelligence Ready</span>
            </div>
            <p>
              Planora works <strong>100% out-of-the-box</strong> using our algorithmic heuristic engine even without an API key!
            </p>
            <p className="text-slate-600">
              Adding a Gemini API key unlocks unconstrained real-time responses and live conversational reasoning with <code>gemini-2.0-flash</code>.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {keyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear Key
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Stored in your browser. When you use live Gemini features, the key and request are sent directly to Google.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
