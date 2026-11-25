/* Web Audio synthesized sound effects (SE) tailored for the antique curio shop atmosphere.
 * Tuned for warm, low-fatigue vintage acoustics and tactile metallic coin clinks.
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
  let hiCut = null;
  let bodyShelf = null;
  let compressor = null;
  let noiseBuffer = null;
  let mutedOverride = null;
  const lastPlayedAt = Object.create(null);

  function isMuted() {
    if (mutedOverride !== null) return mutedOverride;
    if (typeof state !== 'undefined' && state && typeof state.muted === 'boolean') return state.muted;
    return false;
  }

  // Perceptual gain curve with a comfortable master ceiling balanced against BGM.
  function getLevel() {
    if (isMuted() || settings.volume <= 0) return 0;
    const norm = Math.max(0, Math.min(1, settings.volume / 100));
    return Math.pow(norm, 1.45) * 0.62;
  }

  function ensureContext() {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();

      // Warm vintage master chain: rolls off harsh >3.8kHz ear fatigue while preserving metallic coin clarity.
      hiCut = ctx.createBiquadFilter();
      hiCut.type = 'lowpass';
      hiCut.frequency.value = 3800;
      hiCut.Q.value = 0.55;

      bodyShelf = ctx.createBiquadFilter();
      bodyShelf.type = 'lowshelf';
      bodyShelf.frequency.value = 260;
      bodyShelf.gain.value = 2.0;

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 20;
      compressor.ratio.value = 3.5;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.16;

      master = ctx.createGain();
      master.gain.value = getLevel();

      master.connect(hiCut);
      hiCut.connect(bodyShelf);
      bodyShelf.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (master) {
      master.gain.setValueAtTime(getLevel(), ctx.currentTime);
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
    gain = 0.18,
    filterType = null,
    filterFreq = 2600,
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
    gain = 0.10,
    filterType = 'bandpass',
    freq = 1400,
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

  function jitter(base, spread = 0.03) {
    return base * (1 + (Math.random() * 2 - 1) * spread);
  }

  // Physical antique gold/brass coin clink:
  // Combines a short resonant metallic contact click, two closely spaced beating coin modes
  // (the signature shimmer of two metal coins colliding), and a fast-decaying inharmonic overtone.
  function coinHit(audioCtx, start, baseFreq = 1920, volume = 0.11, ring = 0.095, muted = false) {
    const f = jitter(baseFreq, 0.035);
    const lp = muted ? 2400 : 3500;

    // Sharp, brief metallic strike transient (gives instant "metal-on-metal" tactile attack)
    noise(audioCtx, {
      start,
      duration: muted ? 0.009 : 0.012,
      attack: 0.0008,
      gain: volume * (muted ? 0.7 : 0.95),
      filterType: 'bandpass',
      freq: Math.min(3400, f * 1.42),
      q: 4.5
    });

    // Mode A + Mode B (slightly detuned beating pair: real colliding metal discs)
    tone(audioCtx, {
      type: 'sine',
      freq: f,
      start,
      duration: ring,
      attack: 0.001,
      gain: volume * 0.80,
      filterType: 'lowpass',
      filterFreq: lp
    });
    tone(audioCtx, {
      type: 'sine',
      freq: f * 1.058,
      start,
      duration: ring * 0.85,
      attack: 0.001,
      gain: volume * 0.56,
      filterType: 'lowpass',
      filterFreq: lp
    });

    // Inharmonic circular-disc upper mode (1.63x, decays quickly so it never whistles)
    tone(audioCtx, {
      type: 'sine',
      freq: Math.min(3650, f * 1.63),
      start,
      duration: ring * 0.42,
      attack: 0.001,
      gain: volume * (muted ? 0.20 : 0.36),
      filterType: 'lowpass',
      filterFreq: lp
    });

    // Weighty physical coin-body clack on wood/leather
    tone(audioCtx, {
      type: 'triangle',
      freq: f * 0.24,
      endFreq: f * 0.16,
      start,
      duration: 0.020,
      attack: 0.001,
      gain: volume * 0.32,
      filterType: 'lowpass',
      filterFreq: 820
    });
  }

  // Organic multi-coin clatter: rapid staggered micro-impacts + subtle wood/tray settle
  function coinClatter(audioCtx, hits, opts = {}) {
    if (opts.trayTap !== false) {
      woodTap(audioCtx, hits[0]?.[0] || 0, opts.trayPitch || 225, opts.trayVol || 0.11);
    }
    for (const [t, freq, vol, ring] of hits) {
      coinHit(audioCtx, t, freq, vol, ring, !!opts.muted);
    }
  }

  // Warm antique brass / music-box bell pitched in a gentle mid-register (no piercing highs)
  function brassBell(audioCtx, start, freq, volume = 0.14, duration = 0.48) {
    const lp = Math.min(2300, freq * 2.8);
    tone(audioCtx, { type: 'sine', freq, start, duration, attack: 0.005, gain: volume, filterType: 'lowpass', filterFreq: lp });
    tone(audioCtx, { type: 'sine', freq: freq * 2.0, start, duration: duration * 0.55, attack: 0.004, gain: volume * 0.22, filterType: 'lowpass', filterFreq: lp });
    tone(audioCtx, { type: 'triangle', freq: freq * 3.0, start, duration: duration * 0.22, attack: 0.002, gain: volume * 0.055, filterType: 'lowpass', filterFreq: lp });
    noise(audioCtx, { start, duration: 0.012, attack: 0.001, gain: volume * 0.16, filterType: 'bandpass', freq: Math.min(1800, freq * 1.5), q: 1.8 });
  }

  function woodTap(audioCtx, start, pitch = 195, volume = 0.18) {
    tone(audioCtx, { type: 'triangle', freq: pitch, endFreq: pitch * 0.54, start, duration: 0.068, attack: 0.002, gain: volume, filterType: 'lowpass', filterFreq: 980 });
    noise(audioCtx, { start, duration: 0.022, attack: 0.001, gain: volume * 0.45, filterType: 'bandpass', freq: 720, q: 1.8 });
  }

  const RECIPES = {
    // 「ジャラ・チャリン」— realistic gold coins clinking onto the wooden counter
    sell(c) {
      coinClatter(c, [
        [0.000, 1860, 0.095, 0.050],
        [0.019, 2060, 0.090, 0.055],
        [0.041, 1920, 0.110, 0.075],
        [0.072, 2140, 0.115, 0.110],
        [0.106, 1990, 0.085, 0.125]
      ], { trayPitch: 235, trayVol: 0.10 });
    },
    coin(c) {
      RECIPES.sell(c);
    },
    // 高額販売（>= 250G）：ずっしりした金貨の束が落ちる音＋控えめな温かみのある和音
    sellHigh(c) {
      coinClatter(c, [
        [0.000, 1820, 0.095, 0.050],
        [0.017, 2040, 0.095, 0.055],
        [0.036, 1900, 0.105, 0.068],
        [0.059, 2120, 0.115, 0.085],
        [0.086, 1960, 0.110, 0.100],
        [0.118, 2180, 0.115, 0.130],
        [0.152, 2020, 0.085, 0.135]
      ], { trayPitch: 210, trayVol: 0.12 });
      tone(c, { type: 'sine', freq: 440, start: 0.12, duration: 0.34, attack: 0.015, gain: 0.070, filterType: 'lowpass', filterFreq: 1400 });
      tone(c, { type: 'sine', freq: 554.37, start: 0.15, duration: 0.36, attack: 0.015, gain: 0.060, filterType: 'lowpass', filterFreq: 1500 });
    },
    // ブーム・人気・品質A販売：弾む金貨＋落ち着いた真鍮チャイム
    sellBoom(c) {
      coinClatter(c, [
        [0.000, 1880, 0.095, 0.055],
        [0.018, 2080, 0.095, 0.060],
        [0.040, 1940, 0.110, 0.080],
        [0.068, 2160, 0.115, 0.105],
        [0.100, 2040, 0.100, 0.130]
      ], { trayPitch: 220, trayVol: 0.11 });
      brassBell(c, 0.12, 523.25, 0.105, 0.38);
      brassBell(c, 0.19, 659.25, 0.115, 0.44);
    },
    // ブーム開始・予告：落ち着いた街の時計鐘ファンファーレ
    boomStart(c) {
      brassBell(c, 0, 392.0, 0.13, 0.44);
      brassBell(c, 0.11, 493.88, 0.13, 0.46);
      brassBell(c, 0.22, 587.33, 0.14, 0.50);
      brassBell(c, 0.34, 783.99, 0.15, 0.64);
    },
    // 仕入れ完了：木箱を置く音＋革袋へ支払う控えめな硬貨音
    buy(c) {
      woodTap(c, 0, 165, 0.20);
      coinClatter(c, [
        [0.036, 1740, 0.085, 0.055],
        [0.060, 1900, 0.090, 0.070],
        [0.090, 1810, 0.080, 0.085]
      ], { trayTap: false, muted: true });
    },
    // 鑑定（通常 B/C）：柔らかい水晶音叉（耳に優しい中音域）
    appraise(c) {
      brassBell(c, 0, 523.25, 0.13, 0.42);
      tone(c, { type: 'sine', freq: 783.99, start: 0.06, duration: 0.38, attack: 0.012, gain: 0.075, filterType: 'lowpass', filterFreq: 1800 });
    },
    // 鑑定（高品質 A）：温かく神秘的なハープ調アルペジオ
    appraiseA(c) {
      const notes = [440.0, 554.37, 659.25, 880.0];
      notes.forEach((n, idx) => {
        brassBell(c, idx * 0.065, n, 0.11 + idx * 0.01, 0.48 - idx * 0.03);
      });
    },
    // 棚出し・入れ替え：マホガニー棚に品物を置く音
    shelf(c) {
      woodTap(c, 0, 215, 0.17);
      noise(c, { start: 0.014, duration: 0.036, attack: 0.004, gain: 0.045, filterType: 'bandpass', freq: 1100, q: 1.4 });
    },
    // 一括陳列：軽快に木の棚へ並ぶ連続音
    bulkDisplay(c) {
      woodTap(c, 0, 195, 0.14);
      woodTap(c, 0.06, 225, 0.15);
      woodTap(c, 0.12, 255, 0.16);
      brassBell(c, 0.17, 659.25, 0.08, 0.24);
    },
    // 価格設定：羽ペンの記帳＋優しい木琴トーン
    price(c) {
      noise(c, { start: 0, duration: 0.038, attack: 0.004, gain: 0.065, filterType: 'bandpass', freq: 1350, endFreq: 950, q: 1.7 });
      tone(c, { type: 'sine', freq: 587.33, start: 0.024, duration: 0.095, attack: 0.004, gain: 0.095, filterType: 'lowpass', filterFreq: 1600 });
    },
    // 設備設置：重厚な木工＋温かい真鍮和音
    equip(c) {
      woodTap(c, 0, 140, 0.23);
      brassBell(c, 0.055, 392.0, 0.12, 0.42);
      brassBell(c, 0.13, 523.25, 0.13, 0.50);
      brassBell(c, 0.20, 659.25, 0.11, 0.52);
    },
    // 仕入れルート解放：隠し扉の閂＋神秘和音
    unlockRoute(c) {
      noise(c, { start: 0, duration: 0.09, attack: 0.01, gain: 0.09, filterType: 'bandpass', freq: 780, endFreq: 1280, q: 2.0 });
      brassBell(c, 0.08, 440.0, 0.12, 0.44);
      brassBell(c, 0.17, 554.37, 0.13, 0.52);
      brassBell(c, 0.26, 659.25, 0.12, 0.56);
    },
    // 借金返済：ずっしりした革袋の硬貨音＋帳簿スタンプ
    repay(c) {
      coinClatter(c, [
        [0.000, 1760, 0.090, 0.055],
        [0.022, 1920, 0.095, 0.065],
        [0.048, 1830, 0.090, 0.075],
        [0.078, 1990, 0.085, 0.085]
      ], { trayPitch: 135, trayVol: 0.16, muted: true });
      woodTap(c, 0.135, 122, 0.23);
      tone(c, { type: 'sine', freq: 440.0, start: 0.155, duration: 0.24, attack: 0.008, gain: 0.085, filterType: 'lowpass', filterFreq: 1400 });
    },
    // 借金完済！祝福の鐘と金貨
    debtCleared(c) {
      coinClatter(c, [
        [0.000, 1860, 0.095, 0.060],
        [0.022, 2060, 0.095, 0.068],
        [0.048, 1950, 0.105, 0.085],
        [0.080, 2150, 0.105, 0.105]
      ], { trayPitch: 205, trayVol: 0.11 });
      [392.0, 493.88, 587.33, 783.99, 987.77].forEach((n, idx) => {
        brassBell(c, 0.13 + idx * 0.08, n, 0.12, 0.64);
      });
    },
    // 特注納品完了：たっぷりした金貨音＋達成チャイム
    orderComplete(c) {
      coinClatter(c, [
        [0.000, 1850, 0.095, 0.055],
        [0.020, 2050, 0.095, 0.065],
        [0.045, 1940, 0.110, 0.085],
        [0.078, 2140, 0.105, 0.110]
      ], { trayPitch: 220, trayVol: 0.11 });
      brassBell(c, 0.12, 523.25, 0.115, 0.42);
      brassBell(c, 0.20, 783.99, 0.125, 0.56);
    },
    // 評判ランク昇格：店格が上がる温かい祝福和音
    rankUp(c) {
      brassBell(c, 0, 440.0, 0.12, 0.44);
      brassBell(c, 0.09, 554.37, 0.13, 0.48);
      brassBell(c, 0.18, 659.25, 0.13, 0.52);
      brassBell(c, 0.28, 880.0, 0.14, 0.64);
    },
    // 本日の店を開く：アンティーク店の優しいドアベル（カランコロン♪）
    openShop(c) {
      brassBell(c, 0, 587.33, 0.14, 0.52);
      brassBell(c, 0.145, 783.99, 0.14, 0.60);
      brassBell(c, 0.30, 659.25, 0.08, 0.44);
    },
    // 閉店：木の扉と夕暮れの合図
    closeDay(c) {
      woodTap(c, 0, 118, 0.22);
      brassBell(c, 0.08, 523.25, 0.11, 0.40);
      brassBell(c, 0.21, 392.0, 0.12, 0.52);
    },
    // 翌日へ進む：朝の時計鐘
    nextDay(c) {
      brassBell(c, 0, 523.25, 0.11, 0.38);
      brassBell(c, 0.12, 659.25, 0.12, 0.48);
      noise(c, { start: 0.03, duration: 0.075, attack: 0.012, gain: 0.04, filterType: 'bandpass', freq: 1150, endFreq: 1550, q: 1.4 });
    },
    // 見送り・品切れ・価格折り合わず（落ち着いた木音）
    decline(c) {
      tone(c, { type: 'triangle', freq: 340, endFreq: 265, start: 0, duration: 0.082, attack: 0.004, gain: 0.11, filterType: 'lowpass', filterFreq: 860 });
      tone(c, { type: 'triangle', freq: 260, endFreq: 210, start: 0.075, duration: 0.095, attack: 0.004, gain: 0.10, filterType: 'lowpass', filterFreq: 760 });
    },
    unbought(c) {
      RECIPES.decline(c);
    },
    // ページめくり・タブ切替・営業報告（柔らかな羊皮紙のこすれ音）
    page(c) {
      noise(c, { start: 0, duration: 0.09, attack: 0.014, gain: 0.095, filterType: 'bandpass', freq: 920, endFreq: 1580, q: 1.3 });
      tone(c, { type: 'sine', freq: 420, start: 0.01, duration: 0.04, attack: 0.004, gain: 0.035, filterType: 'lowpass', filterFreq: 1100 });
    },
    // 通常・特別イベント発生（ゴシック調の落ち着いた鐘）
    event(c) {
      brassBell(c, 0, 392.0, 0.12, 0.60);
      tone(c, { type: 'sine', freq: 466.16, start: 0.09, duration: 0.56, attack: 0.02, gain: 0.09, filterType: 'lowpass', filterFreq: 1400 });
      tone(c, { type: 'sine', freq: 587.33, start: 0.17, duration: 0.58, attack: 0.02, gain: 0.08, filterType: 'lowpass', filterFreq: 1500 });
    },
    // 借金取りの訪問（D01..D03：ドアを叩く音×3）
    knock(c) {
      [0, 0.165, 0.33].forEach((offset, i) => {
        woodTap(c, offset, 134 - i * 4, 0.24);
      });
      tone(c, { type: 'sine', freq: 246.94, start: 0.45, duration: 0.52, attack: 0.02, gain: 0.085, filterType: 'lowpass', filterFreq: 900 });
    },
    endingBad(c) {
      tone(c, { type: 'triangle', freq: 146.83, start: 0, duration: 1.05, attack: 0.03, gain: 0.14, filterType: 'lowpass', filterFreq: 480 });
      brassBell(c, 0.12, 293.66, 0.11, 0.88);
    },
    endingGood(c) {
      [392.0, 523.25, 659.25, 783.99].forEach((n, i) => {
        brassBell(c, i * 0.095, n, 0.12, 0.80);
      });
    },
    // 会話送り・ガイド送り（耳に刺さらない柔らかな木と紙のタッチ音）
    dialogue(c) {
      tone(c, { type: 'sine', freq: 460, endFreq: 370, start: 0, duration: 0.025, attack: 0.002, gain: 0.048, filterType: 'lowpass', filterFreq: 1100 });
      noise(c, { start: 0, duration: 0.018, attack: 0.003, gain: 0.024, filterType: 'bandpass', freq: 1050, q: 1.4 });
    },
    ui(c) {
      tone(c, { type: 'triangle', freq: 340, endFreq: 235, start: 0, duration: 0.028, attack: 0.002, gain: 0.072, filterType: 'lowpass', filterFreq: 880 });
    },
    modalOpen(c) {
      noise(c, { start: 0, duration: 0.052, attack: 0.008, gain: 0.048, filterType: 'bandpass', freq: 980, endFreq: 1380, q: 1.3 });
      tone(c, { type: 'sine', freq: 380, endFreq: 480, start: 0.005, duration: 0.065, attack: 0.004, gain: 0.055, filterType: 'lowpass', filterFreq: 1200 });
    },
    modalClose(c) {
      tone(c, { type: 'sine', freq: 420, endFreq: 310, start: 0, duration: 0.06, attack: 0.004, gain: 0.055, filterType: 'lowpass', filterFreq: 1100 });
    },
    error(c) {
      tone(c, { type: 'triangle', freq: 165, endFreq: 108, start: 0, duration: 0.11, attack: 0.004, gain: 0.15, filterType: 'lowpass', filterFreq: 520 });
    },

    // Opening narrative cues
    openingFall(c) {
      noise(c, { start: 0, duration: 0.62, attack: 0.04, gain: 0.13, filterType: 'bandpass', freq: 1500, endFreq: 260, q: 1.6 });
      tone(c, { type: 'sine', freq: 680, endFreq: 240, start: 0.02, duration: 0.52, attack: 0.01, gain: 0.08, filterType: 'lowpass', filterFreq: 1500 });
    },
    openingMarket(c) {
      coinClatter(c, [
        [0.05, 1480, 0.08, 0.075],
        [0.09, 1660, 0.075, 0.085],
        [0.24, 1550, 0.075, 0.09]
      ], { trayTap: false, muted: true });
      noise(c, { start: 0, duration: 0.38, attack: 0.1, gain: 0.038, filterType: 'bandpass', freq: 760, q: 0.9 });
    },
    openingPaper(c) {
      noise(c, { start: 0, duration: 0.17, attack: 0.02, gain: 0.10, filterType: 'bandpass', freq: 900, endFreq: 1650, q: 1.3 });
    },
    openingSignature(c) {
      noise(c, { start: 0, duration: 0.07, attack: 0.005, gain: 0.075, filterType: 'bandpass', freq: 1550, endFreq: 1150, q: 1.8 });
      noise(c, { start: 0.11, duration: 0.09, attack: 0.005, gain: 0.08, filterType: 'bandpass', freq: 1400, endFreq: 1800, q: 1.8 });
      brassBell(c, 0.22, 392.0, 0.09, 0.50);
    },
    openingDoorOpen(c) {
      brassBell(c, 0.04, 587.33, 0.12, 0.52);
      brassBell(c, 0.18, 739.99, 0.12, 0.58);
    },
    openingDoorClose(c) {
      woodTap(c, 0, 96, 0.26);
      noise(c, { start: 0.02, duration: 0.08, attack: 0.005, gain: 0.08, filterType: 'lowpass', freq: 480, q: 1.0 });
    }
  };

  function dispatch(audioCtx, name) {
    const fn = RECIPES[name];
    if (!fn) return;
    try {
      if (master) master.gain.setValueAtTime(getLevel(), audioCtx.currentTime);
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
    if (master && ctx) master.gain.setValueAtTime(getLevel(), ctx.currentTime);
  }

  function setMuted(flag) {
    mutedOverride = flag === null ? null : !!flag;
    if (master && ctx) master.gain.setValueAtTime(getLevel(), ctx.currentTime);
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
