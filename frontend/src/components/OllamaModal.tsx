import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Terminal, Cpu, Flame } from 'lucide-react';
import { api } from '../services/api';

interface OllamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointSaved: () => void;
  currentModel: string;
  currentBaseUrl: string;
  isReachable: boolean;
  statusMessage?: string | null;
}

export const OllamaModal: React.FC<OllamaModalProps> = ({
  isOpen,
  onClose,
  onEndpointSaved,
  currentModel,
  currentBaseUrl,
  isReachable,
  statusMessage,
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState(currentBaseUrl || 'http://localhost:11434');
  const [modelInput, setModelInput] = useState(currentModel || 'gemma4:e4b');
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBaseUrlInput(currentBaseUrl || 'http://localhost:11434');
      setModelInput(currentModel || 'gemma4:e4b');
      setStatusMsg(null);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentBaseUrl, currentModel, onClose]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMsg(null);

    try {
      const res = await api.testOllama();
      if (res.success) {
        setStatusMsg({
          success: true,
          message: `Live local Gemma 4 round-trip verified on model "${res.model}". Response: "${res.response}"`,
        });
      } else {
        setStatusMsg({
          success: false,
          message: res.error || 'Connection failed to respond.',
        });
      }
    } catch (err: any) {
      setStatusMsg({
        success: false,
        message: err.message || 'Error communicating with local Ollama runtime.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatusMsg(null);

    try {
      const res = await api.updateEndpoint(baseUrlInput.trim(), modelInput.trim());
      if (res.success) {
        setStatusMsg({ success: true, message: `Local endpoint successfully updated and verified.` });
        onEndpointSaved();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMsg({
          success: false,
          message: res.details?.error || 'Updated endpoint could not be verified.',
        });
      }
    } catch (err: any) {
      setStatusMsg({ success: false, message: err.message || 'Update failed.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090D]/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl border border-[#7C3AED]/30 bg-[#12121A] p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#7C3AED]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-[#7C3AED]/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C3AED]/30 to-[#6EE7B7]/20 border border-[#7C3AED]/40 text-[#6EE7B7]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-[#F4F0FA]">
                Local Ollama & Gemma 4 Engine
              </h3>
              <p className="text-xs font-sans text-[#9693A7]">
                On-device privacy-first AI command channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#9693A7] hover:bg-[#1A1A28] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="relative z-10 mt-5 space-y-4">
          <div>
            <label className="text-[11px] font-display font-semibold uppercase tracking-wider text-[#9693A7] block mb-1">
              Ollama Daemon URL:
            </label>
            <input
              type="text"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full rounded-xl border border-[#7C3AED]/25 bg-[#09090D]/90 p-3 font-mono text-xs text-[#F4F0FA] placeholder-[#9693A7]/50 focus:border-[#FF7518] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-display font-semibold uppercase tracking-wider text-[#9693A7] block mb-1">
              Target Model Identifier:
            </label>
            <input
              type="text"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="gemma4:e4b"
              className="w-full rounded-xl border border-[#7C3AED]/25 bg-[#09090D]/90 p-3 font-mono text-xs text-[#F4F0FA] placeholder-[#9693A7]/50 focus:border-[#FF7518] focus:outline-none"
            />
          </div>

          {/* Current Live Status Card */}
          <div className="rounded-xl bg-[#09090D]/90 border border-[#7C3AED]/20 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#9693A7] font-sans">Daemon Link Status:</span>
              <span
                className={`font-display font-bold flex items-center space-x-1.5 ${
                  isReachable ? 'text-[#6EE7B7]' : 'text-[#F87171]'
                }`}
              >
                {isReachable ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Spectral Link Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Daemon Unreachable</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#9693A7] font-sans">Active Local Model:</span>
              <span className="font-mono text-[#A78BFA] font-semibold">{currentModel}</span>
            </div>

            {statusMessage && !isReachable && (
              <p className="text-[11px] font-sans text-[#F87171] pt-1.5 border-t border-white/5">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Status Message from Testing */}
          {statusMsg && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-start space-x-2 ${
                statusMsg.success
                  ? 'border-[#6EE7B7]/30 bg-[#101D1A] text-[#6EE7B7]'
                  : 'border-[#F87171]/30 bg-[#1F1218] text-[#F87171]'
              }`}
            >
              {statusMsg.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#6EE7B7]" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#F87171]" />
              )}
              <span className="break-all font-sans leading-relaxed">{statusMsg.message}</span>
            </div>
          )}

          {/* Command Prompt Hint */}
          <div className="rounded-xl bg-[#14141F] p-3 border border-white/5 flex items-center space-x-2.5 text-[11px] text-[#9693A7]">
            <Terminal className="h-4 w-4 text-[#FF7518] shrink-0" />
            <span>To start Ollama locally, run in your terminal: <code className="text-[#F4F0FA] font-mono bg-[#09090D] px-1.5 py-0.5 rounded">ollama serve</code></span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="text-xs font-display font-medium text-[#A78BFA] hover:text-[#FF7518] underline flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`h-3 w-3 ${testing ? 'animate-spin' : ''}`} />
              <span>Test Live Round-Trip</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-3.5 py-1.5 text-xs font-display font-medium text-[#9693A7] hover:bg-[#1A1A28] hover:text-white transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={testing}
                className="btn-pumpkin-glow flex items-center space-x-1.5 rounded-xl px-4 py-1.5 text-xs font-display font-bold text-white transition active:scale-95 disabled:opacity-50"
              >
                <span>Save Endpoint</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
