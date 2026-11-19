/* ============================================================
   肖八刷题 · 2027 考研政治
   纯前端单页应用（无依赖、无构建，可直接 GitHub Pages 托管）
   ============================================================ */
(function () {
  'use strict';

  /* ============================ 基础工具 ============================ */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const normAns = (a) => String(a || '').toUpperCase().replace(/[^A-D]/g, '').split('').sort().join('');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
  const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  const ICON = {
    home: '<path d="M3 10.6 12 3l9 7.6V20a1 1 0 0 1-1 1h-5.2v-6.2H9.2V21H4a1 1 0 0 1-1-1z"/>',
    edit: '<path d="M4 20.5h4.2L20.6 8.1a2.9 2.9 0 0 0-4.1-4.1L4 16.3z"/><path d="M13.8 5.8 18.2 10.2"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z"/><path d="M8 7.5h8M8 11.5h8M8 15.5h5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    doc: '<path d="M6 3h8l4.5 4.5V21H6z"/><path d="M14 3v5h5"/><path d="M9.5 12.5h6M9.5 16.5h6"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    back: '<path d="m14.5 5-7 7 7 7"/>',
    right: '<path d="m9.5 5 7 7-7 7"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="m12 3.8 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M4.2 12H1.6M22.4 12h-2.6M6.5 6.5 4.7 4.7M19.3 19.3l-1.8-1.8M17.5 6.5l1.8-1.8M4.7 19.3l1.8-1.8"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.1"/><path d="M20 4.5V11h-6.3"/>',
    flag: '<path d="M5.5 21V3.5h10l-1.2 3.2 1.2 3.2h-10"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.8V16h7v-2.2A6 6 0 0 0 12 3z"/>',
  };
  const svg = (name, cls) => '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[name] || '') + '</svg>';

  /* ============================ 数据 ============================ */
  const MODULES = ['马原', '毛中特', '史纲', '思修法治', '时政当代'];
  const X8 = (window.SHIBA_PAPERS || []).slice();
  const X4DATA = (window.SHIBA_X4 && window.SHIBA_X4.papers) || [];
  const RAW_POINTS = (window.SHIBA_POINTS || []).slice();
  let POINTS = RAW_POINTS;

  const ALL = [];       // 全部选择题
  const QMAP = {};      // id -> question
  const ESSAYS = [];    // 全部分析题
  const EMAP = {};
  const BOOKS = { x8: X8, x4: X4DATA };

  function ingest(papers, book) {
    papers.forEach((p) => {
      p.book = p.book || book;
      (p.single || []).forEach((q) => addQ(p, q, 'single'));
      (p.multi || []).forEach((q) => addQ(p, q, 'multi'));
      (p.essay || []).forEach((q) => {
        const it = {
          id: p.id + '-e' + q.no, paper: p.id, pno: p.no, book: p.book, type: 'essay',
          no: q.no, material: q.material || '', question: q.question || '',
          answer: q.answer || '', module: q.module || '时政当代', topic: q.topic || '分析题',
        };
        ESSAYS.push(it);
        EMAP[it.id] = it;
      });
    });
  }
  function addQ(p, q, type) {
    const it = {
      id: p.id + '-' + q.no, paper: p.id, pno: p.no, book: p.book, type: type,
      no: q.no, stem: q.stem || '', options: q.options || {},
      answer: normAns(q.answer), analysis: q.analysis || '',
      module: q.module || '马原', topic: q.topic || '',
    };
    ALL.push(it);
    QMAP[it.id] = it;
  }
  ingest(X8, 'x8');
  ingest(X4DATA, 'x4');
  ALL.sort((a, b) => (a.book === b.book ? 0 : a.book === 'x8' ? -1 : 1) || a.pno - b.pno || a.no - b.no);
  ESSAYS.sort((a, b) => (a.book === b.book ? 0 : a.book === 'x8' ? -1 : 1) || a.pno - b.pno || a.no - b.no);

  /* 若没有预生成考点卡，用题目考点自动派生，保证「纯知识点」永远有内容 */
  function derivePoints() {
    const groups = {};
    ALL.forEach((q) => {
      if (!q.analysis || q.analysis.length < 20) return;
      const key = q.module + '|' + (q.topic || '未分类考点');
      (groups[key] = groups[key] || []).push(q);
    });
    const out = [];
    Object.keys(groups).forEach((k, i) => {
      const g = groups[k];
      const first = g.slice().sort((a, b) => b.analysis.length - a.analysis.length)[0];
      const bullets = first.analysis
        .split(/[。；]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 10)
        .slice(0, 3);
      out.push({
        id: 'auto-' + i,
        module: first.module,
        title: first.topic || '未分类考点',
        bullets: bullets,
        refs: g.map((q) => q.id),
        quote: first.analysis,
      });
    });
    return out;
  }
  if (!POINTS.length) POINTS = derivePoints();

  const byPaper = (pno) => ALL.filter((q) => q.book === 'x8' && q.pno === pno);
  const paperOf = (id) => BOOKS.x8.find((p) => p.id === id) || BOOKS.x4.find((p) => p.id === id) || null;
  const titleOfPaper = (p) => (p ? (p.book === 'x4' ? '肖四 第' + CN[p.no] + '套' : '肖八 第' + CN[p.no] + '套') : '');

  /* ============================ 状态 ============================ */
  const KEY = 'shiba.v1';
  const DEF = () => ({
    v: 1, rec: {}, wrong: {}, star: {}, read: {}, notes: {},
    settings: { theme: 'auto', font: 'm', autoNext: false, shuffle: false, hideEssay: false },
    last: null, created: Date.now(),
  });
  let DB = loadDB();
  function loadDB() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      const d = DEF();
      return Object.assign(d, raw, { settings: Object.assign(d.settings, raw.settings || {}) });
    } catch (e) { return DEF(); }
  }
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* 隐私模式忽略 */ }
    }, 120);
  }
  function resetDB() {
    DB = DEF(); save();
  }

  /* ============================ 通用 UI ============================ */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1700);
  }

  function openSheet(html) {
    $('#sheetBody').innerHTML = html;
    $('#mask').classList.add('show');
    $('#sheet').classList.add('show');
  }
  function closeSheet() {
    $('#mask').classList.remove('show');
    $('#sheet').classList.remove('show');
  }

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function snip(s) {
    const t = String(s || '').trim();
    if (!t) return '未开始';
    if (t.length <= 38) return esc(t);
    const cut = t.slice(0, 38);
    const m = cut.match(/^[\s\S]*[。；，、]/);
    return esc((m ? m[0].replace(/[，、]$/, '') : cut) + '…');
  }

  /* ============================ 主题 / 字号 ============================ */
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const t = DB.settings.theme;
    const dark = t === 'dark' || (t === 'auto' && mql && mql.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.setAttribute('content', dark ? '#14161a' : '#17835c');
  }
  function applyFont() {
    const map = { s: '15px', m: '16px', l: '17.5px' };
    document.documentElement.style.setProperty('--fs', map[DB.settings.font] || '16px');
  }
  if (mql && mql.addEventListener) mql.addEventListener('change', () => { if (DB.settings.theme === 'auto') applyTheme(); });

  /* ============================ 路由 ============================ */
  const TABS = [
    { href: '#/', icon: 'home', label: '首页', key: 'home' },
    { href: '#/practice', icon: 'edit', label: '刷题', key: 'practice' },
    { href: '#/knowledge', icon: 'book', label: '知识点', key: 'knowledge' },
    { href: '#/modules', icon: 'grid', label: '分类', key: 'modules' },
    { href: '#/essay', icon: 'doc', label: '大题', key: 'essay' },
  ];

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const qidx = raw.indexOf('?');
    const path = qidx >= 0 ? raw.slice(0, qidx) : raw;
    const qs = {};
    if (qidx >= 0) {
      raw.slice(qidx + 1).split('&').forEach((kv) => {
        if (!kv) return;
        const i = kv.indexOf('=');
        qs[decodeURIComponent(i >= 0 ? kv.slice(0, i) : kv)] = i >= 0 ? decodeURIComponent(kv.slice(i + 1)) : '';
      });
    }
    return { path: path || '', qs: qs };
  }

  const META = {};
  let CUR = { path: '', qs: {} };

  function render(keepScroll) {
    CUR = parseRoute();
    const p = CUR.path;
    let html = '';
    let tabKey = '';
    let title = '肖八刷题';
    let sub = '2027 考研政治 · 肖秀荣八套卷';
    let back = '';

    if (p === '') { html = viewHome(); tabKey = 'home'; }
    else if (p === 'practice') { html = viewPractice(); tabKey = 'practice'; title = '刷题'; sub = '选择范围，立刻开始'; }
    else if (p === 'quiz') { html = viewQuiz(); tabKey = 'practice'; title = (S && S.title) ? S.title : '刷题'; sub = '答案即时解析'; back = '#/practice'; }
    else if (p === 'knowledge') { html = viewKnowledge(); tabKey = 'knowledge'; title = '知识点'; sub = '不刷题，只过考点'; }
    else if (p === 'modules') { html = viewModules(); tabKey = 'modules'; title = '分类学习'; sub = '按模块 / 考点集中攻克'; }
    else if (p === 'module') { html = viewModule(CUR.qs.m); tabKey = 'modules'; title = CUR.qs.m || '模块'; sub = '考点分组练习'; back = '#/modules'; }
    else if (p === 'essay') { html = viewEssay(); tabKey = 'essay'; title = '大题专区'; sub = '分析题 34-38 · 可折叠答案'; }
    else if (p === 'x4') { html = viewX4(); tabKey = 'home'; title = '肖四专区'; sub = '预留板块'; back = '#/'; }
    else if (p === 'wrong') { html = viewWrong(); tabKey = 'home'; title = '错题本'; sub = '反复错的题优先'; back = '#/'; }
    else if (p === 'stats') { html = viewStats(); tabKey = 'home'; title = '学习统计'; sub = '进度与正确率'; back = '#/'; }
    else if (p === 'settings') { html = viewSettings(); tabKey = 'home'; title = '设置'; sub = ''; back = '#/'; }
    else if (p === 'search') { html = viewSearch(); tabKey = 'home'; title = '全书搜索'; sub = '题干 / 选项 / 解析'; back = '#/'; }
    else { html = '<div class="empty"><b>页面不存在</b><p>返回首页重新开始</p></div>'; }

    $('#view').innerHTML = html;
    $('#view').className = 'wrap page' + (p === 'quiz' ? ' has-qbar' : '');
    const inExam = p === 'quiz' && S && S.mode === 'exam' && !S.examSubmitted;
    $('#pageTitle').textContent = inExam ? '模拟考试' : title;
    if (inExam) {
      $('#pageSub').innerHTML = '不计对错 · 剩余 <span class="timer" id="examTimer">--:--</span>';
    } else {
      $('#pageSub').textContent = sub;
    }

    const bb = $('#btnBack');
    if (back) { bb.hidden = false; bb.dataset.href = back; } else { bb.hidden = true; }
    $('#btnSearch').style.display = p === 'search' ? 'none' : '';

    renderTabs(tabKey);
    document.title = title + ' · 肖八刷题';
    if (!keepScroll) window.scrollTo(0, 0);
    if (p === 'quiz') afterQuizRender();
    if (p === 'search') setTimeout(() => { const i = $('#q'); if (i) i.focus(); }, 60);
  }

  function renderTabs(active) {
    $('#tabbar').innerHTML = TABS.map((t) =>
      '<a href="' + t.href + '" class="' + (t.key === active ? 'on' : '') + '">' + svg(t.icon) + '<span>' + t.label + '</span></a>'
    ).join('');
  }

  /* ============================ 首页 ============================ */
  function viewHome() {
    const totalQ = ALL.length;
    const answered = ALL.filter((q) => DB.rec[q.id]).length;
    const okN = ALL.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
    const wrongN = Object.keys(DB.wrong).filter((k) => QMAP[k] && !DB.wrong[k].cleared).length;
    const readN = POINTS.filter((p) => DB.read[p.id]).length;
    const acc = answered ? pct(okN, answered) : 0;

    const resume = DB.last && DB.last.idx != null ? DB.last : null;

    return '' +
      '<section class="hero">' +
        '<h2>肖八 <em>刷题</em>，一套一套过</h2>' +
        '<p>选择题 ' + totalQ + ' 道 · 分析题 ' + ESSAYS.length + ' 道 · 答案与解析已就绪</p>' +
        '<div class="stat-grid">' +
          stat(answered + '<i style="font-style:normal;font-size:12px;color:var(--text-3)">/' + totalQ + '</i>', '已练习') +
          stat(acc + '<i style="font-style:normal;font-size:12px">%</i>', '正确率') +
          stat(String(wrongN), '错题') +
          stat(String(readN) + '<i style="font-style:normal;font-size:12px;color:var(--text-3)">/' + POINTS.length + '</i>', '考点') +
        '</div>' +
        (resume ? '<button class="btn btn-primary btn-block" style="margin-top:14px" data-act="resume">继续上次练习：' + esc(resume.title || '') + ' · ' + (resume.idx + 1) + '/' + resume.total + '</button>' : '') +
      '</section>' +

      '<div class="sec-title">学习方式<span class="line"></span></div>' +
      '<div class="mode-list">' +
        mode('edit', '纯刷题', '看题 → 选答案 → 立刻跳出解析', '#/practice', '') +
        mode('bulb', '纯知识点', '不做题，只过一遍考点精华', '#/knowledge', 'warn') +
        mode('grid', '分类学习', '同一模块的题放一起，集中突破', '#/modules', 'blue') +
        mode('doc', '大题专区', '34-38 分析题 · 答案折叠，弱化但保留', '#/essay', 'violet') +
        mode('clock', '模拟考试', '33 题限时 60 分钟，交卷看分', '#/practice?tab=exam', 'bad') +
      '</div>' +

      '<div class="sec-title">快捷入口<span class="line"></span></div>' +
      '<div class="list">' +
        rowItem('flag', '错题本', wrongN ? wrongN + ' 道待巩固' : '暂时没有错题', '#/wrong') +
        rowItem('chart', '学习统计', '按套卷、模块查看正确率', '#/stats') +
        rowItem('search', '全书搜索', '搜题干、选项、解析里的关键词', '#/search') +
      '</div>' +

      x4Teaser() +

      '<p class="tiny muted" style="text-align:center;margin:26px 0 6px">数据来源：2027 肖秀荣考研政治《冲刺8套卷》</p>' +
      '<p class="tiny muted" style="text-align:center;margin:0 0 20px">纯本地运行 · 进度保存在本机浏览器</p>';
  }

  function stat(v, k) { return '<div class="stat"><b>' + v + '</b><span>' + k + '</span></div>'; }

  function mode(icon, title, desc, href, color) {
    return '<a class="mode" href="' + href + '">' +
      '<span class="mode-ico ' + (color || '') + '">' + svg(icon) + '</span>' +
      '<span class="mode-tx"><b>' + title + '</b><span>' + desc + '</span></span>' +
      '<span class="mode-arrow">' + svg('right') + '</span></a>';
  }

  function rowItem(icon, title, desc, href) {
    return '<a class="mode" href="' + href + '">' +
      '<span class="mode-ico" style="background:var(--card-2);color:var(--text-2)">' + svg(icon) + '</span>' +
      '<span class="mode-tx"><b>' + title + '</b><span>' + desc + '</span></span>' +
      '<span class="mode-arrow">' + svg('right') + '</span></a>';
  }

  function x4Teaser() {
    return '<div class="sec-title">即将上线<span class="line"></span></div>' +
      '<a class="mode" href="#/x4" style="background:linear-gradient(135deg,var(--brand-soft),var(--card));border-style:dashed">' +
        '<span class="mode-ico warn">' + svg('star') + '</span>' +
        '<span class="mode-tx"><b>肖四 · 四套卷</b><span>板块已预留，数据到位即自动上线</span></span>' +
        '<span class="mode-arrow">' + svg('right') + '</span></a>';
  }

  /* ============================ 刷题入口 ============================ */
  function viewPractice() {
    const papers = BOOKS.x8.map((p) => {
      const qs = byPaper(p.no);
      const done = qs.filter((q) => DB.rec[q.id]).length;
      return '<a class="item" href="#/quiz?scope=paper:' + p.no + '">' +
        '<div class="row between"><div class="t">肖八 第' + CN[p.no] + '套</div>' +
        '<div class="tiny muted">' + done + '/' + qs.length + '</div></div>' +
        '<div class="d" style="margin-bottom:8px">33 道选择题 · 16 单选 + 17 多选</div>' +
        '<div class="bar"><i style="width:' + pct(done, qs.length) + '%"></i></div></a>';
    }).join('');

    const tab = CUR.qs.tab;

    return '<div class="chip-row" style="margin-bottom:12px">' +
        '<a class="chip ' + (tab !== 'exam' ? 'on' : '') + '" href="#/practice">按套卷刷</a>' +
        '<a class="chip ' + (tab === 'exam' ? 'on' : '') + '" href="#/practice?tab=exam">模拟考试</a>' +
      '</div>' +
      (tab === 'exam' ? examEntry() : '') +
      '<div class="sec-title" style="margin-top:6px">按套卷练习<span class="line"></span></div>' +
      '<div class="list">' + papers + '</div>' +

      '<div class="sec-title">按题型<span class="line"></span></div>' +
      '<div class="list">' +
        linkItem('全部单选题', ALL.filter((q) => q.type === 'single').length + ' 道 · 八套卷单选合集', '#/quiz?scope=type:single') +
        linkItem('全部多选题', ALL.filter((q) => q.type === 'multi').length + ' 道 · 八套卷多选合集', '#/quiz?scope=type:multi') +
      '</div>' +

      '<div class="sec-title">专项<span class="line"></span></div>' +
      '<div class="list">' +
        linkItem('随机抽 20 题', '打乱顺序，检验真实水平', '#/quiz?scope=random:20') +
        linkItem('错题重做', Object.keys(DB.wrong).filter((k) => QMAP[k] && !DB.wrong[k].cleared).length + ' 道错题', '#/quiz?scope=wrong') +
        linkItem('我的收藏', Object.keys(DB.star).filter((k) => QMAP[k]).length + ' 道', '#/quiz?scope=star') +
      '</div>' +
      '<div style="height:26px"></div>';
  }

  function linkItem(title, desc, href) {
    return '<a class="item" href="' + href + '"><div class="t">' + title + '</div><div class="d">' + desc + '</div></a>';
  }

  function examEntry() {
    return '<div class="card pad" style="margin-bottom:6px">' +
      '<div class="row" style="gap:8px;margin-bottom:6px"><b>限时模拟</b><span class="badge badge-m">33 题 · 50 分</span></div>' +
      '<p class="small muted" style="margin:0 0 12px">不带即时反馈，60 分钟内完成 16 道单选 + 17 道多选，交卷后统一评分并逐题看解析。</p>' +
      '<div class="row wrap-gap">' +
        BOOKS.x8.map((p) => '<button class="btn btn-sm" data-act="exam" data-p="' + p.no + '">第' + CN[p.no] + '套</button>').join('') +
      '</div></div>';
  }

  /* ============================ 答题会话 ============================ */
  const SKEY = 'shiba.session';
  let S = null;
  let tick = null;

  function scopeIds(scope) {
    const [kind, val] = String(scope || '').split(':');
    if (kind === 'paper') {
      const p = Number(val);
      return ALL.filter((q) => q.book === 'x8' && q.pno === p);
    }
    if (kind === 'exam') {
      const p = Number(val);
      return ALL.filter((q) => q.book === 'x8' && q.pno === p);
    }
    if (kind === 'type') return ALL.filter((q) => q.type === val);
    if (kind === 'module') return ALL.filter((q) => q.module === val);
    if (kind === 'topic') return ALL.filter((q) => q.topic === val);
    if (kind === 'kp') {
      const pt = POINTS.find((x) => x.id === val);
      if (!pt) return [];
      return (pt.refs || []).map((id) => QMAP[id]).filter(Boolean);
    }
    if (kind === 'wrong') return ALL.filter((q) => DB.wrong[q.id] && !DB.wrong[q.id].cleared);
    if (kind === 'star') return ALL.filter((q) => DB.star[q.id]);
    if (kind === 'one') return [QMAP[val]].filter(Boolean);
    if (kind === 'random') {
      const n = Number(val) || 20;
      const pool = ALL.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      return pool.slice(0, n);
    }
    return [];
  }

  function scopeTitle(scope) {
    const [kind, val] = String(scope || '').split(':');
    if (kind === 'paper') return '肖八 第' + CN[Number(val)] + '套';
    if (kind === 'exam') return '第' + CN[Number(val)] + '套 · 模拟考';
    if (kind === 'type') return val === 'single' ? '全部单选题' : '全部多选题';
    if (kind === 'module') return val + ' · 专项';
    if (kind === 'topic') return val;
    if (kind === 'kp') {
      const pt = POINTS.find((x) => x.id === val);
      return pt ? pt.title : '考点练习';
    }
    if (kind === 'wrong') return '错题重做';
    if (kind === 'star') return '我的收藏';
    if (kind === 'random') return '随机 ' + val + ' 题';
    if (kind === 'one') return '单题回顾';
    return '练习';
  }

  function buildSession(scope, opts) {
    opts = opts || {};
    const isExam = String(scope).indexOf('exam:') === 0;
    let ids = opts.ids || scopeIds(scope).map((q) => q.id);
    if (!ids.length) { toast('这个范围暂时没有题目'); return null; }
    return {
      scope: scope, ids: ids, i: opts.i || 0,
      mode: opts.mode || (isExam ? 'exam' : 'practice'),
      title: opts.title || scopeTitle(scope),
      sel: {}, graded: {}, start: Date.now(),
      limit: opts.limit || (isExam ? 3600 : 0),
      end: 0, examSubmitted: false,
    };
  }

  function startQuiz(scope, opts) {
    const s = buildSession(scope, opts);
    if (!s) return;
    S = s;
    if (S.limit) S.end = Date.now() + S.limit * 1000;
    persistSession();
    if (location.hash === '#/quiz') render(); else location.hash = '#/quiz';
  }

  function persistSession() {
    if (!S) { sessionStorage.removeItem(SKEY); return; }
    try {
      sessionStorage.setItem(SKEY, JSON.stringify({
        scope: S.scope, ids: S.ids, i: S.i, mode: S.mode, title: S.title,
        sel: S.sel, graded: S.graded, start: S.start, limit: S.limit, end: S.end,
        examSubmitted: S.examSubmitted,
      }));
    } catch (e) { }
  }
  function restoreSession() {
    try {
      const raw = sessionStorage.getItem(SKEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.ids || !s.ids.length) return null;
      return s;
    } catch (e) { return null; }
  }

  function grade(q, choice) {
    const ok = normAns(choice) === normAns(q.answer);
    DB.rec[q.id] = { c: choice, ok: ok, ts: Date.now() };
    if (!ok) {
      const w = DB.wrong[q.id] || { n: 0, ts: 0 };
      w.n = (w.n || 0) + 1; w.ts = Date.now(); w.cleared = false;
      DB.wrong[q.id] = w;
    } else if (DB.wrong[q.id] && !DB.wrong[q.id].cleared) {
      // 答对不清除错题，保留直到手动移除
    }
    save();
    return ok;
  }

  /* ============================ 答题页 ============================ */
  function viewQuiz() {
    if (!S) {
      const s = restoreSession();
      if (s) S = s;
    }
    if (CUR.qs.scope && (!S || S.scope !== CUR.qs.scope)) {
      const fresh = buildSession(CUR.qs.scope);
      S = fresh || null;
      if (S && S.limit) S.end = Date.now() + S.limit * 1000;
      persistSession();
    }
    if (!S) {
      return '<div class="empty">' + svg('edit') + '<b>还没有开始练习</b><p>先选一个范围吧</p>' +
        '<a class="btn btn-primary" href="#/practice" style="margin-top:14px">去选范围</a></div>';
    }
    if (S.examSubmitted) return viewQuizResult();

    const total = S.ids.length;
    const q = QMAP[S.ids[S.i]];
    if (!q) { S = null; return '<div class="empty"><b>题目数据缺失</b></div>'; }

    const isExam = S.mode === 'exam';
    const sel = S.sel[q.id] || '';
    const graded = !!S.graded[q.id] || S.mode === 'review';
    const choiceForShow = S.mode === 'review' ? (S.sel[q.id] || '') : sel;
    const ok = graded && normAns(choiceForShow) === normAns(q.answer);
    const multi = q.type === 'multi';
    const ans = normAns(q.answer);
    const rec = DB.rec[q.id];

    const optsHtml = 'ABCD'.split('').filter((k) => q.options[k] != null).map((k) => {
      let cls = 'opt';
      const chosen = choiceForShow.indexOf(k) >= 0;
      if (graded) {
        if (ans.indexOf(k) >= 0) cls += ' right';
        else if (chosen) cls += ' wrong';
        else cls += ' dim';
      } else if (chosen) cls += ' sel';
      let mark = '';
      if (graded) {
        if (ans.indexOf(k) >= 0 && chosen) mark = '正确答案';
        else if (ans.indexOf(k) >= 0) mark = '应选';
        else if (chosen) mark = '错选';
      }
      return '<button class="' + cls + '" data-act="pick" data-k="' + k + '"' + (graded ? ' disabled' : '') + '>' +
        '<span class="k">' + k + '</span><span class="v">' + esc(q.options[k]) + '</span>' +
        (mark ? '<span class="mark">' + mark + '</span>' : '') + '</button>';
    }).join('');

    const doneCount = S.ids.filter((id) => S.graded[id]).length;
    const star = !!DB.star[q.id];

    let body = '';
    if (graded) {
      body = '<div class="answer-box">' +
        '<div class="res ' + (ok ? 'ok' : 'bad') + '">' + svg(ok ? 'check' : 'x') +
          '<span>' + (ok ? '答对了' : '答错了') + '</span>' +
          '<span class="k--big">正确答案 ' + esc(q.answer || '—') + '</span>' +
          '<span class="grow"></span>' +
          '<button class="btn btn-sm" data-act="star" data-id="' + q.id + '" style="border:0;background:transparent;padding:4px 6px' + (star ? ';color:var(--warn)' : '') + '">' + svg('star') + '</button>' +
        '</div>' +
        '<div class="analysis"><span class="lbl">解析</span>' + esc(q.analysis || '（本题暂无解析）') + '</div>' +
      '</div>';
    } else if (isExam) {
      body = '<div class="multi-hint">模拟考试中：不显示对错，交卷后统一评分。' + (multi ? '多选题需选全' : '') + '</div>';
    } else if (multi) {
      body = '<div class="multi-hint">多选题：选好后点“确定”核对答案，多选、少选、错选均不得分。</div>' +
        '<button class="btn btn-primary btn-block" style="margin-top:10px" data-act="submit" ' + (sel ? '' : 'disabled') + '>确定（已选 ' + sel.length + ' 项）</button>';
    }

    return '' +
      '<div class="qprogress"><i style="width:' + pct(S.i + 1, total) + '%"></i></div>' +
      '<div class="card pad" style="margin-top:6px">' +
        '<div class="qhead">' +
          '<span class="qno">' + (isExam ? '第' : '') + q.no + (isExam ? ' 题' : '') + '</span>' +
          '<span class="badge ' + (multi ? 'badge-multi' : 'badge-single') + '">' + (multi ? '多选' : '单选') + '</span>' +
          (q.topic ? '<span class="badge badge-m" data-mod="' + esc(q.module) + '">' + esc(q.module) + '</span>' : '<span class="badge badge-m" data-mod="' + esc(q.module) + '">' + esc(q.module) + '</span>') +
          '<span class="grow"></span>' +
          (rec ? '<span class="tiny muted">上次' + (rec.ok ? '正确' : '错误') + '</span>' : '') +
        '</div>' +
        '<div class="qstem">' + esc(q.stem) + '</div>' +
        '<div class="opts">' + optsHtml + '</div>' +
        body +
        (q.topic ? '<div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap"><span class="tiny muted">考点：' + esc(q.topic) + '</span></div>' : '') +
        (graded && !isExam ? '<div class="row" style="margin-top:12px;gap:8px">' +
          '<button class="btn btn-sm" data-act="redo">重做本题</button>' +
          '<button class="btn btn-sm" data-act="goto-module" data-m="' + esc(q.module) + '">同类题</button>' +
        '</div>' : '') +
      '</div>' +

      '<div class="qbar"><div class="qbar-in">' +
        '<button class="btn" data-act="prev" ' + (S.i === 0 ? 'disabled' : '') + '>上一题</button>' +
        '<button class="pos" data-act="card" style="border:0;background:transparent">' + (S.i + 1) + '/' + total + (isExam ? '' : ' · 已答' + doneCount) + '</button>' +
        (S.i >= total - 1
          ? (isExam ? '<button class="btn btn-primary" data-act="finish">交卷</button>' : '<button class="btn btn-primary" data-act="next">完成</button>')
          : '<button class="btn btn-primary" data-act="next">下一题</button>') +
      '</div></div>' +
      (isExam ? '<div style="height:6px"></div>' : '');
  }

  function afterQuizRender() {
    clearInterval(tick);
    if (!S || S.mode !== 'exam' || S.examSubmitted) return;
    const el = $('#examTimer');
    if (!el) return;
    const upd = () => {
      const left = Math.max(0, Math.floor((S.end - Date.now()) / 1000));
      el.textContent = Math.floor(left / 60) + ':' + pad2(left % 60);
      el.classList.toggle('warn', left < 300);
      if (left <= 0) { clearInterval(tick); submitExam(); }
    };
    upd();
    tick = setInterval(upd, 1000);
  }

  function submitExam() {
    if (!S || S.examSubmitted) return;
    S.ids.forEach((id) => {
      const q = QMAP[id];
      if (!q) return;
      const c = S.sel[id] || '';
      if (!c) return;
      grade(q, c);
    });
    S.examSubmitted = true;
    S.mode = 'review';
    persistSession();
    render();
  }

  function viewQuizResult() {
    const total = S.ids.length;
    let singleOk = 0, singleN = 0, multiOk = 0, multiN = 0;
    S.ids.forEach((id) => {
      const q = QMAP[id]; if (!q) return;
      const c = S.sel[id] || '';
      const ok = !!c && normAns(c) === normAns(q.answer);
      if (q.type === 'single') { singleN++; if (ok) singleOk++; } else { multiN++; if (ok) multiOk++; }
    });
    const score = singleOk * 1 + multiOk * 2;
    const maxScore = singleN + multiN * 2;
    const used = Math.round((Date.now() - S.start) / 1000);

    return '<div class="card pad" style="text-align:center">' +
      '<div class="tiny muted" style="letter-spacing:2px">得分</div>' +
      '<div style="font-size:44px;font-weight:800;letter-spacing:-2px;color:var(--brand)">' + score + '<span style="font-size:18px;color:var(--text-3);font-weight:600"> / ' + maxScore + '</span></div>' +
      '<div class="row" style="justify-content:center;gap:18px;margin-top:10px">' +
        '<span class="tiny muted">单选 ' + singleOk + '/' + singleN + '</span>' +
        '<span class="tiny muted">多选 ' + multiOk + '/' + multiN + '</span>' +
        '<span class="tiny muted">用时 ' + Math.floor(used / 60) + '分' + (used % 60) + '秒</span>' +
      '</div></div>' +
      '<div class="sec-title">逐题回顾<span class="line"></span></div>' +
      '<div class="list">' + S.ids.map((id, i) => {
        const q = QMAP[id]; if (!q) return '';
        const c = S.sel[id] || '未答';
        const ok = !!S.sel[id] && normAns(c) === normAns(q.answer);
        return '<button class="item" data-act="jump" data-i="' + i + '" style="text-align:left">' +
          '<div class="row between"><span class="t" style="margin:0">第 ' + q.no + ' 题' + (q.type === 'multi' ? '（多选）' : '') + '</span>' +
          '<span class="badge ' + (ok ? 'badge-m' : 'badge-essay') + '">' + (ok ? '对' : '错') + '</span></div>' +
          '<div class="d" style="margin-top:4px">你的选择 ' + esc(c) + ' · 正确答案 ' + esc(q.answer) + '</div></button>';
      }).join('') + '</div>' +
      '<div class="row" style="margin-top:16px;gap:10px">' +
        '<button class="btn btn-block" data-act="restart">再来一遍</button>' +
        '<a class="btn btn-primary btn-block" href="#/practice">返回</a>' +
      '</div>';
  }

  function pickOption(k) {
    if (!S) return;
    const q = QMAP[S.ids[S.i]];
    if (!q || S.graded[q.id] || S.mode === 'review') return;
    if (q.type === 'single') {
      S.sel[q.id] = k;
      if (S.mode !== 'exam') {
        S.graded[q.id] = true;
        grade(q, k);
      }
      persistSession();
      render(true);
      if (S.mode !== 'exam') {
        revealAnswer();
        if (DB.settings.autoNext) {
          setTimeout(() => {
            if (!S) return;
            if (S.i < S.ids.length - 1 && normAns(k) === normAns(q.answer)) nextQ();
          }, 900);
        }
      }
    } else {
      const cur = S.sel[q.id] || '';
      const has = cur.indexOf(k) >= 0;
      S.sel[q.id] = has ? cur.replace(k, '') : (cur + k).split('').sort().join('');
      persistSession();
      render(true);
    }
  }

  function revealAnswer() {
    const ab = $('.answer-box');
    if (ab && ab.scrollIntoView) {
      const r = ab.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 40 || r.top < 60) {
        ab.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function submitMulti() {
    if (!S) return;
    const q = QMAP[S.ids[S.i]];
    if (!q) return;
    const c = S.sel[q.id] || '';
    if (!c) return;
    S.graded[q.id] = true;
    if (S.mode !== 'exam') grade(q, c);
    persistSession();
    render(true);
    if (S.mode !== 'exam') revealAnswer();
  }

  function nextQ() { if (!S) return; if (S.i < S.ids.length - 1) { S.i++; persistSession(); render(); } else finishPractice(); }
  function prevQ() { if (!S) return; if (S.i > 0) { S.i--; persistSession(); render(); } }

  function finishPractice() {
    if (!S) return;
    const total = S.ids.length;
    const doneN = S.ids.filter((id) => S.graded[id]).length;
    const okN = S.ids.filter((id) => S.graded[id] && normAns(S.sel[id]) === normAns(QMAP[id] && QMAP[id].answer)).length;
    openSheet('<h3>本轮完成</h3><div class="desc">' + esc(S.title) + '</div>' +
      '<div class="pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">' +
        '<div class="stat"><b>' + doneN + '</b><span>已答</span></div>' +
        '<div class="stat"><b>' + (doneN ? pct(okN, doneN) : 0) + '%</b><span>正确率</span></div>' +
        '<div class="stat"><b>' + (doneN - okN) + '</b><span>错题</span></div>' +
      '</div><div class="pad"><button class="btn btn-primary btn-block" data-act="closeThen" data-href="#/practice">好的</button>' +
      '<a class="btn btn-block" style="margin-top:8px" href="#/stats">看学习统计</a></div>');
    S = null; persistSession();
  }

  /* ============================ 知识点 ============================ */
  function viewKnowledge() {
    if (!POINTS.length) return '<div class="empty">' + svg('book') + '<b>考点数据准备中</b><p>题目解析已就绪，考点卡还在整理</p></div>';
    const m = CUR.qs.m || '全部';
    const kw = (CUR.qs.q || '').trim();
    let list = POINTS;
    if (m !== '全部') list = list.filter((p) => p.module === m);
    if (kw) list = list.filter((p) => (p.title + ' ' + (p.bullets || []).join(' ') + ' ' + (p.quote || '')).indexOf(kw) >= 0);

    const chips = ['全部'].concat(MODULES).map((x) =>
      '<a class="chip ' + (x === m ? 'on' : '') + '" href="#/knowledge' + (x === '全部' ? '' : '?m=' + encodeURIComponent(x)) + '">' + x + '</a>').join('');

    return '<form class="search-box" id="kpSearch" data-act="kpSearch">' + svg('search') +
        '<input id="q" name="q" placeholder="搜索考点，如“矛盾”“剩余价值”" value="' + esc(kw) + '"></form>' +
      '<div class="chip-row" style="margin:12px 0 4px">' + chips + '</div>' +
      '<p class="tiny muted" style="margin:2px 2px 12px">共 ' + list.length + ' 个考点 · 点击展开原文解析</p>' +
      '<div class="list">' + list.map((p) => kpCard(p)).join('') + '</div>' +
      '<div style="height:24px"></div>';
  }

  function kpCard(p) {
    const read = !!DB.read[p.id];
    const refs = (p.refs || []).filter((id) => QMAP[id]);
    return '<div class="kp" data-kp="' + esc(p.id) + '">' +
      '<h3>' + esc(p.title) + '<span class="n">' + esc(p.module) + '</span></h3>' +
      '<ul>' + (p.bullets || []).map((b) => '<li>' + esc(b) + '</li>').join('') + '</ul>' +
      (p.quote ? '<div class="quote">' + esc(p.quote) + '</div>' : '') +
      '<div class="src">' +
        (p.quote ? '<button class="btn btn-sm" data-act="kpQuote" style="border:0;background:transparent;padding:2px 4px;color:var(--brand)">原文解析</button>' : '') +
        (refs.length ? '<a class="btn btn-sm" style="border:0;background:transparent;padding:2px 4px;color:var(--brand)" href="#/quiz?scope=kp:' + encodeURIComponent(p.id) + '">练这个考点</a>' : '') +
        '<span class="tiny" style="margin-left:auto;color:var(--text-3)">' + refs.length + ' 道相关题</span>' +
        '<button class="btn btn-sm" data-act="kpRead" data-id="' + esc(p.id) + '" style="border:0;background:transparent;padding:2px 4px;' + (read ? 'color:var(--brand)' : 'color:var(--text-3)') + '">' + (read ? '已掌握 ✓' : '标记掌握') + '</button>' +
      '</div></div>';
  }

  /* ============================ 分类 ============================ */
  function viewModules() {
    const cards = MODULES.map((m) => {
      const qs = ALL.filter((q) => q.module === m);
      const done = qs.filter((q) => DB.rec[q.id]).length;
      const ok = qs.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
      const es = ESSAYS.filter((e) => e.module === m).length;
      return '<a class="item" href="#/module?m=' + encodeURIComponent(m) + '">' +
        '<div class="row between"><div class="t">' + m + '</div>' +
        '<span class="badge badge-m" data-mod="' + m + '">' + qs.length + ' 题</span></div>' +
        '<div class="d" style="margin:6px 0 8px">正确率 ' + (done ? pct(ok, done) + '%' : '—') + ' · 已练 ' + done + '/' + qs.length + (es ? ' · 分析题 ' + es : '') + '</div>' +
        '<div class="bar"><i style="width:' + pct(done, qs.length) + '%"></i></div></a>';
    }).join('');

    return '<p class="tiny muted" style="margin:2px 2px 12px">同一模块的题集中在一起，按考点逐个击破。</p>' +
      '<div class="list">' + cards + '</div>' +
      '<div class="sec-title">按题型分类<span class="line"></span></div>' +
      '<div class="list">' +
        linkItem('单选题专场', '16 题 × 8 套 = ' + ALL.filter((q) => q.type === 'single').length + ' 题', '#/quiz?scope=type:single') +
        linkItem('多选题专场', '17 题 × 8 套 = ' + ALL.filter((q) => q.type === 'multi').length + ' 题', '#/quiz?scope=type:multi') +
        linkItem('分析题（大题）', ESSAYS.length + ' 道 · 可折叠参考答案', '#/essay') +
      '</div>' +
      '<div class="sec-title">按套卷分类<span class="line"></span></div>' +
      '<div class="list">' + BOOKS.x8.map((p) => linkItem('肖八 第' + CN[p.no] + '套', '33 道选择题', '#/quiz?scope=paper:' + p.no)).join('') + '</div>' +
      '<div style="height:24px"></div>';
  }

  function viewModule(m) {
    if (!m) return '<div class="empty"><b>未选择模块</b></div>';
    const qs = ALL.filter((q) => q.module === m);
    const cards = POINTS.filter((p) => p.module === m);
    let rows = '';

    if (cards.length) {
      rows = cards.map((p) => {
        const ids = (p.refs || []).filter((id) => QMAP[id]);
        const done = ids.filter((id) => DB.rec[id]).length;
        const ok = ids.filter((id) => DB.rec[id] && DB.rec[id].ok).length;
        return '<a class="item" href="#/quiz?scope=kp:' + encodeURIComponent(p.id) + '">' +
          '<div class="row between"><div class="t">' + esc(p.title) + '</div>' +
          '<span class="tiny muted">' + ids.length + ' 题</span></div>' +
          '<div class="d" style="margin-top:4px">' + (done ? '已练 ' + done + ' · 正确率 ' + pct(ok, done) + '%' : snip(p.bullets && p.bullets[0])) + '</div></a>';
      }).join('');
    } else {
      const groups = {};
      qs.forEach((q) => {
        const key = q.topic || '未分类考点';
        (groups[key] = groups[key] || []).push(q);
      });
      rows = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length).map((k) => {
        const g = groups[k];
        const done = g.filter((q) => DB.rec[q.id]).length;
        const ok = g.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
        return '<a class="item" href="#/quiz?scope=topic:' + encodeURIComponent(k) + '">' +
          '<div class="row between"><div class="t">' + esc(k) + '</div><span class="tiny muted">' + g.length + ' 题</span></div>' +
          '<div class="d" style="margin-top:4px">' + (done ? '已练 ' + done + ' · 正确率 ' + pct(ok, done) + '%' : '未开始') + '</div></a>';
      }).join('');
    }

    return '<div class="row between" style="margin-bottom:12px">' +
        '<span class="badge badge-m" data-mod="' + esc(m) + '">' + m + ' · ' + qs.length + ' 题</span>' +
        '<a class="btn btn-sm btn-primary" href="#/quiz?scope=module:' + encodeURIComponent(m) + '">全部刷一遍</a>' +
      '</div>' +
      '<p class="tiny muted" style="margin:0 2px 12px">按考点分组，点进去只练这一考点（' + (cards.length || '若干') + ' 个考点）。</p>' +
      '<div class="list">' + (rows || '<div class="empty">暂无</div>') + '</div><div style="height:24px"></div>';
  }

  /* ============================ 大题 ============================ */
  function viewEssay() {
    if (!ESSAYS.length) return '<div class="empty">' + svg('doc') + '<b>暂无分析题数据</b></div>';
    const m = CUR.qs.m || '全部';
    const pno = CUR.qs.p || '';
    let list = ESSAYS.filter((e) => e.book === 'x8');
    if (m !== '全部') list = list.filter((e) => e.module === m);
    if (pno) list = list.filter((e) => String(e.pno) === pno);

    const chips = ['全部'].concat(MODULES).map((x) =>
      '<a class="chip ' + (x === m ? 'on' : '') + '" href="#/essay' + (x === '全部' ? '' : '?m=' + encodeURIComponent(x)) + '">' + x + '</a>').join('');
    const pchips = ['全部套'].concat(BOOKS.x8.map((p) => '第' + CN[p.no] + '套')).map((x, i) =>
      '<a class="chip ' + ((i === 0 && !pno) || (i > 0 && String(i) === pno) ? 'on' : '') + '" href="#/essay' + (i === 0 ? '' : '?p=' + i) + '">' + x + '</a>').join('');

    return '<div class="card pad" style="margin-bottom:12px">' +
      '<div class="row" style="gap:8px"><b>分析题 34-38</b><span class="badge badge-essay">弱化但保留</span></div>' +
      '<p class="tiny muted" style="margin:6px 0 0">每套 5 道材料题。先自己看设问想思路，再展开参考答案对照。材料与答案默认折叠，避免一眼看穿。</p></div>' +
      '<div class="chip-row">' + chips + '</div>' +
      '<div class="chip-row" style="margin-bottom:8px">' + pchips + '</div>' +
      '<div>' + list.map((e) => essayCard(e)).join('') + '</div><div style="height:24px"></div>';
  }

  function essayCard(e) {
    const read = !!DB.read['e:' + e.id];
    return '<div class="essay-card">' +
      '<div class="row" style="gap:8px;margin-bottom:8px">' +
        '<span class="badge badge-essay">第 ' + e.no + ' 题</span>' +
        '<span class="badge badge-m" data-mod="' + esc(e.module) + '">' + esc(e.module) + '</span>' +
        '<span class="tiny muted">肖八 第' + CN[e.pno] + '套</span>' +
        '<span class="grow"></span>' +
        '<button class="btn btn-sm" data-act="essayRead" data-id="' + esc(e.id) + '" style="border:0;background:transparent;color:' + (read ? 'var(--brand)' : 'var(--text-3)') + '">' + (read ? '已读 ✓' : '标记已读') + '</button>' +
      '</div>' +
      '<div class="essay-q">' + esc(e.question) + '</div>' +
      (e.material ? '<details class="fold"><summary>材料原文</summary><div class="body">' + esc(e.material) + '</div></details>' : '') +
      (e.answer
        ? '<details class="fold ans"><summary>展开参考答案</summary><div class="body">' + esc(e.answer) + '</div></details>'
        : '<p class="tiny muted" style="margin:10px 0 0">参考答案暂缺</p>') +
      '</div>';
  }

  /* ============================ 肖四 ============================ */
  function viewX4() {
    const has = X4DATA.length > 0;
    const cards = (has ? X4DATA : [1, 2, 3, 4].map((n) => ({ no: n, empty: true }))).map((p) => {
      if (p.empty) {
        return '<div class="essay-card" style="opacity:.72;border-style:dashed">' +
          '<div class="row" style="gap:8px;margin-bottom:6px"><b>肖四 第' + CN[p.no] + '套</b><span class="badge badge-essay">待补充</span></div>' +
          '<p class="tiny muted" style="margin:0">数据到位后，本套会自动出现在刷题、知识点、分类和大题模块中。</p></div>';
      }
      const qs = ALL.filter((q) => q.paper === p.id);
      const done = qs.filter((q) => DB.rec[q.id]).length;
      return '<a class="essay-card" href="#/quiz?scope=x4:' + p.no + '" style="display:block">' +
        '<div class="row between"><b>肖四 第' + CN[p.no] + '套</b><span class="tiny muted">' + done + '/' + qs.length + '</span></div>' +
        '<p class="tiny muted" style="margin:4px 0 0">33 道选择题 · 5 道分析题</p></a>';
    }).join('');

    return '<div class="card pad" style="margin-bottom:14px">' +
      '<div class="row" style="gap:8px"><b>肖四板块已预留</b><span class="badge badge-essay">' + (has ? '已就绪' : '等待数据') + '</span></div>' +
      '<p class="small muted" style="margin:8px 0 0">' + (has ? '数据已就位，和肖八一样支持三种学习方式。' : '肖四（四套卷）发布后，把整理好的数据放进 <code>data/x4.js</code> 即可，无需改动任何页面代码。') + '</p>' +
    '</div>' + cards +
    (has ? '' : '<div class="card pad" style="margin-top:14px">' +
      '<b class="small">怎么加肖四数据？</b>' +
      '<ol class="small muted" style="margin:8px 0 0;padding-left:20px;line-height:1.9">' +
        '<li>打开 <code>data/x4.js</code></li>' +
        '<li>按 <code>window.SHIBA_X4 = { papers: [ … ] }</code> 的格式填入四套题</li>' +
        '<li>每题字段：<code>no / stem / options / answer / analysis / module / topic</code></li>' +
        '<li>保存并推送，手机上刷新即可</li>' +
      '</ol>' +
      '<p class="tiny muted" style="margin:10px 0 0">详细模板见项目根目录 README.md 的“扩展肖四”一节。</p></div>') +
      '<div style="height:24px"></div>';
  }

  /* ============================ 错题 / 统计 ============================ */
  function viewWrong() {
    const ids = Object.keys(DB.wrong).filter((k) => QMAP[k] && !DB.wrong[k].cleared);
    if (!ids.length) return '<div class="empty">' + svg('check') + '<b>错题本是空的</b><p>做错的题会自动收进来</p>' +
      '<a class="btn btn-primary" href="#/practice" style="margin-top:14px">去刷题</a></div>';
    ids.sort((a, b) => DB.wrong[b].ts - DB.wrong[a].ts);
    return '<div class="row between" style="margin-bottom:12px"><span class="small muted">共 ' + ids.length + ' 道</span>' +
      '<a class="btn btn-sm btn-primary" href="#/quiz?scope=wrong">全部重做</a></div>' +
      '<div class="list">' + ids.map((id) => {
        const q = QMAP[id];
        return '<div class="item" style="cursor:default">' +
          '<div class="row" style="gap:8px"><span class="badge ' + (q.type === 'multi' ? 'badge-multi' : 'badge-single') + '">' + (q.type === 'multi' ? '多选' : '单选') + '</span>' +
          '<span class="tiny muted">第' + CN[q.pno] + '套 · 第' + q.no + '题 · 错 ' + (DB.wrong[id].n || 1) + ' 次</span>' +
          '<span class="grow"></span>' +
          '<button class="btn btn-sm" data-act="unwrong" data-id="' + id + '">移出</button></div>' +
          '<div class="snip" style="margin-top:6px">' + esc(q.stem).slice(0, 80) + '</div>' +
          '<div class="row" style="margin-top:8px;gap:8px"><a class="btn btn-sm" href="#/quiz?scope=one:' + id + '">看解析</a>' +
          '<span class="tiny muted">正确答案 ' + esc(q.answer) + '</span></div></div>';
      }).join('') + '</div><div style="height:24px"></div>';
  }

  function viewStats() {
    const answered = ALL.filter((q) => DB.rec[q.id]).length;
    const okAll = ALL.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
    const acc = answered ? pct(okAll, answered) : 0;
    const wrongN = Object.keys(DB.wrong).filter((k) => QMAP[k] && !DB.wrong[k].cleared).length;
    const essayRead = ESSAYS.filter((e) => DB.read['e:' + e.id]).length;

    const byMod = MODULES.map((m) => {
      const qs = ALL.filter((q) => q.module === m);
      const done = qs.filter((q) => DB.rec[q.id]).length;
      const ok = qs.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
      return '<div class="bar-row"><div class="top"><b>' + m + '</b><span class="muted">' + done + '/' + qs.length + (done ? ' · ' + pct(ok, done) + '%' : '') + '</span></div>' +
        '<div class="bar"><i style="width:' + pct(done, qs.length) + '%"></i></div></div>';
    }).join('');

    const paperBars = BOOKS.x8.map((p) => {
      const qs = byPaper(p.no);
      const done = qs.filter((q) => DB.rec[q.id]).length;
      const ok = qs.filter((q) => DB.rec[q.id] && DB.rec[q.id].ok).length;
      return '<div class="bar-row"><div class="top"><b>第' + CN[p.no] + '套</b><span class="muted">' + done + '/' + qs.length + (done ? ' · ' + pct(ok, done) + '%' : '') + '</span></div>' +
        '<div class="bar"><i style="width:' + pct(done, qs.length) + '%"></i></div></div>';
    }).join('');

    return '<div class="card pad"><div class="donut">' +
        donut(acc) +
        '<div class="nums">' +
          '<span class="muted">已做选择题 <i>' + answered + '</i> / ' + ALL.length + '</span>' +
          '<span class="muted">正确 <i>' + okAll + '</i> 道</span>' +
          '<span class="muted">错题 <i>' + wrongN + '</i> 道</span>' +
          '<span class="muted">分析题已读 <i>' + essayRead + '</i> / ' + ESSAYS.length + '</span>' +
        '</div></div></div>' +
      '<div class="sec-title">按模块<span class="line"></span></div><div class="card pad"><div class="bars">' + byMod + '</div></div>' +
      '<div class="sec-title">按套卷<span class="line"></span></div><div class="card pad"><div class="bars">' + paperBars + '</div></div>' +
      '<div class="sec-title">数据<span class="line"></span></div>' +
      '<div class="card"><button class="setting" data-act="export" style="width:100%;background:transparent;border:0;border-bottom:1px solid var(--line-2);text-align:left"><span class="tx"><b>导出进度</b><span>保存成 JSON 备份</span></span>' + svg('right') + '</button>' +
      '<button class="setting" data-act="import" style="width:100%;background:transparent;border:0;text-align:left"><span class="tx"><b>导入进度</b><span>从备份恢复</span></span>' + svg('right') + '</button></div>' +
      '<div style="height:24px"></div>';
  }

  function donut(p) {
    const r = 26, c = 2 * Math.PI * r;
    const off = c * (1 - p / 100);
    return '<svg width="68" height="68" viewBox="0 0 68 68">' +
      '<circle cx="34" cy="34" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="7"/>' +
      '<circle cx="34" cy="34" r="' + r + '" fill="none" stroke="var(--brand)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 34 34)"/>' +
      '<text x="34" y="39" text-anchor="middle" font-size="15" font-weight="800" fill="var(--text)">' + p + '%</text></svg>';
  }

  /* ============================ 搜索 ============================ */
  function viewSearch() {
    const kw = (CUR.qs.q || '').trim();
    let res = [];
    if (kw) {
      const low = kw.toLowerCase();
      ALL.forEach((q) => {
        const hay = (q.stem + ' ' + Object.values(q.options).join(' ') + ' ' + q.analysis + ' ' + q.topic).toLowerCase();
        if (hay.indexOf(low) >= 0) res.push({ q: q, essay: false });
      });
      ESSAYS.forEach((e) => {
        const hay = (e.question + ' ' + e.material + ' ' + e.answer).toLowerCase();
        if (hay.indexOf(low) >= 0) res.push({ q: e, essay: true });
      });
    }
    return '<form class="search-box" data-act="search">' + svg('search') +
        '<input id="q" name="q" placeholder="输入关键词，如“矛盾”“抗战”" value="' + esc(kw) + '"></form>' +
      (kw ? '<p class="tiny muted" style="margin:12px 2px">找到 ' + res.length + ' 条结果</p>' : '<p class="tiny muted" style="margin:12px 2px">支持题干、选项、解析、大题材料全文搜索</p>') +
      '<div class="list">' + res.slice(0, 120).map((r) => {
        if (r.essay) {
          return '<a class="item" href="#/essay?p=' + r.q.pno + '"><div class="d"><span class="badge badge-essay">大题</span>第' + CN[r.q.pno] + '套 第' + r.q.no + '题</div>' +
            '<div class="snip">' + esc(r.q.question) + '</div></a>';
        }
        return '<a class="item" href="#/quiz?scope=one:' + r.q.id + '"><div class="d">' +
            '<span class="badge ' + (r.q.type === 'multi' ? 'badge-multi' : 'badge-single') + '">' + (r.q.type === 'multi' ? '多选' : '单选') + '</span>' +
            '第' + CN[r.q.pno] + '套 第' + r.q.no + '题</div><div class="snip">' + esc(r.q.stem) + '</div></a>';
      }).join('') + '</div><div style="height:24px"></div>';
  }

  /* ============================ 设置 ============================ */
  function viewSettings() {
    const s = DB.settings;
    const seg = (key, opts) => '<div class="seg">' + opts.map((o) =>
      '<button data-act="set" data-k="' + key + '" data-v="' + o.v + '" class="' + (s[key] === o.v ? 'on' : '') + '">' + o.t + '</button>').join('') + '</div>';

    return '<div class="card">' +
      '<div class="setting"><span class="tx"><b>主题</b><span>深色模式更省电</span></span>' + seg('theme', [{ v: 'auto', t: '自动' }, { v: 'light', t: '浅色' }, { v: 'dark', t: '深色' }]) + '</div>' +
      '<div class="setting"><span class="tx"><b>字号</b><span>题干预览字号</span></span>' + seg('font', [{ v: 's', t: '小' }, { v: 'm', t: '标准' }, { v: 'l', t: '大' }]) + '</div>' +
      '<div class="setting"><span class="tx"><b>答对自动下一题</b><span>单选题答对后自动跳转</span></span>' +
        '<button class="switch ' + (s.autoNext ? 'on' : '') + '" data-act="toggle" data-k="autoNext"></button></div>' +
    '</div>' +
    '<div class="sec-title">数据管理<span class="line"></span></div>' +
    '<div class="card">' +
      '<button class="setting" data-act="export" style="width:100%;background:transparent;border:0;border-bottom:1px solid var(--line-2);text-align:left"><span class="tx"><b>导出进度</b><span>下载 JSON 备份文件</span></span>' + svg('right') + '</button>' +
      '<button class="setting" data-act="import" style="width:100%;background:transparent;border:0;border-bottom:1px solid var(--line-2);text-align:left"><span class="tx"><b>导入进度</b><span>从备份恢复</span></span>' + svg('right') + '</button>' +
      '<button class="setting" data-act="reset" style="width:100%;background:transparent;border:0;text-align:left"><span class="tx"><b style="color:var(--bad)">清空所有记录</b><span>做题记录、错题、收藏都会删除</span></span>' + svg('trash') + '</button>' +
    '</div>' +
    '<div class="sec-title">关于<span class="line"></span></div>' +
    '<div class="card pad small muted" style="line-height:1.9">' +
      '<b style="color:var(--text)">肖八刷题 v1.0</b><br>' +
      '题库：2027 肖秀荣考研政治《冲刺8套卷》<br>' +
      '共 ' + ALL.length + ' 道选择题 · ' + ESSAYS.length + ' 道分析题 · ' + POINTS.length + ' 个考点<br>' +
      '纯前端离线运行，不收集任何数据；进度存在你自己的浏览器里。<br>' +
      '<span class="tiny">仅供个人学习使用，题目与解析版权归原作者所有。</span>' +
    '</div><div style="height:24px"></div>';
  }

  /* ============================ 事件 ============================ */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.tagName === 'FORM') return; // 表单点击交给 submit 处理
    const act = el.dataset.act;

    if (act === 'pick') { e.preventDefault(); pickOption(el.dataset.k); return; }
    if (act === 'submit') { e.preventDefault(); submitMulti(); return; }
    if (act === 'next') { e.preventDefault(); nextQ(); return; }
    if (act === 'prev') { e.preventDefault(); prevQ(); return; }
    if (act === 'card') { e.preventDefault(); openCardSheet(); return; }
    if (act === 'redo') {
      e.preventDefault();
      const q = QMAP[S.ids[S.i]]; delete S.graded[q.id]; delete S.sel[q.id]; persistSession(); render(); return;
    }
    if (act === 'star') {
      e.preventDefault();
      const id = el.dataset.id;
      if (DB.star[id]) { delete DB.star[id]; toast('已取消收藏'); } else { DB.star[id] = 1; toast('已收藏'); }
      save(); render(); return;
    }
    if (act === 'goto-module') { e.preventDefault(); location.hash = '#/module?m=' + encodeURIComponent(el.dataset.m); return; }
    if (act === 'resume') { e.preventDefault(); resumeLast(); return; }
    if (act === 'exam') {
      e.preventDefault();
      const p = Number(el.dataset.p);
      startQuiz('exam:' + p, {
        mode: 'exam', limit: 3600,
        title: '肖八 第' + CN[p] + '套 · 模拟考',
        ids: byPaper(p).map((q) => q.id),
      });
      return;
    }
    if (act === 'finish') { e.preventDefault(); submitExam(); return; }
    if (act === 'jump') { e.preventDefault(); S.i = Number(el.dataset.i); persistSession(); closeSheet(); render(); return; }
    if (act === 'restart') { e.preventDefault(); const sc = S.scope; const ti = S.title; S = null; startQuiz(sc, { mode: 'practice', title: ti }); return; }
    if (act === 'closeSheet') { e.preventDefault(); closeSheet(); return; }
    if (act === 'closeThen') { e.preventDefault(); closeSheet(); if (el.dataset.href) location.hash = el.dataset.href; return; }
    if (act === 'unwrong') { e.preventDefault(); DB.wrong[el.dataset.id].cleared = true; save(); render(); toast('已移出错题本'); return; }
    if (act === 'essayRead') {
      e.preventDefault();
      const k = 'e:' + el.dataset.id;
      if (DB.read[k]) delete DB.read[k]; else DB.read[k] = 1;
      save(); render(); return;
    }
    if (act === 'kpRead') {
      e.preventDefault();
      const id = el.dataset.id;
      if (DB.read[id]) delete DB.read[id]; else DB.read[id] = 1;
      save(); render(); return;
    }
    if (act === 'kpQuote') {
      e.preventDefault();
      const card = el.closest('.kp');
      card.classList.toggle('open');
      el.textContent = card.classList.contains('open') ? '收起原文' : '原文解析';
      return;
    }
    if (act === 'set') {
      e.preventDefault();
      const k = el.dataset.k, v = el.dataset.v;
      DB.settings[k] = v; save();
      if (k === 'theme') applyTheme();
      if (k === 'font') applyFont();
      render(); return;
    }
    if (act === 'toggle') {
      e.preventDefault();
      const k = el.dataset.k;
      DB.settings[k] = !DB.settings[k]; save(); render(); return;
    }
    if (act === 'export') {
      e.preventDefault();
      const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'shiba-progress-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      toast('已导出');
      return;
    }
    if (act === 'import') {
      e.preventDefault();
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return;
        const fr = new FileReader();
        fr.onload = () => {
          try {
            const d = JSON.parse(String(fr.result));
            if (!d || typeof d !== 'object') throw new Error('bad');
            DB = Object.assign(DEF(), d, { settings: Object.assign(DEF().settings, d.settings || {}) });
            save(); applyTheme(); applyFont(); render(); toast('导入成功');
          } catch (err) { toast('文件格式不对'); }
        };
        fr.readAsText(f);
      };
      inp.click();
      return;
    }
    if (act === 'reset') { e.preventDefault(); confirmReset(); return; }
    if (act === 'menu') { e.preventDefault(); openMenu(); return; }
    if (act === 'search') { e.preventDefault(); openSearch(); return; }
  });

  // 表单提交（搜索）
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (!f.dataset || !f.dataset.act) return;
    e.preventDefault();
    const q = (f.querySelector('input[name=q]') || {}).value || '';
    if (f.dataset.act === 'search') location.hash = '#/search?q=' + encodeURIComponent(q);
    if (f.dataset.act === 'kpSearch') {
      const m = CUR.qs.m;
      location.hash = '#/knowledge?' + (m && m !== '全部' ? 'm=' + encodeURIComponent(m) + '&' : '') + 'q=' + encodeURIComponent(q);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (!S || CUR.path !== 'quiz' || S.examSubmitted) return;
    const q = QMAP[S.ids[S.i]];
    if (!q) return;
    if (e.key === 'ArrowRight') { nextQ(); }
    else if (e.key === 'ArrowLeft') { prevQ(); }
    else if (/^[a-dA-D]$/.test(e.key)) { pickOption(e.key.toUpperCase()); }
    else if (e.key === 'Enter' && q.type === 'multi') { submitMulti(); }
  });

  window.addEventListener('scroll', () => {
    const tb = $('#topbar');
    if (tb) tb.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  window.addEventListener('hashchange', () => { closeSheet(); render(); });

  /* ---------- 答题卡 ---------- */
  function openCardSheet() {
    if (!S) return;
    const cells = S.ids.map((id, i) => {
      const graded = !!S.graded[id];
      const ok = graded && normAns(S.sel[id]) === normAns(QMAP[id] && QMAP[id].answer);
      const style = i === S.i ? 'outline:2px solid var(--brand);outline-offset:1px' : '';
      const cls = graded ? (ok ? 'done' : '') : '';
      return '<button class="' + cls + '" data-act="jump" data-i="' + i + '" style="width:38px;height:38px;border-radius:10px;border:1px solid ' + (graded && !ok ? 'var(--bad)' : 'var(--line)') + ';background:' + (graded ? (ok ? 'var(--brand-soft)' : 'var(--bad-soft)') : 'var(--card)') + ';font-size:12.5px;font-weight:700;' + style + '">' + (i + 1) + '</button>';
    }).join('');
    openSheet('<h3>答题卡</h3><div class="desc">已答 ' + S.ids.filter((id) => S.graded[id]).length + '/' + S.ids.length + '</div>' +
      '<div class="pad" style="display:flex;flex-wrap:wrap;gap:7px">' + cells + '</div>');
  }

  /* ---------- 菜单 ---------- */
  function openMenu() {
    const items = [
      ['flag', '错题本', '#/wrong'],
      ['chart', '学习统计', '#/stats'],
      ['search', '全书搜索', '#/search'],
      ['star', '肖四专区', '#/x4'],
      ['gear', '设置', '#/settings'],
    ];
    openSheet('<h3>更多</h3><div class="desc">肖八 · 2027 考研政治</div><div class="opt-list">' +
      items.map((i) => '<button class="opt-item" data-act="closeThen" data-href="' + i[2] + '" style="border:0;background:transparent;width:100%;text-align:left;color:var(--text)">' + svg(i[0]) + i[1] + '</button>').join('') +
      '</div><div style="height:8px"></div>');
  }

  function openSearch() { location.hash = '#/search'; }

  function confirmReset() {
    openSheet('<h3>清空所有记录？</h3><div class="desc">做题记录、错题、收藏、考点标记都会被删除，无法恢复。</div>' +
      '<div class="pad"><button class="btn btn-block" data-act="closeSheet">取消</button>' +
      '<button class="btn btn-primary btn-block" style="margin-top:8px;background:var(--bad);border-color:var(--bad)" data-act="doReset">确认清空</button></div>');
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act="doReset"]');
    if (el) { resetDB(); closeSheet(); toast('已清空'); render(); }
    if (e.target.id === 'mask') closeSheet();
  });

  /* ---------- 继续上次 ---------- */
  function resumeLast() {
    if (!DB.last) return;
    startQuiz(DB.last.scope, { mode: 'practice', title: DB.last.title, i: DB.last.idx || 0 });
  }

  // 记录最近一次练习（进入答题页时写入）
  const origRender = render;
  render = function () {
    origRender();
    if (S && CUR.path === 'quiz' && !S.examSubmitted) {
      DB.last = { scope: S.scope, title: S.title, idx: S.i, total: S.ids.length, ts: Date.now() };
      save();
    }
  };

  /* ============================ 启动 ============================ */
  $('#btnBack').innerHTML = svg('back');
  $('#btnSearch').innerHTML = svg('search');
  $('#btnMenu').innerHTML = svg('menu');
  $('#btnBack').addEventListener('click', () => { location.hash = $('#btnBack').dataset.href || '#/'; });
  $('#btnSearch').addEventListener('click', openSearch);
  $('#btnMenu').addEventListener('click', openMenu);
  $('#mask').addEventListener('click', closeSheet);

  applyTheme();
  applyFont();
  if (!location.hash) location.hash = '#/';
  render();

  // 注册 Service Worker（离线可用）
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => { });
    });
  }
})();