/* global React */
// ============================================================
// Fruit illustrations — paper-cutout style.
//
// Each fruit has BOTH a whole and a sliced painter so the game
// can show genuine "before" and "after" states. Sliced variants
// expose the flesh, drop the rind/leaves, and add a stray seed
// or pip drift for motion.
//
// Usage:
//   <FruitIcon kind="rambutan" size={120} />
//   <FruitIcon kind="rambutan" size={120} sliced />
// ============================================================

const INK = "#4c3125";
const INK_DEEP = "#24150f";

// ----- WHOLE painters (200x200 viewBox) -----
const WHOLE = {
  watermelon: () => (
    <g>
      {/* full round melon — brighter green */}
      <circle cx="100" cy="100" r="84" fill="#2a8a4e" stroke={INK} strokeWidth="7"/>
      {/* dark rind stripes */}
      <g fill="none" stroke="#0e3a22" strokeWidth="10" strokeLinecap="round" opacity="0.92">
        <path d="M40 60 C 32 90, 32 122, 44 154"/>
        <path d="M70 30 C 62 70, 60 130, 72 170"/>
        <path d="M130 30 C 138 70, 140 130, 128 170"/>
        <path d="M160 60 C 168 90, 168 122, 156 154"/>
      </g>
      {/* light rind stripes */}
      <g fill="none" stroke="#7ec96b" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M56 44 C 50 80, 50 124, 58 164"/>
        <path d="M100 22 C 96 80, 96 124, 100 178"/>
        <path d="M144 44 C 150 80, 150 124, 142 164"/>
      </g>
      {/* highlight */}
      <ellipse cx="74" cy="58" rx="22" ry="11" fill="#c8ee9a" opacity="0.78" transform="rotate(-30 74 58)"/>
    </g>
  ),
  pineapple: () => (
    <g>
      <path d="M100 12 C 96 30, 88 40, 78 46 C 70 50, 64 50, 60 48 C 64 38, 76 22, 100 12 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M100 12 C 104 30, 112 40, 122 46 C 130 50, 136 50, 140 48 C 136 38, 124 22, 100 12 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M100 12 C 102 30, 100 44, 96 56 C 92 64, 88 68, 84 70 C 84 56, 92 32, 100 12 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M100 12 C 98 30, 100 44, 104 56 C 108 64, 112 68, 116 70 C 116 56, 108 32, 100 12 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M52 86 C 54 70, 72 60, 100 60 C 128 60, 146 70, 148 86 C 154 130, 142 178, 100 184 C 58 178, 46 130, 52 86 Z" fill="#f0b41c" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      <g stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.86">
        <path d="M58 96 L 96 132"/><path d="M76 86 L 116 124"/><path d="M94 80 L 138 122"/><path d="M112 80 L 148 116"/>
        <path d="M142 96 L 104 132"/><path d="M124 86 L 84 124"/><path d="M106 80 L 62 122"/><path d="M88 80 L 52 116"/>
      </g>
      <g fill={INK_DEEP}>
        <circle cx="80" cy="108" r="2.5"/><circle cx="100" cy="116" r="2.5"/><circle cx="120" cy="108" r="2.5"/>
        <circle cx="90" cy="138" r="2.5"/><circle cx="110" cy="138" r="2.5"/><circle cx="100" cy="158" r="2.5"/>
      </g>
    </g>
  ),
  mango: () => (
    <g>
      {/* leaf nub */}
      <path d="M120 28 C 138 18, 158 20, 168 28 C 158 40, 138 46, 118 42 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      {/* body — saturated, bold stroke */}
      <path d="M40 68 C 70 38, 124 32, 156 56 C 184 78, 188 130, 164 164 C 138 192, 78 196, 48 170 C 16 142, 14 96, 40 68 Z"
            fill="#ff8a1a" stroke={INK} strokeWidth="7" strokeLinejoin="round"/>
      {/* red-orange blush on shoulder */}
      <path d="M118 48 C 148 54, 172 76, 178 106 C 152 94, 128 82, 116 66 Z" fill="#e0432a" opacity="0.92"/>
      {/* warm yellow highlight */}
      <ellipse cx="74" cy="92" rx="22" ry="34" fill="#ffd066" opacity="0.85" transform="rotate(-22 74 92)"/>
      {/* small specular */}
      <ellipse cx="62" cy="78" rx="9" ry="14" fill="#fff4c8" opacity="0.7" transform="rotate(-22 62 78)"/>
    </g>
  ),
  dragonfruit: () => (
    <g>
      <path d="M62 70 C 50 48, 34 38, 18 42 C 26 60, 44 70, 62 70 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M138 70 C 150 48, 166 38, 182 42 C 174 60, 156 70, 138 70 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M70 50 C 76 32, 74 18, 64 12 C 58 24, 60 40, 70 50 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M130 50 C 124 32, 126 18, 136 12 C 142 24, 140 40, 130 50 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M52 110 C 36 108, 22 116, 18 130 C 30 134, 46 130, 56 122 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M148 110 C 164 108, 178 116, 182 130 C 170 134, 154 130, 144 122 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M50 96 C 52 70, 76 56, 100 56 C 124 56, 148 70, 150 96 C 154 144, 130 184, 100 184 C 70 184, 46 144, 50 96 Z" fill="#e64c9b" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* skin scales — irregular curls */}
      <g fill="none" stroke={INK} strokeWidth="3" opacity="0.6" strokeLinecap="round">
        <path d="M70 100 C 78 94, 86 96, 88 104"/>
        <path d="M114 100 C 122 94, 130 96, 132 104"/>
        <path d="M88 134 C 96 128, 104 130, 106 138"/>
      </g>
      {/* highlight */}
      <ellipse cx="78" cy="86" rx="14" ry="10" fill="#ff80b6" opacity="0.7" transform="rotate(-26 78 86)"/>
    </g>
  ),
  durian: () => (
    <g>
      <path d="M96 12 L 104 12 L 102 28 L 98 28 Z" fill="#4a3220" stroke={INK} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M100 22 L 116 36 L 138 30 L 144 50 L 168 60 L 162 82 L 184 96 L 172 116 L 184 138 L 162 146 L 156 168 L 134 162 L 116 180 L 100 168 L 84 180 L 66 162 L 44 168 L 38 146 L 16 138 L 28 116 L 16 96 L 38 82 L 32 60 L 56 50 L 62 30 L 84 36 Z"
            fill="#c5c533" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      <g fill={INK} opacity="0.86">
        <path d="M100 50 L 106 64 L 94 64 Z"/><path d="M76 60 L 82 74 L 68 72 Z"/><path d="M124 60 L 132 72 L 118 74 Z"/>
        <path d="M58 82 L 66 94 L 52 94 Z"/><path d="M142 82 L 148 94 L 134 94 Z"/>
        <path d="M100 96 L 108 110 L 92 110 Z"/><path d="M70 110 L 78 122 L 64 122 Z"/><path d="M130 110 L 136 122 L 122 122 Z"/>
        <path d="M86 130 L 94 142 L 80 142 Z"/><path d="M114 130 L 120 142 L 106 142 Z"/>
        <path d="M100 150 L 106 162 L 94 162 Z"/>
      </g>
    </g>
  ),
  rambutan: () => (
    <g>
      {/* hairs */}
      <g stroke="#d63a3f" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M100 18 L 100 44"/><path d="M120 24 L 112 48"/><path d="M80 24 L 88 48"/>
        <path d="M140 32 L 124 52"/><path d="M60 32 L 76 52"/>
        <path d="M158 48 L 138 60"/><path d="M42 48 L 62 60"/>
        <path d="M170 70 L 146 76"/><path d="M30 70 L 54 76"/>
        <path d="M178 96 L 152 96"/><path d="M22 96 L 48 96"/>
        <path d="M174 122 L 150 116"/><path d="M26 122 L 50 116"/>
        <path d="M162 146 L 142 132"/><path d="M38 146 L 58 132"/>
        <path d="M142 166 L 130 144"/><path d="M58 166 L 70 144"/>
        <path d="M118 178 L 114 152"/><path d="M82 178 L 86 152"/>
      </g>
      {/* hair tips — yellow/green spikes */}
      <g fill="#7baa48" stroke={INK} strokeWidth="2">
        <circle cx="100" cy="42" r="5"/><circle cx="112" cy="46" r="5"/><circle cx="88" cy="46" r="5"/>
        <circle cx="124" cy="50" r="5"/><circle cx="76" cy="50" r="5"/><circle cx="138" cy="58" r="5"/>
        <circle cx="62" cy="58" r="5"/><circle cx="146" cy="74" r="5"/><circle cx="54" cy="74" r="5"/>
        <circle cx="152" cy="94" r="5"/><circle cx="48" cy="94" r="5"/><circle cx="150" cy="116" r="5"/>
        <circle cx="50" cy="116" r="5"/><circle cx="142" cy="132" r="5"/><circle cx="58" cy="132" r="5"/>
        <circle cx="130" cy="144" r="5"/><circle cx="70" cy="144" r="5"/><circle cx="114" cy="152" r="5"/><circle cx="86" cy="152" r="5"/>
      </g>
      <circle cx="100" cy="100" r="56" fill="#d63a3f" stroke={INK} strokeWidth="6"/>
      <ellipse cx="78" cy="80" rx="18" ry="10" fill="#ff7a6e" opacity="0.7" transform="rotate(-26 78 80)"/>
    </g>
  ),
  mangosteen: () => (
    <g>
      <path d="M100 16 C 92 22, 84 30, 78 42 C 88 46, 100 44, 110 38 C 116 30, 108 18, 100 16 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M100 16 C 108 22, 116 30, 122 42 C 112 46, 100 44, 90 38 C 84 30, 92 18, 100 16 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M64 26 C 60 38, 60 50, 70 60 C 82 56, 90 46, 86 32 C 80 24, 68 22, 64 26 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M136 26 C 140 38, 140 50, 130 60 C 118 56, 110 46, 114 32 C 120 24, 132 22, 136 26 Z" fill="#5a8c3e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <circle cx="100" cy="116" r="62" fill="#5b3676" stroke={INK} strokeWidth="6"/>
      <g stroke={INK} strokeWidth="3.5" fill="#3a234d" strokeLinejoin="round">
        <path d="M100 158 L 86 168 L 80 158 Z"/><path d="M100 158 L 114 168 L 120 158 Z"/>
        <path d="M100 158 L 92 174 L 100 178 Z"/><path d="M100 158 L 108 174 L 100 178 Z"/>
        <path d="M100 158 L 76 156 L 84 162 Z"/><path d="M100 158 L 124 156 L 116 162 Z"/>
      </g>
      <ellipse cx="78" cy="92" rx="14" ry="8" fill="#9b78b8" opacity="0.7" transform="rotate(-22 78 92)"/>
    </g>
  ),
  lychee: () => (
    <g>
      <path d="M104 18 C 116 14, 124 22, 122 32" fill="none" stroke="#5a8c3e" strokeWidth="6" strokeLinecap="round"/>
      <path d="M122 30 C 138 26, 152 30, 156 44 C 144 50, 130 46, 122 38 Z" fill="#7baa48" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M58 76 C 58 50, 80 36, 100 44 C 120 36, 142 50, 142 76 C 144 116, 124 162, 100 184 C 76 162, 56 116, 58 76 Z" fill="#d4585e" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* bumpy shell — small scales */}
      <g fill="none" stroke={INK} strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
        <path d="M70 76 C 76 72, 84 72, 86 78"/>
        <path d="M94 70 C 100 66, 108 66, 110 72"/>
        <path d="M118 76 C 124 72, 132 72, 134 78"/>
        <path d="M64 100 C 70 96, 78 96, 80 102"/>
        <path d="M90 96 C 96 92, 104 92, 106 98"/>
        <path d="M114 100 C 120 96, 128 96, 130 102"/>
        <path d="M70 124 C 76 120, 84 120, 86 126"/>
        <path d="M96 124 C 102 120, 110 120, 112 126"/>
        <path d="M118 124 C 124 120, 130 120, 130 126"/>
        <path d="M82 148 C 88 144, 96 144, 98 150"/>
        <path d="M104 148 C 110 144, 116 144, 118 150"/>
      </g>
    </g>
  ),
};

// ----- SLICED painters — flesh exposed, no rind/leaves -----
const SLICED = {
  watermelon: () => (
    <g>
      {/* half-circle flesh */}
      <path d="M22 110 A 78 78 0 0 1 178 110 L 22 110 Z" fill="#e0394e" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* rind */}
      <path d="M22 110 A 78 78 0 0 1 178 110 L 22 110 Z" fill="none" stroke="#1f5a39" strokeWidth="14" strokeLinejoin="round" transform="translate(0 6)"/>
      <path d="M14 116 A 86 86 0 0 1 186 116" fill="none" stroke="#1f5a39" strokeWidth="6"/>
      <path d="M22 110 A 78 78 0 0 1 178 110" fill="none" stroke="#f7efd4" strokeWidth="6"/>
      {/* seeds scattered */}
      <ellipse cx="60" cy="92" rx="4" ry="7" fill={INK_DEEP} transform="rotate(-18 60 92)"/>
      <ellipse cx="86" cy="78" rx="4" ry="7" fill={INK_DEEP}/>
      <ellipse cx="110" cy="76" rx="4" ry="7" fill={INK_DEEP} transform="rotate(8 110 76)"/>
      <ellipse cx="138" cy="86" rx="4" ry="7" fill={INK_DEEP} transform="rotate(20 138 86)"/>
      <ellipse cx="76" cy="100" rx="4" ry="6" fill={INK_DEEP} transform="rotate(-8 76 100)"/>
      <ellipse cx="124" cy="100" rx="4" ry="6" fill={INK_DEEP} transform="rotate(8 124 100)"/>
      <ellipse cx="100" cy="92" rx="4" ry="6.5" fill={INK_DEEP}/>
      {/* stray seed flying */}
      <ellipse cx="156" cy="40" rx="3" ry="5" fill={INK_DEEP} transform="rotate(40 156 40)"/>
      <ellipse cx="40" cy="56" rx="3" ry="5" fill={INK_DEEP} transform="rotate(-30 40 56)"/>
    </g>
  ),
  pineapple: () => (
    <g>
      {/* round slice with rind */}
      <circle cx="100" cy="100" r="76" fill="#f0b41c" stroke="#5a8c3e" strokeWidth="14"/>
      <circle cx="100" cy="100" r="76" fill="none" stroke={INK} strokeWidth="6"/>
      {/* core */}
      <circle cx="100" cy="100" r="14" fill="#fff4d2" stroke={INK} strokeWidth="4"/>
      {/* radial flesh lines */}
      <g stroke={INK} strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round">
        <path d="M100 32 L 100 86"/><path d="M100 114 L 100 168"/>
        <path d="M32 100 L 86 100"/><path d="M114 100 L 168 100"/>
        <path d="M52 52 L 90 90"/><path d="M148 52 L 110 90"/>
        <path d="M52 148 L 90 110"/><path d="M148 148 L 110 110"/>
      </g>
      {/* eye dots */}
      <g fill={INK_DEEP}>
        <circle cx="100" cy="58" r="3"/><circle cx="100" cy="142" r="3"/>
        <circle cx="58" cy="100" r="3"/><circle cx="142" cy="100" r="3"/>
        <circle cx="70" cy="70" r="3"/><circle cx="130" cy="70" r="3"/>
        <circle cx="70" cy="130" r="3"/><circle cx="130" cy="130" r="3"/>
      </g>
    </g>
  ),
  mango: () => (
    <g>
      {/* hedgehog cut — half mango, scored */}
      <path d="M40 64 C 64 44, 100 40, 130 56 C 160 72, 168 122, 148 154 C 132 178, 88 178, 64 162 C 36 142, 28 90, 40 64 Z" fill="#ffb24a" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* skin strip on right */}
      <path d="M138 60 C 156 76, 162 110, 152 142 C 144 158, 134 168, 124 174 C 142 156, 152 124, 148 96 C 144 76, 140 64, 138 60 Z" fill="#f59a30" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      {/* score lines — diamond */}
      <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.78">
        <path d="M56 80 L 124 148"/><path d="M82 64 L 138 130"/><path d="M104 60 L 142 110"/>
        <path d="M122 78 L 56 144"/><path d="M138 96 L 80 158"/>
      </g>
      {/* highlight */}
      <ellipse cx="64" cy="92" rx="10" ry="18" fill="#ffd084" opacity="0.7" transform="rotate(-18 64 92)"/>
    </g>
  ),
  dragonfruit: () => (
    <g>
      {/* white flesh oval */}
      <ellipse cx="100" cy="104" rx="78" ry="72" fill="#fff4f7" stroke="#e64c9b" strokeWidth="14"/>
      <ellipse cx="100" cy="104" rx="78" ry="72" fill="none" stroke={INK} strokeWidth="6"/>
      {/* tiny green leaf nub at top */}
      <path d="M88 30 C 96 22, 110 22, 116 30 C 112 38, 96 38, 88 30 Z" fill="#7baa48" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>
      {/* black seeds — many */}
      <g fill={INK_DEEP}>
        <circle cx="76" cy="74" r="2.4"/><circle cx="92" cy="68" r="2.4"/><circle cx="108" cy="68" r="2.4"/><circle cx="124" cy="74" r="2.4"/>
        <circle cx="64" cy="92" r="2.4"/><circle cx="82" cy="86" r="2.4"/><circle cx="100" cy="84" r="2.4"/><circle cx="118" cy="86" r="2.4"/><circle cx="136" cy="92" r="2.4"/>
        <circle cx="60" cy="110" r="2.4"/><circle cx="78" cy="106" r="2.4"/><circle cx="96" cy="104" r="2.4"/><circle cx="114" cy="104" r="2.4"/><circle cx="132" cy="106" r="2.4"/><circle cx="140" cy="110" r="2.4"/>
        <circle cx="68" cy="128" r="2.4"/><circle cx="86" cy="124" r="2.4"/><circle cx="104" cy="122" r="2.4"/><circle cx="122" cy="124" r="2.4"/><circle cx="140" cy="128" r="2.4"/>
        <circle cx="80" cy="146" r="2.4"/><circle cx="100" cy="142" r="2.4"/><circle cx="120" cy="146" r="2.4"/>
        <circle cx="92" cy="160" r="2.4"/><circle cx="108" cy="160" r="2.4"/>
      </g>
    </g>
  ),
  durian: () => (
    <g>
      {/* spiky outer half */}
      <path d="M100 30 C 70 30, 40 48, 30 78 C 16 116, 30 152, 60 168 C 84 180, 116 180, 140 168 C 170 152, 184 116, 170 78 C 160 48, 130 30, 100 30 Z"
            fill="#c5c533" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* spike fringe */}
      <g fill="#c5c533" stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M44 56 L 36 38 L 60 48 Z"/><path d="M76 36 L 76 18 L 92 32 Z"/>
        <path d="M124 36 L 132 18 L 132 36 Z"/><path d="M156 56 L 172 38 L 160 60 Z"/>
        <path d="M178 92 L 196 90 L 180 102 Z"/><path d="M22 92 L 4 90 L 22 102 Z"/>
      </g>
      {/* opening — pale pods */}
      <path d="M62 96 C 70 84, 90 84, 100 92 C 110 84, 130 84, 138 96 C 142 116, 130 138, 100 146 C 70 138, 58 116, 62 96 Z"
            fill="#fff4d2" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      {/* pod divisions */}
      <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M82 92 C 86 110, 86 132, 82 144"/>
        <path d="M118 92 C 114 110, 114 132, 118 144"/>
        <path d="M100 92 L 100 146"/>
      </g>
      {/* seeds inside pods */}
      <g fill="#a87a3a">
        <ellipse cx="72" cy="118" rx="6" ry="9"/>
        <ellipse cx="100" cy="120" rx="6" ry="9"/>
        <ellipse cx="128" cy="118" rx="6" ry="9"/>
      </g>
    </g>
  ),
  rambutan: () => (
    <g>
      {/* peeled — translucent white flesh + seed */}
      {/* outer red skin curling back like a banana peel */}
      <path d="M30 110 C 24 70, 50 30, 90 28 C 86 36, 80 44, 78 56 C 60 64, 46 84, 46 110 Z" fill="#d63a3f" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M170 110 C 176 70, 150 30, 110 28 C 114 36, 120 44, 122 56 C 140 64, 154 84, 154 110 Z" fill="#d63a3f" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      {/* hairs on peel curls */}
      <g stroke="#d63a3f" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M48 50 L 38 38"/><path d="M62 38 L 56 22"/><path d="M152 50 L 162 38"/><path d="M138 38 L 144 22"/>
      </g>
      {/* inner flesh — translucent oval */}
      <ellipse cx="100" cy="120" rx="56" ry="60" fill="#fff4f0" stroke={INK} strokeWidth="5"/>
      {/* seed */}
      <ellipse cx="100" cy="124" rx="22" ry="32" fill="#a87a3a" stroke={INK} strokeWidth="4"/>
      {/* highlight on flesh */}
      <ellipse cx="78" cy="100" rx="10" ry="14" fill="#ffffff" opacity="0.7" transform="rotate(-22 78 100)"/>
    </g>
  ),
  mangosteen: () => (
    <g>
      {/* dark purple shell halves */}
      <path d="M16 100 C 16 56, 56 24, 100 24 C 144 24, 184 56, 184 100 C 184 116, 174 124, 158 122 C 138 96, 116 80, 100 80 C 84 80, 62 96, 42 122 C 26 124, 16 116, 16 100 Z" fill="#5b3676" stroke={INK} strokeWidth="6" strokeLinejoin="round"/>
      {/* shell rim showing red flesh of inner skin */}
      <path d="M40 122 C 60 100, 80 88, 100 88 C 120 88, 140 100, 160 122 C 144 122, 116 124, 100 124 C 84 124, 56 122, 40 122 Z" fill="#a64356" stroke={INK} strokeWidth="4" strokeLinejoin="round"/>
      {/* white segments — like garlic cloves */}
      <g fill="#fff4f0" stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M62 132 C 64 122, 78 116, 84 130 C 86 142, 76 154, 64 152 C 56 148, 58 138, 62 132 Z"/>
        <path d="M86 138 C 90 130, 100 130, 104 138 C 106 154, 96 168, 90 166 C 80 162, 80 146, 86 138 Z"/>
        <path d="M108 138 C 110 130, 124 128, 130 138 C 134 148, 124 162, 114 162 C 104 158, 104 146, 108 138 Z"/>
        <path d="M134 132 C 136 122, 148 116, 152 130 C 154 144, 144 156, 134 152 C 126 148, 130 138, 134 132 Z"/>
      </g>
      {/* segment shadows */}
      <g fill="none" stroke={INK} strokeWidth="2" opacity="0.5">
        <path d="M72 136 C 74 144, 72 150, 70 152"/>
        <path d="M96 142 C 96 152, 94 158, 92 162"/>
        <path d="M118 142 C 118 152, 120 158, 122 162"/>
      </g>
    </g>
  ),
  lychee: () => (
    <g>
      {/* peeled — red shell open, white flesh + brown pit */}
      <path d="M28 110 C 22 70, 46 30, 90 28 C 86 36, 80 44, 78 56 C 60 66, 44 90, 44 116 Z" fill="#d4585e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      <path d="M172 110 C 178 70, 154 30, 110 28 C 114 36, 120 44, 122 56 C 140 66, 156 90, 156 116 Z" fill="#d4585e" stroke={INK} strokeWidth="5" strokeLinejoin="round"/>
      {/* bumpy texture on shells */}
      <g fill="none" stroke={INK} strokeWidth="2" opacity="0.5" strokeLinecap="round">
        <path d="M50 70 C 56 66, 60 68, 60 72"/>
        <path d="M62 90 C 68 86, 72 88, 72 92"/>
        <path d="M150 70 C 144 66, 140 68, 140 72"/>
        <path d="M138 90 C 132 86, 128 88, 128 92"/>
      </g>
      {/* white translucent flesh */}
      <ellipse cx="100" cy="120" rx="58" ry="60" fill="#fff7f0" stroke={INK} strokeWidth="5"/>
      {/* brown pit */}
      <ellipse cx="100" cy="124" rx="20" ry="28" fill="#7a4a2a" stroke={INK} strokeWidth="4"/>
      {/* highlight */}
      <ellipse cx="78" cy="100" rx="10" ry="14" fill="#ffffff" opacity="0.7" transform="rotate(-22 78 100)"/>
    </g>
  ),
};

function FruitIcon({ kind, size = 96, sliced = false, style }) {
  const set = sliced ? SLICED : WHOLE;
  const painter = set[kind] || WHOLE[kind];
  if (!painter) {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
        <circle cx="100" cy="100" r="70" fill="#ddd" stroke={INK} strokeWidth="6"/>
      </svg>
    );
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 200 200"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 8px 14px rgba(42,31,24,0.18))',
        ...style,
      }}
    >
      {painter()}
    </svg>
  );
}

const FRUIT_KINDS = Object.keys(WHOLE);

Object.assign(window, { FruitIcon, FRUIT_KINDS });
