import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { FiGithub, FiGlobe, FiExternalLink } from "react-icons/fi";

interface AboutProps {
  onClose: () => void;
  zIndex: number;
  onFocus: () => void;
}

const WIDTH = 540;
const HEIGHT = 580;

type TabId = "subhan" | "kn1ghtmere" | "aleeza";

export default function About({ onClose, zIndex, onFocus }: AboutProps) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(12, (window.innerWidth - WIDTH) / 2),
    y: Math.max(12, (window.innerHeight - HEIGHT) / 2 - 30),
  }));
  const [activeTab, setActiveTab] = useState<TabId>("subhan");

  const startDrag = (e: ReactMouseEvent) => {
    const offX = e.clientX - pos.x;
    const offY = e.clientY - pos.y;
    const move = (ev: MouseEvent) =>
      setPos({ x: ev.clientX - offX, y: Math.max(0, ev.clientY - offY) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={onFocus}
      className="absolute flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#121215] text-white shadow-2xl backdrop-blur-none"
      style={{
        left: pos.x,
        top: pos.y,
        width: WIDTH,
        height: HEIGHT,
        zIndex,
      }}
    >
      <div
        onMouseDown={startDrag}
        className="flex h-10 shrink-0 select-none items-center justify-between px-4 bg-[#1a1a20] border-b border-white/10 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="h-3 w-3 rounded-full bg-red-500 hover:opacity-80 transition-opacity cursor-pointer"
          />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs font-mono text-white/70 font-medium">
          WofOS Creators
        </span>
        <div className="w-12" />
      </div>

      <div className="flex border-b border-white/10 bg-[#16161c] px-4 pt-2.5 gap-1 justify-center">
        <button
          onClick={() => setActiveTab("subhan")}
          className={`cursor-pointer pb-2 px-3 text-xs font-mono border-b-2 transition-all ${
            activeTab === "subhan"
              ? "border-blue-900 text-blue-900 font-semibold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Subhan Ali
        </button>
        <button
          onClick={() => setActiveTab("kn1ghtmere")}
          className={`cursor-pointer pb-2 px-3 text-xs font-mono border-b-2 transition-all ${
            activeTab === "kn1ghtmere"
              ? "border-white text-white font-semibold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Kn1ghtmere Chandio
        </button>
        <button
          onClick={() => setActiveTab("aleeza")}
          className={`cursor-pointer pb-2 px-3 text-xs font-mono border-b-2 transition-all ${
            activeTab === "aleeza"
              ? "border-pink-500 text-pink-500 font-semibold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Aleeza Zahra
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6 overflow-y-auto bg-[#121215]">
        {activeTab === "subhan" && (
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-blue-900 p-0.5 bg-[#16161c]">
                <img
                  src="https://github.com/subhanali07.png"
                  alt="Subhan Ali"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold tracking-wide text-blue-900">
              Muhammad Subhan Ali
            </h2>
            <p className="mt-0.5 text-xs text-blue-200/70">
              Undergraduate CS Student and AI/ML Enthusiast
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["Co-founder at Launchit", "Full Stack", "AI/ML", "UI/UX Design"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-blue-900/40 bg-blue-900/10 px-3 py-0.5 text-[11px] text-blue-300 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 w-full rounded-xl border border-blue-900/20 bg-[#16161c] p-4 text-left text-xs leading-relaxed text-white/80">
              <p className="mb-2">
                Focused on full-stack, developing visually appealing designs, learning new stuff every day about Artificial Intelligence and Machine Learning.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[11px]">
                <span className="text-white/50">Website</span>
                <a
                  href="https://subhanali.xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-900 hover:underline"
                >
                  subhanali.xyz <FiExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-center gap-3">
              <a
                href="https://github.com/subhanali07"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-900/40 bg-[#16161c] text-blue-900 hover:bg-blue-900 hover:text-black transition-all cursor-pointer"
              >
                <FiGithub size={15} />
              </a>
              <a
                href="https://subhanali.xyz"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-900/40 bg-[#16161c] text-blue-900 hover:bg-blue-900 hover:text-black transition-all cursor-pointer"
              >
                <FiGlobe size={15} />
              </a>
            </div>
          </div>
        )}

        {activeTab === "kn1ghtmere" && (
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white p-0.5 bg-[#16161c] flex items-center justify-center">
                <img
                  src="https://github.com/Kn1ghtmere.png"
                  alt="chandiooo"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold tracking-wide text-white">
              Kn1ghtmere
            </h2>
            <p className="mt-0.5 text-xs text-white/70">
              Undergraduate Cyber Security Student and um loves tech
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["Co-founder at Launchit", "Software", "Hardware", "Creative ig"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/40 bg-white/10 px-3 py-0.5 text-[11px] text-white font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 w-full rounded-xl border border-white/20 bg-[#16161c] p-4 text-left text-xs leading-relaxed text-white/80">
              <p className="mb-2">
                Hi , im kn1ghtmere and i like to code smtimes, im kinda new to it , but im still learning alot. im majoring in cyber security , and my fav color is black :) andddd btwww yk whattttt I LOVE ALEEZA ZAHRA
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[11px]">
                <span className="text-white/50">Website</span>
                <a
                  href="https://kn1ghtmere.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-white hover:underline font-semibold"
                >
                  kn1ghtmere.vercel.app <FiExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-center gap-3">
              <a
                href="https://github.com/Kn1ghtmere"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#16161c] text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <FiGithub size={15} />
              </a>
              <a
                href="https://kn1ghtmere.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#16161c] text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <FiGlobe size={15} />
              </a>
            </div>
          </div>
        )}

    
        {activeTab === "aleeza" && (
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-pink-500 p-0.5 bg-[#16161c] flex items-center justify-center">
                <img
                  src="https://github.com/aleezazahra.png"
                  alt="leeza peeza"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold tracking-wide text-pink-500">
              Aleeza Zahra
            </h2>
            <p className="mt-0.5 text-xs text-pink-300/70">
              Full Stack Developer and AI/ML enthusiast
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["Co-founder at Launchit", "Full Stack", "AI/ML Enthusiast", "cute"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-0.5 text-[11px] text-pink-300 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 w-full rounded-xl border border-pink-500/20 bg-[#16161c] p-4 text-left text-xs leading-relaxed text-white/80">
              <p className="mb-2">
                Focused on Full Stack and AI. Love to build stuff that's cool clean and simple. Like to learn new stuff. and yeah i love coffee ramen and I LOVE TO GOON
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[11px]">
                <span className="text-white/50">Website</span>
                <a
                  href="https://aleezazahra.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-pink-400 hover:underline"
                >
                  aleezazahra.com <FiExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-center gap-3">
              <a
                href="https://github.com/aleezazahra"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-500/40 bg-[#16161c] text-pink-500 hover:bg-pink-500 hover:text-black transition-all cursor-pointer"
              >
                <FiGithub size={15} />
              </a>
              <a
                href="https://aleezazahra.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-500/40 bg-[#16161c] text-pink-500 hover:bg-pink-500 hover:text-black transition-all cursor-pointer"
              >
                <FiGlobe size={15} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}