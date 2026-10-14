/* Margdarshak – student app pages */
(function () {
  const S = MG.state, esc = MG.esc, ico = MG.ico, inr = MG.inr;
  const PLAN_TASKS = 12;
  MG.PLAN_TASKS = PLAN_TASKS;

  /* ---------- save / plan actions ---------- */
  MG.saveBtnHTML = (id, cls = 'btn btn-ghost btn-sm') => {
    const on = S.saved.includes(id);
    return `<button class="${cls} save-btn ${on ? 'saved' : ''}" data-act="saveCareer" data-id="${esc(id)}" aria-pressed="${on}">${ico('heart', 16)} ${on ? 'Saved' : 'Save'}</button>`;
  };
  MG.act.saveCareer = async (el) => {
    if (!S.user) { MG.go('/login'); return; }
    const id = el.dataset.id; const on = S.saved.includes(id);
    try {
      if (on) { await MG.api(`/api/saved/${S.user.id}/${id}`, { method: 'DELETE' }); S.saved = S.saved.filter((x) => x !== id); }
      else { await MG.api('/api/saved', { method: 'POST', body: { userId: S.user.id, careerId: id } }); S.saved.unshift(id); }
      MG.$$('[data-act="saveCareer"]').filter((b) => b.dataset.id === id).forEach((b) => {
        b.classList.toggle('saved', !on); b.setAttribute('aria-pressed', String(!on));
        b.innerHTML = `${ico('heart', 16)} ${!on ? 'Saved' : 'Save'}`;
      });
      MG.toast(on ? 'Removed from saved' : 'Saved to your profile');
    } catch (e) { MG.toast('Could not update saved careers.'); }
  };
  MG.setPlan = async (id) => {
    if (!S.user) { MG.go('/login'); return; }
    if (S.activeCareerId && S.activeCareerId !== id && S.roadmapProgress.length && !confirm('Switching plans resets your current 90-day progress. Continue?')) return;
    if (S.activeCareerId !== id) S.roadmapProgress = [];
    S.activeCareerId = id;
    try { await MG.api('/api/profile/progress', { method: 'POST', body: { userId: S.user.id, careerId: id, progressDays: S.roadmapProgress } }); } catch (e) { MG.toast('Could not save the plan.'); return; }
    MG.closeModal(); MG.toast('Set as your 90-day plan'); MG.go('/app/roadmap');
  };
  MG.act.setPlan = (el) => MG.setPlan(el.dataset.id);
  MG.act.go = (el) => MG.go(el.dataset.to);

  const emptyState = (title, text, btn, to) => `<div class="card empty"><h3>${title}</h3><p>${text}</p><a class="btn btn-primary" href="#${to}">${btn}</a></div>`;
  const head = (h, p, right = '') => `<div class="page-head"><div><h2>${h}</h2>${p ? `<p>${p}</p>` : ''}</div>${right}</div>`;

  /* ============================================================
     ASSESSMENT (5-step wizard)
     ============================================================ */
  const EDU = ['10th Pass', '12th Pass', 'Diploma', 'Graduate'];
  const STREAMS = ['Science', 'Commerce', 'Arts', 'Other'];
  const INTERESTS = ['Technology', 'Medicine', 'Business', 'Design', 'Arts', 'Sports', 'Research', 'Others'];
  const INTEREST_WORDS = {
    Technology: 'technology, coding, computer, programming, software, it',
    Medicine: 'medicine, doctor, medical, biology, health, nursing, patient care',
    Business: 'business, commerce, accounting, finance, management, marketing',
    Design: 'design, creative, drawing, art, media',
    Arts: 'arts, humanities, writing, history, teaching, law',
    Sports: 'sports, fitness, police, defence, physical, ncc',
    Research: 'research, science, maths, physics, analysis',
    Others: ''
  };
  const TAGS = ['Web design', 'Tally & Accounts', 'Coding Python', 'SSC / Sarkari Mock', 'NCC / Police Physical', 'Content Writing'];
  const STEP_TITLES = ['About you', 'Marks & subjects', 'Budget & time', 'Your journey so far', 'Quick questions'];

  const wizKey = () => 'mg_wiz_' + (S.user ? S.user.id : 'anon');
  let wiz = null;

  const profileToWizard = () => {
    const p = S.profile || {}; let a = {};
    try { a = JSON.parse(p.assessment_answers || '{}'); } catch (e) { a = {}; }
    const answers = {}; Object.keys(a).forEach((k) => { if (/^q\d/.test(k)) answers[k] = a[k]; });
    return {
      step: 1,
      edu: a._edu || (p.stage === 'Class 10' ? '10th Pass' : p.stage === 'College Graduate' ? 'Graduate' : p.stage ? '12th Pass' : ''),
      stream: a._stream || '', sci: a._sci || (/PCB/.test(p.stream || '') ? 'PCB' : /PCM/.test(p.stream || '') ? 'PCM' : ''),
      interests: a._interests || [], percentage: p.percentage || '', liked: a._likedText != null ? a._likedText : '', disliked: p.disliked_subjects || '',
      hours: p.weekly_hours || 18, budget: p.budget_level || 'Zero to Minimal', workPref: p.work_preference || 'both', relocate: p.relocation_pref || 'Anywhere',
      activities: p.activities_text || '', worry: p.main_worry || '', answers
    };
  };
  const loadWiz = () => {
    if (wiz) return wiz;
    try { const d = localStorage.getItem(wizKey()); if (d) { wiz = JSON.parse(d); return wiz; } } catch (e) { /* ignore */ }
    wiz = profileToWizard(); return wiz;
  };
  const saveWiz = () => { try { localStorage.setItem(wizKey(), JSON.stringify(wiz)); } catch (e) { /* ignore */ } };
  const radio = (name, val, label, cur, cls = '') => `<label class="opt ${cls}"><input type="radio" name="${name}" value="${esc(val)}" ${cur === val ? 'checked' : ''} data-chg="wiz"><span>${label}</span></label>`;

  const stepHTML = (n, w) => {
    if (n === 1) {
      const full = w.interests.length >= 5;
      return `
        <div class="q-block"><span class="label">1. Education level</span><div class="opt-grid">${EDU.map((e) => radio('edu', e, e, w.edu)).join('')}</div></div>
        ${w.edu === '10th Pass'
          ? '<div class="q-block"><span class="label">2. Stream</span><p class="sub">Streams are chosen after Class 10, so we will show paths for every stream.</p></div>'
          : `<div class="q-block"><span class="label">2. Stream</span><div class="opt-grid">${STREAMS.map((e) => radio('stream', e, e, w.stream)).join('')}</div>
             ${w.stream === 'Science' ? `<div style="margin-top:.8rem"><span class="label">Which science subjects?</span><div class="opt-grid" style="grid-template-columns:repeat(2,1fr);max-width:420px">${radio('sci', 'PCM', 'PCM (Maths)', w.sci)}${radio('sci', 'PCB', 'PCB (Biology)', w.sci)}</div></div>` : ''}</div>`}
        <div class="q-block"><span class="label">3. What are your interests? <span class="muted" style="font-weight:500">(select up to 5)</span></span>
          <div class="opt-grid">${INTERESTS.map((i) => `<label class="opt check"><input type="checkbox" name="interest" value="${i}" data-chg="wizInterest" ${w.interests.includes(i) ? 'checked' : ''} ${full && !w.interests.includes(i) ? 'disabled' : ''}><span>${i}</span></label>`).join('')}</div>
          <p class="hint" id="int-hint">${w.interests.length}/5 selected</p></div>`;
    }
    if (n === 2) return `
      <div class="two-col"><div><label class="label" for="w-pct">Marks / percentage (%)</label><input class="input" id="w-pct" name="percentage" type="number" min="30" max="100" placeholder="e.g. 72" value="${esc(w.percentage)}"><p class="hint">Approximate is fine.</p></div>
      <div><label class="label" for="w-liked">Subjects you liked</label><input class="input" id="w-liked" name="liked" placeholder="e.g. Maths, Computer, English" value="${esc(w.liked)}"></div></div>
      <div style="margin-top:1rem"><label class="label" for="w-dis">Subjects you disliked or found stressful</label><input class="input" id="w-dis" name="disliked" placeholder="e.g. Chemistry" value="${esc(w.disliked)}"></div>`;
    if (n === 3) return `
      <div class="two-col">
        <div><label class="label" for="w-h">Study hours per week</label><select class="select" id="w-h" name="hours"><option value="10" ${+w.hours === 10 ? 'selected' : ''}>8 – 12 hours (part-time)</option><option value="18" ${+w.hours === 18 ? 'selected' : ''}>15 – 20 hours (standard)</option><option value="30" ${+w.hours === 30 ? 'selected' : ''}>25+ hours (full-time)</option></select></div>
        <div><label class="label" for="w-b">Family budget for course & college</label><select class="select" id="w-b" name="budget"><option value="Zero to Minimal" ${w.budget === 'Zero to Minimal' ? 'selected' : ''}>Zero to minimal (under ₹20k / govt only)</option><option value="Low to Moderate" ${w.budget === 'Low to Moderate' ? 'selected' : ''}>Low to moderate (₹20k – ₹1.5 lakh)</option><option value="Moderate to High" ${w.budget === 'Moderate to High' ? 'selected' : ''}>Moderate to high (over ₹2 lakh / loan ok)</option></select></div>
        <div><label class="label" for="w-wp">Work sector preference</label><select class="select" id="w-wp" name="workPref"><option value="both" ${w.workPref === 'both' ? 'selected' : ''}>Open to government and private</option><option value="govt" ${w.workPref === 'govt' ? 'selected' : ''}>Prefer government job stability</option><option value="private" ${w.workPref === 'private' ? 'selected' : ''}>Prefer private-industry growth</option></select></div>
        <div><label class="label" for="w-r">Willingness to relocate</label><select class="select" id="w-r" name="relocate"><option value="Anywhere" ${w.relocate === 'Anywhere' ? 'selected' : ''}>Anywhere in India</option><option value="State" ${w.relocate === 'State' ? 'selected' : ''}>Within my home state</option><option value="Home" ${w.relocate === 'Home' ? 'selected' : ''}>Near home district</option></select></div>
      </div>`;
    if (n === 4) return `
      <label class="label" for="w-act">What have you done so far?</label><p class="hint" style="margin:-.2rem 0 .4rem">Projects, courses, hobbies, part-time work, exams tried. Hinglish is fine.</p>
      <textarea class="textarea" id="w-act" name="activities" rows="4" placeholder="e.g. Built a simple website in HTML, helped at a shop with billing in Excel, practise running for police physical.">${esc(w.activities)}</textarea>
      <div class="tag-row">${TAGS.map((t) => `<button type="button" class="tag" data-act="wizTag" data-tag="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>
      <div style="margin-top:1.2rem"><label class="label" for="w-worry">Family situation and your biggest worry (optional)</label>
      <textarea class="textarea" id="w-worry" name="worry" rows="3" placeholder="e.g. First in my family to go to college; worried about losing years in exam attempts.">${esc(w.worry)}</textarea></div>`;
    const qs = S.assessment.quickQuestions || [];
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap"><p class="sub">Six quick questions. No right or wrong answers.</p><button type="button" class="link-btn" data-act="wizSample">Fill sample answers</button></div>` +
      qs.map((q, i) => `<div class="q-block"><span class="label"><span style="color:var(--brand)">Q${i + 1}.</span> ${esc(q.text)}<span class="hi muted" style="display:block;font-weight:500;font-size:.82rem">${esc(q.hindi || '')}</span></span>
        <div class="radio-list">${q.options.map((o) => radio(q.id, o.id, esc(o.label), w.answers[q.id], '')).join('')}</div></div>`).join('');
  };

  const collect = () => {
    const form = MG.$('#wiz-form'); if (!form) return;
    const w = loadWiz();
    MG.$$('[name]', form).forEach((el) => {
      if (el.type === 'radio') { if (el.checked) { if (/^q\d/.test(el.name)) w.answers[el.name] = el.value; else w[el.name] = el.value; } }
      else if (el.type === 'checkbox') { /* interests handled live */ }
      else w[el.name] = el.value;
    });
    saveWiz();
  };

  MG.register('assessment', {
    layout: 'app',
    html: () => {
      const w = loadWiz(); const n = w.step;
      return `${head('Student Assessment', 'Tell us about yourself to get personalised career recommendations.', `<span class="chip">Step ${n} of 5 · ${STEP_TITLES[n - 1]}</span>`)}
      <div class="card wizard">
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${n}"><i style="width:${(n / 5) * 100}%"></i></div>
        <div class="form-error" id="wiz-err" role="alert" style="margin-top:1rem"></div>
        <form id="wiz-form" data-form="wiz" novalidate style="margin-top:.6rem">${stepHTML(n, w)}
          <div class="wizard-actions">
            <span>${n === 1 ? '<button type="button" class="link-btn" data-act="wizSkip">Skip for now</button>' : '<button type="button" class="btn btn-ghost" data-act="wizBack">Back</button>'}</span>
            <button class="btn btn-primary" type="submit" id="wiz-next">${n === 5 ? 'Get my career matches' : 'Next →'}</button>
          </div></form></div>`;
    }
  });

  MG.chg.wiz = (el) => {
    const w = loadWiz();
    if (el.type === 'radio' && !/^q\d/.test(el.name)) {
      w[el.name] = el.value; saveWiz();
      if (el.name === 'edu' || el.name === 'stream') { collect(); MG.render(); }
    } else if (el.type === 'radio') { w.answers[el.name] = el.value; saveWiz(); }
  };
  MG.chg.wizInterest = (el) => {
    const w = loadWiz();
    w.interests = MG.$$('input[name="interest"]:checked').map((i) => i.value); saveWiz();
    const full = w.interests.length >= 5;
    MG.$$('input[name="interest"]').forEach((i) => { i.disabled = full && !i.checked; });
    MG.$('#int-hint').textContent = `${w.interests.length}/5 selected`;
  };
  MG.act.wizTag = (el) => {
    const a = MG.$('#w-act'); const t = el.dataset.tag;
    if (!a.value.includes(t)) a.value = a.value ? a.value.replace(/[,\s]+$/, '') + ', ' + t : t;
  };
  MG.act.wizSample = () => {
    const w = loadWiz(); const sample = { q1_work_nature: 'tech_code', q2_risk_timeline: 'fast_earning', q3_environment: 'office_desk', q4_maths_logic: 'love_maths', q5_govt_vs_private: 'open_to_both', q6_family_relocation: 'pan_india' };
    Object.assign(w.answers, sample); saveWiz(); MG.render();
  };
  MG.act.wizBack = () => { collect(); const w = loadWiz(); w.step = Math.max(1, w.step - 1); saveWiz(); MG.render(); window.scrollTo(0, 0); };
  MG.act.wizSkip = () => { MG.toast('You can finish the assessment any time from the sidebar.'); MG.go('/app/dashboard'); };

  MG.forms.wiz = async () => {
    collect(); const w = loadWiz(); const err = MG.$('#wiz-err'); err.classList.remove('show');
    const fail = (m) => { err.textContent = m; err.classList.add('show'); err.scrollIntoView({ block: 'nearest' }); };
    if (w.step === 1) {
      if (!w.edu) return fail('Choose your education level.');
      if (w.edu !== '10th Pass' && !w.stream) return fail('Choose your stream.');
      if (w.edu !== '10th Pass' && w.stream === 'Science' && !w.sci) return fail('Choose PCM or PCB.');
    }
    if (w.step === 2 && w.percentage !== '' && (+w.percentage < 30 || +w.percentage > 100)) return fail('Enter marks between 30 and 100.');
    if (w.step === 5) {
      const missing = (S.assessment.quickQuestions || []).filter((q) => !w.answers[q.id]).length;
      if (missing) return fail(`Please answer all questions (${missing} left), or use “Fill sample answers”.`);
      return submitAssessment(w);
    }
    w.step += 1; saveWiz(); MG.render(); window.scrollTo(0, 0);
  };

  async function submitAssessment(w) {
    const btn = MG.$('#wiz-next'); btn.disabled = true; btn.textContent = 'Calculating…';
    const stage = w.edu === '10th Pass' ? 'Class 10' : w.edu === 'Graduate' ? 'College Graduate' : 'Class 12';
    const stream = w.edu === '10th Pass' ? 'Class 10 (no stream yet)' : w.stream === 'Science' ? `Science (${w.sci})` : w.stream === 'Arts' ? 'Arts / Humanities' : w.stream === 'Other' ? 'General Degree (BA/B.Com/B.Sc)' : w.stream;
    const q1 = (S.assessment.quickQuestions || []).find((q) => q.id === 'q1_work_nature');
    const q1opt = q1 && q1.options.find((o) => o.id === w.answers.q1_work_nature);
    const expanded = w.interests.map((i) => INTEREST_WORDS[i]).filter(Boolean);
    const liked = [w.liked, ...w.interests, ...expanded, ...((q1opt && q1opt.tags) || [])].filter(Boolean).join(', ');
    const profileData = {
      stage, stream, percentage: parseFloat(w.percentage) || 60, liked_subjects: liked, disliked_subjects: w.disliked, activities_text: w.activities,
      weekly_hours: parseInt(w.hours, 10), budget_level: w.budget, work_preference: w.workPref, relocation_pref: w.relocate, main_worry: w.worry
    };
    const answers = { ...w.answers, _edu: w.edu, _stream: w.stream, _sci: w.sci, _interests: w.interests, _likedText: w.liked };
    try {
      const d = await MG.api('/api/profile/save-and-match', { method: 'POST', body: { userId: S.user.id, profileData, assessmentAnswers: answers } });
      S.matches = d; await MG.loadUserData();
      try { localStorage.removeItem(wizKey()); } catch (e) { /* ignore */ }
      wiz = null; MG.toast(`Done! ${d.eligibleCount} eligible careers found.`); MG.go('/app/recommendations');
    } catch (e) { btn.disabled = false; btn.textContent = 'Get my career matches'; MG.$('#wiz-err').textContent = e.message || 'Could not calculate matches.'; MG.$('#wiz-err').classList.add('show'); }
  }

  /* ============================================================
     RECOMMENDATIONS
     ============================================================ */
  const recUI = { filter: 'All', limit: 8 };
  const FILTERS = ['All', 'Government', 'Private', 'Higher Studies', 'Entrepreneurship'];

  MG.register('recommendations', {
    layout: 'app',
    html: async () => {
      const m = await MG.ensureMatches();
      if (!m) return head('Your Career Recommendations', '') + emptyState('No recommendations yet', 'Complete the short assessment and we will score every career in the dataset for you.', 'Start assessment', '/app/assessment');
      const all = m.allMatches || m.topMatches;
      const list = all.filter((x) => recUI.filter === 'All' || MG.groups(x.career).includes(recUI.filter));
      const shown = list.slice(0, recUI.limit);
      const card = (x) => { const c = x.career; return `<article class="card rec">
          ${MG.mono(c)}
          <div><h3>${esc(c.name)}</h3><span class="match">${x.score}% Match</span>
            <div class="meta"><span class="chip ${c.isGovt ? 'green' : 'red'}">${c.isGovt ? 'Government' : 'Private / Skill'}</span><span><b>${esc(MG.shortSalary(c))}</b></span><span>· ${esc(c.competition)} competition</span></div>
            <p class="desc">${esc(c.outcomes.length > 120 ? c.outcomes.slice(0, 118).replace(/\s+\S*$/, '') + '…' : c.outcomes)}</p></div>
          <div class="acts"><a class="btn btn-primary btn-sm" href="#/app/career/${esc(c.id)}">View Details</a>${MG.saveBtnHTML(c.id, 'btn btn-ghost btn-sm')}</div></article>`; };
      const b = m.backupOption; const em = m.emergingOption && (m.emergingOption.career || m.emergingOption);
      return `${MG.caveat()}${head('Your Career Recommendations', `Based on your profile, here are the best options for you. We checked ${m.totalEvaluated} careers and ${m.eligibleCount} are open to you.`,
        `<div class="no-print" style="display:flex;gap:.5rem"><button class="btn btn-ghost btn-sm" onclick="window.print()">Print / Save PDF</button><button class="btn btn-ghost btn-sm" data-act="shareWA">Share on WhatsApp</button></div>`)}
      <div class="tabs" role="tablist">${FILTERS.map((f) => `<button class="tab ${recUI.filter === f ? 'active' : ''}" role="tab" data-act="recFilter" data-f="${f}">${f}</button>`).join('')}</div>
      ${shown.length ? shown.map(card).join('') : '<div class="card empty"><h3>No matches in this group</h3><p>Try another filter. Some groups only appear when your profile fits them.</p></div>'}
      ${list.length > shown.length ? `<div style="text-align:center"><button class="btn btn-outline" data-act="recMore">Show ${Math.min(8, list.length - shown.length)} more</button></div>` : ''}
      <p class="small muted" style="margin:1rem 0">Score = eligibility 30% + interests 25% + budget 15% + time 10% + past activities 10% + values 10%.</p>
      ${b && b.career ? `<div class="card" style="border-style:dashed"><span class="chip blue">Safe backup track</span><h3 style="margin-top:.5rem">${esc(b.career.name)}</h3><p class="sub">A lower-risk fallback: ${esc(b.career.outcomes)}</p><a class="btn btn-outline btn-sm" style="margin-top:.7rem" href="#/app/career/${esc(b.career.id)}">Explore backup</a></div>` : ''}
      ${em ? `<div class="card" style="border-style:dashed"><span class="chip green">Emerging field</span><h3 style="margin-top:.5rem">${esc(em.name)}</h3><p class="sub">${esc(em.outcomes)} (${esc(MG.shortSalary(em))})</p><a class="btn btn-outline btn-sm" style="margin-top:.7rem" href="#/app/career/${esc(em.id)}">Explore</a></div>` : ''}`;
    }
  });
  MG.act.recFilter = (el) => { recUI.filter = el.dataset.f; recUI.limit = 8; MG.render(); };
  MG.act.recMore = () => { recUI.limit += 8; MG.render(); };
  MG.act.shareWA = () => {
    const top = S.matches && S.matches.topMatches[0]; if (!top) return;
    const c = top.career;
    const text = encodeURIComponent(`Namaste! My top career match on Margdarshak (मार्गदर्शक): ${c.name} (${c.hindiTitle || ''})\nCompetition: ${c.competition}\nStarting pay: ${MG.shortSalary(c)}\nAlways verify details on the official site.`);
    window.open('https://api.whatsapp.com/send?text=' + text, '_blank', 'noopener');
  };

  /* ============================================================
     CAREER DETAIL
     ============================================================ */
  const detailUI = { tab: 'Overview' };
  const DETAIL_TABS = ['Overview', 'Eligibility', 'Skills', 'Job Opportunities', 'Future Scope'];
  let skillsCache = null;
  MG.loadSkills = async () => { if (!skillsCache) skillsCache = await MG.api('/api/skills'); return skillsCache; };
  MG.skillsFor = (c, sk) => {
    if (sk[c.id]) return sk[c.id];
    const kw = (c.keywords || []).filter((k) => k.length > 3).slice(0, 5).map((k) => k[0].toUpperCase() + k.slice(1));
    return { title: c.name, required: [...kw, ...sk._default.required.slice(0, 6 - kw.length)].slice(0, 6) };
  };

  MG.register('career', {
    layout: 'app',
    html: async (params) => {
      const id = params[0]; const c = MG.career(id);
      if (MG._detailId !== id) { detailUI.tab = 'Overview'; MG._detailId = id; }
      if (!c) return emptyState('Career not found', 'This career is not in the dataset.', 'Back to recommendations', '/app/recommendations');
      await MG.ensureMatches();
      const [det, sk] = await Promise.all([MG.api('/api/careers/' + encodeURIComponent(id)), MG.loadSkills()]);
      const m = S.matches && (S.matches.allMatches || S.matches.topMatches).find((x) => x.career.id === id);
      MG._detail = { c, m, roadmap: det.roadmap, skills: MG.skillsFor(c, sk) };
      return `<a class="btn btn-ghost btn-sm" href="#/app/recommendations" style="margin-bottom:.4rem">${ico('back', 16)} Back to Recommendations</a>
        <div class="detail-head">${MG.mono(c)}<div><h2>${esc(c.name)}</h2><p class="hi muted">${esc(c.hindiTitle || '')}</p></div>
          ${m ? `<span class="match">${m.score}% Match</span>` : ''}<span class="chip ${c.isGovt ? 'green' : 'red'}">${c.isGovt ? 'Government' : 'Private / Skill'}</span><span class="chip">${esc(MG.shortSalary(c))}</span>
          <span style="margin-left:auto">${MG.saveBtnHTML(c.id)}</span></div>
        <div class="detail-grid"><div><div class="tabs underline" role="tablist">${DETAIL_TABS.map((t) => `<button class="tab ${detailUI.tab === t ? 'active' : ''}" role="tab" data-act="detailTab" data-t="${t}">${t}</button>`).join('')}</div>
          <div id="detail-panel">${detailPanel(detailUI.tab)}</div></div>
        <aside>${nextStep()}</aside></div>`;
    }
  });
  MG.act.detailTab = (el) => {
    detailUI.tab = el.dataset.t;
    MG.$$('.tabs.underline .tab').forEach((b) => b.classList.toggle('active', b.dataset.t === detailUI.tab));
    MG.$('#detail-panel').innerHTML = detailPanel(detailUI.tab);
  };

  function detailPanel(tab) {
    const { c, m, roadmap, skills } = MG._detail; const href = MG.portalHref(c);
    if (tab === 'Overview') {
      const fit = m ? m.reasons.map((r) => `<li>${ico('check', 18)}<span>${esc(r)}</span></li>`).join('') : `<li>${ico('check', 18)}<span>Duration: ${esc(c.duration)}</span></li><li>${ico('check', 18)}<span>Fees: ${esc(c.fees)}</span></li>`;
      const caution = m && m.caution.length ? `<div class="notice" style="margin-top:1rem">${ico('info', 18)}<div><b>What may challenge you:</b> ${esc(m.caution.join('; '))}.</div></div>` : '';
      const planB = c.competition.includes('Extreme') && m && m.planBCompanion ? `<div class="notice" style="margin-top:1rem;background:var(--sky-tint);border-color:var(--sky);border-left-color:var(--sky);color:var(--ink)">${ico('shield', 18)}<div><b>Plan B:</b> ${esc(m.planBCompanion.name)} (${esc(m.planBCompanion.competition)} competition). <a href="#/app/career/${esc(m.planBCompanion.id)}">View</a></div></div>` : '';
      return `<p style="margin:1rem 0">${esc(c.outcomes)}</p><h3>Why it’s a good fit for you</h3><ul class="check-list" style="margin-top:.6rem">${fit}</ul>${caution}${planB}
        <dl class="facts" style="margin-top:1.2rem"><div><dt>Duration</dt><dd>${esc(c.duration)}</dd></div><div><dt>Fees</dt><dd>${esc(c.fees)}</dd></div><div><dt>Competition</dt><dd>${esc(c.competition)}</dd></div><div><dt>Starting salary</dt><dd>${esc(c.salary)}</dd></div></dl>`;
    }
    if (tab === 'Eligibility') return `<table class="kv" style="margin-top:.8rem"><tr><th>Minimum qualification</th><td>${esc(c.minQualification || '')}</td></tr><tr><th>Stream</th><td>${esc(c.streamRequired || '')}</td></tr><tr><th>Eligibility</th><td>${esc(c.eligibility)}</td></tr><tr><th>Entrance exam</th><td>${esc(c.exam)}</td></tr><tr><th>Syllabus</th><td>${esc(c.syllabus)}</td></tr>${c.physicalFitnessRequired ? '<tr><th>Physical standards</th><td>Physical fitness test required</td></tr>' : ''}</table>`;
    if (tab === 'Skills') return `<p class="sub" style="margin:1rem 0 .6rem">Skills that matter for <b>${esc(skills.title)}</b>:</p><ul class="check-list">${skills.required.map((s) => `<li>${ico('check', 18)}<span>${esc(s)}</span></li>`).join('')}</ul><a class="btn btn-outline btn-sm" style="margin-top:1rem" href="#/app/skills/${esc(c.id)}">Check my skill gap</a>`;
    if (tab === 'Job Opportunities') return `<table class="kv" style="margin-top:.8rem"><tr><th>Roles</th><td>${esc(c.outcomes)}</td></tr><tr><th>Starting pay</th><td>${esc(c.salary)}</td></tr><tr><th>Official portal</th><td>${href ? `<a href="${href}" target="_blank" rel="noopener">${esc(c.officialPortal)}</a>` : esc(c.officialPortal)}</td></tr></table>`;
    return `<table class="kv" style="margin-top:.8rem"><tr><th>Competition</th><td>${esc(c.competitionDetail || c.competition)}</td></tr><tr><th>Growth outlook</th><td>${c.isEmerging ? 'Flagged as an emerging, skill-driven field in the dataset, so demand is growing.' : 'A long-established path; progress depends on exam rank, experience and skills.'}</td></tr><tr><th>Backup option</th><td>${c.planBRecommendation && MG.career(c.planBRecommendation) ? `<a href="#/app/career/${esc(c.planBRecommendation)}">${esc(MG.career(c.planBRecommendation).name)}</a>` : 'Not required for this path'}</td></tr></table>`;
  }
  function nextStep() {
    const { c, roadmap } = MG._detail;
    const first = roadmap && roadmap.phase1.resources[0];
    const text = first ? `Start with “${esc(first.title)}” (${esc(first.platform)}).` : c.isGovt ? `Read the latest notification on the official portal, then begin previous-year papers.` : 'Check the eligibility and entrance exam, then follow the 90-day plan.';
    return `<div class="next-step"><span class="chip red">Next step</span><p style="margin:.7rem 0 1rem">${text}</p><button class="btn btn-primary btn-block" data-act="setPlan" data-id="${esc(c.id)}">View Learning Resources</button><button class="btn btn-ghost btn-block btn-sm" style="margin-top:.5rem" data-act="openCareer" data-id="${esc(c.id)}">All 8 dataset fields</button></div>`;
  }

  /* ============================================================
     COLLEGE FINDER
     ============================================================ */
  const colUI = { state: 'Bihar', course: 'B.Tech', tab: 'colleges' };
  const COURSE_CAREERS = { 'B.Tech': ['btech-engineering'], 'B.Tech (Lateral Entry)': ['polytechnic-diploma'], 'Diploma (Polytechnic)': ['polytechnic-diploma'], MBBS: ['mbbs-doctor'], 'BA / B.Com / B.Sc': ['ba-humanities', 'bcom-bba', 'bsc-pure-sciences'] };

  MG.register('colleges', {
    layout: 'app',
    html: async () => {
      const q = new URLSearchParams({ state: colUI.state, course: colUI.course });
      const d = await MG.api('/api/colleges?' + q.toString());
      const states = ['All', ...d.states];
      const rows = d.colleges.map((c) => `<tr><td><b>${esc(c.name)}</b><div class="small muted">${esc(c.city)}, ${esc(c.state)} · ${esc(c.type)}${c.note ? ' · ' + esc(c.note) : ''}</div></td><td>${esc(colUI.course)}</td><td>${esc(c.fees)}</td><td class="muted">Check official site</td><td><a class="btn btn-primary btn-sm" href="${esc(c.link)}" target="_blank" rel="noopener">Visit ${ico('external', 14)}</a></td></tr>`).join('');
      const exams = (COURSE_CAREERS[colUI.course] || []).map((id) => MG.career(id)).filter(Boolean);
      const examHTML = exams.map((c) => { const href = MG.portalHref(c); return `<div class="card"><h3>${esc(c.name)}</h3>
          <table class="kv"><tr><th>Entrance exam</th><td>${esc(c.exam)}</td></tr><tr><th>Eligibility</th><td>${esc(c.eligibility)}</td></tr><tr><th>Fees</th><td>${esc(c.fees)}</td></tr><tr><th>Official portal</th><td>${href ? `<a href="${href}" target="_blank" rel="noopener">${esc(c.officialPortal)}</a>` : esc(c.officialPortal)}</td></tr></table>
          ${colUI.course === 'B.Tech (Lateral Entry)' ? '<p class="small muted" style="margin-top:.5rem">Diploma holders can join B.Tech in the 2nd year through lateral-entry exams such as LEET or state counselling.</p>' : ''}</div>`; }).join('');
      return `${head('Government College Finder', 'Find government colleges, courses and entrance exams based on your preferences.')}
      <div class="card"><div class="filter-bar">
        <div><label class="label" for="f-state">State</label><select class="select" id="f-state" data-chg="colFilter">${states.map((s) => `<option ${s === colUI.state ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <div><label class="label" for="f-course">Course</label><select class="select" id="f-course" data-chg="colFilter">${d.courses.map((s) => `<option ${s === colUI.course ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <button class="btn btn-primary" data-act="colSearch">${ico('search', 18)} Search</button></div></div>
      <div class="tabs"><button class="tab ${colUI.tab === 'colleges' ? 'active' : ''}" data-act="colTab" data-t="colleges">Colleges</button><button class="tab ${colUI.tab === 'exams' ? 'active' : ''}" data-act="colTab" data-t="exams">Entrance Exams</button></div>
      ${colUI.tab === 'colleges'
        ? (d.colleges.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>College / University</th><th>Course</th><th>Fees (approx.)</th><th>Last date</th><th>Official link</th></tr></thead><tbody>${rows}</tbody></table></div>`
          : '<div class="card empty"><h3>No colleges listed for this combination</h3><p>Try “All” states or another course. This list is a starter set, not every college.</p></div>')
        : (examHTML || '<div class="card empty"><h3>No exam details for this course</h3></div>')}
      <div class="notice red" style="margin-top:1rem">${ico('info', 18)}<div>Information is for guidance only. Fees are approximate and dates change every year, so always check the official website for the latest updates.</div></div>`;
    }
  });
  MG.chg.colFilter = () => { colUI.state = MG.$('#f-state').value; colUI.course = MG.$('#f-course').value; MG.render(); };
  MG.act.colSearch = () => MG.chg.colFilter();
  MG.act.colTab = (el) => { colUI.tab = el.dataset.t; MG.render(); };

  /* ============================================================
     OPPORTUNITIES (government exams and jobs from the dataset)
     ============================================================ */
  const oppUI = { part: 'all', q: '' };
  MG.register('opportunities', {
    layout: 'app',
    html: () => {
      const parts = ['all', 'After Class 10', 'After Class 12', 'After Graduation'];
      return `${MG.caveat()}${head('Opportunities', 'Government exams and jobs from the dataset, with the official portal to apply on.', `<input class="input" id="op-q" style="width:240px" placeholder="Search exam or role…" aria-label="Search opportunities" value="${esc(oppUI.q)}">`)}
      <div class="tabs">${parts.map((p) => `<button class="tab ${oppUI.part === p ? 'active' : ''}" data-act="oppTab" data-p="${p}">${p === 'all' ? 'All' : p}</button>`).join('')}</div><div id="op-list"></div>`;
    },
    mount: () => { oppList(); MG.$('#op-q').addEventListener('input', (e) => { oppUI.q = e.target.value; oppList(); }); }
  });
  function oppList() {
    const q = oppUI.q.toLowerCase().trim();
    const list = S.careers.filter((c) => c.isGovt && (oppUI.part === 'all' || c.part === oppUI.part) && (!q || [c.name, c.exam, c.outcomes].some((x) => String(x).toLowerCase().includes(q))));
    MG.$('#op-list').innerHTML = list.length ? list.map((c) => { const href = MG.portalHref(c); return `<div class="card"><div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap"><div><div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.4rem"><span class="chip">${esc(c.part)}</span><span class="chip amber">${esc(c.competition)}</span></div><h3>${esc(c.name)}</h3></div>
      <div style="display:flex;gap:.5rem;align-items:flex-start;flex-wrap:wrap">${MG.saveBtnHTML(c.id)}<button class="btn btn-outline btn-sm" data-act="openCareer" data-id="${esc(c.id)}">Details</button>${href ? `<a class="btn btn-primary btn-sm" href="${href}" target="_blank" rel="noopener">Official site ${ico('external', 14)}</a>` : ''}</div></div>
      <p class="sub" style="margin-top:.4rem"><b>Eligibility:</b> ${esc(c.eligibility)}</p><p class="sub"><b>Starting pay:</b> ${esc(MG.shortSalary(c))}</p></div>`; }).join('') : '<div class="card empty"><h3>Nothing matches</h3></div>';
  }
  MG.act.oppTab = (el) => { oppUI.part = el.dataset.p; MG.render(); };

  /* ============================================================
     PROFILE
     ============================================================ */
  MG.register('profile', {
    layout: 'app',
    html: () => {
      const u = S.user; const p = S.profile || {}; const pct = MG.profileCompleteness();
      const saved = S.saved.map((id) => MG.career(id)).filter(Boolean);
      const f = (v) => (v ? esc(v) : '<span class="muted">Not set</span>');
      return `${head('Student Dashboard & Profile', '')}
      <div class="profile-layout"><div>
        <div class="card"><div class="profile-top"><span class="avatar lg">${esc(MG.initials(u.name))}</span><div style="flex:1"><h3 style="font-size:1.35rem">${esc(u.name)}</h3><p class="sub">${u.is_guest ? 'Guest demo account' : esc(u.email)}</p></div><button class="btn btn-outline btn-sm" data-act="editProfile">Edit Profile</button></div></div>
        <div class="card"><h3>Education & Preferences</h3><dl class="pref-grid" style="margin-top:.8rem">
          <div><dt>Education level</dt><dd>${f(p.stage)}</dd></div><div><dt>Stream</dt><dd>${f(p.stream)}</dd></div>
          <div><dt>Marks</dt><dd>${p.percentage ? esc(p.percentage) + '%' : f('')}</dd></div><div><dt>Budget</dt><dd>${f(p.budget_level)}</dd></div>
          <div><dt>Study hours / week</dt><dd>${p.weekly_hours ? esc(p.weekly_hours) : f('')}</dd></div><div><dt>Sector preference</dt><dd>${f(p.work_preference)}</dd></div>
          <div style="grid-column:1/-1"><dt>Interests & liked subjects</dt><dd>${f(profileInterests(p))}</dd></div></dl></div>
        <div class="card"><h3>Privacy & data</h3><p class="sub" style="margin:.4rem 0 .9rem">Your profile is stored in this app’s own SQLite database. Nothing is sold or shared. You can permanently delete everything below.</p><button class="btn btn-danger btn-sm" data-act="deleteAccount">Delete account & erase data</button></div>
      </div><div>
        <div class="card"><h3>My Progress</h3><div style="display:flex;gap:1rem;align-items:center;margin:.8rem 0"><div class="ring" style="--p:${pct}"><b>${pct}%</b></div><div><p style="font-weight:700">Profile complete</p><p class="sub small">${pct < 100 ? (u.is_guest ? 'Create an account and finish the assessment to reach 100%.' : 'Finish the assessment to fill the rest.') : 'Great, everything is filled in.'}</p></div></div>
          <a class="btn btn-primary btn-block btn-sm" href="#/app/assessment">${p.stage ? 'Update assessment' : 'Complete Profile'}</a></div>
        <div class="card"><h3>Saved Plans</h3>${saved.length ? saved.map((c) => `<div class="sch"><div class="grow"><b>${esc(c.name)}</b><div class="small muted">${esc(c.part)}</div></div><a class="btn btn-outline btn-sm" href="#/app/career/${esc(c.id)}">View</a></div>`).join('') : '<p class="sub">No saved careers yet. Tap “Save” on any recommendation.</p>'}</div>
        <div class="card"><h3>Quick Links</h3><a class="quick-link" href="#/app/recommendations">${ico('recs', 18)} Career matches</a><a class="quick-link" href="#/app/opportunities">${ico('briefcase', 18)} Saved opportunities</a><a class="quick-link" href="#/app/roadmap">${ico('roadmap', 18)} My roadmap</a></div>
      </div></div>`;
    }
  });
  function profileInterests(p) { try { const a = JSON.parse(p.assessment_answers || '{}'); if (a._interests && a._interests.length) return a._interests.join(', '); } catch (e) { /* ignore */ } return p.liked_subjects ? p.liked_subjects.split(',').slice(0, 3).join(', ') : ''; }

  MG.act.editProfile = () => {
    const p = S.profile || {}; const u = S.user;
    const sel = (id, opts, cur) => `<select class="select" id="${id}">${opts.map((o) => `<option value="${esc(o[0])}" ${String(cur) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
    MG.modal(`<h2 style="margin-bottom:1rem;padding-right:2.5rem">Edit profile</h2><form data-form="editProfile" novalidate><div class="form-error" id="ep-err"></div>
      <div class="two-col"><div><label class="label" for="ep-name">Full name</label><input class="input" id="ep-name" value="${esc(u.name)}"></div>
      <div><label class="label" for="ep-pct">Marks (%)</label><input class="input" id="ep-pct" type="number" min="0" max="100" value="${esc(p.percentage || '')}"></div>
      <div><label class="label" for="ep-stage">Education level</label>${sel('ep-stage', [['Class 10', '10th pass'], ['Class 12', '12th pass'], ['College Graduate', 'Graduate']], p.stage || 'Class 12')}</div>
      <div><label class="label" for="ep-stream">Stream</label>${sel('ep-stream', [['Science (PCM)', 'Science (PCM)'], ['Science (PCB)', 'Science (PCB)'], ['Commerce', 'Commerce'], ['Arts / Humanities', 'Arts'], ['General Degree (BA/B.Com/B.Sc)', 'Other']], p.stream || 'Science (PCM)')}</div>
      <div><label class="label" for="ep-bud">Budget</label>${sel('ep-bud', [['Zero to Minimal', 'Zero to minimal'], ['Low to Moderate', 'Low to moderate'], ['Moderate to High', 'Moderate to high']], p.budget_level || 'Zero to Minimal')}</div>
      <div><label class="label" for="ep-hrs">Study hours / week</label>${sel('ep-hrs', [['10', '8 – 12'], ['18', '15 – 20'], ['30', '25+']], p.weekly_hours || 18)}</div></div>
      <div style="margin:.9rem 0"><label class="label" for="ep-like">Interests / liked subjects</label><input class="input" id="ep-like" value="${esc(p.liked_subjects || '')}"></div>
      <p class="hint" style="margin-bottom:1rem">After saving, re-run the assessment or open Recommendations to refresh your matches.</p>
      <div style="display:flex;justify-content:flex-end;gap:.6rem"><button type="button" class="btn btn-ghost" data-act="closeModal">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div></form>`, 'sm');
  };
  MG.forms.editProfile = async () => {
    const name = MG.$('#ep-name').value.trim(); const err = MG.$('#ep-err');
    if (!name) { err.textContent = 'Name cannot be empty.'; err.classList.add('show'); return; }
    try {
      await MG.api('/api/profile/' + S.user.id, { method: 'PUT', body: { name, percentage: parseFloat(MG.$('#ep-pct').value) || null, stage: MG.$('#ep-stage').value, stream: MG.$('#ep-stream').value, budget_level: MG.$('#ep-bud').value, weekly_hours: +MG.$('#ep-hrs').value, liked_subjects: MG.$('#ep-like').value } });
      MG.setUser({ ...S.user, name }); S.matches = null; await MG.loadUserData(); MG.closeModal(); MG.toast('Profile updated'); MG.render();
    } catch (e) { err.textContent = e.message; err.classList.add('show'); }
  };
  MG.act.deleteAccount = async () => {
    if (!confirm('This permanently deletes your account, profile, saved careers and progress. Continue?')) return;
    try { await MG.api('/api/profile/' + S.user.id, { method: 'DELETE' }); S.user = null; try { localStorage.removeItem('margdarshak_user'); } catch (e) { /* ignore */ } MG.toast('Your account and data were deleted.'); MG.go('/home'); }
    catch (e) { MG.toast('Could not delete the account.'); }
  };

  /* ============================================================
     DASHBOARD
     ============================================================ */
  MG.register('dashboard', {
    layout: 'app',
    html: async () => {
      const u = S.user; const p = S.profile; const m = await MG.ensureMatches();
      const done = S.roadmapProgress.filter((x) => /^p[1-3]t[1-4]$/.test(x)).length; const planPct = Math.round((done / PLAN_TASKS) * 100);
      const active = S.activeCareerId && MG.career(S.activeCareerId);
      const advice = (S.assessment.counselorAdvice || {});
      const tips = (advice.talkingToParents || []).slice(0, 3);
      const top = m ? m.topMatches.slice(0, 3) : [];
      return `${MG.caveat()}${head(`Namaste, ${esc(MG.firstName(u.name))}`, p && p.stage ? 'Here is where your journey stands today.' : 'Start with the five-step assessment to unlock your matches.')}
      ${!m ? `<div class="card" style="display:flex;gap:1.2rem;align-items:center;flex-wrap:wrap;background:var(--brand-tint);border-color:transparent"><div style="flex:1;min-width:240px"><h3 style="font-size:1.25rem">Find your best-fit careers</h3><p class="sub" style="margin:.3rem 0 1rem">Five short steps. About three minutes. Skip anything you are not sure about.</p><a class="btn btn-primary" href="#/app/assessment">Start assessment</a></div><div style="width:220px;max-width:100%">${MG.studentArt()}</div></div>` : ''}
      <div class="grid-4" style="margin-bottom:1.1rem">
        <div class="card stat"><b>${MG.profileCompleteness()}%</b><span>Profile complete</span></div>
        <div class="card stat"><b>${m ? m.eligibleCount : '–'}</b><span>Careers open to you</span></div>
        <div class="card stat"><b>${S.saved.length}</b><span>Saved careers</span></div>
        <div class="card stat"><b>${planPct}%</b><span>90-day plan done</span></div></div>
      ${top.length ? `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem"><h3>Your top matches</h3><a href="#/app/recommendations" style="font-weight:700;font-size:.88rem;text-decoration:none">See all</a></div>
        ${top.map((x) => `<div class="sch">${MG.mono(x.career)}<div class="grow"><b>${esc(x.career.name)}</b><div class="small muted">${esc(MG.shortSalary(x.career))}</div></div><span class="match">${x.score}%</span><a class="btn btn-outline btn-sm" href="#/app/career/${esc(x.career.id)}">View</a></div>`).join('')}</div>` : ''}
      <div class="card"><h3>${active ? esc(active.name) : '90-day action plan'}</h3>${active ? `<div class="progress" style="margin:.7rem 0"><i style="width:${planPct}%"></i></div><p class="sub small">${done} of ${PLAN_TASKS} tasks done</p><a class="btn btn-primary btn-sm" style="margin-top:.8rem" href="#/app/roadmap">Continue plan</a>` : `<p class="sub" style="margin:.3rem 0 .8rem">Pick a career to get a three-stage, 90-day plan with free resources.</p><a class="btn btn-outline btn-sm" href="#/app/recommendations">Choose a career</a>`}</div>
      <div class="grid-3">${[['swap', 'What-if Simulator', 'Compare routes if money or marks are tight', '/app/whatif'], ['rupee', 'Budget Planner', 'Yearly cost and scholarships', '/app/budget'], ['chart', 'Skill Gap Analysis', 'See what to learn next', '/app/skills']].map(([i, h, d, to]) => `<a class="card tool-card" href="#${to}"><span class="fs-ico">${ico(i, 22)}</span><div><h3>${h}</h3><p class="sub small">${d}</p></div></a>`).join('')}</div>
      ${tips.length ? `<div class="card"><h3>Talking to your family</h3><p class="sub small" style="margin-bottom:.6rem">Respectful ways to discuss your plans with parents.</p>${tips.map((t) => `<details style="padding:.5rem 0;border-top:1px solid var(--line)"><summary style="cursor:pointer;font-weight:700">${esc(t.title)}</summary><p class="sub" style="margin-top:.4rem">${esc(t.advice)}</p></details>`).join('')}</div>` : ''}`;
    }
  });
})();
