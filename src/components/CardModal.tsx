"use client";

import React, { useState, useEffect } from "react";
import { CardItem } from "@/lib/d1";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: Partial<CardItem>) => Promise<void>;
  initialData?: CardItem | null;
}

const CATEGORIES = ["产品想法", "技术架构", "设计灵感", "生活随笔", "读书笔记", "商业模式"];
const COLOR_OPTIONS = [
  { label: "Classic", value: "blue", hex: "#1e3a8a" },
  { label: "Emerald", value: "emerald", hex: "#065f46" },
  { label: "Amber", value: "amber", hex: "#92400e" },
  { label: "Purple", value: "purple", hex: "#6b21a8" },
  { label: "Rose", value: "rose", hex: "#9f1239" },
  { label: "Cyan", value: "cyan", hex: "#155e75" },
];

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("产品想法");
  const [tagsInput, setTagsInput] = useState("");
  const [color, setColor] = useState("blue");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCategory(initialData.category || "产品想法");
      setTagsInput(initialData.tags?.join(", ") || "");
      setColor(initialData.color || "blue");
      setAuthor(initialData.author || "");
    } else {
      setTitle("");
      setContent("");
      setCategory("产品想法");
      setTagsInput("");
      setColor("blue");
      setAuthor("");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("错误：灵感标题和具体内容不可为空。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsedTags = tagsInput
        .split(/[,，\s]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await onSubmit({
        id: initialData?.id,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: parsedTags,
        color,
        author: author.trim() || "匿名创作者",
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "提交失败，请检查网络设置。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Modal Dialog Window */}
      <div className="win-outset-deep w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-100">
        {/* Win32 Window Titlebar */}
        <div className="win-titlebar">
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <span>📝</span>
            <span>{initialData ? "编辑卡片属性 - Card Editor" : "新建灵感便签 - New Idea.exe"}</span>
          </div>
          <button
            onClick={onClose}
            className="win-titlebar-btn hover:bg-red-600 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>

        {/* Menu Bar */}
        <div className="px-3 py-1 flex items-center gap-4 text-xs border-b border-[var(--win-surface-dark)] text-black dark:text-white font-medium select-none">
          <span className="cursor-pointer hover:underline"><u>F</u>ile</span>
          <span className="cursor-pointer hover:underline"><u>E</u>dit</span>
          <span className="cursor-pointer hover:underline"><u>V</u>iew</span>
          <span className="cursor-pointer hover:underline"><u>H</u>elp</span>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-black dark:text-white">
          {error && (
            <div className="win-inset bg-red-100 dark:bg-red-950 p-2 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-bold">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold mb-1">
              <u>T</u>itle / 灵感标题 *:
            </label>
            <input
              type="text"
              required
              placeholder="请输入灵感主题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="win-inset w-full px-2.5 py-1.5 text-xs focus:outline-none placeholder-slate-500 font-sans"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold mb-1">
              <u>D</u>escription / 灵感详细内容 *:
            </label>
            <textarea
              required
              rows={4}
              placeholder="记录你的灵感思路、技术细节或产品原型..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="win-inset w-full px-2.5 py-1.5 text-xs focus:outline-none font-sans placeholder-slate-500 leading-relaxed"
            />
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">
                <u>C</u>ategory / 分类:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="win-inset w-full px-2 py-1.5 text-xs focus:outline-none cursor-pointer font-sans"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                <u>A</u>uthor / 作者名:
              </label>
              <input
                type="text"
                placeholder="匿名创作者"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="win-inset w-full px-2.5 py-1.5 text-xs focus:outline-none placeholder-slate-500 font-sans"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold mb-1">
              <u>T</u>ags / 标签 (以空格或逗号分隔):
            </label>
            <input
              type="text"
              placeholder="Nextjs, Cloudflare, Retro, Win32"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="win-inset w-full px-2.5 py-1.5 text-xs focus:outline-none placeholder-slate-500 font-sans"
            />
          </div>

          {/* Color Palette Choice */}
          <div>
            <label className="block text-xs font-bold mb-1">
              <u>P</u>alette / 窗口配色主题:
            </label>
            <div className="flex items-center gap-2.5 pt-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 border-2 ${
                    color === c.value
                      ? "border-black dark:border-white scale-110 shadow"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--win-surface-dark)]">
            <button
              type="submit"
              disabled={loading}
              className="win-btn px-4 py-1.5 text-xs min-w-[80px] font-bold text-black dark:text-white"
            >
              {loading ? "保存中..." : initialData ? "确定 (OK)" : "保存 (Save)"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="win-btn px-4 py-1.5 text-xs min-w-[80px] text-black dark:text-white"
            >
              取消 (Cancel)
            </button>
          </div>
        </form>

        {/* Status Bar */}
        <div className="px-3 py-1 win-inset-shallow text-xs text-black dark:text-white font-medium flex justify-between">
          <span>Ready</span>
          <span className="font-mono">UTF-8 / D1 Connected</span>
        </div>
      </div>
    </div>
  );
};
