/* Margdarshak – public pages: Home, Explore, Login / Sign Up, shared career modal */
(function () {
  const { S, esc, ico, t, tHTML } = { S: MG.state, esc: MG.esc, ico: MG.ico, t: (k) => MG.t(k), tHTML: (k) => MG.tHTML(k) };

  const portalHref = (c) => {
    const first = String(c.officialPortal || '').split(/\s|\//)[0];
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(first) ? 'https://' + first : null;
  };
  MG.portalHref = portalHref;

  /* ---------- shared: career detail modal (8 dataset fields + 90-day roadmap) ---------- */
  MG.openCareerModal = async (id) => {
    MG.modal('<p class="loading">Loading career details…</p>');
    try {
      const { career: c, roadmap } = await MG.api('/api/careers/' + encodeURIComponent(id));
      const href = portalHref(c);
      const phase = (p, label) => `<div class="roadmap-phase"><div class="phase-tag">${esc(p.days)} · ${esc(p.weeklyHours)}</div><h4>${esc(p.name)}</h4>
        <p class="sub">${esc(p.focus)}</p>
        <ul style="margin:.4rem 0 .5rem 1.2rem;font-size:.88rem">${p.resources.map((r) => `<li>${esc(r.title)} <span class="muted">(${esc(r.platform)})</span></li>`).join('')}</ul>
        <div class="chip green">${label}: ${esc(p.milestone)}</div></div>`;
      MG.modal(`
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.4rem"><span class="chip ${c.isGovt ? 'green' : 'red'}">${c.isGovt ? 'Government' : 'Private / Skill'}</span><span class="chip amber">${esc(c.competition)} competition</span><span class="chip">${esc(c.part)}</span></div>
        <h2 style="padding-right:2.5rem">${esc(c.name)}</h2><p class="hi muted" style="margin-bottom:1rem">${esc(c.hindiTitle || '')}</p>
        <table class="kv">
          <tr><th>Entrance exam</th><td>${esc(c.exam)}</td></tr><tr><th>Eligibility</th><td>${esc(c.eligibility)}</td></tr>
          <tr><th>Syllabus</th><td>${esc(c.syllabus)}</td></tr><tr><th>Competition</th><td>${esc(c.competitionDetail || c.competition)}</td></tr>
          <tr><th>Fees</th><td>${esc(c.fees)}</td></tr><tr><th>Duration</th><td>${esc(c.duration)}</td></tr>
          <tr><th>Career outcomes</th><td>${esc(c.outcomes)}</td></tr><tr><th>Starting salary</th><td>${esc(c.salary)}</td></tr>
        </table>
        <div class="notice" style="margin-top:1rem">${ico('info', 18)}<div>Verify on the official portal: ${href ? `<a href="${href}" target="_blank" rel="noopener">${esc(c.officialPortal)}</a>` : esc(c.officialPortal)}</div></div>
        <h3 style="margin:1.2rem 0 .6rem">90-day roadmap</h3>
        ${roadmap ? phase(roadmap.phase1, '30-day milestone') + phase(roadmap.phase2, '60-day milestone') + phase(roadmap.phase3, '90-day milestone')
          : '<p class="sub">Standard progression: days 1–30 build the basics, days 31–60 practise with previous-year papers, days 61–90 take full mock tests and check the official notification.</p>'}
        <div style="display:flex;gap:.6rem;justify-content:flex-end;flex-wrap:wrap;margin-top:1.2rem">
          ${S.user ? `${MG.saveBtnHTML(c.id, 'btn btn-ghost btn-sm')}
          <button class="btn btn-primary btn-sm" data-act="setPlan" data-id="${esc(c.id)}">Use as my 90-day plan</button>`
          : `<a class="btn btn-primary btn-sm" href="#/signup">Sign up to save</a>`}
        </div>`);
    } catch (e) { MG.modal('<p>Could not load this career.</p>'); }
  };

  /* ---------- HOME ---------- */
  MG.register('home', {
    layout: 'public',
    html: () => {
      const feats = [
        ['target', 'Personalised matches', 'Answer five short steps. We score all 63 careers in the dataset and show why each one fits, with the formula spelled out.'],
        ['college', 'Government college & exam finder', 'Filter by state and course, see approximate fees and jump straight to the official admission site.'],
        ['rupee', 'Budget planner & scholarships', 'Estimate yearly cost for a course and see scholarships you may be able to apply for.'],
        ['swap', 'What-if simulator', 'Cannot afford a private college? Compare government seats, entrance exams and earn-and-learn routes side by side.'],
        ['chart', 'Skill gap analysis', 'Pick a target career, tick the skills you already have and see exactly what to learn next.'],
        ['calendar', '90-day action plan', 'A day-by-day plan in three 30-day stages with free resources and a progress tracker.']
      ];
      const pills = S.careers.slice(0, 14).map((c) => `<button class="tag" data-act="openCareer" data-id="${esc(c.id)}">${esc(c.name)}</button>`).join('');
      return `
      <section class="hero">
        <div>
          <h1>${esc(t('hero.l1'))}<span class="accent">${esc(t('hero.l2'))}</span></h1>
          <p class="lead">${esc(t('hero.sub'))}</p>
          <div class="cta">
            <a class="btn btn-primary" href="#/signup">${t('btn.getStarted')}</a>
            <button class="btn btn-outline" data-act="guest">${t('btn.guest')}</button>
          </div>
        </div>
        <div class="hero-art">${MG.heroArt()}<div class="tag">${tHTML('hero.tag')}</div></div>
      </section>
      <div class="feature-strip">
        ${[['user', 'fs.1'], ['college', 'fs.2'], ['rupee', 'fs.3'], ['calendar', 'fs.4']].map(([i, k]) => `<div class="fs-item"><span class="fs-ico">${ico(i, 22)}</span><span>${tHTML(k)}</span></div>`).join('')}
      </div>

      <section class="section" id="sec-features">
        <div class="section-head"><h2>Everything a first-generation student needs in one place</h2><p>No coaching adverts, no black-box scores. Every figure comes from the Complete Career Guide dataset behind this app.</p></div>
        <div class="grid-3">${feats.map(([i, h, p]) => `<div class="feat"><span class="fs-ico">${ico(i, 22)}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
      </section>

      <section class="section" id="sec-explore">
        <div class="card" style="background:var(--bg-2);border:0;padding:1.6rem">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
            <div><h3 style="font-size:1.25rem">Browse ${S.careers.length} careers</h3><p class="sub">After Class 10, after Class 12 and after graduation.</p></div>
            <a class="btn btn-outline btn-sm" href="#/explore">Explore all careers</a>
          </div>
          <div class="tag-row">${pills}</div>
        </div>
      </section>

      <section class="section" id="sec-about">
        <div class="about-band">
          <div>
            <h2>Built for students who can’t afford trial and error</h2>
            <p class="sub" style="margin-top:.7rem;max-width:34rem">Many students are the first in their family to go to college. Margdarshak gives honest competition levels, real fee ranges and a safe Plan B for every high-risk exam, so a wrong turn costs less.</p>
          </div>
          <ul>
            <li>${ico('check', 18)}<span>Transparent scoring: eligibility 30%, interests 25%, budget 15%, time 10%, past activities 10%, values 10%.</span></li>
            <li>${ico('check', 18)}<span>Every “Extreme” competition career is paired with a practical fallback.</span></li>
            <li>${ico('check', 18)}<span>Your data stays in your own database and you can delete it any time.</span></li>
          </ul>
        </div>
      </section>

      <section class="section" id="sec-contact">
        <div class="grid-2" style="align-items:start">
          <div class="section-head"><h2>Questions or feedback?</h2><p>Tell us what is missing or wrong, especially if a fee, date or exam detail is out of date. Messages are saved to this app’s database.</p></div>
          <form class="card" data-form="contact" novalidate>
            <div class="form-error" id="contact-err"></div>
            <label class="label" for="c-name">Name</label><input class="input" id="c-name" autocomplete="name" style="margin-bottom:.8rem">
            <label class="label" for="c-email">Email</label><input class="input" id="c-email" type="email" autocomplete="email" style="margin-bottom:.8rem">
            <label class="label" for="c-msg">Message</label><textarea class="textarea" id="c-msg" required style="margin-bottom:1rem"></textarea>
            <button class="btn btn-primary" type="submit">Send message</button>
          </form>
        </div>
      </section>
      <footer class="pub-footer">
        <p><b>Margdarshak (मार्गदर्शक)</b> · Non-profit career navigation concept</p>
        <p style="margin-top:.4rem">Source: <i>Complete Career Guide: After Class 10, Class 12 &amp; After Graduation (India)</i>. Verified portals: <a href="https://ssc.gov.in" target="_blank" rel="noopener">ssc.gov.in</a> · <a href="https://upsc.gov.in" target="_blank" rel="noopener">upsc.gov.in</a> · <a href="https://ibps.in" target="_blank" rel="noopener">ibps.in</a> · <a href="https://nta.ac.in" target="_blank" rel="noopener">nta.ac.in</a></p>
      </footer>`;
    }
  });
  ['features', 'about', 'contact'].forEach((n) => MG.register(n, MG.routes.home));

  MG.act.openCareer = (el) => MG.openCareerModal(el.dataset.id);
  MG.forms.contact = async (f) => {
    const err = MG.$('#contact-err', f); err.classList.remove('show');
    try {
      await MG.api('/api/contact', { method: 'POST', body: { name: MG.$('#c-name', f).value, email: MG.$('#c-email', f).value, message: MG.$('#c-msg', f).value } });
      f.reset(); MG.toast('Thanks! Your message was saved.');
    } catch (e) { err.textContent = e.message; err.classList.add('show'); }
  };

  /* ---------- EXPLORE ---------- */
  const exploreState = { part: 'all', q: '' };
  MG.register('explore', {
    layout: 'public',
    html: () => {
      const parts = ['all', 'After Class 10', 'After Class 12', 'After Graduation'];
      const count = (p) => (p === 'all' ? S.careers.length : S.careers.filter((c) => c.part === p).length);
      return `<section class="section" style="padding-top:2rem">
        <div class="page-head"><div><h2>Explore all careers</h2><p>The exact eight dataset fields for every path: exam, eligibility, syllabus, competition, fees, duration, outcomes and salary.</p></div>
        <input class="input" id="ex-q" style="width:260px" placeholder="Search exam, role, salary…" aria-label="Search careers" value="${esc(exploreState.q)}"></div>
        <div class="tabs" id="ex-tabs">${parts.map((p) => `<button class="tab ${exploreState.part === p ? 'active' : ''}" data-act="exTab" data-part="${p}">${p === 'all' ? 'All' : p} (${count(p)})</button>`).join('')}</div>
        <div id="ex-list"></div></section>`;
    },
    mount: () => { exploreList(); MG.$('#ex-q').addEventListener('input', (e) => { exploreState.q = e.target.value; exploreList(); }); }
  });
  function exploreList() {
    const q = exploreState.q.toLowerCase().trim();
    const list = S.careers.filter((c) => (exploreState.part === 'all' || c.part === exploreState.part) &&
      (!q || [c.name, c.hindiTitle, c.exam, c.outcomes, c.salary].some((x) => String(x || '').toLowerCase().includes(q))));
    MG.$('#ex-list').innerHTML = list.length ? list.map((c) => `<div class="card"><div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap">
        <div><div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.4rem"><span class="chip ${c.isGovt ? 'green' : 'red'}">${c.isGovt ? 'Government' : 'Private / Skill'}</span><span class="chip">${esc(c.part)}</span><span class="chip amber">${esc(c.competition)}</span></div>
        <h3>${esc(c.name)} <span class="hi muted" style="font-size:.88rem">${esc(c.hindiTitle || '')}</span></h3></div>
        <button class="btn btn-outline btn-sm" data-act="openCareer" data-id="${esc(c.id)}">View details</button></div>
        <p class="sub" style="margin-top:.4rem"><b>Exam:</b> ${esc(c.exam)}</p><p class="sub"><b>Starting pay:</b> ${esc(c.salary)}</p></div>`).join('')
      : '<div class="card empty"><h3>No careers match</h3><p>Try a different word, or switch tabs.</p></div>';
  }
  MG.act.exTab = (el) => { exploreState.part = el.dataset.part; MG.render(); };

  /* ---------- LOGIN / SIGN UP ---------- */
  const authPage = (mode) => ({
    layout: 'auth',
    html: () => {
      const su = mode === 'signup';
      return `<div class="auth-wrap">
        <div class="auth-top"><a class="brand" href="#/home">${MG.logo()}<span>Margdarshak</span></a>
          <div style="display:flex;gap:.6rem;align-items:center"><select class="select-pill" data-chg="lang" aria-label="Language"><option value="en" ${S.lang === 'en' ? 'selected' : ''}>English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>हिन्दी</option></select>
          <button class="icon-btn" data-act="theme" aria-label="Toggle dark mode">${ico(document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon', 18)}</button></div></div>
        <div class="auth-main">
          <form class="auth-card" data-form="auth" data-mode="${mode}" novalidate>
            <h1>${t(su ? 'auth.createTitle' : 'auth.loginTitle')}</h1>
            <p class="sub">${t(su ? 'auth.createSub' : 'auth.loginSub')}</p>
            <div class="form-error" id="auth-err" role="alert"></div>
            ${su ? `<div class="field">${ico('user', 18, 'class="lead"')}<input class="input" id="a-name" placeholder="${t('auth.name')}" autocomplete="name" aria-label="${t('auth.name')}"></div>` : ''}
            <div class="field">${ico('mail', 18, 'class="lead"')}<input class="input" id="a-email" type="email" placeholder="${t('auth.email')}" autocomplete="email" aria-label="${t('auth.email')}"></div>
            <div class="field">${ico('lock', 18, 'class="lead"')}<input class="input" id="a-pass" type="password" placeholder="${t('auth.password')}" autocomplete="${su ? 'new-password' : 'current-password'}" aria-label="${t('auth.password')}"><button type="button" class="eye" data-act="eye" data-target="a-pass" aria-label="Show password">${ico('eye', 18)}</button></div>
            ${su ? `<div class="field">${ico('lock', 18, 'class="lead"')}<input class="input" id="a-pass2" type="password" placeholder="${t('auth.confirm')}" autocomplete="new-password" aria-label="${t('auth.confirm')}"><button type="button" class="eye" data-act="eye" data-target="a-pass2" aria-label="Show password">${ico('eye', 18)}</button></div>` : ''}
            <button class="btn btn-primary btn-block" type="submit" id="a-submit">${t(su ? 'btn.signup' : 'btn.login')}</button>
            <div class="or">${t('auth.or')}</div>
            <button class="btn btn-google btn-block" type="button" data-act="google"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 019.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.2A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2 1.4-4.7 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/></svg>${t('auth.google')}</button>
            <button class="btn btn-ghost btn-block" type="button" data-act="guest" style="margin-top:.6rem">${t('btn.guest')}</button>
            <p class="auth-foot">${su ? `${t('auth.have')} <a href="#/login">${t('btn.login')}</a>` : `${t('auth.noacc')} <a href="#/signup">${t('btn.signup')}</a>`}</p>
          </form>
          <aside class="auth-side">${MG.studentArt()}<blockquote>${esc(t('auth.quote'))}</blockquote><cite>– Margdarshak</cite></aside>
        </div></div>`;
    },
    mount: () => { const n = MG.$('#a-name') || MG.$('#a-email'); if (n) n.focus(); }
  });
  MG.register('login', authPage('login'));
  MG.register('signup', authPage('signup'));

  MG.act.eye = (el) => {
    const inp = document.getElementById(el.dataset.target);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    el.innerHTML = ico(show ? 'eyeoff' : 'eye', 18);
    el.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  };
  MG.act.google = () => {
    const e = MG.$('#auth-err');
    e.textContent = 'Google sign-in is not set up yet. It needs a Google OAuth client ID (see README). Please use email or continue as guest for now.';
    e.classList.add('show');
  };
  MG.forms.auth = async (f) => {
    const mode = f.dataset.mode; const err = MG.$('#auth-err'); const btn = MG.$('#a-submit');
    const fail = (m) => { err.textContent = m; err.classList.add('show'); };
    err.classList.remove('show');
    const email = MG.$('#a-email').value.trim(); const pass = MG.$('#a-pass').value;
    const name = mode === 'signup' ? MG.$('#a-name').value.trim() : '';
    if (mode === 'signup' && !name) return fail('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Enter a valid email address.');
    if (!pass) return fail('Enter your password.');
    if (mode === 'signup') {
      if (pass.length < 6) return fail('Use at least 6 characters for the password.');
      if (pass !== MG.$('#a-pass2').value) return fail('The two passwords do not match.');
    }
    btn.disabled = true;
    try {
      const d = await MG.api(mode === 'signup' ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body: mode === 'signup' ? { name, email, password: pass } : { email, password: pass } });
      MG.setUser(d.user); S.matches = null;
      await MG.loadUserData();
      MG.toast(mode === 'signup' ? 'Account created. Let’s find your path.' : 'Welcome back, ' + MG.firstName(d.user.name) + '!');
      MG.go(S.profile && S.profile.stage ? '/app/dashboard' : '/app/assessment');
    } catch (e) { fail(e.message); btn.disabled = false; }
  };
})();
