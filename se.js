/* Web Audio synthesized sound effects (SE) tailored for the antique curio shop atmosphere.
 * Zero external asset dependencies; respects state.muted and standalone SE volume settings. */
const SE = (() => {
  const SETTING_KEY = 'angel-curio-shop-se-settings-v1';
  let settings = { volume: 75 };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTING_KEY));
    if (Number.isFinite(saved?.volume)) settings.volume = Math.max(0, Math.min(100, saved.volume));
  } catch {}

  let ctx = null;
  let master = null;
  let compressor = null;
  let noiseBuffer = null;
  let mutedOverride = null;
  const lastPlayedAt = Object.create(null);

  function isMuted() {
    if (mutedOverride !== null) return mutedOverride;
    if (typeof state !== 'undefined' && state && typeof state.muted === 'boolean') return state.muted;
    return false;
  }

  function getLevel() {
    return isMuted() ? 0 : Math.max(0, Math.min(1, settings.volume / 100));
  }

  function ensureContext() {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.16;

      master = ctx.createGain();
      master.gain.value = getLevel() * 0.85;
      master.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (master) {
      master.gain.setValueAtTime(getLevel() * 0.85, ctx.currentTime);
    }
    return ctx;
  }

  function getNoiseBuffer(audioCtx) {
    if (noiseBuffer && noiseBuffer.sampleRate === audioCtx.sampleRate) return noiseBuffer;
    const length = Math.floor(audioCtx.sampleRate * 0.8);
    const buf = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return buf;
  }

  function tone(audioCtx, {
    type = 'sine',
    freq = 440,
    endFreq = null,
    start = 0,
    duration = 0.2,
    attack = 0.006,
    gain = 0.2,
    filterType = null,
    filterFreq = 4000,
    filterEndFreq = null,
    q = 1
  }) {
    const t0 = audioCtx.currentTime + start;
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (endFreq !== null && endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
    }

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(Math.max(0.0002, gain), t0 + Math.min(attack, duration * 0.4));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    if (filterType) {
      const flt = audioCtx.createBiquadFilter();
      flt.type = filterType;
      flt.frequency.setValueAtTime(filterFreq, t0);
      if (filterEndFreq !== null) {
        flt.frequency.exponentialRampToValueAtTime(Math.max(60, filterEndFreq), t0 + duration);
      }
      flt.Q.value = q;
      osc.connect(flt);
      flt.connect(env);
    } else {
      osc.connect(env);
    }

    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function noise(audioCtx, {
    start = 0,
    duration = 0.08,
    attack = 0.005,
    gain = 0.12,
    filterType = 'bandpass',
    freq = 1800,
    endFreq = null,
    q = 1.4
  }) {
    const t0 = audioCtx.currentTime + start;
    const src = audioCtx.createBufferSource();
    src.buffer = getNoiseBuffer(audioCtx);

    const flt = audioCtx.createBiquadFilter();
    flt.type = filterType;
    flt.frequency.setValueAtTime(freq, t0);
    if (endFreq !== null) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), t0 + duration);
    }
    flt.Q.value = q;

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(Math.max(0.0002, gain), t0 + Math.min(attack, duration * 0.4));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(flt);
    flt.connect(env);
    env.connect(master);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  // Crisp metallic coin clink: high inharmonic partials + tiny strike click
  function coinClink(audioCtx, start, baseFreq = 2350, volume = 0.18, decay = 0.22) {
    noise(audioCtx, { start, duration: 0.018, attack: 0.001, gain: volume * 0.55, filterType: 'highpass', freq: 3800, q: 1.0 });
    tone(audioCtx, { type: 'triangle', freq: baseFreq, start, duration: decay, attack: 0.002, gain: volume });
    tone(audioCtx, { type: 'sine', freq: baseFreq * 1.52, start, duration: decay * 0.88, attack: 0.002, gain: volume * 0.72 });
    tone(audioCtx, { type: 'sine', freq: baseFreq * 2.13, start, duration: decay * 0.65, attack: 0.002, gain: volume * 0.42 });
    tone(audioCtx, { type: 'sine', freq: baseFreq * 0.5, start, duration: decay * 0.45, attack: 0.002, gain: volume * 0.24 });
  }

  function brassBell(audioCtx, start, freq, volume = 0.16, duration = 0.55) {
    tone(audioCtx, { type: 'sine', freq, start, duration, attack: 0.004, gain: volume });
    tone(audioCtx, { type: 'sine', freq: freq * 2.0, start, duration: duration * 0.78, attack: 0.003, gain: volume * 0.45 });
    tone(audioCtx, { type: 'triangle', freq: freq * 2.98, start, duration: duration * 0.45, attack: 0.002, gain: volume * 0.2 });
    noise(audioCtx, { start, duration: 0.015, attack: 0.001, gain: volume * 0.35, filterType: 'bandpass', freq: freq * 1.6, q: 2.2 });
  }

  function woodTap(audioCtx, start, pitch = 210, volume = 0.18) {
    tone(audioCtx, { type: 'triangle', freq: pitch, endFreq: pitch * 0.52, start, duration: 0.075, attack: 0.002, gain: volume, filterType: 'lowpass', filterFreq: 1400 });
    noise(audioCtx, { start, duration: 0.024, attack: 0.001, gain: volume * 0.6, filterType: 'bandpass', freq: 880, q: 2.0 });
  }

  const RECIPES = {
    // 「ちゃりんちゃりん♪」— gold coin clink when selling items
    sell(c) {
      coinClink(c, 0, 2360, 0.17, 0.21);
      coinClink(c, 0.088, 2720, 0.20, 0.30);
    },
    coin(c) {
      RECIPES.sell(c);
    },
    // 「ちゃりん・ちゃりん・シャラン♪」— high-value sales (>= 250G)
    sellHigh(c) {
      coinClink(c, 0, 2240, 0.16, 0.20);
      coinClink(c, 0.075, 2660, 0.18, 0.24);
      coinClink(c, 0.155, 3140, 0.21, 0.36);
      tone(c, { type: 'sine', freq: 1318.5, start: 0.17, duration: 0.42, attack: 0.01, gain: 0.09 });
      tone(c, { type: 'sine', freq: 1975.5, start: 0.21, duration: 0.45, attack: 0.01, gain: 0.075 });
    },
    // ブーム・人気商品販売：黄金のチャイム＋祝福スパークル
    sellBoom(c) {
      coinClink(c, 0, 2380, 0.17, 0.22);
      coinClink(c, 0.07, 2860, 0.19, 0.26);
      coinClink(c, 0.14, 3380, 0.22, 0.38);
      brassBell(c, 0.16, 1318.51, 0.11, 0.42);
      brassBell(c, 0.23, 1760, 0.11, 0.48);
    },
    // ブーム開始・予告：街の鐘と華やかなファンファーレ
    boomStart(c) {
      brassBell(c, 0, 783.99, 0.14, 0.48);
      brassBell(c, 0.11, 987.77, 0.14, 0.50);
      brassBell(c, 0.22, 1174.66, 0.15, 0.56);
      brassBell(c, 0.34, 1567.98, 0.16, 0.72);
    },
    // 仕入れ完了：木箱と革袋の小銭音
    buy(c) {
      woodTap(c, 0, 175, 0.22);
      coinClink(c, 0.045, 1980, 0.12, 0.16);
      coinClink(c, 0.105, 2290, 0.14, 0.22);
    },
    // 鑑定（通常 B/C）：澄んだ結晶音叉
    appraise(c) {
      brassBell(c, 0, 1046.5, 0.14, 0.46);
      tone(c, { type: 'sine', freq: 1568, start: 0.06, duration: 0.42, attack: 0.008, gain: 0.09 });
    },
    // 鑑定（高品質 A）：神秘的な天使のアルペジオ
    appraiseA(c) {
      const notes = [880, 1108.73, 1318.51, 1760];
      notes.forEach((n, idx) => {
        brassBell(c, idx * 0.06, n, 0.12 + idx * 0.015, 0.55 - idx * 0.04);
      });
    },
    // 棚出し・入れ替え：マホガニー棚に品物を置く音
    shelf(c) {
      woodTap(c, 0, 235, 0.18);
      noise(c, { start: 0.015, duration: 0.04, attack: 0.004, gain: 0.06, filterType: 'bandpass', freq: 1500, q: 1.5 });
    },
    // 一括陳列：軽快に棚へ並ぶ連続音
    bulkDisplay(c) {
      woodTap(c, 0, 210, 0.15);
      woodTap(c, 0.06, 245, 0.16);
      woodTap(c, 0.12, 285, 0.17);
      brassBell(c, 0.17, 1568, 0.08, 0.24);
    },
    // 価格設定：羽ペンの記帳と小さな鈴
    price(c) {
      noise(c, { start: 0, duration: 0.038, attack: 0.003, gain: 0.09, filterType: 'bandpass', freq: 3100, endFreq: 2100, q: 2.2 });
      tone(c, { type: 'sine', freq: 1480, start: 0.025, duration: 0.11, attack: 0.003, gain: 0.11 });
    },
    // 設備設置：重厚な真鍮金具＋建設和音
    equip(c) {
      woodTap(c, 0, 145, 0.24);
      brassBell(c, 0.05, 587.33, 0.13, 0.45);
      brassBell(c, 0.12, 880, 0.15, 0.58);
      tone(c, { type: 'triangle', freq: 1174.66, start: 0.19, duration: 0.52, attack: 0.01, gain: 0.10 });
    },
    // 仕入れルート解放：隠し扉の閂＋神秘音
    unlockRoute(c) {
      noise(c, { start: 0, duration: 0.09, attack: 0.01, gain: 0.11, filterType: 'bandpass', freq: 950, endFreq: 1650, q: 2.5 });
      brassBell(c, 0.08, 659.25, 0.13, 0.45);
      brassBell(c, 0.17, 987.77, 0.15, 0.58);
      brassBell(c, 0.26, 1318.51, 0.13, 0.62);
    },
    // 借金返済：硬貨袋と帳簿スタンプ
    repay(c) {
      coinClink(c, 0, 2180, 0.14, 0.18);
      coinClink(c, 0.06, 2490, 0.15, 0.20);
      woodTap(c, 0.13, 125, 0.24);
      tone(c, { type: 'sine', freq: 783.99, start: 0.15, duration: 0.26, attack: 0.005, gain: 0.10 });
    },
    // 借金完済！祝福の鐘
    debtCleared(c) {
      coinClink(c, 0, 2400, 0.15, 0.20);
      coinClink(c, 0.07, 2820, 0.16, 0.22);
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((n, idx) => {
        brassBell(c, 0.13 + idx * 0.075, n, 0.14, 0.72);
      });
    },
    // 特注納品完了：コイン袋と達成チャイム
    orderComplete(c) {
      coinClink(c, 0, 2450, 0.16, 0.22);
      coinClink(c, 0.065, 2940, 0.18, 0.26);
      brassBell(c, 0.12, 987.77, 0.14, 0.45);
      brassBell(c, 0.20, 1479.98, 0.15, 0.62);
    },
    // 評判ランク昇格：店格が上がる祝福和音
    rankUp(c) {
      brassBell(c, 0, 659.25, 0.13, 0.46);
      brassBell(c, 0.09, 880, 0.14, 0.50);
      brassBell(c, 0.18, 1108.73, 0.14, 0.54);
      brassBell(c, 0.28, 1318.51, 0.16, 0.72);
    },
    // 本日の店を開く：アンティーク店のドアベル（カランコロン♪）
    openShop(c) {
      brassBell(c, 0, 1318.51, 0.16, 0.62);
      brassBell(c, 0.145, 1567.98, 0.17, 0.72);
      brassBell(c, 0.30, 1318.51, 0.075, 0.48);
    },
    // 閉店：木の扉と夕暮れの合図
    closeDay(c) {
      woodTap(c, 0, 118, 0.22);
      brassBell(c, 0.08, 783.99, 0.12, 0.42);
      brassBell(c, 0.21, 587.33, 0.13, 0.56);
    },
    // 翌日へ進む：朝の時計鐘
    nextDay(c) {
      brassBell(c, 0, 880, 0.12, 0.40);
      brassBell(c, 0.12, 1318.51, 0.14, 0.55);
      noise(c, { start: 0.03, duration: 0.08, attack: 0.01, gain: 0.06, filterType: 'bandpass', freq: 2100, endFreq: 2900, q: 1.5 });
    },
    // 見送り・品切れ・価格折り合わず（コイン音と聴き分けられる落ち着いた木音）
    decline(c) {
      tone(c, { type: 'triangle', freq: 392, endFreq: 310, start: 0, duration: 0.085, attack: 0.004, gain: 0.11, filterType: 'lowpass', filterFreq: 1100 });
      tone(c, { type: 'triangle', freq: 294, endFreq: 245, start: 0.075, duration: 0.10, attack: 0.004, gain: 0.10, filterType: 'lowpass', filterFreq: 950 });
    },
    unbought(c) {
      RECIPES.decline(c);
    },
    // ページめくり・タブ切替・営業報告（羊皮紙のこすれ音）
    page(c) {
      noise(c, { start: 0, duration: 0.095, attack: 0.014, gain: 0.12, filterType: 'bandpass', freq: 1350, endFreq: 2700, q: 1.4 });
      tone(c, { type: 'sine', freq: 640, start: 0.01, duration: 0.04, attack: 0.004, gain: 0.04 });
    },
    // 通常・特別イベント発生（ゴシック調の怪しい鐘）
    event(c) {
      brassBell(c, 0, 587.33, 0.13, 0.68);
      tone(c, { type: 'sine', freq: 698.46, start: 0.09, duration: 0.65, attack: 0.02, gain: 0.10 });
      tone(c, { type: 'sine', freq: 880, start: 0.16, duration: 0.65, attack: 0.02, gain: 0.09 });
      tone(c, { type: 'sine', freq: 1318.51, start: 0.24, duration: 0.72, attack: 0.02, gain: 0.07 });
    },
    // 借金取りの訪問（D01..D03：ドアを叩く音×3）
    knock(c) {
      [0, 0.165, 0.33].forEach((offset, i) => {
        woodTap(c, offset, 138 - i * 4, 0.24);
      });
      tone(c, { type: 'sine', freq: 293.66, start: 0.45, duration: 0.55, attack: 0.02, gain: 0.09 });
    },
    endingBad(c) {
      tone(c, { type: 'triangle', freq: 146.83, start: 0, duration: 1.1, attack: 0.03, gain: 0.14, filterType: 'lowpass', filterFreq: 520 });
      brassBell(c, 0.12, 349.23, 0.12, 0.95);
    },
    endingGood(c) {
      [523.25, 783.99, 987.77, 1318.51].forEach((n, i) => {
        brassBell(c, i * 0.09, n, 0.13, 0.9);
      });
    },
    // 会話送り・ガイド送り・軽微UIクリック
    dialogue(c) {
      tone(c, { type: 'sine', freq: 1080, endFreq: 860, start: 0, duration: 0.028, attack: 0.002, gain: 0.055 });
      noise(c, { start: 0, duration: 0.022, attack: 0.003, gain: 0.032, filterType: 'bandpass', freq: 2200, q: 1.6 });
    },
    ui(c) {
      tone(c, { type: 'triangle', freq: 760, endFreq: 540, start: 0, duration: 0.032, attack: 0.002, gain: 0.07, filterType: 'lowpass', filterFreq: 1800 });
    },
    modalOpen(c) {
      noise(c, { start: 0, duration: 0.055, attack: 0.008, gain: 0.06, filterType: 'bandpass', freq: 1400, endFreq: 2100, q: 1.3 });
      tone(c, { type: 'sine', freq: 740, endFreq: 920, start: 0.005, duration: 0.07, attack: 0.003, gain: 0.06 });
    },
    modalClose(c) {
      tone(c, { type: 'sine', freq: 620, endFreq: 420, start: 0, duration: 0.065, attack: 0.003, gain: 0.06 });
    },
    error(c) {
      tone(c, { type: 'triangle', freq: 170, endFreq: 108, start: 0, duration: 0.11, attack: 0.004, gain: 0.16, filterType: 'lowpass', filterFreq: 600 });
    },

    // Opening narrative cues
    openingFall(c) {
      noise(c, { start: 0, duration: 0.65, attack: 0.04, gain: 0.16, filterType: 'bandpass', freq: 2400, endFreq: 280, q: 1.8 });
      tone(c, { type: 'sine', freq: 1180, endFreq: 320, start: 0.02, duration: 0.55, attack: 0.01, gain: 0.09 });
    },
    openingMarket(c) {
      coinClink(c, 0.05, 2260, 0.08, 0.18);
      coinClink(c, 0.24, 2580, 0.07, 0.18);
      noise(c, { start: 0, duration: 0.4, attack: 0.1, gain: 0.045, filterType: 'bandpass', freq: 900, q: 0.9 });
    },
    openingPaper(c) {
      noise(c, { start: 0, duration: 0.18, attack: 0.02, gain: 0.13, filterType: 'bandpass', freq: 1200, endFreq: 2600, q: 1.3 });
    },
    openingSignature(c) {
      noise(c, { start: 0, duration: 0.07, attack: 0.005, gain: 0.10, filterType: 'bandpass', freq: 2900, endFreq: 2200, q: 2.2 });
      noise(c, { start: 0.11, duration: 0.09, attack: 0.005, gain: 0.11, filterType: 'bandpass', freq: 2600, endFreq: 3300, q: 2.2 });
      brassBell(c, 0.22, 440, 0.10, 0.55);
    },
    openingDoorOpen(c) {
      brassBell(c, 0.04, 1174.66, 0.14, 0.58);
      brassBell(c, 0.18, 1396.91, 0.13, 0.64);
    },
    openingDoorClose(c) {
      woodTap(c, 0, 96, 0.28);
      noise(c, { start: 0.02, duration: 0.08, attack: 0.005, gain: 0.09, filterType: 'lowpass', freq: 520, q: 1.0 });
    }
  };

  function dispatch(audioCtx, name) {
    const fn = RECIPES[name];
    if (!fn) return;
    try {
      if (master) master.gain.setValueAtTime(getLevel() * 0.85, audioCtx.currentTime);
      fn(audioCtx);
    } catch {}
  }

  function play(name, opts = {}) {
    if (!RECIPES[name] || isMuted() || settings.volume <= 0) return false;
    const now = Date.now();
    const minInterval = Number.isFinite(opts.cooldown) ? opts.cooldown : (name === 'ui' || name === 'dialogue' ? 35 : 22);
    if (minInterval > 0 && lastPlayedAt[name] && now - lastPlayedAt[name] < minInterval) return false;
    lastPlayedAt[name] = now;

    const audioCtx = ensureContext();
    if (!audioCtx) return false;

    if (audioCtx.state === 'suspended') {
      try {
        const res = audioCtx.resume?.();
        if (res && typeof res.then === 'function') {
          res.then(() => {
            if (!isMuted() && settings.volume > 0) dispatch(audioCtx, name);
          }).catch(() => {});
        } else {
          dispatch(audioCtx, name);
        }
      } catch {}
      return true;
    }

    dispatch(audioCtx, name);
    return true;
  }

  function unlock() {
    const audioCtx = ensureContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      try { audioCtx.resume?.().catch?.(() => {}); } catch {}
    }
  }

  function setVolume(value) {
    settings.volume = Math.max(0, Math.min(100, Number(value) || 0));
    try { localStorage.setItem(SETTING_KEY, JSON.stringify(settings)); } catch {}
    if (master && ctx) master.gain.setValueAtTime(getLevel() * 0.85, ctx.currentTime);
  }

  function setMuted(flag) {
    mutedOverride = flag === null ? null : !!flag;
    if (master && ctx) master.gain.setValueAtTime(getLevel() * 0.85, ctx.currentTime);
  }

  function getSettings() {
    return { volume: settings.volume, muted: isMuted() };
  }

  if (typeof document !== 'undefined') {
    const onGesture = () => unlock();
    document.addEventListener('pointerdown', onGesture, { passive: true, capture: true });
    document.addEventListener('keydown', onGesture, { passive: true, capture: true });
  }

  return { play, unlock, setVolume, setMuted, getSettings, has: name => !!RECIPES[name] };
})();
