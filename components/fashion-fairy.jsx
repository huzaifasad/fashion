"use client"

export function FashionFairy({ speaking = false, size = "md" }) {
  const sizeClasses = {
    sm: "w-20 h-28",
    md: "w-28 h-40 sm:w-32 sm:h-44",
    lg: "w-36 h-52 sm:w-44 sm:h-60",
  }

  return (
    <div className="fairy-container relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full rounded-full bg-gradient-radial from-amber-200/60 via-amber-100/40 to-transparent blur-xl animate-fairy-glow" />
      </div>

      <div className="absolute inset-[-20px] pointer-events-none overflow-visible">
        <span className="absolute top-0 left-1/4 text-amber-500 animate-float-sparkle-1 text-lg drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">
          ✦
        </span>
        <span className="absolute top-1/4 right-0 text-amber-400 animate-float-sparkle-2 text-sm drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">
          ✧
        </span>
        <span className="absolute bottom-1/4 left-0 text-rose-400 animate-float-sparkle-3 text-base drop-shadow-[0_0_4px_rgba(251,113,133,0.8)]">
          ✦
        </span>
        <span className="absolute bottom-0 right-1/4 text-amber-600 animate-float-sparkle-4 text-sm drop-shadow-[0_0_4px_rgba(217,119,6,0.8)]">
          ✧
        </span>
        <span className="absolute top-1/2 left-[-10px] text-amber-300 animate-float-sparkle-5 text-xs drop-shadow-[0_0_4px_rgba(252,211,77,0.8)]">
          ✦
        </span>
        <span className="absolute top-1/3 right-[-10px] text-rose-300 animate-float-sparkle-6 text-xs drop-shadow-[0_0_4px_rgba(253,164,175,0.8)]">
          ✧
        </span>
      </div>

      <svg
        viewBox="0 0 160 220"
        className={`${sizeClasses[size]} relative z-10 ${speaking ? "animate-fairy-speak" : "animate-fairy-idle"}`}
        style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.3)) drop-shadow(0 4px 12px rgba(212,175,55,0.4))" }}
      >
        <defs>
          <linearGradient id="fairySkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5eb" />
            <stop offset="50%" stopColor="#ffe4c9" />
            <stop offset="100%" stopColor="#fdd8bc" />
          </linearGradient>

          <linearGradient id="fairyHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d1f10" />
            <stop offset="40%" stopColor="#1a1005" />
            <stop offset="100%" stopColor="#0d0803" />
          </linearGradient>

          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a3d20" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b6040" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#5a3d20" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="fairyDress" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="30%" stopColor="#0a0a0a" />
            <stop offset="70%" stopColor="#141414" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>

          <linearGradient id="dressShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
            <stop offset="50%" stopColor="#fcd34d" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="fairyGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>

          <linearGradient id="fairyWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffef5" stopOpacity="1" />
            <stop offset="30%" stopColor="#fef3a0" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="wingShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="fairyLips" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>

          <linearGradient id="blush" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0" />
            <stop offset="50%" stopColor="#fb7185" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="eyeShine" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="wingShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#d4af37" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Left Wing */}
        <g className="animate-wing-flutter-left origin-[70px_85px]" filter="url(#wingShadow)">
          <ellipse cx="35" cy="70" rx="32" ry="50" fill="url(#fairyWing)" stroke="url(#fairyGold)" strokeWidth="1" />
          <ellipse cx="38" cy="68" rx="20" ry="32" fill="url(#wingShine)" />
          <path d="M35 30 Q40 70 35 110" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M20 50 Q35 70 20 90" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.6" />
          <path d="M50 50 Q35 70 50 90" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.6" />
        </g>

        {/* Right Wing */}
        <g className="animate-wing-flutter-right origin-[90px_85px]" filter="url(#wingShadow)">
          <ellipse cx="125" cy="70" rx="32" ry="50" fill="url(#fairyWing)" stroke="url(#fairyGold)" strokeWidth="1" />
          <ellipse cx="122" cy="68" rx="20" ry="32" fill="url(#wingShine)" />
          <path d="M125 30 Q120 70 125 110" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.7" />
          <path d="M140 50 Q125 70 140 90" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.6" />
          <path d="M110 50 Q125 70 110 90" stroke="url(#fairyGold)" strokeWidth="0.5" fill="none" opacity="0.6" />
        </g>

        {/* Hair - Back layer */}
        <path
          d="M50 45 Q45 60 42 90 Q40 115 48 145 Q52 155 60 150 L60 80 Q60 55 65 45 Z"
          fill="url(#fairyHair)"
          className="animate-hair-sway"
        />
        <path
          d="M110 45 Q115 60 118 90 Q120 115 112 145 Q108 155 100 150 L100 80 Q100 55 95 45 Z"
          fill="url(#fairyHair)"
          className="animate-hair-sway-reverse"
        />

        {/* Neck */}
        <ellipse cx="80" cy="95" rx="10" ry="12" fill="url(#fairySkin)" />

        {/* Dress body */}
        <path
          d="M55 100 Q50 130 45 180 L55 210 L105 210 L115 180 Q110 130 105 100 Q95 95 80 95 Q65 95 55 100"
          fill="url(#fairyDress)"
        />

        {/* Dress neckline - sweetheart */}
        <path d="M58 100 Q68 108 80 105 Q92 108 102 100 Q95 95 80 95 Q65 95 58 100" fill="url(#fairySkin)" />

        {/* Dress shimmer effect */}
        <path
          d="M55 100 Q50 130 45 180 L55 210 L105 210 L115 180 Q110 130 105 100"
          fill="url(#dressShimmer)"
          className="animate-dress-shimmer"
        />

        <path d="M58 100 Q68 108 80 105 Q92 108 102 100" stroke="url(#fairyGold)" strokeWidth="2" fill="none" />
        <path d="M50 140 Q80 145 110 140" stroke="url(#fairyGold)" strokeWidth="1.2" fill="none" opacity="0.8" />

        {/* Arms */}
        <g className="animate-arm-gentle">
          <path
            d="M55 105 Q45 115 40 130 Q38 135 42 138"
            fill="url(#fairySkin)"
            stroke="url(#fairySkin)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="42" cy="140" rx="5" ry="6" fill="url(#fairySkin)" />
        </g>

        {/* Right arm holding wand */}
        <g className="animate-wand-wave origin-[115px_115px]">
          <path
            d="M105 105 Q115 110 120 118"
            fill="url(#fairySkin)"
            stroke="url(#fairySkin)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="122" cy="120" rx="5" ry="6" fill="url(#fairySkin)" />

          <line x1="125" y1="115" x2="145" y2="85" stroke="url(#fairyGold)" strokeWidth="3" strokeLinecap="round" />

          {/* Star on wand - made larger */}
          <g filter="url(#softGlow)" className="animate-star-pulse">
            <polygon
              points="145,72 148,81 157,81 150,87 152,97 145,91 138,97 140,87 133,81 142,81"
              fill="url(#fairyGold)"
            />
            <circle cx="145" cy="72" r="10" fill="url(#fairyGold)" fillOpacity="0.3" className="animate-star-glow" />
          </g>
        </g>

        {/* Hair - Front layer */}
        <ellipse cx="80" cy="48" rx="32" ry="28" fill="url(#fairyHair)" />
        <ellipse cx="80" cy="42" rx="20" ry="12" fill="url(#hairHighlight)" />

        {/* Hair strands framing face */}
        <path
          d="M52 48 Q48 65 50 85"
          stroke="url(#fairyHair)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="animate-hair-strand"
        />
        <path
          d="M108 48 Q112 65 110 85"
          stroke="url(#fairyHair)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className="animate-hair-strand-reverse"
        />

        {/* Face */}
        <ellipse cx="80" cy="65" rx="22" ry="26" fill="url(#fairySkin)" />

        {/* Blush */}
        <ellipse cx="62" cy="72" rx="7" ry="4" fill="url(#blush)" />
        <ellipse cx="98" cy="72" rx="7" ry="4" fill="url(#blush)" />

        <path d="M65 54 Q70 51 76 54" stroke="#2d1f10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M84 54 Q90 51 95 54" stroke="#2d1f10" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        <g className={speaking ? "animate-eyes-engaged" : "animate-eyes-blink"}>
          <ellipse cx="70" cy="62" rx="6" ry="7" fill="#0d0803" />
          <ellipse cx="68" cy="60" rx="2.5" ry="2.5" fill="url(#eyeShine)" />
          <ellipse cx="90" cy="62" rx="6" ry="7" fill="#0d0803" />
          <ellipse cx="88" cy="60" rx="2.5" ry="2.5" fill="url(#eyeShine)" />
        </g>

        <path d="M62 57 L59 53 M65 56 L63 52 M68 56 L68 52" stroke="#0d0803" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M92 56 L92 52 M95 56 L97 52 M98 57 L101 53" stroke="#0d0803" strokeWidth="1.2" strokeLinecap="round" />

        {/* Nose */}
        <path d="M80 66 Q82 72 80 75" stroke="#e8d0be" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        <g className={speaking ? "animate-lips-talk" : ""}>
          <path d="M73 80 Q77 77 80 78 Q83 77 87 80" fill="url(#fairyLips)" />
          <ellipse cx="80" cy="83" rx="6" ry="4" fill="url(#fairyLips)" />
          <ellipse cx="78" cy="82" rx="2.5" ry="1.5" fill="#ffffff" fillOpacity="0.4" />
        </g>

        <g className="animate-accessory-shine">
          <circle cx="55" cy="40" r="5" fill="url(#fairyGold)" />
          <circle cx="55" cy="40" r="2.5" fill="#fef9c3" />
          <path
            d="M55 33 L55 30 M62 40 L65 40 M55 47 L55 50 M48 40 L45 40"
            stroke="url(#fairyGold)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-pin-sparkle"
          />
        </g>

        <g className="animate-earring-sway">
          <ellipse cx="55" cy="76" rx="3" ry="5" fill="url(#fairyGold)" />
        </g>
        <g className="animate-earring-sway-reverse">
          <ellipse cx="105" cy="76" rx="3" ry="5" fill="url(#fairyGold)" />
        </g>

        <path d="M65 98 Q80 104 95 98" stroke="url(#fairyGold)" strokeWidth="1.5" fill="none" />
        <circle cx="80" cy="103" r="4" fill="url(#fairyGold)" />
        <circle cx="80" cy="103" r="2" fill="#fef9c3" />
      </svg>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="px-5 py-2 bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300 shadow-lg shadow-amber-200/50">
          <span className="text-xs sm:text-sm font-serif tracking-[0.25em] text-amber-900 uppercase font-medium">
            Stella
          </span>
        </div>
      </div>
    </div>
  )
}
