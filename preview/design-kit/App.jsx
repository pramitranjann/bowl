/* global React, ReactDOM,
   Scene, BrandMark, IconButton, BlobButton,
   HudSpread, Fruit, BowlReveal, ShareSheet, FruitIcon,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */
const { useState } = React;

// ============================================================
// Bowl — Game UI Kit
// ----------------------------------------------------------------
// Bottom-right "Screens" picker switches between the canonical states.
// "Tweaks" toggles scene mood + fruit-rendering.
// ============================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "sceneTime": "goldenHour",
  "animateScene": true,
  "fruitsIllustrated": true,
  "showSliced": false
}/*EDITMODE-END*/;

// Sample bowl composition for game-over reveal.
const BOWL_FRUITS = [
  { kind: 'watermelon', x: 22, y: 36, size: 88, rot: -8 },
  { kind: 'pineapple',  x: 50, y: 22, size: 92, rot: 6 },
  { kind: 'mango',      x: 78, y: 38, size: 80, rot: 14 },
  { kind: 'rambutan',   x: 18, y: 70, size: 72, rot: -14 },
  { kind: 'dragonfruit',x: 44, y: 64, size: 86, rot: 4 },
  { kind: 'mangosteen', x: 70, y: 70, size: 70, rot: 18 },
  { kind: 'lychee',     x: 30, y: 50, size: 56, rot: -4 },
  { kind: 'durian',     x: 60, y: 50, size: 64, rot: 8 },
];

// Fruits in flight on play screen — mix of whole and (when toggled) sliced.
const FLIGHT = [
  { kind: 'watermelon',  x: '22%', y: '46%', size: 96,  rot: -12 },
  { kind: 'mango',       x: '60%', y: '58%', size: 84,  rot:  18 },
  { kind: 'dragonfruit', x: '40%', y: '34%', size: 88,  rot:   6 },
  { kind: 'durian',      x: '78%', y: '44%', size: 110, rot:  -4 },
  { kind: 'rambutan',    x: '14%', y: '70%', size: 76,  rot:   8 },
  { kind: 'lychee',      x: '54%', y: '76%', size: 64,  rot: -14 },
];

function ScreenPicker({ screen, setScreen }) {
  const screens = ['opening', 'mode', 'worlds', 'play', 'gameover', 'share'];
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
      background: 'rgba(244,235,217,0.94)',
      borderRadius: 999,
      boxShadow: '0 10px 24px rgba(0,0,0,0.32)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12, color: '#4c3125',
    }}>
      <span style={{ padding: '0 8px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.4, fontSize: 10 }}>
        screens
      </span>
      {screens.map(s => (
        <button key={s} onClick={() => setScreen(s)} style={{
          border: 0, padding: '6px 12px', borderRadius: 999,
          background: screen === s ? '#c5d86d' : 'transparent',
          fontFamily: 'inherit', fontSize: 12, color: 'inherit',
          cursor: 'pointer', textTransform: 'capitalize',
        }}>{s}</button>
      ))}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState('mode');
  const [muted, setMuted] = useState(false);
  const [score] = useState(184);
  const [time] = useState('1:23');

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { sceneTime, animateScene, fruitsIllustrated, showSliced } = tweaks;

  const [mode, setMode] = useState('Endless');
  const goPlay = (m) => { setMode(m); setScreen('play'); };

  return (
    <div data-screen-label={screen} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Scene time={sceneTime} animate={animateScene}>
        {/* Brand wordmark — top left */}
        <div style={{ position: 'absolute', top: 24, left: 28, zIndex: 5 }}>
          <BrandMark size={44} onClick={() => setScreen('opening')} />
        </div>

        {/* Persistent corner controls visible during play / mode */}
        {(screen === 'play' || screen === 'mode' || screen === 'worlds') && (
          <>
            <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 5, display: 'flex', gap: 14 }}>
              {screen === 'play' && (
                <IconButton icon="iconHomeBold.svg" label="Home" onClick={() => setScreen('mode')} />
              )}
              <IconButton icon="iconSettingsBold.svg" label="Settings" />
            </div>
            <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 5 }}>
              <IconButton icon="sound on.svg" label="Sound" muted={muted} onClick={() => setMuted(!muted)} />
            </div>
          </>
        )}

        {/* OPENING */}
        {screen === 'opening' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center',
            zIndex: 4,
          }}>
            <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
              <h1 style={{
                margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400,
                fontSize: 'clamp(3.8rem, 8vw, 7rem)', lineHeight: 0.92,
                color: 'var(--color-evening-amber)',
                textShadow: '0 6px 16px rgba(0,0,0,0.34)',
                animation: 'bowl-enter 480ms cubic-bezier(0.2,0,0,1) both',
              }}>raise a finger</h1>
              <p style={{
                margin: 0, fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2.5rem)', lineHeight: 0.98,
                color: 'rgba(244,235,217,0.96)',
                textShadow: '0 4px 12px rgba(0,0,0,0.30)',
                animation: 'bowl-enter 480ms cubic-bezier(0.2,0,0,1) 140ms both',
              }}>looking at your finger very closely</p>
              <button onClick={() => setScreen('mode')} style={{
                marginTop: 32,
                fontFamily: 'system-ui, sans-serif', fontStyle: 'italic', fontSize: 12,
                background: 'transparent', color: 'rgba(244,235,217,0.6)', border: 0, cursor: 'pointer',
              }}>(skip · in the real game: hand-tracking)</button>
            </div>
          </div>
        )}

        {/* MODE SELECT */}
        {screen === 'mode' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 4,
          }}>
            <div style={{ display: 'flex', gap: 'clamp(34px, 3vw, 58px)' }}>
              <BlobButton onClick={() => goPlay('Endless')}>Endless</BlobButton>
              <BlobButton onClick={() => goPlay('Timed')}>Timed</BlobButton>
              <BlobButton onClick={() => setScreen('worlds')}>Worlds</BlobButton>
            </div>
          </div>
        )}

        {/* WORLDS */}
        {screen === 'worlds' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 4,
          }}>
            <div style={{ display: 'flex', gap: 'clamp(34px, 3vw, 58px)' }}>
              <BlobButton onClick={() => goPlay('2 Player')}>2 Player</BlobButton>
              <BlobButton onClick={() => goPlay('Beach')}>Beach</BlobButton>
            </div>
          </div>
        )}

        {/* PLAY */}
        {screen === 'play' && (
          <>
            <HudSpread score={score} time={time} mode={mode} lives={3} lost={1}/>

            {FLIGHT.map((f, i) => (
              <Fruit key={i} {...f} illustrated={fruitsIllustrated} sliced={showSliced && i % 2 === 0}/>
            ))}

            <button onClick={() => setScreen('gameover')} style={{
              position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
              fontFamily: 'system-ui, sans-serif', fontStyle: 'italic', fontSize: 12,
              background: 'transparent', color: 'rgba(244,235,217,0.55)', border: 0, cursor: 'pointer',
            }}>(simulate game over)</button>
          </>
        )}

        {/* GAME OVER → BOWL REVEAL */}
        {screen === 'gameover' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 4,
          }}>
            <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
              <p style={{
                margin: 0, fontFamily: 'var(--font-display)', fontSize: 38,
                color: 'var(--color-hibiscus)',
                textShadow: '0 3px 10px rgba(0,0,0,0.18)',
                animation: 'bowl-enter 360ms cubic-bezier(0.2,0,0,1) both',
              }}>what a bowl</p>
              <BowlReveal fruits={BOWL_FRUITS}/>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 76, lineHeight: 0.84,
                color: 'var(--color-coconut-cream)', textShadow: '0 4px 14px rgba(0,0,0,0.34)',
                fontVariantNumeric: 'tabular-nums',
                animation: 'bowl-enter 420ms cubic-bezier(0.2,0,0,1) 200ms both',
              }}>{score}</div>
              <div style={{ display: 'flex', gap: 22 }}>
                <BlobButton onClick={() => setScreen('mode')}>Again</BlobButton>
                <BlobButton primary onClick={() => setScreen('share')}>Share</BlobButton>
              </div>
            </div>
          </div>
        )}

        {/* SHARE MODAL */}
        {screen === 'share' && (
          <ShareSheet
            score={score}
            fruits={BOWL_FRUITS}
            onClose={() => setScreen('gameover')}
            onAgain={() => setScreen('mode')}
          />
        )}
      </Scene>

      <ScreenPicker screen={screen} setScreen={setScreen}/>

      <TweaksPanel title="Tweaks" defaultOpen={false}>
        <TweakSection title="Scene">
          <TweakRadio
            label="time of day"
            value={sceneTime}
            onChange={(v) => setTweak('sceneTime', v)}
            options={[
              { value: 'noon',        label: 'noon' },
              { value: 'goldenHour',  label: 'golden' },
              { value: 'dusk',        label: 'dusk' },
            ]}
          />
          <TweakToggle
            label="ambient animation"
            value={animateScene}
            onChange={(v) => setTweak('animateScene', v)}
          />
        </TweakSection>

        <TweakSection title="Fruits">
          <TweakToggle
            label="illustrated fruits"
            value={fruitsIllustrated}
            onChange={(v) => setTweak('fruitsIllustrated', v)}
          />
          <TweakToggle
            label="show sliced (play screen)"
            value={showSliced}
            onChange={(v) => setTweak('showSliced', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
