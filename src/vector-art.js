const FRUIT_ART = {
  watermelon: {
    flightScale: 1.54,
    bowlScale: 1.18,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="84" fill="#2a8a4e" stroke="#4c3125" stroke-width="7"/>
        <g fill="none" stroke="#0e3a22" stroke-width="10" stroke-linecap="round" opacity="0.92">
          <path d="M40 60 C 32 90, 32 122, 44 154"/>
          <path d="M70 30 C 62 70, 60 130, 72 170"/>
          <path d="M130 30 C 138 70, 140 130, 128 170"/>
          <path d="M160 60 C 168 90, 168 122, 156 154"/>
        </g>
        <g fill="none" stroke="#7ec96b" stroke-width="5" stroke-linecap="round" opacity="0.85">
          <path d="M56 44 C 50 80, 50 124, 58 164"/>
          <path d="M100 22 C 96 80, 96 124, 100 178"/>
          <path d="M144 44 C 150 80, 150 124, 142 164"/>
        </g>
        <ellipse cx="74" cy="58" rx="22" ry="11" fill="#c8ee9a" opacity="0.78" transform="rotate(-30 74 58)"/>
      </svg>
    `,
  },
  pineapple: {
    flightScale: 1.84,
    bowlScale: 1.28,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M100 12 C 96 30, 88 40, 78 46 C 70 50, 64 50, 60 48 C 64 38, 76 22, 100 12 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M100 12 C 104 30, 112 40, 122 46 C 130 50, 136 50, 140 48 C 136 38, 124 22, 100 12 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M100 12 C 102 30, 100 44, 96 56 C 92 64, 88 68, 84 70 C 84 56, 92 32, 100 12 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M100 12 C 98 30, 100 44, 104 56 C 108 64, 112 68, 116 70 C 116 56, 108 32, 100 12 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M52 86 C 54 70, 72 60, 100 60 C 128 60, 146 70, 148 86 C 154 130, 142 178, 100 184 C 58 178, 46 130, 52 86 Z" fill="#f0b41c" stroke="#4c3125" stroke-width="6" stroke-linejoin="round"/>
        <g stroke="#4c3125" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.86">
          <path d="M58 96 L 96 132"/><path d="M76 86 L 116 124"/><path d="M94 80 L 138 122"/><path d="M112 80 L 148 116"/>
          <path d="M142 96 L 104 132"/><path d="M124 86 L 84 124"/><path d="M106 80 L 62 122"/><path d="M88 80 L 52 116"/>
        </g>
        <g fill="#24150f">
          <circle cx="80" cy="108" r="2.5"/><circle cx="100" cy="116" r="2.5"/><circle cx="120" cy="108" r="2.5"/>
          <circle cx="90" cy="138" r="2.5"/><circle cx="110" cy="138" r="2.5"/><circle cx="100" cy="158" r="2.5"/>
        </g>
      </svg>
    `,
  },
  mango: {
    flightScale: 1.56,
    bowlScale: 1.16,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M120 28 C 138 18, 158 20, 168 28 C 158 40, 138 46, 118 42 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M40 68 C 70 38, 124 32, 156 56 C 184 78, 188 130, 164 164 C 138 192, 78 196, 48 170 C 16 142, 14 96, 40 68 Z" fill="#ff8a1a" stroke="#4c3125" stroke-width="7" stroke-linejoin="round"/>
        <path d="M118 48 C 148 54, 172 76, 178 106 C 152 94, 128 82, 116 66 Z" fill="#e0432a" opacity="0.92"/>
        <ellipse cx="74" cy="92" rx="22" ry="34" fill="#ffd066" opacity="0.85" transform="rotate(-22 74 92)"/>
        <ellipse cx="62" cy="78" rx="9" ry="14" fill="#fff4c8" opacity="0.7" transform="rotate(-22 62 78)"/>
      </svg>
    `,
  },
  papaya: {
    flightScale: 1.62,
    bowlScale: 1.2,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="papayaBody" x1="20%" y1="8%" x2="78%" y2="88%">
            <stop offset="0%" stop-color="#ffb36f"/>
            <stop offset="55%" stop-color="#ff8248"/>
            <stop offset="100%" stop-color="#ea5b28"/>
          </linearGradient>
        </defs>
        <path d="M128 36c40 0 72 35 72 90 0 57-31 95-72 95s-72-38-72-95c0-55 32-90 72-90Z" fill="url(#papayaBody)" stroke="#d9541f" stroke-width="6"/>
        <path d="M128 67c28 0 49 24 49 58s-21 58-49 58-49-24-49-58 21-58 49-58Z" fill="#2b231a" opacity=".18"/>
        <path d="M128 75c24 0 42 21 42 50s-18 50-42 50-42-21-42-50 18-50 42-50Z" fill="#20170e"/>
        <g fill="#3a2814">
          <circle cx="108" cy="113" r="5"/>
          <circle cx="125" cy="101" r="5"/>
          <circle cx="142" cy="111" r="5"/>
          <circle cx="149" cy="131" r="5"/>
          <circle cx="131" cy="149" r="5"/>
          <circle cx="111" cy="145" r="5"/>
          <circle cx="118" cy="128" r="4"/>
          <circle cx="140" cy="128" r="4"/>
        </g>
        <ellipse cx="105" cy="88" rx="26" ry="12" fill="#fff2d8" opacity=".2" transform="rotate(-22 105 88)"/>
      </svg>
    `,
  },
  dragonfruit: {
    flightScale: 1.68,
    bowlScale: 1.22,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M62 70 C 50 48, 34 38, 18 42 C 26 60, 44 70, 62 70 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M138 70 C 150 48, 166 38, 182 42 C 174 60, 156 70, 138 70 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M70 50 C 76 32, 74 18, 64 12 C 58 24, 60 40, 70 50 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M130 50 C 124 32, 126 18, 136 12 C 142 24, 140 40, 130 50 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M52 110 C 36 108, 22 116, 18 130 C 30 134, 46 130, 56 122 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M148 110 C 164 108, 178 116, 182 130 C 170 134, 154 130, 144 122 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M50 96 C 52 70, 76 56, 100 56 C 124 56, 148 70, 150 96 C 154 144, 130 184, 100 184 C 70 184, 46 144, 50 96 Z" fill="#e64c9b" stroke="#4c3125" stroke-width="6" stroke-linejoin="round"/>
        <g fill="none" stroke="#4c3125" stroke-width="3" opacity="0.6" stroke-linecap="round">
          <path d="M70 100 C 78 94, 86 96, 88 104"/>
          <path d="M114 100 C 122 94, 130 96, 132 104"/>
          <path d="M88 134 C 96 128, 104 130, 106 138"/>
        </g>
        <ellipse cx="78" cy="86" rx="14" ry="10" fill="#ff80b6" opacity="0.7" transform="rotate(-26 78 86)"/>
      </svg>
    `,
  },
  mangosteen: {
    flightScale: 1.56,
    bowlScale: 1.14,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M100 16 C 92 22, 84 30, 78 42 C 88 46, 100 44, 110 38 C 116 30, 108 18, 100 16 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M100 16 C 108 22, 116 30, 122 42 C 112 46, 100 44, 90 38 C 84 30, 92 18, 100 16 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M64 26 C 60 38, 60 50, 70 60 C 82 56, 90 46, 86 32 C 80 24, 68 22, 64 26 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M136 26 C 140 38, 140 50, 130 60 C 118 56, 110 46, 114 32 C 120 24, 132 22, 136 26 Z" fill="#5a8c3e" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="100" cy="116" r="62" fill="#5b3676" stroke="#4c3125" stroke-width="6"/>
        <g stroke="#4c3125" stroke-width="3.5" fill="#3a234d" stroke-linejoin="round">
          <path d="M100 158 L 86 168 L 80 158 Z"/><path d="M100 158 L 114 168 L 120 158 Z"/>
          <path d="M100 158 L 92 174 L 100 178 Z"/><path d="M100 158 L 108 174 L 100 178 Z"/>
          <path d="M100 158 L 76 156 L 84 162 Z"/><path d="M100 158 L 124 156 L 116 162 Z"/>
        </g>
        <ellipse cx="78" cy="92" rx="14" ry="8" fill="#9b78b8" opacity="0.7" transform="rotate(-22 78 92)"/>
      </svg>
    `,
  },
  rambutan: {
    flightScale: 1.68,
    bowlScale: 1.2,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <g stroke="#d63a3f" stroke-width="5" stroke-linecap="round" fill="none">
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
        <g fill="#7baa48" stroke="#4c3125" stroke-width="2">
          <circle cx="100" cy="42" r="5"/><circle cx="112" cy="46" r="5"/><circle cx="88" cy="46" r="5"/>
          <circle cx="124" cy="50" r="5"/><circle cx="76" cy="50" r="5"/><circle cx="138" cy="58" r="5"/>
          <circle cx="62" cy="58" r="5"/><circle cx="146" cy="74" r="5"/><circle cx="54" cy="74" r="5"/>
          <circle cx="152" cy="94" r="5"/><circle cx="48" cy="94" r="5"/><circle cx="150" cy="116" r="5"/>
          <circle cx="50" cy="116" r="5"/><circle cx="142" cy="132" r="5"/><circle cx="58" cy="132" r="5"/>
          <circle cx="130" cy="144" r="5"/><circle cx="70" cy="144" r="5"/><circle cx="114" cy="152" r="5"/><circle cx="86" cy="152" r="5"/>
        </g>
        <circle cx="100" cy="100" r="56" fill="#d63a3f" stroke="#4c3125" stroke-width="6"/>
        <ellipse cx="78" cy="80" rx="18" ry="10" fill="#ff7a6e" opacity="0.7" transform="rotate(-26 78 80)"/>
      </svg>
    `,
  },
  starfruit: {
    flightScale: 1.72,
    bowlScale: 1.24,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="starBody" x1="15%" y1="18%" x2="88%" y2="86%">
            <stop offset="0%" stop-color="#ffe88f"/>
            <stop offset="55%" stop-color="#f7cf4a"/>
            <stop offset="100%" stop-color="#d8a826"/>
          </linearGradient>
        </defs>
        <path d="M128 43 150 88 199 94 164 127 172 178 128 155 84 178 92 127 57 94 106 88Z" fill="url(#starBody)" stroke="#c4941d" stroke-width="6" stroke-linejoin="round"/>
        <path d="M128 62 144 95 180 100 155 124 161 161 128 145 95 161 101 124 76 100 112 95Z" fill="#fff3c5" opacity=".38"/>
        <circle cx="128" cy="128" r="15" fill="#ffe08a" opacity=".46"/>
      </svg>
    `,
  },
  lychee: {
    flightScale: 1.5,
    bowlScale: 1.12,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M104 18 C 116 14, 124 22, 122 32" fill="none" stroke="#5a8c3e" stroke-width="6" stroke-linecap="round"/>
        <path d="M122 30 C 138 26, 152 30, 156 44 C 144 50, 130 46, 122 38 Z" fill="#7baa48" stroke="#4c3125" stroke-width="5" stroke-linejoin="round"/>
        <path d="M58 76 C 58 50, 80 36, 100 44 C 120 36, 142 50, 142 76 C 144 116, 124 162, 100 184 C 76 162, 56 116, 58 76 Z" fill="#d4585e" stroke="#4c3125" stroke-width="6" stroke-linejoin="round"/>
        <g fill="none" stroke="#4c3125" stroke-width="2.5" opacity="0.7" stroke-linecap="round">
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
      </svg>
    `,
  },
  guava: {
    flightScale: 1.56,
    bowlScale: 1.14,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="guavaBody" cx="34%" cy="30%" r="75%">
            <stop offset="0%" stop-color="#ffd0cf"/>
            <stop offset="55%" stop-color="#f7a5a5"/>
            <stop offset="100%" stop-color="#ea8088"/>
          </radialGradient>
        </defs>
        <path d="M128 55c38 0 69 31 69 70 0 40-31 73-69 73s-69-33-69-73c0-39 31-70 69-70Z" fill="url(#guavaBody)" stroke="#d27179" stroke-width="6"/>
        <path d="M128 55c8-13 20-22 36-27-2 15-11 26-26 34-13 7-25 9-36 5 6-5 15-9 26-12Z" fill="#5f9b50"/>
        <circle cx="128" cy="127" r="28" fill="#f8c0c7" opacity=".58"/>
        <g fill="#f2d8b7" opacity=".76">
          <circle cx="117" cy="118" r="3"/>
          <circle cx="133" cy="116" r="3"/>
          <circle cx="144" cy="129" r="3"/>
          <circle cx="125" cy="136" r="3"/>
          <circle cx="111" cy="131" r="3"/>
        </g>
      </svg>
    `,
  },
  durian: {
    flightScale: 1.7,
    bowlScale: 1.24,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <path d="M96 12 L 104 12 L 102 28 L 98 28 Z" fill="#4a3220" stroke="#4c3125" stroke-width="3" stroke-linejoin="round"/>
        <path d="M100 22 L 116 36 L 138 30 L 144 50 L 168 60 L 162 82 L 184 96 L 172 116 L 184 138 L 162 146 L 156 168 L 134 162 L 116 180 L 100 168 L 84 180 L 66 162 L 44 168 L 38 146 L 16 138 L 28 116 L 16 96 L 38 82 L 32 60 L 56 50 L 62 30 L 84 36 Z" fill="#c5c533" stroke="#4c3125" stroke-width="6" stroke-linejoin="round"/>
        <g fill="#4c3125" opacity="0.86">
          <path d="M100 50 L 106 64 L 94 64 Z"/><path d="M76 60 L 82 74 L 68 72 Z"/><path d="M124 60 L 132 72 L 118 74 Z"/>
          <path d="M58 82 L 66 94 L 52 94 Z"/><path d="M142 82 L 148 94 L 134 94 Z"/>
          <path d="M100 96 L 108 110 L 92 110 Z"/><path d="M70 110 L 78 122 L 64 122 Z"/><path d="M130 110 L 136 122 L 122 122 Z"/>
          <path d="M86 130 L 94 142 L 80 142 Z"/><path d="M114 130 L 120 142 L 106 142 Z"/>
          <path d="M100 150 L 106 162 L 94 162 Z"/>
        </g>
      </svg>
    `,
  },
};

const BOWL_ART = {
  scale: 1.18,
  svg: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 420">
      <defs>
        <linearGradient id="shell" x1="18%" y1="10%" x2="82%" y2="90%">
          <stop offset="0%" stop-color="#b57c51"/>
          <stop offset="52%" stop-color="#966340"/>
          <stop offset="100%" stop-color="#6d4227"/>
        </linearGradient>
        <linearGradient id="shellInner" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stop-color="#714228"/>
          <stop offset="100%" stop-color="#4d2a18"/>
        </linearGradient>
        <linearGradient id="rim" x1="0%" y1="25%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#fff4e1"/>
          <stop offset="55%" stop-color="#f3dec0"/>
          <stop offset="100%" stop-color="#d8ba91"/>
        </linearGradient>
      </defs>
      <ellipse cx="280" cy="340" rx="182" ry="30" fill="#51331f" opacity=".16"/>
      <path d="M100 170c22 92 92 156 180 156s158-64 180-156c-52 24-112 36-180 36s-128-12-180-36Z" fill="url(#shell)" stroke="#59321d" stroke-width="14" stroke-linejoin="round"/>
      <path d="M126 173c28 49 86 80 154 80s126-31 154-80c-44 20-95 30-154 30s-110-10-154-30Z" fill="url(#shellInner)"/>
      <path d="M110 164c42-31 99-46 170-46s128 15 170 46c-36 19-92 31-170 31s-134-12-170-31Z" fill="url(#rim)" stroke="#8e6844" stroke-width="10" stroke-linejoin="round"/>
      <path d="M142 168c37-17 83-26 138-26s101 9 138 26c-30 11-76 18-138 18s-108-7-138-18Z" fill="#694029" opacity=".48"/>
      <path d="M184 284c34 17 65 24 98 24 31 0 62-7 96-22" fill="none" stroke="#f8eddc" stroke-width="12" stroke-linecap="round" opacity=".22"/>
      <ellipse cx="214" cy="160" rx="88" ry="22" fill="#fff" opacity=".18" transform="rotate(-5 214 160)"/>
    </svg>
  `,
};

const imageCache = new Map();

function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getCachedImage(key, svg) {
  let cached = imageCache.get(key);
  if (!cached) {
    const image = new Image();
    image.decoding = "async";
    image.src = svgToDataUrl(svg);
    cached = { image };
    imageCache.set(key, cached);
  }
  return cached.image;
}

function drawImageIfReady(ctx, image, x, y, width, height) {
  if (!image.complete || image.naturalWidth <= 0) {
    return false;
  }
  ctx.drawImage(image, x, y, width, height);
  return true;
}

function getFruitArt(type) {
  return FRUIT_ART[type] ?? FRUIT_ART.mango;
}

function mixHex(colorA, colorB, amount) {
  const a = colorA.replace("#", "");
  const b = colorB.replace("#", "");
  const parse = (value, index) => Number.parseInt(value.slice(index, index + 2), 16);
  const channel = (index) =>
    Math.round(parse(a, index) + (parse(b, index) - parse(a, index)) * amount)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function drawPlayfulFruitSticker(ctx, type, radius) {
  const shadowColor = "rgba(106, 74, 38, 0.16)";
  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = radius * 0.24;
  ctx.shadowOffsetY = radius * 0.11;
  ctx.fillStyle = "#fff6e4";

  ctx.beginPath();
  if (type === "pineapple") {
    ctx.ellipse(0, radius * 0.1, radius * 1.06, radius * 1.36, 0, 0, Math.PI * 2);
  } else if (type === "starfruit") {
    ctx.ellipse(0, radius * 0.04, radius * 1.14, radius * 1.14, 0, 0, Math.PI * 2);
  } else if (type === "durian") {
    ctx.ellipse(0, radius * 0.02, radius * 1.12, radius * 1.08, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(0, radius * 0.03, radius * 1.1, radius * 1.08, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(181, 135, 80, 0.42)";
  ctx.lineWidth = Math.max(3, radius * 0.08);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.34, radius * 0.3, radius * 0.16, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayfulBowlSticker(ctx, bowlRadius) {
  ctx.save();
  ctx.shadowColor = "rgba(106, 74, 38, 0.14)";
  ctx.shadowBlur = bowlRadius * 0.18;
  ctx.shadowOffsetY = bowlRadius * 0.14;
  ctx.fillStyle = "#fff3dc";
  ctx.beginPath();
  ctx.ellipse(0, bowlRadius * 0.26, bowlRadius * 1.28, bowlRadius * 0.84, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(190, 148, 91, 0.32)";
  ctx.lineWidth = Math.max(6, bowlRadius * 0.05);
  ctx.stroke();
  ctx.restore();
}

function drawCutFace(ctx, type, radius, juiceColor) {
  const flesh = mixHex(juiceColor, "#fff6dd", 0.24);
  const shadow = mixHex(juiceColor, "#23150f", 0.26);
  const width = radius * (type === "pineapple" ? 0.16 : type === "starfruit" ? 0.2 : 0.17);
  const height = radius * (type === "pineapple" ? 0.96 : 0.84);

  ctx.save();
  ctx.fillStyle = flesh;
  ctx.beginPath();
  ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = shadow;
  ctx.lineWidth = Math.max(2, radius * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.94);
  ctx.lineTo(0, height * 0.94);
  ctx.stroke();

  if (type === "papaya" || type === "watermelon" || type === "guava" || type === "dragonfruit") {
    const seedColor =
      type === "dragonfruit"
        ? "#2d2322"
        : type === "guava"
          ? "#f1dfc5"
          : "#332016";
    ctx.fillStyle = seedColor;
    const seedCount = type === "papaya" ? 6 : 4;
    for (let index = 0; index < seedCount; index += 1) {
      const t = seedCount === 1 ? 0.5 : index / (seedCount - 1);
      const y = -height * 0.5 + t * height;
      const x = (index % 2 === 0 ? -1 : 1) * width * 0.28;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 0.05, radius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawHalfArc(ctx, radius, side) {
  ctx.beginPath();
  if (side === "left") {
    ctx.arc(0, 0, radius, Math.PI / 2, (Math.PI * 3) / 2);
  } else {
    ctx.arc(0, 0, radius, -Math.PI / 2, Math.PI / 2);
  }
  ctx.closePath();
}

function drawFruitHalfBase(ctx, type, radius, juiceColor, side) {
  const rind = mixHex(juiceColor, "#2a180f", 0.32);
  const flesh = mixHex(juiceColor, "#fff4d8", 0.18);
  const innerRadius =
    type === "pineapple" ? radius * 0.84 : type === "starfruit" ? radius * 0.8 : radius * 0.86;
  const innerOffset =
    side === "left" ? -radius * 0.06 : radius * 0.06;

  ctx.save();
  ctx.fillStyle = rind;
  drawHalfArc(ctx, radius, side);
  ctx.fill();

  ctx.save();
  ctx.translate(innerOffset, 0);
  ctx.fillStyle = flesh;
  drawHalfArc(ctx, innerRadius, side);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = mixHex(juiceColor, "#1c120d", 0.22);
  ctx.lineWidth = Math.max(2, radius * 0.05);
  drawHalfArc(ctx, radius, side);
  ctx.stroke();
  ctx.restore();
}

export function preloadVectorArt() {
  for (const [type, art] of Object.entries(FRUIT_ART)) {
    const image = getCachedImage(`fruit:${type}`, art.svg);
    image.decode?.().catch(() => {});
  }
  const bowlImage = getCachedImage("bowl", BOWL_ART.svg);
  bowlImage.decode?.().catch(() => {});
}

export function drawFruitSvg(ctx, type, radius, variant = "flight") {
  const art = getFruitArt(type);
  const image = getCachedImage(`fruit:${type}`, art.svg);
  const scale = variant === "bowl" ? art.bowlScale : art.flightScale;
  const drawRadius = radius * scale;
  drawPlayfulFruitSticker(ctx, type, radius);
  ctx.save();
  ctx.filter = "saturate(1.16) brightness(1.05)";
  const drawn = drawImageIfReady(
    ctx,
    image,
    -drawRadius,
    -drawRadius,
    drawRadius * 2,
    drawRadius * 2
  );
  ctx.restore();
  return drawn;
}

export function drawFruitHalfSvg(ctx, type, radius, juiceColor, side) {
  drawFruitHalfBase(ctx, type, radius, juiceColor, side);
  drawCutFace(ctx, type, radius, juiceColor);
  return true;
}

export function drawBowlSvg(ctx, bowlRadius) {
  const image = getCachedImage("bowl", BOWL_ART.svg);
  const width = bowlRadius * BOWL_ART.scale * 2.2;
  const height = bowlRadius * BOWL_ART.scale * 1.58;
  drawPlayfulBowlSticker(ctx, bowlRadius);
  ctx.save();
  ctx.filter = "saturate(1.08) brightness(1.04)";
  const drawn = drawImageIfReady(ctx, image, -width / 2, -height * 0.34, width, height);
  ctx.restore();
  return drawn;
}
