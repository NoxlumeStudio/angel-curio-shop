'use strict';
// Two-part interactive beginner guide & Day 1 spotlight tutorial.
// Independent of game rules, balance, and save data.
const GUIDE = (() => {
  const SEEN_KEY = 'angel-curio-shop-guide-seen-v2';

  const PARTS = [
    {
      id: 'basics',
      badge: '第1部',
      title: '基本操作編',
      subtitle: '光るボタンに沿って1日目を体験',
      pages: [
        {
          title: '1. まずは「闇市場」で仕入れよう',
          lead: '右上の光っている「闇市場」を押して、売るための珍品を買いに行きましょう。',
          tab: 'shop',
          dock: 'left',
          spotlight: '#shop-nav-dock [data-tab="market"]',
          spotlightLabel: '▼ まずはここ！押して仕入れへ',
          glow: ['#shop-nav-dock [data-tab="market"]'],
          steps: [
            { label: '目標', text: '秋の<strong>90日間</strong>で借金 <strong>45,000 G</strong> の完済を目指します。' },
            { label: '次の操作', text: '右上の <span class="guide-chip">闇市場</span> を押すと、そのまま次の案内へ進みます。' }
          ],
          tip: '不要な場合は右上の「閉じる ×」や「スキップ」でいつでも閉じられます。'
        },
        {
          title: '2. 商品を選んで「仕入れる」',
          lead: '仕入れたい珍品の数を決めて購入します（仕入れ後に店へ戻ります）。',
          tab: 'market',
          dock: 'bottom-right',
          spotlight: () => (typeof stock === 'function' && stock() > 0)
            ? document.querySelector('.secondary-image-nav [data-tab="shop"]')
            : document.querySelector('.market-image-card:first-child'),
          spotlightLabel: () => (typeof stock === 'function' && stock() > 0)
            ? '▼ 仕入れ完了！押して店へ戻る'
            : '✦ 個数を選んで「仕入れる」',
          glow: () => (typeof stock === 'function' && stock() > 0)
            ? ['.secondary-image-nav [data-tab="shop"]']
            : ['.market-image-card .market-card-quantity', '.market-image-card .market-card-buy', '.market-image-routes'],
          steps: [
            { label: '買い方', text: '<span class="guide-chip">−</span> <span class="guide-chip">＋</span> で数（1〜10個）を選び <span class="guide-chip">仕入れる</span> を押します（右一覧で上位ルート <span class="guide-chip">解放</span> も可）。' },
            { label: '店へ戻る', text: '仕入れが終わったら右上の <span class="guide-chip">店へ戻る</span> を押しましょう。' }
          ],
          actionStatus: () => (typeof stock === 'function' && stock() > 0)
            ? `✓ ${stock()}点仕入れました！右上の光っている「店へ戻る」を押しましょう。`
            : ''
        },
        {
          title: '3. 「陳列棚」で所持商品を確認',
          lead: '棚の枠を押すと、いま持っている在庫・倉庫残数・鑑定状況を確認できます。',
          tab: 'shop',
          dock: 'right',
          spotlight: '.image-shelf .goods',
          spotlightLabel: '✦ 商品を押すと詳細を確認',
          glow: ['.image-shelf .good.in-stock', '.undisplayed-notice [data-act="undisplayed-choose"]'],
          steps: [
            { label: '棚の表示', text: '各枠の「陳列 ○ · 鑑○ 未○ A○」が陳列数・鑑定済・未鑑定・品質Aです。' },
            { label: '詳細画面', text: '棚の商品を押すと<strong>総在庫・倉庫残数・原価</strong>が見られます（棚外在庫は <span class="guide-chip">商品を入れ替える</span> でも確認可）。' }
          ],
          tip: '商品詳細を開いても、閉じればそのままこの続きから案内します。'
        },
        {
          title: '4. 「一括陳列」で並べる・鑑定と値付け',
          lead: '棚の上にある「一括陳列」を押すと、在庫のある商品を自動で棚に並べます。',
          tab: 'shop',
          dock: 'right',
          spotlight: () => {
            if (typeof displayStock === 'function' && displayStock() > 0) {
              return document.querySelector('.image-shelf .good.in-stock') || document.querySelector('.image-shelf .shelf-actions');
            }
            return document.querySelector('.image-shelf .bulk-display-btn') || document.querySelector('.image-shelf .shelf-actions');
          },
          spotlightLabel: () => (typeof displayStock === 'function' && displayStock() > 0)
            ? '✦ 押して鑑定・価格調整も可'
            : '▼ 「一括陳列」を押して並べよう！',
          glow: () => (typeof displayStock === 'function' && displayStock() > 0)
            ? ['.image-shelf .good.in-stock', '.image-shelf .bulk-display-btn', '#shop-nav-dock [data-act="open"]']
            : ['.image-shelf .bulk-display-btn', '.image-shelf .bulk-display-mode', '.image-shelf .good.empty'],
          steps: [
            { label: '一括陳列', text: '<span class="guide-chip">おすすめ</span> / <span class="guide-chip">高利益</span> / <span class="guide-chip">在庫整理</span> を選び <span class="guide-chip">一括陳列</span> で在庫を自動配置・補充します。' },
            { label: '個別＆鑑定', text: '<span class="guide-chip">＋ 商品を置く</span> や商品詳細の <span class="guide-chip">棚に出す ＋1</span> <span class="guide-chip">倉庫へ戻す −1</span> <span class="guide-chip">同じ商品を補充</span> <span class="guide-chip">この枠の商品を入れ替える</span>、<span class="guide-chip">鑑定 15 G</span>、<span class="guide-chip">−10</span> <span class="guide-chip">＋10</span> <span class="guide-chip">設定</span> も使えます。' }
          ],
          tip: '品質A・B・Cの違いや特殊鑑定の条件は「便利な機能」の鑑定システムページで詳しく見られます。',
          actionStatus: () => {
            if (typeof displayStock === 'function' && displayStock() > 0) {
              return `✓ ${displayStock()}点を陳列中です！次のページで店を開きましょう。`;
            }
            if (typeof stock === 'function' && stock() > 0) {
              return `在庫 ${stock()}点が倉庫にあります。光っている「一括陳列」を押してみましょう！`;
            }
            return '';
          }
        },
        {
          title: '5. 「本日の店を開く」・接客の流れ',
          lead: '陳列ができたら右上の「本日の店を開く」を押して営業を始めましょう！',
          tab: 'shop',
          dock: 'left',
          spotlight: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? (document.querySelector('.image-dialogue .service-dialogue-actions') || document.querySelector('.image-customer'))
            : document.querySelector('#shop-nav-dock [data-act="open"]'),
          spotlightLabel: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? '✦ 「販売する」か選択して接客'
            : '▼ ここを押して本日の店を開く！',
          glow: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? ['.image-dialogue .service-dialogue-actions .btn', '.counter-speed-dock .speed-controls']
            : ['#shop-nav-dock [data-act="open"]'],
          steps: [
            { label: '開店＆接客', text: '<span class="guide-chip">本日の店を開く</span> 後、希望品と価格を見て <span class="guide-chip">販売する</span> / <span class="guide-chip">今回は売らない</span> を選び、<span class="guide-chip">次のお客様へ</span>（最後は <span class="guide-chip">閉店・決算へ</span>）で進みます。' },
            { label: '速度調整', text: 'カウンター上の <span class="guide-chip">通常</span> <span class="guide-chip">×2</span> <span class="guide-chip">×4</span> で自動接客、<span class="guide-chip">残りの客を見送って閉店</span> で早じまいも可能です。' }
          ]
        },
        {
          title: '6. 「営業報告」と「翌日へ進む →」',
          lead: '閉店したら結果を確認し、次の日の営業へ進みましょう。',
          tab: 'shop',
          dock: 'left',
          spotlight: () => (typeof state !== 'undefined' && state.phase === 'closed')
            ? document.querySelector('#shop-nav-dock [data-act="next"]')
            : document.querySelector('#shop-nav-dock [data-act="report"]'),
          spotlightLabel: () => (typeof state !== 'undefined' && state.phase === 'closed')
            ? '✦ 確認後「翌日へ進む →」'
            : '✦ 閉店後に結果と翌日の操作',
          glow: ['#shop-nav-dock [data-act="report"]', '#shop-nav-dock [data-act="next"]'],
          steps: [
            { label: '営業報告', text: '<span class="guide-chip">営業報告</span> で売上・売れた商品の原価・粗利益を確認できます（閉店後の仕入れ・返済も可）。' },
            { label: '翌日へ', text: '<span class="guide-chip">翌日へ進む →</span> で次の営業日へ進みます（第90日の閉店後は <span class="guide-chip">最終決算へ →</span>）。' }
          ],
          tip: '基本操作はここまで！続けて「便利な機能」で鑑定システム・図鑑・帳簿・設備もチェックしてみましょう。'
        }
      ]
    },
    {
      id: 'features',
      badge: '第2部',
      title: '便利な機能編',
      subtitle: '鑑定・図鑑・帳簿・設備を活用しよう',
      pages: [
        {
          title: '鑑定システム ― 品質判定・値付け・図鑑登録',
          lead: '仕入れた商品はすべて「未鑑定」です。詳細画面から鑑定すると品質と適正価格が判明します。',
          tab: 'shop',
          dock: 'right',
          spotlight: () => document.querySelector('.image-shelf .good.in-stock') || document.querySelector('.image-shelf .goods'),
          spotlightLabel: () => {
            const hasUnknown = typeof state !== 'undefined' && state.inventory?.some(x => !x.known && x.qty > 0);
            return hasUnknown ? '▼ 未鑑定あり！商品を押して鑑定' : '✦ 商品を押して詳細・鑑定へ';
          },
          glow: ['.image-shelf .good.in-stock', '.undisplayed-notice [data-act="undisplayed-choose"]'],
          steps: [
            { label: '手順と費用', text: '棚の商品を押して詳細画面を開き <span class="guide-chip">鑑定 15 G</span> を押します（仕入れただけでは図鑑に載らず、<strong>鑑定で珍品図鑑へ登録</strong>されます）。' },
            { label: '品質 A/B/C', text: '品質に応じて参考価値が判明します。<strong>A：約1.5倍</strong>（高値でも売れやすい）／<strong>B：基準どおり（1.0倍）</strong>／<strong>C：0.7倍</strong>（値下げ向き）。' },
            { label: '購入率と設備', text: '鑑定済みは未鑑定より購入率が上昇！一部の上位品は <span class="guide-chip">天上文字の解読書</span> や <span class="guide-chip">封印鑑定台</span>、効率化には <span class="guide-chip">真鍮の拡大鏡</span>（12 G化）・<span class="guide-chip">光量測定器</span> が必要です。' }
          ],
          actionStatus: () => {
            if (typeof state === 'undefined' || !Array.isArray(state.inventory)) return '';
            const unknown = state.inventory.reduce((n, x) => n + (!x.known ? x.qty : 0), 0);
            const known = state.inventory.reduce((n, x) => n + (x.known ? x.qty : 0), 0);
            const qualityA = state.inventory.reduce((n, x) => n + (x.known && x.quality === 'A' ? x.qty : 0), 0);
            const fee = typeof appraisalFee === 'function' ? appraisalFee() : 15;
            if (unknown > 0) return `現在、未鑑定の商品が ${unknown}点あります。棚の品を押して「鑑定 ${fee} G」を試してみましょう！`;
            if (known > 0) return `✓ 所持中の在庫 ${known}点はすべて鑑定済みです（品質A：${qualityA}点）。参考価値を目安に値付けしましょう。`;
            return '商品を仕入れたあと、棚を押して詳細画面から「鑑定」を行えます。';
          },
          tip: '一括陳列でも、高額品は鑑定済みの商品を優先して棚に並べる仕組みになっています。'
        },
        {
          title: '珍品図鑑 ― 鑑定記録と入手の手がかり',
          lead: '鑑定した珍品の知識と入手条件が記録される魔導書です。',
          tab: 'codex',
          dock: 'bottom-right',
          spotlight: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? document.querySelector('#shop-nav-dock [data-tab="codex"]')
            : document.querySelector('.codex-selection-grid'),
          spotlightLabel: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? '✦ 珍品図鑑ボタン'
            : '✦ 鑑定した品が記録されます',
          glow: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? ['#shop-nav-dock [data-tab="codex"]']
            : ['.codex-progress', '.codex-selection-grid', '.codex-detail-acquisition', '.codex-image-nav [data-tab="shop"]'],
          steps: [
            { label: '開き方', text: 'メニューの <span class="guide-chip">珍品図鑑</span> から開き、<span class="guide-chip">店へ戻る</span> で店舗に戻ります。' },
            { label: '見方＆活用', text: '<strong>鑑定</strong>すると登録され、分類・希少性（★1〜5）・解説・主な入手方法・メモを確認できます（18種以上は最高評価条件の1つ）。' }
          ]
        },
        {
          title: '帳簿 ― 収支・返済・経営状況',
          lead: 'メニューの「帳簿と設備」から、損益・借金残高・取引履歴を確認できます。',
          tab: 'ledger',
          dock: 'bottom-right',
          spotlight: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? document.querySelector('#shop-nav-dock [data-tab="ledger"]')
            : document.querySelector('.ledger-image-tabs'),
          spotlightLabel: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? '✦ 帳簿と設備ボタン'
            : '✦ タブで収支・返済を切替',
          glow: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? ['#shop-nav-dock [data-tab="ledger"]']
            : ['.ledger-image-tabs', '.ledger-summary-panel', '.ledger-graph-panel', '.ledger-goal-toggle'],
          steps: [
            { label: '記録＆返済', text: '上部タブで <span class="guide-chip">収支概要</span> <span class="guide-chip">借金返済</span> <span class="guide-chip">設備管理</span> <span class="guide-chip">取引履歴</span> を切り替え、<span class="guide-chip">100 G返済</span> / <span class="guide-chip">返せるだけ返済</span> が行えます。' },
            { label: '経営確認', text: '「日別収支」グラフ（<span class="guide-chip">直近7日</span>/<span class="guide-chip">30日</span>/<span class="guide-chip">記録全件</span>）と <span class="guide-chip">目標確認</span> で完済の目安を把握できます（利息なし）。' }
          ]
        },
        {
          title: '設備 ― 店舗拡張・鑑定・集客',
          lead: '「帳簿と設備」内の設備パネルから設備を購入し、店を強化できます。',
          tab: 'ledger',
          dock: 'right',
          spotlight: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? document.querySelector('#shop-nav-dock [data-tab="ledger"]')
            : document.querySelector('.ledger-equipment-panel'),
          spotlightLabel: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? '✦ 帳簿と設備ボタン'
            : '✦ ここで設備を購入・管理',
          glow: () => (typeof state !== 'undefined' && state.phase === 'serving')
            ? ['#shop-nav-dock [data-tab="ledger"]']
            : ['.ledger-category-tabs', '.ledger-equipment-grid'],
          steps: [
            { label: '管理方法', text: '<span class="guide-chip">店舗拡張</span> <span class="guide-chip">鑑定設備</span> <span class="guide-chip">集客設備</span> を切り替え、各設備を押して条件を確認し購入します（効果は常時自動）。' },
            { label: '経営への影響', text: '店舗拡張で<strong>高級品解禁＆保管12→38点</strong>、鑑定設備で<strong>費用割引・特殊鑑定・精度向上</strong>、集客設備で<strong>来客数＆高額品購入率上昇</strong>が得られます。' }
          ],
          tip: 'いつでも各画面の「遊び方」ボタンからこのガイドを開き直せます！'
        }
      ]
    }
  ];

  let openState = null;
  let rafId = 0;

  function hasSeen() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
  }

  function resetForNewGame() {
    try { localStorage.removeItem(SEEN_KEY); } catch {}
  }

  function isOpen() {
    return !!openState;
  }

  function hostEl() {
    return document.getElementById('guide-modal');
  }

  function clearGlowingTargets() {
    document.querySelectorAll('.guide-target-glow').forEach(el => {
      el.classList.remove('guide-target-glow');
    });
  }

  function resolveTargets(spec) {
    const val = typeof spec === 'function' ? spec() : spec;
    if (!val) return [];
    if (Array.isArray(val)) {
      const out = [];
      for (const s of val) {
        document.querySelectorAll(s).forEach(el => out.push(el));
      }
      return out;
    }
    if (typeof val === 'string') return Array.from(document.querySelectorAll(val));
    return val.nodeType === 1 ? [val] : [];
  }

  function resolvePrimaryTarget(spec) {
    const val = typeof spec === 'function' ? spec() : spec;
    if (!val) return null;
    if (typeof val === 'string') return document.querySelector(val);
    return val.nodeType === 1 ? val : null;
  }

  function syncSpotlightPosition() {
    if (!openState) return;
    const host = hostEl();
    if (!host) return;
    const box = host.querySelector('.guide-spotlight-box');
    const card = host.querySelector('.guide-dialog');
    if (!box || !card) return;

    const modalOpen = !document.getElementById('modal')?.classList.contains('hidden');
    const openingOpen = !document.getElementById('opening')?.classList.contains('hidden');
    const titleOpen = !document.getElementById('title-screen')?.classList.contains('hidden');

    if (modalOpen || openingOpen || titleOpen) {
      box.hidden = true;
      card.hidden = true;
      clearGlowingTargets();
      return;
    }
    card.hidden = false;

    const part = PARTS[openState.part] || PARTS[0];
    const page = part.pages[openState.page] || part.pages[0];

    clearGlowingTargets();
    for (const el of resolveTargets(page.glow)) {
      el.classList.add('guide-target-glow');
    }

    const target = resolvePrimaryTarget(page.spotlight);
    if (!target) {
      box.hidden = true;
      return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      box.hidden = true;
      return;
    }

    const pad = 6;
    const vw = window.innerWidth || document.documentElement.clientWidth || 1920;
    const vh = window.innerHeight || document.documentElement.clientHeight || 1080;

    box.hidden = false;
    box.style.left = `${Math.max(2, rect.left - pad)}px`;
    box.style.top = `${Math.max(2, rect.top - pad)}px`;
    box.style.width = `${Math.min(vw - 4, rect.width + pad * 2)}px`;
    box.style.height = `${Math.min(vh - 4, rect.height + pad * 2)}px`;

    const tag = box.querySelector('.guide-spotlight-tag');
    if (tag) {
      const label = typeof page.spotlightLabel === 'function' ? page.spotlightLabel() : (page.spotlightLabel || '✦ ここ');
      tag.textContent = label;
      const placeBelow = rect.top < 54;
      tag.classList.toggle('below', placeBelow);
    }

    if (vw <= 760 && !document.documentElement.hasAttribute('data-whole-canvas-phone')) {
      const targetCenterY = rect.top + rect.height / 2;
      card.classList.toggle('mobile-top', targetCenterY > vh * 0.54);
    } else {
      card.classList.remove('mobile-top');
    }
  }

  function scheduleSpotlightSync() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncSpotlightPosition();
    });
  }

  function ensureDesiredTab(page) {
    if (!page?.tab || typeof tab === 'undefined' || typeof state === 'undefined') return;
    if (tab === page.tab) return;
    if (state.phase === 'serving' && page.tab !== 'shop' && state.service?.stage !== 'reaction') return;
    if (typeof closeModal === 'function') closeModal();
    tab = page.tab;
    if (typeof render === 'function') render();
  }

  function renderGuide() {
    const host = hostEl();
    if (!host) return;
    if (!openState) {
      clearGlowingTargets();
      host.classList.add('hidden');
      host.innerHTML = '';
      return;
    }

    const part = PARTS[openState.part] || PARTS[0];
    const page = part.pages[openState.page] || part.pages[0];
    const totalPages = part.pages.length;
    const isFirstOverall = openState.part === 0 && openState.page === 0;
    const isLastOfPart1 = openState.part === 0 && openState.page === totalPages - 1;
    const isLastOverall = openState.part === PARTS.length - 1 && openState.page === totalPages - 1;

    const partTabs = PARTS.map((p, idx) =>
      `<button type="button" class="guide-part-tab ${idx === openState.part ? 'active' : ''}" data-guide-part="${idx}" aria-pressed="${idx === openState.part}">
        <span>${p.badge}</span><strong>${p.title}</strong>
      </button>`
    ).join('');

    const dots = part.pages.map((_, idx) =>
      `<button type="button" class="guide-dot ${idx === openState.page ? 'active' : ''}" data-guide-goto="${idx}" aria-label="${part.badge} ${idx + 1}ページへ"></button>`
    ).join('');

    const stepsHtml = page.steps.map(step =>
      `<li><span class="guide-step-label">${step.label}</span><div class="guide-step-body">${step.text}</div></li>`
    ).join('');

    const statusMsg = typeof page.actionStatus === 'function' ? page.actionStatus() : '';
    const nextLabel = isLastOfPart1
      ? '便利な機能 →'
      : isLastOverall
        ? 'ガイドを閉じる ✓'
        : '次へ →';

    const dockClass = `dock-${page.dock || 'left'}`;

    host.innerHTML = `
      <div class="guide-spotlight-box" hidden aria-hidden="true">
        <span class="guide-spotlight-tag">✦ ここ</span>
      </div>
      <div class="guide-dialog ${dockClass}" role="dialog" aria-modal="false" aria-labelledby="guide-title">
        <div class="guide-header">
          <div class="guide-brand">
            <span class="guide-overline">CURIO CABINET TUTORIAL</span>
            <div class="guide-part-tabs" role="tablist" aria-label="ガイドの構成">${partTabs}</div>
          </div>
          <button type="button" class="guide-close-btn" data-guide-close aria-label="ガイドを閉じる">閉じる ×</button>
        </div>

        <div class="guide-meta-bar">
          <span class="guide-part-pill">${part.badge}：${part.title}</span>
          <span class="guide-page-counter">${openState.page + 1} / ${totalPages}</span>
        </div>

        <div class="guide-body">
          <h2 id="guide-title">${page.title}</h2>
          <p class="guide-lead">${page.lead}</p>
          ${statusMsg ? `<div class="guide-live-status" role="status">${statusMsg}</div>` : ''}
          <ul class="guide-steps">${stepsHtml}</ul>
          ${page.tip ? `<aside class="guide-tip"><strong>◈ メモ</strong><p>${page.tip}</p></aside>` : ''}
        </div>

        <div class="guide-footer">
          <button type="button" class="guide-skip-btn" data-guide-skip>スキップして閉じる</button>
          <div class="guide-dots" aria-label="ページ一覧">${dots}</div>
          <div class="guide-nav-btns">
            <button type="button" class="guide-nav-btn" data-guide-prev ${isFirstOverall ? 'disabled' : ''}>← 前へ</button>
            <button type="button" class="guide-nav-btn primary" data-guide-next>${nextLabel}</button>
          </div>
        </div>
      </div>
    `;
    host.classList.remove('hidden');
    scheduleSpotlightSync();
  }

  function open(opts = {}) {
    const part = Math.max(0, Math.min(PARTS.length - 1, Number(opts.part) || 0));
    const maxPage = PARTS[part].pages.length - 1;
    const pageIdx = Math.max(0, Math.min(maxPage, Number(opts.page) || 0));
    const currentTab = typeof tab !== 'undefined' ? tab : 'shop';
    openState = {
      part,
      page: pageIdx,
      auto: !!opts.auto,
      originTab: currentTab,
      userInteracted: false
    };
    const page = PARTS[part].pages[pageIdx];
    ensureDesiredTab(page);
    renderGuide();
    const nextBtn = hostEl()?.querySelector('[data-guide-next]') || hostEl()?.querySelector('[data-guide-close]');
    nextBtn?.focus?.();
  }

  function pingGuideButton() {
    document.querySelectorAll('.guide-shelf-btn, .secondary-image-nav [data-act="guide"]').forEach(btn => {
      btn.classList.remove('guide-btn-ping');
      void btn.offsetWidth;
      btn.classList.add('guide-btn-ping');
      window.setTimeout(() => btn.classList.remove('guide-btn-ping'), 3600);
    });
  }

  function close(shouldMarkSeen = true) {
    if (!openState) return;
    const { originTab, userInteracted, auto } = openState;
    openState = null;
    if (shouldMarkSeen) markSeen();
    renderGuide();
    if (!userInteracted && originTab && typeof tab !== 'undefined' && tab !== originTab && typeof state !== 'undefined' && state.phase !== 'serving') {
      tab = originTab;
      if (typeof render === 'function') render();
    }
    if (auto) pingGuideButton();
  }

  function goTo(partIdx, pageIdx) {
    if (!openState || !PARTS[partIdx]) return;
    const clampedPage = Math.max(0, Math.min(PARTS[partIdx].pages.length - 1, pageIdx));
    openState.part = partIdx;
    openState.page = clampedPage;
    ensureDesiredTab(PARTS[partIdx].pages[clampedPage]);
    renderGuide();
  }

  function prev() {
    if (!openState) return;
    if (openState.page > 0) {
      goTo(openState.part, openState.page - 1);
    } else if (openState.part > 0) {
      const prevPart = openState.part - 1;
      goTo(prevPart, PARTS[prevPart].pages.length - 1);
    }
  }

  function next() {
    if (!openState) return;
    const part = PARTS[openState.part];
    if (openState.page < part.pages.length - 1) {
      goTo(openState.part, openState.page + 1);
    } else if (openState.part < PARTS.length - 1) {
      goTo(openState.part + 1, 0);
    } else {
      close(true);
    }
  }

  function maybeOpenFirstTime() {
    if (hasSeen()) return false;
    open({ part: 0, page: 0, auto: true });
    return true;
  }

  function sync() {
    if (!openState) return;
    if (openState.part === 0 && openState.page === 4 && typeof state !== 'undefined' && state.phase === 'closed') {
      openState.page = 5;
      renderGuide();
      return;
    }
    const statusEl = hostEl()?.querySelector('.guide-live-status');
    const page = PARTS[openState.part]?.pages[openState.page];
    if (page && typeof page.actionStatus === 'function') {
      const msg = page.actionStatus();
      if (msg && !statusEl) {
        renderGuide();
        return;
      }
      if (statusEl) {
        statusEl.textContent = msg;
        statusEl.hidden = !msg;
      }
    }
    scheduleSpotlightSync();
  }

  document.addEventListener('click', (e) => {
    if (!openState) return;
    const host = hostEl();
    if (host && host.contains(e.target)) {
      const btn = e.target.closest('button');
      if (!btn) return;
      e.stopImmediatePropagation();
      if (btn.hasAttribute('data-guide-close') || btn.hasAttribute('data-guide-skip')) {
        if (typeof SE !== 'undefined') SE.play('modalClose');
        close(true);
      } else if (btn.hasAttribute('data-guide-prev')) {
        if (typeof SE !== 'undefined') SE.play('page');
        prev();
      } else if (btn.hasAttribute('data-guide-next')) {
        if (typeof SE !== 'undefined') SE.play(openState.part === PARTS.length - 1 && openState.page === PARTS[openState.part].pages.length - 1 ? 'modalClose' : 'page');
        next();
      } else if (btn.hasAttribute('data-guide-part')) {
        const p = Number(btn.dataset.guidePart);
        if (Number.isInteger(p) && PARTS[p]) {
          if (typeof SE !== 'undefined') SE.play('page');
          goTo(p, 0);
        }
      } else if (btn.hasAttribute('data-guide-goto')) {
        const idx = Number(btn.dataset.guideGoto);
        if (Number.isInteger(idx) && PARTS[openState.part]?.pages[idx]) {
          if (typeof SE !== 'undefined') SE.play('page');
          goTo(openState.part, idx);
        }
      }
      return;
    }

    const gameBtn = e.target.closest?.('button');
    if (!gameBtn || gameBtn.disabled) return;
    if (gameBtn.dataset.act === 'title' || gameBtn.dataset.act === 'replay') {
      close(true);
      return;
    }
    openState.userInteracted = true;

    if (openState.part === 0) {
      if (openState.page === 0 && gameBtn.dataset.tab === 'market') {
        openState.page = 1;
        window.setTimeout(() => { if (openState) renderGuide(); }, 0);
      } else if (openState.page === 1 && gameBtn.dataset.tab === 'shop') {
        openState.page = 2;
        window.setTimeout(() => { if (openState) renderGuide(); }, 0);
      } else if ((openState.page === 2 || openState.page === 3) && gameBtn.dataset.act === 'open') {
        openState.page = 4;
        window.setTimeout(() => { if (openState) renderGuide(); }, 0);
      } else if (openState.page >= 1 && openState.page <= 5) {
        window.setTimeout(() => { if (openState) sync(); }, 0);
      }
    }
  }, true);

  document.addEventListener('keydown', (e) => {
    if (!openState) return;
    const modalOpen = !document.getElementById('modal')?.classList.contains('hidden');
    if (modalOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      close(true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopImmediatePropagation();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopImmediatePropagation();
      prev();
    }
  }, true);

  window.addEventListener?.('resize', scheduleSpotlightSync, { passive: true });
  window.addEventListener?.('scroll', scheduleSpotlightSync, { passive: true, capture: true });

  return { open, close, prev, next, isOpen, hasSeen, markSeen, resetForNewGame, maybeOpenFirstTime, sync };
})();
