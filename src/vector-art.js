const FRUIT_ART = {
  watermelon: {
    flightScale: 1.54,
    bowlScale: 1.18,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="flesh" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stop-color="#ff8d9a"/>
            <stop offset="58%" stop-color="#ff5a6c"/>
            <stop offset="100%" stop-color="#df2d45"/>
          </radialGradient>
        </defs>
        <ellipse cx="128" cy="132" rx="82" ry="78" fill="#1e5a39"/>
        <ellipse cx="128" cy="132" rx="72" ry="68" fill="#f6f5d4"/>
        <ellipse cx="128" cy="132" rx="63" ry="60" fill="url(#flesh)"/>
        <path d="M82 77c-8 21-11 40-9 55 2 17 8 36 18 54" fill="none" stroke="#2e7d49" stroke-width="11" stroke-linecap="round" opacity=".82"/>
        <path d="M115 72c-4 18-5 38-3 60 2 24 6 43 13 57" fill="none" stroke="#2e7d49" stroke-width="10" stroke-linecap="round" opacity=".74"/>
        <path d="M150 72c4 18 5 38 3 60-2 24-6 43-13 57" fill="none" stroke="#2e7d49" stroke-width="10" stroke-linecap="round" opacity=".74"/>
        <path d="M176 80c8 20 11 39 10 54-2 16-8 34-18 52" fill="none" stroke="#2e7d49" stroke-width="11" stroke-linecap="round" opacity=".82"/>
        <g fill="#3b1718" opacity=".72">
          <ellipse cx="106" cy="116" rx="4" ry="7" transform="rotate(-18 106 116)"/>
          <ellipse cx="147" cy="107" rx="4" ry="7" transform="rotate(12 147 107)"/>
          <ellipse cx="162" cy="142" rx="4" ry="7" transform="rotate(18 162 142)"/>
          <ellipse cx="118" cy="154" rx="4" ry="7" transform="rotate(-12 118 154)"/>
          <ellipse cx="139" cy="165" rx="4" ry="7" transform="rotate(8 139 165)"/>
        </g>
        <ellipse cx="102" cy="94" rx="24" ry="12" fill="#fff" opacity=".16" transform="rotate(-20 102 94)"/>
      </svg>
    `,
  },
  pineapple: {
    flightScale: 1.84,
    bowlScale: 1.28,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <linearGradient id="body" x1="0%" y1="12%" x2="100%" y2="88%">
            <stop offset="0%" stop-color="#ffd768"/>
            <stop offset="58%" stop-color="#f4bf2a"/>
            <stop offset="100%" stop-color="#cb8e12"/>
          </linearGradient>
        </defs>
        <path d="M128 22c14 11 18 21 18 34-1 15-8 28-18 39-10-10-17-23-18-39 0-13 5-23 18-34Z" fill="#3a8b45"/>
        <path d="M109 31c-18 13-27 26-28 42 1 16 11 29 27 38 0-21 1-46 1-80Z" fill="#2e7440"/>
        <path d="M147 31c18 13 27 26 28 42-1 16-11 29-27 38 0-21-1-46-1-80Z" fill="#2e7440"/>
        <path d="M84 58c-13 9-25 19-35 33 16 4 31 2 46-7 8-5 16-12 23-23-14-4-25-5-34-3Z" fill="#63a34b"/>
        <path d="M172 58c13 9 25 19 35 33-16 4-31 2-46-7-8-5-16-12-23-23 14-4 25-5 34-3Z" fill="#63a34b"/>
        <path d="M91 82c-15 20-27 42-27 68 0 44 28 74 64 74s64-30 64-74c0-26-12-48-27-68-8-11-22-18-37-18s-29 7-37 18Z" fill="url(#body)" stroke="#b2740b" stroke-width="6"/>
        <g stroke="#b2740b" stroke-width="5" opacity=".58">
          <path d="M93 90 163 214"/>
          <path d="M122 82 185 194"/>
          <path d="M74 118 144 226"/>
          <path d="M163 90 93 214"/>
          <path d="M134 82 71 194"/>
          <path d="M182 118 112 226"/>
        </g>
        <g fill="#ffe59a" opacity=".45">
          <circle cx="105" cy="118" r="7"/>
          <circle cx="149" cy="115" r="7"/>
          <circle cx="92" cy="150" r="7"/>
          <circle cx="130" cy="146" r="7"/>
          <circle cx="166" cy="150" r="7"/>
          <circle cx="111" cy="181" r="7"/>
          <circle cx="150" cy="184" r="7"/>
        </g>
      </svg>
    `,
  },
  mango: {
    flightScale: 1.56,
    bowlScale: 1.16,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="mangoBody" cx="30%" cy="28%" r="75%">
            <stop offset="0%" stop-color="#ffd38b"/>
            <stop offset="52%" stop-color="#ffa83b"/>
            <stop offset="100%" stop-color="#ef7e1f"/>
          </radialGradient>
        </defs>
        <path d="M88 49c31-22 79-14 101 20 21 33 18 82-7 117-22 31-68 41-102 23-42-21-56-76-35-119 9-19 24-32 43-41Z" fill="url(#mangoBody)" stroke="#d86d17" stroke-width="6"/>
        <path d="M123 44c11-8 24-12 40-9-5 10-15 19-29 24-16 6-29 6-39 2 7-7 16-13 28-17Z" fill="#51914b"/>
        <ellipse cx="101" cy="92" rx="26" ry="12" fill="#fff4d6" opacity=".22" transform="rotate(-28 101 92)"/>
        <path d="M166 76c-12 18-26 34-43 46-18 12-38 21-58 23" fill="none" stroke="#ffdb87" stroke-width="7" opacity=".42" stroke-linecap="round"/>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="dragonBody" cx="38%" cy="28%" r="78%">
            <stop offset="0%" stop-color="#ff8dd0"/>
            <stop offset="55%" stop-color="#ef4da7"/>
            <stop offset="100%" stop-color="#c71475"/>
          </radialGradient>
        </defs>
        <path d="M71 107c-22-16-28-36-20-60 17 5 32 14 45 29" fill="#89c457"/>
        <path d="M184 106c22-16 28-36 20-60-17 5-32 14-45 29" fill="#89c457"/>
        <path d="M55 146c-22 0-39 8-50 25 20 8 39 8 59-2" fill="#89c457"/>
        <path d="M201 146c22 0 39 8 50 25-20 8-39 8-59-2" fill="#89c457"/>
        <path d="M128 46c39 0 73 32 73 80 0 54-33 89-73 89s-73-35-73-89c0-48 34-80 73-80Z" fill="url(#dragonBody)" stroke="#ab115f" stroke-width="6"/>
        <ellipse cx="128" cy="127" rx="50" ry="58" fill="#fff7fb"/>
        <g fill="#28201f" opacity=".82">
          <circle cx="102" cy="101" r="2.5"/>
          <circle cx="123" cy="92" r="2.5"/>
          <circle cx="145" cy="101" r="2.5"/>
          <circle cx="161" cy="118" r="2.5"/>
          <circle cx="93" cy="122" r="2.5"/>
          <circle cx="118" cy="117" r="2.5"/>
          <circle cx="141" cy="127" r="2.5"/>
          <circle cx="109" cy="140" r="2.5"/>
          <circle cx="132" cy="149" r="2.5"/>
          <circle cx="153" cy="144" r="2.5"/>
        </g>
        <ellipse cx="102" cy="88" rx="24" ry="11" fill="#fff" opacity=".18" transform="rotate(-20 102 88)"/>
      </svg>
    `,
  },
  mangosteen: {
    flightScale: 1.56,
    bowlScale: 1.14,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="mangoSteenBody" cx="36%" cy="30%" r="72%">
            <stop offset="0%" stop-color="#9d79c0"/>
            <stop offset="55%" stop-color="#6d458d"/>
            <stop offset="100%" stop-color="#4b2c67"/>
          </radialGradient>
        </defs>
        <path d="M128 58c37 0 68 31 68 69s-31 70-68 70-68-32-68-70 31-69 68-69Z" fill="url(#mangoSteenBody)" stroke="#3a2050" stroke-width="6"/>
        <path d="M128 57c-22 0-39 10-51 26 18 2 32-2 44-11 3 12 6 23 7 35 8-10 15-22 20-35 10 10 23 15 40 16-9-19-29-31-60-31Z" fill="#6aa84f"/>
        <path d="M102 161c16 11 34 11 52 0-2 12-11 23-26 23s-24-11-26-23Z" fill="#f4eee8" opacity=".82"/>
        <ellipse cx="104" cy="95" rx="21" ry="10" fill="#fff" opacity=".14" transform="rotate(-22 104 95)"/>
      </svg>
    `,
  },
  rambutan: {
    flightScale: 1.68,
    bowlScale: 1.2,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="rambutanBody" cx="36%" cy="30%" r="74%">
            <stop offset="0%" stop-color="#ff8c8c"/>
            <stop offset="58%" stop-color="#e5394e"/>
            <stop offset="100%" stop-color="#a11225"/>
          </radialGradient>
        </defs>
        <g stroke="#7bb85a" stroke-width="6" stroke-linecap="round" opacity=".95">
          <path d="M128 38v33"/>
          <path d="M93 48 107 78"/>
          <path d="M163 48 149 78"/>
          <path d="M69 76 94 95"/>
          <path d="M187 76 162 95"/>
          <path d="M56 114 88 121"/>
          <path d="M200 114 168 121"/>
          <path d="M63 153 93 144"/>
          <path d="M193 153 163 144"/>
          <path d="M85 186 106 160"/>
          <path d="M171 186 150 160"/>
        </g>
        <circle cx="128" cy="127" r="56" fill="url(#rambutanBody)" stroke="#84111f" stroke-width="6"/>
        <circle cx="128" cy="127" r="24" fill="#fff2eb"/>
        <ellipse cx="104" cy="102" rx="19" ry="10" fill="#fff" opacity=".16" transform="rotate(-22 104 102)"/>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="lycheeBody" cx="38%" cy="30%" r="74%">
            <stop offset="0%" stop-color="#ffd5d8"/>
            <stop offset="58%" stop-color="#f6a8af"/>
            <stop offset="100%" stop-color="#d57c84"/>
          </radialGradient>
        </defs>
        <circle cx="128" cy="128" r="58" fill="url(#lycheeBody)" stroke="#c06f78" stroke-width="6"/>
        <g fill="#f9e4e6" opacity=".32">
          <circle cx="101" cy="97" r="8"/>
          <circle cx="123" cy="85" r="7"/>
          <circle cx="149" cy="92" r="8"/>
          <circle cx="164" cy="114" r="8"/>
          <circle cx="94" cy="123" r="7"/>
          <circle cx="118" cy="120" r="8"/>
          <circle cx="143" cy="128" r="7"/>
          <circle cx="111" cy="151" r="8"/>
          <circle cx="139" cy="156" r="8"/>
          <circle cx="160" cy="146" r="7"/>
        </g>
        <ellipse cx="106" cy="97" rx="18" ry="10" fill="#fff" opacity=".16" transform="rotate(-20 106 97)"/>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
        <defs>
          <radialGradient id="durianBody" cx="38%" cy="28%" r="76%">
            <stop offset="0%" stop-color="#b1936e"/>
            <stop offset="58%" stop-color="#88684a"/>
            <stop offset="100%" stop-color="#654730"/>
          </radialGradient>
        </defs>
        <path d="M128 46 149 69 179 61 186 92 212 108 199 137 212 166 183 177 175 207 145 199 128 221 111 199 81 207 73 177 44 166 57 137 44 108 70 92 77 61 107 69Z" fill="url(#durianBody)" stroke="#4f3725" stroke-width="6" stroke-linejoin="round"/>
        <g fill="#c8c34e" opacity=".88">
          <circle cx="128" cy="46" r="6"/>
          <circle cx="179" cy="61" r="6"/>
          <circle cx="212" cy="108" r="6"/>
          <circle cx="212" cy="166" r="6"/>
          <circle cx="175" cy="207" r="6"/>
          <circle cx="128" cy="221" r="6"/>
          <circle cx="81" cy="207" r="6"/>
          <circle cx="44" cy="166" r="6"/>
          <circle cx="44" cy="108" r="6"/>
          <circle cx="77" cy="61" r="6"/>
        </g>
        <ellipse cx="103" cy="93" rx="20" ry="11" fill="#fff" opacity=".12" transform="rotate(-24 103 93)"/>
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
  const flesh = mixHex(juiceColor, "#fff6dd", 0.36);
  const shadow = mixHex(juiceColor, "#23150f", 0.26);
  const width = radius * (type === "pineapple" ? 0.22 : type === "starfruit" ? 0.28 : 0.24);
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
  const art = getFruitArt(type);
  const image = getCachedImage(`fruit:${type}`, art.svg);
  const drawRadius = radius * art.flightScale;

  if (!image.complete || image.naturalWidth <= 0) {
    return false;
  }

  drawPlayfulFruitSticker(ctx, type, radius * 0.98);
  ctx.save();
  ctx.beginPath();
  if (side === "left") {
    ctx.rect(-drawRadius - 2, -drawRadius - 2, drawRadius + 4, drawRadius * 2 + 4);
  } else {
    ctx.rect(-2, -drawRadius - 2, drawRadius + 4, drawRadius * 2 + 4);
  }
  ctx.clip();
  ctx.filter = "saturate(1.14) brightness(1.04)";
  ctx.drawImage(image, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
  ctx.restore();

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
