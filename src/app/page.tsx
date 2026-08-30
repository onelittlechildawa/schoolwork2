"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { CardItem } from "@/lib/d1";
import { IdeaCard } from "@/components/IdeaCard";
import { CardModal } from "@/components/CardModal";

const CATEGORIES = ["全部", "产品想法", "技术架构", "设计灵感", "生活随笔", "读书笔记", "商业模式"];

export default function InspirationWall() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);

  // Local likes tracking
  const [likedCardIds, setLikedCardIds] = useState<Set<string>>(new Set());

  // Clock in taskbar
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme
  useEffect(() => {
    const isDark = localStorage.getItem("win32_theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("win32_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("win32_theme", "light");
      }
      return next;
    });
  };

  // Load liked cards from localStorage
  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem("wall_liked_cards");
      if (storedLikes) {
        setLikedCardIds(new Set(JSON.parse(storedLikes)));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "全部") {
        params.append("category", activeCategory);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      params.append("sort", sortBy);

      const res = await fetch(`/api/cards?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCards(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Handle Like / Unlike
  const handleLike = async (id: string) => {
    const isCurrentlyLiked = likedCardIds.has(id);
    const action = isCurrentlyLiked ? "unlike" : "like";

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            likes: isCurrentlyLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
          };
        }
        return c;
      })
    );

    const nextLiked = new Set(likedCardIds);
    if (isCurrentlyLiked) {
      nextLiked.delete(id);
    } else {
      nextLiked.add(id);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
    setLikedCardIds(nextLiked);
    localStorage.setItem("wall_liked_cards", JSON.stringify(Array.from(nextLiked)));

    try {
      await fetch(`/api/cards/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch (err) {
      console.error("Like action failed:", err);
      fetchCards();
    }
  };

  // Handle Pin / Unpin
  const handlePin = async (id: string, pinned: boolean) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned } : c))
    );

    try {
      await fetch(`/api/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      fetchCards();
    } catch (err) {
      console.error("Pin action failed:", err);
      fetchCards();
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Windows 灵感管理器：\n确定要将此卡片移至回收站（删除）吗？")) return;

    setCards((prev) => prev.filter((c) => c.id !== id));

    try {
      await fetch(`/api/cards/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete failed:", err);
      fetchCards();
    }
  };

  // Handle Save
  const handleSaveCard = async (cardData: Partial<CardItem>) => {
    if (cardData.id) {
      const res = await fetch(`/api/cards/${cardData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "更新失败");
    } else {
      const res = await fetch(`/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "创建失败");

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 },
      });
    }
    fetchCards();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-12 select-none">
      {/* Desktop Workspace */}
      <div className="p-3 sm:p-6 max-w-7xl mx-auto w-full flex-1">
        {/* Main Window */}
        <div className="win-outset-deep shadow-2xl overflow-hidden mb-6">
          {/* Main Titlebar */}
          <div className="win-titlebar">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span className="text-xs sm:text-sm font-bold tracking-wide text-white">
                Inspiration Wall 2000 - [灵感卡片墙.exe - Cloudflare D1 Edition]
              </span>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="win-titlebar-btn px-2.5 w-auto h-[20px] text-xs font-bold"
                title="切换白天 / 黑夜经典主题"
              >
                {isDarkMode ? "☀️ 白天模式" : "🌙 暗黑模式"}
              </button>
              <div className="win-titlebar-btn h-[20px] px-2 text-xs">_</div>
              <div className="win-titlebar-btn h-[20px] px-2 text-xs">□</div>
              <div className="win-titlebar-btn h-[20px] px-2 text-xs hover:bg-red-600 hover:text-white">✕</div>
            </div>
          </div>

          {/* Windows Menu Bar */}
          <div className="px-3 py-1.5 bg-[var(--win-surface)] border-b border-[var(--win-surface-dark)] flex items-center justify-between text-xs text-black dark:text-white font-medium">
            <div className="flex items-center gap-5">
              <span className="cursor-pointer hover:underline"><u>F</u>ile (文件)</span>
              <span className="cursor-pointer hover:underline"><u>E</u>dit (编辑)</span>
              <span className="cursor-pointer hover:underline"><u>V</u>iew (视图)</span>
              <span className="cursor-pointer hover:underline"><u>H</u>elp (帮助)</span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              ⚡ Cloudflare D1: Connected
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-3 bg-[var(--win-surface)] border-b border-[var(--win-surface-dark)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* New Button */}
              <button
                onClick={() => {
                  setEditingCard(null);
                  setIsModalOpen(true);
                }}
                className="win-btn px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold text-black dark:text-white"
              >
                <span>➕</span>
                <span>新建灵感 (New)</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchCards}
                className="win-btn px-3.5 py-1.5 text-xs flex items-center gap-1.5 text-black dark:text-white"
              >
                <span>🔄</span>
                <span>刷新 (Refresh)</span>
              </button>

              {/* Sort selector */}
              <div className="flex items-center gap-1 text-xs pl-2 text-black dark:text-white font-bold">
                <span>排序:</span>
                <button
                  onClick={() => setSortBy("latest")}
                  className={`win-btn px-3 py-1 text-xs ${
                    sortBy === "latest" ? "win-btn-pressed text-blue-700 dark:text-blue-300" : ""
                  }`}
                >
                  ⏱ 最新发布
                </button>
                <button
                  onClick={() => setSortBy("likes")}
                  className={`win-btn px-3 py-1 text-xs ${
                    sortBy === "likes" ? "win-btn-pressed text-blue-700 dark:text-blue-300" : ""
                  }`}
                >
                  🔥 最多获赞
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2 w-full sm:w-80 text-black dark:text-white">
              <span className="text-xs shrink-0 font-bold">🔍 搜索:</span>
              <input
                type="text"
                placeholder="搜索标题、内容、作者或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="win-inset w-full px-2.5 py-1.5 text-xs focus:outline-none placeholder-slate-500 font-sans"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-3 pt-2 bg-[var(--win-surface)] flex items-end gap-1.5 border-b border-[var(--win-surface-dark)] overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-none ${
                  activeCategory === cat
                    ? "win-outset border-b-0 bg-[var(--win-surface)] -mb-[2px] pb-2 z-10 text-black dark:text-white shadow-sm"
                    : "win-btn text-slate-700 dark:text-slate-300"
                }`}
              >
                📁 {cat}
              </button>
            ))}
          </div>

          {/* Cards Area */}
          <div className="p-4 bg-[var(--win-surface-light)] dark:bg-slate-900/60 min-h-[440px]">
            {loading && cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-xs text-black dark:text-white">
                <div className="text-2xl mb-2">⏳</div>
                <div className="font-bold text-sm">正在加载 Cloudflare D1 灵感卡片...</div>
              </div>
            ) : cards.length === 0 ? (
              <div className="win-inset p-12 text-center my-8">
                <div className="text-3xl mb-2">📂</div>
                <div className="font-bold text-sm mb-1 text-black dark:text-white">未找到相关灵感卡片</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-4">可以尝试更改筛选条件或直接创建一张新卡片。</div>
                <button
                  onClick={() => {
                    setEditingCard(null);
                    setIsModalOpen(true);
                  }}
                  className="win-btn px-4 py-2 text-xs font-bold text-black dark:text-white"
                >
                  ➕ 立即创建新灵感
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <IdeaCard
                    key={card.id}
                    card={card}
                    isLiked={likedCardIds.has(card.id)}
                    onLike={handleLike}
                    onPin={handlePin}
                    onDelete={handleDelete}
                    onEdit={(c) => {
                      setEditingCard(c);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-3 py-1 bg-[var(--win-surface)] border-t border-[var(--win-surface-dark)] flex items-center justify-between text-xs text-black dark:text-white font-medium select-none">
            <div className="win-inset-shallow px-2.5 py-1 flex items-center gap-3">
              <span>共 <b>{cards.length}</b> 个对象</span>
              <span className="text-slate-400">|</span>
              <span>当前分类: <b>{activeCategory}</b></span>
            </div>
            <div className="win-inset-shallow px-2.5 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
              Vercel + Cloudflare D1
            </div>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 win-outset z-40 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          {/* Start Button */}
          <button
            onClick={() => {
              setEditingCard(null);
              setIsModalOpen(true);
            }}
            className="win-btn px-3 py-1 text-xs font-black flex items-center gap-1.5 text-black dark:text-white"
          >
            <span className="text-sm">🪟</span>
            <span>开始 (Start)</span>
          </button>

          {/* Active Window */}
          <div className="win-btn win-btn-pressed px-3 py-1 text-xs font-bold flex items-center gap-1.5 truncate max-w-[240px] text-black dark:text-white">
            <span>💡</span>
            <span className="truncate">灵感卡片墙 (Inspiration Wall)</span>
          </div>
        </div>

        {/* Tray */}
        <div className="win-inset-shallow px-3 py-1 flex items-center gap-3 text-xs font-bold text-black dark:text-white">
          <button
            onClick={toggleTheme}
            className="cursor-pointer hover:scale-110 transition-transform"
            title="点击切换主题"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">D1 DB</span>
          <span className="font-mono text-slate-900 dark:text-slate-100">{currentTime || "12:00"}</span>
        </div>
      </footer>

      {/* Modal Dialog */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSubmit={handleSaveCard}
        initialData={editingCard}
      />
    </div>
  );
}
