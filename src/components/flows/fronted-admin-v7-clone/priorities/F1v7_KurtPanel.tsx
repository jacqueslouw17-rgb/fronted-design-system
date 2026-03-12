/**
 * F1v7 Kurt Panel — Glassmorphism-styled AI assistant panel for Flow 1 v7 Future
 * Opens from the right side when actions are triggered from Priorities.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, Square, Check, XIcon, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import AudioWaveVisualizer from "@/components/AudioWaveVisualizer";

interface KurtMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface F1v7_KurtPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-seeded messages to display (e.g. from action triggers) */
  messages: KurtMessage[];
  onAddMessage: (msg: KurtMessage) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  /** Called when user clicks an action button (yes/no/other) */
  onActionResponse?: (action: "yes" | "no" | "other", message?: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kurt-chat`;

const makeChatId = () =>
  `kurt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const F1v7_KurtPanel: React.FC<F1v7_KurtPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onAddMessage,
  isLoading = false,
  isStreaming: externalStreaming = false,
  onActionResponse,
}) => {
  const [input, setInput] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalStreaming, setInternalStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [panelReady, setPanelReady] = useState(false);
  const [actionChoice, setActionChoice] = useState<"none" | "yes" | "no" | "other">("none");
  const [otherText, setOtherText] = useState("");
  const otherInputRef = useRef<HTMLTextAreaElement>(null);

  const streaming = externalStreaming || internalStreaming;
  const loading = isLoading || internalLoading;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => {
    if (panelReady) adjustHeight();
  }, [input, panelReady, adjustHeight]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setInternalStreaming(false);
    setInternalLoading(false);
  };

  const handleSubmit = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const userMsg: KurtMessage = { id: makeChatId(), role: "user", content: trimmed };
    onAddMessage(userMsg);
    setInput("");
    setInternalLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("AI service error");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantId = makeChatId();
      const assistantMsg: KurtMessage = { id: assistantId, role: "assistant", content: "" };
      onAddMessage(assistantMsg);
      setInternalStreaming(true);

      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimLine = line.trim();
          if (!trimLine || trimLine.startsWith(":")) continue;
          if (!trimLine.startsWith("data: ")) continue;
          const jsonStr = trimLine.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              // Update message in place
              onAddMessage({ ...assistantMsg, content });
            }
          } catch {
            // incomplete JSON
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      onAddMessage({
        id: makeChatId(),
        role: "assistant",
        content: "Sorry, I had trouble processing that. Please try again.",
      });
    } finally {
      setInternalLoading(false);
      setInternalStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const accent = "hsl(172 28% 42%)";

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 420 : 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      onAnimationComplete={() => {
        if (isOpen) setPanelReady(true);
        else setPanelReady(false);
      }}
      className={cn(
        "sticky top-0 h-screen flex-shrink-0 overflow-hidden z-[60]",
        !isOpen && "pointer-events-none"
      )}
    >
      <div className="w-[420px] h-full flex flex-col"
        style={{
          background: "linear-gradient(180deg, hsl(172 20% 98% / 0.92), hsl(200 15% 96% / 0.88))",
          backdropFilter: "blur(60px) saturate(1.8)",
          borderLeft: "1px solid hsl(0 0% 100% / 0.5)",
          boxShadow: "-8px 0 30px hsl(210 15% 10% / 0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid hsl(0 0% 100% / 0.4)",
            background: "linear-gradient(180deg, hsl(172 15% 97% / 0.6), transparent)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span
              className="text-sm font-semibold tracking-[0.04em]"
              style={{ color: "hsl(210 8% 15%)" }}
            >
              Kurt
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all duration-300"
            style={{
              background: "hsl(0 0% 100% / 0.4)",
              border: "1px solid hsl(0 0% 100% / 0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(0 0% 100% / 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(0 0% 100% / 0.4)";
            }}
          >
            <X className="h-3.5 w-3.5" style={{ color: "hsl(210 8% 40%)" }} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <AudioWaveVisualizer isActive={false} />
                <p
                  className="text-[13px] text-center"
                  style={{ color: "hsl(210 8% 50%)" }}
                >
                  Ask about payroll, workers, or anything else.
                </p>
              </div>
            ) : (
              messages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className="max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                      style={{
                        background: "linear-gradient(135deg, hsl(172 28% 42% / 0.08), hsl(172 20% 50% / 0.04))",
                        border: "1px solid hsl(172 28% 42% / 0.12)",
                        color: "hsl(210 8% 15%)",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : msg.content ? (
                  <div key={msg.id} className="flex justify-start">
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "max-w-[92%] rounded-2xl px-4 py-3",
                        "text-[13px] leading-relaxed",
                        // Markdown styling
                        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
                        "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2",
                        "[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5",
                        "[&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc [&_ul]:space-y-1",
                        "[&_ol]:my-2 [&_ol]:pl-4 [&_ol]:list-decimal [&_ol]:space-y-1",
                        "[&_li]:my-0 [&_li]:leading-relaxed",
                        "[&_strong]:font-semibold",
                        "[&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
                        "[&_hr]:my-3",
                        "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:my-2",
                      )}
                      style={{
                        background: "linear-gradient(155deg, hsl(0 0% 100% / 0.65), hsl(0 0% 100% / 0.35))",
                        backdropFilter: "blur(30px) saturate(1.4)",
                        border: "1px solid hsl(0 0% 100% / 0.5)",
                        boxShadow: "inset 0 1px 0 hsl(0 0% 100% / 0.6), 0 2px 8px hsl(210 8% 50% / 0.06)",
                        color: "hsl(210 8% 15%)",
                      }}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {streaming && msg === messages[messages.length - 1] && (
                        <span
                          className="inline-block w-1.5 h-3.5 animate-pulse ml-0.5 rounded-sm"
                          style={{ backgroundColor: accent }}
                        />
                      )}
                    </motion.div>
                  </div>
                ) : null
              )
            )}

            {/* Action buttons after auto-approval question */}
            {!loading && !streaming && messages.length > 0 &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content?.includes("proceed with auto-approval") &&
              actionChoice === "none" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-2 mt-1"
              >
                {[
                  { key: "yes" as const, label: "Yes, approve", icon: <Check className="h-3.5 w-3.5" /> },
                  { key: "no" as const, label: "No", icon: <XIcon className="h-3.5 w-3.5" /> },
                  { key: "other" as const, label: "Other", icon: <MessageSquare className="h-3.5 w-3.5" /> },
                ].map((btn, i) => (
                  <motion.button
                    key={btn.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    onClick={() => {
                      setActionChoice(btn.key);
                      if (btn.key === "yes") {
                        onAddMessage({ id: `kurt-action-${Date.now()}`, role: "user", content: "Yes, proceed with auto-approval for the 10 compliant workers." });
                        onActionResponse?.("yes");
                      } else if (btn.key === "no") {
                        onAddMessage({ id: `kurt-action-${Date.now()}`, role: "user", content: "No, I'll review them manually." });
                        onActionResponse?.("no");
                      } else {
                        setTimeout(() => otherInputRef.current?.focus(), 100);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium transition-all duration-300"
                    style={{
                      background: btn.key === "yes"
                        ? "linear-gradient(135deg, hsl(172 28% 42% / 0.12), hsl(172 28% 42% / 0.06))"
                        : "hsl(0 0% 100% / 0.5)",
                      border: btn.key === "yes"
                        ? "1px solid hsl(172 28% 42% / 0.25)"
                        : "1px solid hsl(0 0% 100% / 0.6)",
                      color: btn.key === "yes" ? accent : "hsl(210 8% 30%)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px hsl(172 28% 42% / 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {btn.icon}
                    {btn.label}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* "Other" text field */}
            {actionChoice === "other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-2"
              >
                <div
                  className="rounded-2xl p-3 space-y-2.5"
                  style={{
                    background: "hsl(0 0% 100% / 0.5)",
                    border: "1px solid hsl(172 28% 42% / 0.15)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <textarea
                    ref={otherInputRef}
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder="Tell Kurt what you'd like instead..."
                    rows={2}
                    className="w-full bg-transparent text-[13px] resize-none outline-none leading-relaxed"
                    style={{ color: "hsl(210 8% 15%)", caretColor: accent }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && otherText.trim()) {
                        e.preventDefault();
                        onAddMessage({ id: `kurt-action-${Date.now()}`, role: "user", content: otherText.trim() });
                        setOtherText("");
                        setActionChoice("none");
                      }
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setActionChoice("none"); setOtherText(""); }}
                      className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                      style={{ color: "hsl(210 8% 50%)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (otherText.trim()) {
                          onAddMessage({ id: `kurt-action-${Date.now()}`, role: "user", content: otherText.trim() });
                          setOtherText("");
                          setActionChoice("none");
                        }
                      }}
                      disabled={!otherText.trim()}
                      className="text-[11px] font-medium px-3 py-1 rounded-lg transition-all duration-300"
                      style={{
                        background: otherText.trim()
                          ? "linear-gradient(135deg, hsl(172 28% 42%), hsl(172 28% 35%))"
                          : "hsl(0 0% 90%)",
                        color: otherText.trim() ? "white" : "hsl(210 8% 60%)",
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {loading && !messages.some((m) => m.role === "assistant" && streaming) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2.5"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="text-[11px] font-medium" style={{ color: "hsl(210 8% 55%)" }}>
                    Analyzing payroll data...
                  </span>
                </motion.div>

                <div className="space-y-2.5">
                  {[
                    { width: "90%", delay: 0.15 },
                    { width: "75%", delay: 0.25 },
                    { width: "82%", delay: 0.35 },
                    { width: "60%", delay: 0.45 },
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay, duration: 0.3 }}
                    >
                      <div
                        className="h-3 rounded-full skeleton-shimmer"
                        style={{ width: line.width }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.4)" }}>
          <div
            className={cn(
              "relative flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
            )}
            style={{
              background: "hsl(0 0% 100% / 0.45)",
              border: input.trim()
                ? "1px solid hsl(172 28% 42% / 0.25)"
                : "1px solid hsl(0 0% 100% / 0.6)",
              backdropFilter: "blur(20px)",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Kurt anything..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[160px] leading-relaxed"
              style={{
                color: "hsl(210 8% 15%)",
                caretColor: accent,
              }}
              disabled={loading && !streaming}
            />

            {streaming ? (
              <button
                onClick={stopStreaming}
                className="shrink-0 p-2 rounded-xl transition-colors"
                style={{
                  background: "hsl(0 0% 90%)",
                  color: "hsl(210 8% 30%)",
                }}
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || loading}
                className="shrink-0 p-2 rounded-xl transition-all duration-300"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, hsl(172 28% 42%), hsl(172 28% 35%))"
                    : "hsl(0 0% 90%)",
                  color: input.trim() ? "white" : "hsl(210 8% 60%)",
                  boxShadow: input.trim()
                    ? "0 2px 8px hsl(172 28% 42% / 0.3)"
                    : "none",
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
