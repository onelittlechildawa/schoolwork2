import React from "react";
import { FileText } from "lucide-react";
import { CardItem } from "@/lib/d1";

interface IdeaCardProps {
  card: CardItem;
  onLike: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (card: CardItem) => void;
  isLiked?: boolean;
}

const colorThemes: Record<string, { bar: string; tag: string }> = {
  amber: {
    bar: "from-amber-700 to-amber-900 text-white",
    tag: "bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  },
  emerald: {
    bar: "from-emerald-700 to-emerald-900 text-white",
    tag: "bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
  },
  blue: {
    bar: "from-blue-700 to-blue-900 text-white",
    tag: "bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700",
  },
  purple: {
    bar: "from-purple-700 to-purple-900 text-white",
    tag: "bg-purple-100 text-purple-900 border-purple-400 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700",
  },
  rose: {
    bar: "from-rose-700 to-rose-900 text-white",
    tag: "bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700",
  },
  cyan: {
    bar: "from-cyan-700 to-cyan-900 text-white",
    tag: "bg-cyan-100 text-cyan-900 border-cyan-400 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-700",
  },
};

export const IdeaCard: React.FC<IdeaCardProps> = ({
  card,
  onLike,
  onPin,
  onDelete,
  onEdit,
  isLiked = false,
}) => {
  const cardColor = card.color || "amber";
  const theme = colorThemes[cardColor] || colorThemes.blue;

  const formattedDate = new Date(card.created_at).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="win-outset flex flex-col justify-between text-xs relative group shadow">
      {/* Window Titlebar */}
      <div className={`flex items-center justify-between px-2 py-1 select-none font-bold text-xs bg-gradient-to-r ${theme.bar}`}>
        <div className="flex items-center gap-1.5 overflow-hidden pr-2">
          <FileText className="w-3.5 h-3.5 shrink-0 text-white" />
          <span className="truncate text-white font-bold">{card.category || "General"} - {card.title}</span>
        </div>
        
        {/* Titlebar Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onPin(card.id, !card.pinned)}
            className={`win-titlebar-btn px-1 ${card.pinned ? "bg-amber-300 text-black font-black" : ""}`}
            title={card.pinned ? "取消置顶" : "置顶该卡片"}
          >
            📌
          </button>
          <button
            onClick={() => onEdit(card)}
            className="win-titlebar-btn px-1"
            title="编辑"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="win-titlebar-btn px-1 hover:bg-red-600 hover:text-white"
            title="删除"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Pinned status alert */}
          {card.pinned && (
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 border border-amber-400">
              <span>📌</span>
              <span>[已置顶] 重要灵感推荐</span>
            </div>
          )}

          {/* Title */}
          <h4 className="text-sm font-bold text-black dark:text-white mb-2 break-words leading-tight">
            {card.title}
          </h4>

          {/* High Contrast Note Container */}
          <div className="win-inset p-3 text-xs leading-relaxed whitespace-pre-wrap select-text selection:bg-blue-600 selection:text-white min-h-[90px]">
            {card.content}
          </div>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {card.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-[11px] font-bold border rounded-none ${theme.tag}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Win32 Bottom Status Bar */}
        <div className="pt-2">
          <div className="win-inset-shallow px-2.5 py-1.5 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 font-medium">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="font-bold text-slate-900 dark:text-slate-100">👤 {card.author || "匿名"}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-700 dark:text-slate-300">🕒 {formattedDate}</span>
            </div>

            {/* Like Button */}
            <button
              onClick={() => onLike(card.id)}
              className={`win-btn px-2.5 py-1 text-xs flex items-center gap-1.5 shrink-0 ${
                isLiked ? "win-btn-pressed text-rose-600 dark:text-rose-400" : "text-black dark:text-white"
              }`}
              title="点赞"
            >
              <span>{isLiked ? "❤️" : "🤍"}</span>
              <span className="font-bold font-mono">{card.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
