/* Margdarshak – core runtime: state, API, router, i18n, icons, illustrations */
(function () {
  const MG = (window.MG = {
    state: {
      user: null, profile: null, matches: null, saved: [], careers: [], assessment: { quickQuestions: [], counselorAdvice: {} },
      lang: 'en', roadmapProgress: [], activeCareerId: null, noticeDismissed: false
    },
    routes: {}, act: {}, chg: {}, forms: {}
  });
  const S = MG.state;

  /* ---------------- helpers ---------------- */
  MG.esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esc = MG.esc;
  MG.$ = (sel, root) => (root || document).querySelector(sel);
  MG.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  MG.inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  MG.initials = (name) => (String(name || 'S').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('') || 'S').toUpperCase();
  MG.firstName = (name) => String(name || 'Student').split(/\s+/)[0];

  MG.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(MG._toastT);
    MG._toastT = setTimeout(() => el.classList.remove('show'), 3200);
  };

  MG.api = async (path, opts = {}) => {
    const o = { headers: { 'Content-Type': 'application/json' }, ...opts };
    if (o.body && typeof o.body !== 'string') o.body = JSON.stringify(o.body);
    const res = await fetch(path, o);
    let data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) { const err = new Error((data && data.error) || 'Request failed'); err.status = res.status; throw err; }
    return data;
  };

  /* ---------------- icons ---------------- */
  const P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    assess: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 13l2.5 2.5L16 10"/>',
    recs: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    roadmap: '<path d="M4 20V5l5 2 6-2 5 2v13l-5-2-6 2-5-2z"/><path d="M9 7v13M15 5v13"/>',
    college: '<path d="M3 10l9-6 9 6"/><path d="M5 10v9M9 10v9M15 10v9M19 10v9M3 20h18"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    toolkit: '<path d="M14.5 6.5a4 4 0 00-5 5L3 18l3 3 6.5-6.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.6A17 17 0 002 12s3.6 7 10 7a9.7 9.7 0 004.1-.9"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    heart: '<path d="M12 20s-8-4.9-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6.1-8 11-8 11z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    rupee: '<path d="M7 5h10M7 9h10M7 5c6 0 7 7 0 7h-1l7 7"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M9 7h6"/>',
    logout: '<path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M16 8l4 4-4 4M20 12H9"/>',
    arrows: '<path d="M8 9l-4 3 4 3M16 9l4 3-4 3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
  };
  MG.ico = (n, s = 20, extra = '') =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[n] || ''}</svg>`;
  const ico = MG.ico;

  /* ---------------- illustrations ---------------- */
  MG.logo = (size = 42) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 42C8 38 3 25 5 16c10-.5 17 6 19 26z" fill="#3E8E4A"/>
    <path d="M24 42c16-4 21-17 19-26-10-.5-17 6-19 26z" fill="#E9A23B"/>
    <circle cx="24" cy="9.5" r="5.5" fill="#C63D1E"/>
    <path d="M24 16.5c-5.2 0-7.6 4-6.4 8.3 1 3.6 3.6 6.3 6.4 10.7 2.8-4.4 5.4-7.1 6.4-10.7 1.2-4.3-1.2-8.3-6.4-8.3z" fill="#C63D1E"/>
    <circle cx="24" cy="24" r="2.8" fill="#FDF3E7"/></svg>`;

  MG.heroArt = () => `<svg viewBox="0 0 640 520" role="img" aria-label="A student with a backpack looking at a signpost pointing to Engineering, Medical, Management, Design and more">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3C8"/><stop offset=".6" stop-color="#FDF0DF"/><stop offset="1" stop-color="#FDF6EA"/></linearGradient>
      <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3C9"/><stop offset=".55" stop-color="#FFE3A3" stop-opacity=".7"/><stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient>
      <linearGradient id="board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9622F"/><stop offset="1" stop-color="#A94B1E"/></linearGradient>
    </defs>
    <rect width="640" height="520" fill="url(#sky)"/>
    <circle cx="300" cy="150" r="130" fill="url(#sun)"/>
    <g fill="#FFFFFF" opacity=".75"><ellipse cx="130" cy="110" rx="50" ry="14"/><ellipse cx="165" cy="98" rx="30" ry="14"/><ellipse cx="470" cy="70" rx="46" ry="12"/><ellipse cx="500" cy="60" rx="26" ry="12"/></g>
    <path d="M0 330l120-90 90 60 90-110 110 120 90-70 140 100v180H0z" fill="#B9B5DA" opacity=".85"/>
    <path d="M0 360l100-50 100 40 120-60 120 50 100-30 100 40v190H0z" fill="#9EC08E"/>
    <path d="M0 400c120-30 220-20 330 10s210 10 310-20v150H0z" fill="#7FAE6E"/>
    <path d="M60 520C140 470 120 430 230 410c100-18 100-60 70-95" fill="none" stroke="#F6E6CF" stroke-width="34" stroke-linecap="round" opacity=".95"/>
    <path d="M60 520C140 470 120 430 230 410c100-18 100-60 70-95" fill="none" stroke="#EAD2B3" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>
    <g><rect x="62" y="338" width="10" height="42" fill="#7A4B2B"/><circle cx="67" cy="326" r="30" fill="#4E8A47"/><circle cx="50" cy="344" r="20" fill="#5C9A52"/></g>
    <g><rect x="188" y="352" width="8" height="30" fill="#7A4B2B"/><circle cx="192" cy="340" r="22" fill="#5C9A52"/></g>
    <g><rect x="412" y="372" width="8" height="30" fill="#7A4B2B"/><circle cx="416" cy="360" r="22" fill="#4E8A47"/></g>
    <g fill="#C63D1E"><circle cx="120" cy="470" r="4"/><circle cx="134" cy="478" r="4"/><circle cx="108" cy="482" r="4"/></g>
    <g fill="#E9A23B"><circle cx="560" cy="470" r="4"/><circle cx="574" cy="480" r="4"/></g>
    <!-- signpost -->
    <rect x="552" y="110" width="14" height="370" rx="4" fill="#7A4B2B"/>
    <g transform="translate(0 -34)" font-family="Plus Jakarta Sans, Noto Sans Devanagari, sans-serif" font-weight="800" fill="#FFF4E4" text-anchor="middle">
      <g transform="rotate(-8 560 135)"><path d="M440 112h140l24 24-24 24H440z" fill="url(#board)"/><text x="508" y="143" font-size="21">Engineering</text></g>
      <g transform="rotate(-2 560 205)"><path d="M446 184h120l22 24-22 24H446z" fill="url(#board)"/><text x="508" y="215" font-size="21">Medical</text></g>
      <g transform="rotate(2 560 275)"><path d="M424 254h150l22 24-22 24H424z" fill="url(#board)"/><text x="498" y="285" font-size="21">Management</text></g>
      <g transform="rotate(-1 560 345)"><path d="M470 326h100l22 24-22 24H470z" fill="url(#board)"/><text x="522" y="357" font-size="21">Design</text></g>
      <g transform="rotate(4 560 415)"><path d="M446 396h126l22 22-22 22H446z" fill="url(#board)"/><text x="512" y="424" font-size="19">And More…</text></g>
    </g>
    <!-- student (back view) -->
    <g transform="translate(0 6)">
      <ellipse cx="300" cy="494" rx="62" ry="9" fill="#000" opacity=".12"/>
      <rect x="268" y="414" width="26" height="76" rx="9" fill="#34415C"/><rect x="304" y="414" width="26" height="76" rx="9" fill="#34415C"/>
      <rect x="262" y="480" width="34" height="14" rx="7" fill="#2A2F3D"/><rect x="302" y="480" width="34" height="14" rx="7" fill="#2A2F3D"/>
      <path d="M252 318c0-14 14-24 48-24s48 10 48 24l6 100H246z" fill="#E08B2E"/>
      <rect x="226" y="316" width="30" height="52" rx="14" fill="#E08B2E" transform="rotate(8 241 316)"/>
      <rect x="344" y="316" width="30" height="52" rx="14" fill="#E08B2E" transform="rotate(-14 359 316)"/>
      <rect x="228" y="352" width="24" height="42" rx="11" fill="#E3A57C" transform="rotate(6 240 352)"/>
      <rect x="352" y="330" width="24" height="46" rx="11" fill="#E3A57C" transform="rotate(-24 364 330)"/>
      <rect x="258" y="316" width="84" height="104" rx="20" fill="#4B3F57"/>
      <rect x="272" y="372" width="56" height="34" rx="10" fill="#5B4E69"/>
      <path d="M262 318c-4 28-2 52 6 70M338 318c4 28 2 52-6 70" stroke="#2F2638" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="284" y="288" width="32" height="22" rx="10" fill="#E3A57C"/>
      <circle cx="300" cy="272" r="33" fill="#E3A57C"/>
      <path d="M266 272c-4-30 18-44 38-42 22 2 34 20 28 42-6-12-12-18-28-18s-28 6-38 18z" fill="#4A2A1B"/>
      <path d="M268 268c-2 14 2 24 8 30 4-12 4-20 0-30zM332 268c2 14-2 24-8 30-4-12-4-20 0-30z" fill="#4A2A1B"/>
    </g>
  </svg>`;

  MG.studentArt = () => `<svg viewBox="0 0 360 250" role="img" aria-label="A student working on a laptop">
    <ellipse cx="190" cy="228" rx="150" ry="14" fill="#EAD2B3" opacity=".6"/>
    <g><path d="M60 220c-12-40-6-80 8-96 10 28 12 60 12 96z" fill="#4E8A47"/><path d="M82 220c8-30 22-60 40-76 2 30-8 60-18 76z" fill="#5C9A52"/><rect x="52" y="200" width="44" height="30" rx="4" fill="#C9622F"/></g>
    <g><path d="M300 220c10-30 6-64-8-84-12 24-14 56-12 84z" fill="#4E8A47"/><path d="M278 220c-8-24-22-48-38-60-2 26 8 48 18 60z" fill="#5C9A52"/><rect x="266" y="204" width="44" height="26" rx="4" fill="#C9622F"/></g>
    <rect x="96" y="176" width="170" height="10" rx="4" fill="#B9763D"/>
    <rect x="130" y="186" width="8" height="42" fill="#9C5F2D"/><rect x="226" y="186" width="8" height="42" fill="#9C5F2D"/>
    <path d="M118 176l12-60h92l12 60z" fill="#2C3A52"/><rect x="132" y="122" width="88" height="48" rx="3" fill="#1D2638"/><circle cx="176" cy="146" r="6" fill="#2E86AB"/>
    <path d="M130 100c-10-40 20-60 48-56 26 4 36 30 26 58z" fill="#2B1B13"/>
    <circle cx="170" cy="86" r="26" fill="#E3A57C"/>
    <path d="M144 80c-2-26 20-38 40-32 18 6 22 24 14 38-4-12-14-20-26-20s-22 6-28 14z" fill="#2B1B13"/>
    <path d="M132 176c-10-26 0-56 22-62h40c20 8 28 36 20 62z" fill="#2F5D9B"/>
    <rect x="150" y="104" width="40" height="14" rx="6" fill="#E3A57C"/>
    <path d="M150 140l30 16M206 140l-30 16" stroke="#E3A57C" stroke-width="12" stroke-linecap="round"/>
  </svg>`;

  /* ---------------- i18n ---------------- */
  const I18N = {
    en: {
      'nav.home': 'Home', 'nav.explore': 'Explore', 'nav.features': 'Features', 'nav.about': 'About', 'nav.contact': 'Contact',
      'btn.login': 'Login', 'btn.signup': 'Sign Up', 'btn.getStarted': 'Get Started Free', 'btn.guest': 'Continue as Guest',
      'hero.l1': 'Your Career', 'hero.l2': 'Our Guidance',
      'hero.sub': 'Discover the right career path, plan your education, explore opportunities and build a better future with Margdarshak.',
      'hero.tag': 'Better Career\nBrighter Future',
      'fs.1': 'Personalized\nCareer Guidance', 'fs.2': 'Government College\n& Exam Finder', 'fs.3': 'Scholarships &\nBudget Planner', 'fs.4': '90-Day\nAction Plan',
      'side.dashboard': 'Dashboard', 'side.assessment': 'Assessment', 'side.recommendations': 'Recommendations', 'side.roadmap': 'Roadmap',
      'side.colleges': 'College Finder', 'side.opportunities': 'Opportunities', 'side.profile': 'Profile', 'side.toolkit': 'Toolkit',
      'auth.createTitle': 'Create Your Account', 'auth.createSub': 'Start your journey towards a better future',
      'auth.loginTitle': 'Welcome Back', 'auth.loginSub': 'Log in to see your matches and 90-day plan',
      'auth.name': 'Full Name', 'auth.email': 'Email Address', 'auth.password': 'Password', 'auth.confirm': 'Confirm Password',
      'auth.google': 'Continue with Google', 'auth.or': 'OR', 'auth.have': 'Already have an account?', 'auth.noacc': 'New here?',
      'auth.quote': '“The right guidance can change your future.”', 'btn.logout': 'Log out'
    },
    hi: {
      'nav.home': 'होम', 'nav.explore': 'एक्सप्लोर', 'nav.features': 'सुविधाएँ', 'nav.about': 'हमारे बारे में', 'nav.contact': 'संपर्क',
      'btn.login': 'लॉगिन', 'btn.signup': 'साइन अप', 'btn.getStarted': 'मुफ़्त शुरू करें', 'btn.guest': 'अतिथि के रूप में जारी रखें',
      'hero.l1': 'आपका करियर', 'hero.l2': 'हमारा मार्गदर्शन',
      'hero.sub': 'सही करियर मार्ग खोजें, अपनी पढ़ाई की योजना बनाएँ, अवसर तलाशें और मार्गदर्शक के साथ बेहतर भविष्य बनाएँ।',
      'hero.tag': 'बेहतर करियर\nउज्ज्वल भविष्य',
      'fs.1': 'व्यक्तिगत\nकरियर मार्गदर्शन', 'fs.2': 'सरकारी कॉलेज\nऔर परीक्षा खोजें', 'fs.3': 'छात्रवृत्ति और\nबजट प्लानर', 'fs.4': '90-दिन\nकार्य योजना',
      'side.dashboard': 'डैशबोर्ड', 'side.assessment': 'मूल्यांकन', 'side.recommendations': 'सुझाव', 'side.roadmap': 'रोडमैप',
      'side.colleges': 'कॉलेज खोजें', 'side.opportunities': 'अवसर', 'side.profile': 'प्रोफ़ाइल', 'side.toolkit': 'टूलकिट',
      'auth.createTitle': 'अपना खाता बनाएँ', 'auth.createSub': 'बेहतर भविष्य की ओर अपनी यात्रा शुरू करें',
      'auth.loginTitle': 'वापसी पर स्वागत है', 'auth.loginSub': 'अपने सुझाव और 90-दिन की योजना देखने के लिए लॉगिन करें',
      'auth.name': 'पूरा नाम', 'auth.email': 'ईमेल पता', 'auth.password': 'पासवर्ड', 'auth.confirm': 'पासवर्ड की पुष्टि करें',
      'auth.google': 'Google से जारी रखें', 'auth.or': 'या', 'auth.have': 'पहले से खाता है?', 'auth.noacc': 'नए हैं?',
      'auth.quote': '“सही मार्गदर्शन आपका भविष्य बदल सकता है।”', 'btn.logout': 'लॉग आउट'
    }
  };
  MG.t = (k) => (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k;
  MG.tHTML = (k) => esc(MG.t(k)).replace(/\n/g, '<br>');
  MG.setLang = (l) => { S.lang = l; try { localStorage.setItem('mg_lang', l); } catch (e) {} document.documentElement.lang = l; MG.render(); };

  /* ---------------- theme / nav side ---------------- */
  MG.toggleTheme = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mg_theme', next); } catch (e) {}
    MG.render();
  };
  MG.toggleNavSide = () => {
    const root = document.documentElement;
    const right = root.classList.toggle('nav-right');
    try { localStorage.setItem('mg_nav', right ? 'right' : 'left'); } catch (e) {}
    MG.toast(right ? 'Menu moved to the right' : 'Menu moved to the left');
  };
  const themeIcon = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon');

  /* ---------------- session ---------------- */
  MG.restoreSession = () => {
    try {
      const u = localStorage.getItem('margdarshak_user');
      if (u) S.user = JSON.parse(u);
      const l = localStorage.getItem('mg_lang');
      if (l) S.lang = l;
    } catch (e) { /* ignore */ }
    document.documentElement.lang = S.lang;
  };
  MG.setUser = (u) => { S.user = u; try { localStorage.setItem('margdarshak_user', JSON.stringify(u)); } catch (e) {} };
  MG.logout = () => {
    S.user = null; S.profile = null; S.matches = null; S.saved = []; S.roadmapProgress = [];
    try { localStorage.removeItem('margdarshak_user'); } catch (e) {}
    MG.toast('Logged out. Your saved profile stays in the database.');
    MG.go('/home');
  };

  MG.loadUserData = async () => {
    if (!S.user) return;
    try {
      const [p, saved] = await Promise.all([MG.api('/api/profile/' + S.user.id), MG.api('/api/saved/' + S.user.id)]);
      S.profile = p;
      S.saved = saved || [];
      S.activeCareerId = p && p.saved_career_id ? p.saved_career_id : null;
      try { S.roadmapProgress = p && p.progress_days ? JSON.parse(p.progress_days) : []; } catch (e) { S.roadmapProgress = []; }
    } catch (e) { /* offline or reset db */ }
  };

  MG.ensureMatches = async () => {
    if (S.matches || !S.user) return S.matches;
    try {
      const d = await MG.api('/api/matches/' + S.user.id);
      if (d && d.success) S.matches = d;
    } catch (e) { /* no profile yet */ }
    return S.matches;
  };

  MG.guest = async () => {
    try {
      const d = await MG.api('/api/auth/guest', { method: 'POST' });
      MG.setUser(d.user); S.profile = null; S.matches = null; S.saved = []; S.roadmapProgress = [];
      MG.go('/app/assessment');
    } catch (e) { MG.toast('Could not start a guest session. Is the server running?'); }
  };

  MG.career = (id) => S.careers.find((c) => c.id === id);

  /* ---------------- router ---------------- */
  MG.register = (name, def) => { MG.routes[name] = def; };
  MG.go = (path) => { if (location.hash === '#' + path) MG.render(); else location.hash = path; };

  MG.parse = () => {
    const raw = (location.hash || '#/home').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    if (!parts.length) parts.push('home');
    if (parts[0] === 'app') return { name: parts[1] || 'dashboard', params: parts.slice(2), isApp: true };
    return { name: parts[0], params: parts.slice(1), isApp: false };
  };

  const SIDE = [
    ['dashboard', 'dashboard', 'side.dashboard'], ['assessment', 'assess', 'side.assessment'], ['recommendations', 'recs', 'side.recommendations'],
    ['roadmap', 'roadmap', 'side.roadmap'], ['colleges', 'college', 'side.colleges'], ['opportunities', 'briefcase', 'side.opportunities'],
    ['profile', 'user', 'side.profile'], ['toolkit', 'toolkit', 'side.toolkit']
  ];
  const SIDE_ALIAS = { career: 'recommendations', whatif: 'toolkit', budget: 'toolkit', skills: 'toolkit', plan: 'roadmap' };

  MG.pubHeader = (active) => `
    <header class="pub-header"><div class="inner">
      <a class="brand" href="#/home">${MG.logo()}<span>Margdarshak</span></a>
      <nav class="pub-nav" id="pubnav" aria-label="Main">
        ${[['home', 'nav.home'], ['explore', 'nav.explore'], ['features', 'nav.features'], ['about', 'nav.about'], ['contact', 'nav.contact']]
          .map(([r, k]) => `<a href="#/${r}" class="${active === r ? 'active' : ''}" data-act="closeMenu">${MG.t(k)}</a>`).join('')}
      </nav>
      <span class="spacer"></span>
      <div class="pub-actions">
        <select class="select-pill hide-sm" data-chg="lang" aria-label="Language">
          <option value="en" ${S.lang === 'en' ? 'selected' : ''}>English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>हिन्दी</option>
        </select>
        <button class="icon-btn" data-act="theme" aria-label="Toggle dark mode">${ico(themeIcon(), 18)}</button>
        ${S.user
          ? `<a class="btn btn-primary btn-sm" href="#/app/dashboard">${MG.t('side.dashboard')}</a>`
          : `<a class="btn btn-outline btn-sm hide-sm" href="#/login">${MG.t('btn.login')}</a><a class="btn btn-primary btn-sm" href="#/signup">${MG.t('btn.signup')}</a>`}
        <button class="icon-btn menu-toggle" data-act="menu" aria-label="Open menu">${ico('menu', 18)}</button>
      </div>
    </div></header>`;

  MG.appShell = (active, inner) => {
    const key = SIDE_ALIAS[active] || active;
    const links = SIDE.map(([r, i, k]) => `<a class="side-link ${key === r ? 'active' : ''}" href="#/app/${r}">${ico(i, 20)}<span>${MG.t(k)}</span></a>`).join('');
    const bottom = SIDE.map(([r, i, k]) => `<a class="${key === r ? 'active' : ''}" href="#/app/${r}">${ico(i, 20)}<span>${MG.t(k).split(' ')[0]}</span></a>`).join('');
    const u = S.user || {};
    return `<div class="app">
      <header class="topbar">
        <a class="brand" href="#/app/dashboard">${MG.logo()}<span>Margdarshak</span></a>
        <span class="spacer"></span>
        <select class="select-pill hide-sm" data-chg="lang" aria-label="Language"><option value="en" ${S.lang === 'en' ? 'selected' : ''}>English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>हिन्दी</option></select>
        <button class="icon-btn hide-sm" data-act="navSide" aria-label="Move menu to the other side" title="Move menu left/right">${ico('arrows', 18)}</button>
        <button class="icon-btn" data-act="theme" aria-label="Toggle dark mode">${ico(themeIcon(), 18)}</button>
        <a class="user-chip" href="#/app/profile"><span class="avatar">${esc(MG.initials(u.name))}</span><span class="name">${esc(MG.firstName(u.name))}</span></a>
        <button class="icon-btn" data-act="logout" aria-label="Log out" title="${MG.t('btn.logout')}">${ico('logout', 18)}</button>
      </header>
      <div class="shell">
        <nav class="sidebar" aria-label="App">${links}<div class="side-sep"></div><p class="side-note">${u.is_guest ? 'Guest demo – <a href="#/signup">create an account</a> to keep your plan.' : 'Signed in as ' + esc(u.email || '')}</p></nav>
        <main class="content" id="main"><div class="content-inner">${inner}</div></main>
      </div>
      <nav class="bottom-nav" aria-label="App">${bottom}</nav>
    </div>`;
  };

  MG.caveat = () => S.noticeDismissed ? '' : `<div class="notice">${ico('info', 18)}<div><b>Verify before you apply.</b> Fees, cut-offs, salaries and dates here are approximate and change every year. Always confirm on the official site (ssc.gov.in, upsc.gov.in, ibps.in, nta.ac.in).</div></div>`;

  MG.render = async () => {
    const { name, params, isApp } = MG.parse();
    const root = document.getElementById('root');
    const SCROLL_SECTIONS = ['features', 'about', 'contact'];
    const routeName = SCROLL_SECTIONS.includes(name) ? 'home' : name;
    const def = MG.routes[routeName];
    if (!def) { MG.go(S.user ? '/app/dashboard' : '/home'); return; }
    if (isApp && !S.user) { MG.go('/login'); return; }
    if ((routeName === 'login' || routeName === 'signup') && S.user && !S.user.is_guest) { MG.go('/app/dashboard'); return; }

    const token = (MG._renderToken = (MG._renderToken || 0) + 1);
    if (def.layout === 'app') {
      root.innerHTML = MG.appShell(name, '<div class="loading">Loading…</div>');
    }
    let html = '';
    try { html = await def.html(params, name); } catch (e) { console.error(e); html = `<div class="card empty"><h3>Something went wrong</h3><p>${esc(e.message)}</p></div>`; }
    if (token !== MG._renderToken) return; // a newer navigation superseded this one

    if (def.layout === 'app') root.innerHTML = MG.appShell(name, html);
    else if (def.layout === 'auth') root.innerHTML = html;
    else root.innerHTML = MG.pubHeader(name === 'home' ? 'home' : name) + `<main id="main">${html}</main>`;

    if (def.mount) def.mount(params, name);
    if (SCROLL_SECTIONS.includes(name)) {
      const el = document.getElementById('sec-' + name);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
    } else if (location.hash !== MG._lastHash) window.scrollTo({ top: 0, behavior: 'instant' });
    MG._lastHash = location.hash;
  };

  /* ---------------- modal ---------------- */
  MG.modal = (html, cls = '') => {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-overlay" data-act="modalBackdrop"><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="icon-btn modal-close" data-act="closeModal" aria-label="Close">${ico('x', 18)}</button>${html}</div></div>`;
    document.body.style.overflow = 'hidden';
    const first = root.querySelector('input,select,textarea,button.btn');
    if (first) first.focus();
  };
  MG.closeModal = () => { document.getElementById('modal-root').innerHTML = ''; document.body.style.overflow = ''; };

  /* ---------------- delegated events ---------------- */
  Object.assign(MG.act, {
    theme: () => MG.toggleTheme(),
    navSide: () => MG.toggleNavSide(),
    logout: () => MG.logout(),
    menu: () => { const n = document.getElementById('pubnav'); if (n) n.classList.toggle('open'); },
    closeMenu: () => { const n = document.getElementById('pubnav'); if (n) n.classList.remove('open'); },
    closeModal: () => MG.closeModal(),
    modalBackdrop: (el, ev) => { if (ev.target === el) MG.closeModal(); },
    dismissNotice: () => { S.noticeDismissed = true; const n = document.querySelector('.notice'); if (n) n.remove(); },
    guest: () => MG.guest()
  });
  MG.chg.lang = (el) => MG.setLang(el.value);

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const fn = MG.act[el.dataset.act];
    if (fn) { if (el.tagName === 'A' && el.dataset.act !== 'closeMenu') ev.preventDefault(); fn(el, ev); }
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-chg]');
    if (el && MG.chg[el.dataset.chg]) MG.chg[el.dataset.chg](el, ev);
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('[data-form]');
    if (f && MG.forms[f.dataset.form]) { ev.preventDefault(); MG.forms[f.dataset.form](f, ev); }
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') MG.closeModal(); });
  window.addEventListener('hashchange', () => { MG.closeModal(); MG.render(); });

  /* ---------------- boot ---------------- */
  MG.boot = async () => {
    MG.restoreSession();
    try {
      const [careers, assessment] = await Promise.all([MG.api('/api/careers'), MG.api('/api/assessment')]);
      S.careers = careers; S.assessment = assessment;
    } catch (e) {
      document.getElementById('root').innerHTML = '<div style="padding:3rem;max-width:560px;margin:auto"><h2>Server not reachable</h2><p style="margin-top:.6rem">Start the app with <code>npm start</code> and open <code>http://localhost:3000</code>.</p></div>';
      return;
    }
    await MG.loadUserData();
    if (S.user && S.user.id && S.profile === null && !S.user.is_guest) { /* new account, no profile yet */ }
    MG.render();
  };

  /* ---------------- shared career helpers ---------------- */
  MG.shortSalary = (c) => {
    const first = String(c.salary || '').split(/;|\. /)[0].trim();
    return first.length > 62 ? first.slice(0, 60).replace(/\s+\S*$/, '') + '…' : first;
  };
  MG.groups = (c) => {
    const g = [];
    if (c.isGovt) g.push('Government');
    if (!c.isGovt && /private|skill/.test(c.category)) g.push('Private');
    if (!c.isGovt && /education/.test(c.category)) g.push('Higher Studies');
    if (c.id === 'entrepreneurship-startups') g.push('Entrepreneurship');
    return g;
  };
  const COLORS = ['#2F6FB5', '#C63D1E', '#3E8E4A', '#7B52AB', '#C9822B', '#1F8A8A', '#B23A6B'];
  MG.mono = (c) => {
    let h = 0; for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const words = c.name.replace(/[()]/g, '').split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
    const txt = (words[0] || 'C')[0] + ((words[1] || '')[0] || '');
    return `<span class="badge-ico" style="background:${COLORS[h % COLORS.length]}" aria-hidden="true">${esc(txt.toUpperCase())}</span>`;
  };
  MG.profileCompleteness = () => {
    const p = S.profile || {}; const u = S.user || {};
    const checks = [u.name, !u.is_guest, p.stage, p.stream, p.percentage, p.liked_subjects, p.activities_text, p.budget_level, p.work_preference, p.weekly_hours, p.relocation_pref, p.main_worry];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };
})();
