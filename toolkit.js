/* Margdarshak – toolkit: What-if Simulator, Budget Planner, Skill Gap Analysis, 90-Day Action Plan */
(function () {
  const S = MG.state, esc = MG.esc, ico = MG.ico, inr = MG.inr;
  const head = (h, p, right = '') => `<div class="page-head"><div><h2>${h}</h2>${p ? `<p>${p}</p>` : ''}</div>${right}</div>`;
  const back = () => `<a class="btn btn-ghost btn-sm" href="#/app/toolkit" style="margin-bottom:.6rem">${ico('back', 16)} Toolkit</a>`;

  /* ---------------- hub ---------------- */
  MG.register('toolkit', {
    layout: 'app',
    html: () => `${head('Toolkit', 'Practical tools to plan the money, skills and time behind your career choice.')}
      <div class="grid-2">${[
        ['swap', 'What-if Career Simulator', 'Cannot afford private college? Miss the entrance exam? Compare your other routes.', '/app/whatif'],
        ['rupee', 'Education Budget Planner', 'Estimate yearly cost for a course and see scholarships you could apply for.', '/app/budget'],
        ['chart', 'Skill Gap Analysis', 'Compare your skills with what a target career needs.', '/app/skills'],
        ['calendar', '90-Day Action Plan', 'A three-stage plan with free resources and a progress tracker.', '/app/roadmap']
      ].map(([i, h, d, to]) => `<a class="card tool-card" href="#${to}"><span class="fs-ico">${ico(i, 24)}</span><div><h3>${h}</h3><p class="sub">${d}</p></div></a>`).join('')}</div>`
  });

  /* ---------------- What-if simulator ---------------- */
  const wi = { profile: null, scenario: 0 };
  const SCENARIOS = [
    { q: 'I cannot afford a private college', best: 'govt', note: 'Government seats cost the least. Prepare for the entrance exam, and keep earn-and-learn as a back-up.' },
    { q: 'I do not clear the entrance exam this year', best: 'earn', note: 'Do not lose the year. Work or apprentice while you re-attempt, or take a government seat through state counselling.' },
    { q: 'I need to start earning early', best: 'earn', note: 'Skill-based and apprenticeship routes pay while you learn. Plan a degree later through distance or lateral entry.' },
    { q: 'I must stay close to home', best: 'govt', note: 'Look for government colleges in your own state. Earn-and-learn also works if local industry is hiring.' }
  ];
  const OPTIONS_12 = [
    { id: 'govt', icon: '🏛️', bg: 'var(--brand-tint)', name: 'Government College', cost: '₹10K – ₹50K / year', dur: '4 years', tag: 'Best for low budget', pros: 'Lowest fees, strong reputation', cons: 'Needs a good entrance rank; limited seats', go: ['/app/colleges', 'Open College Finder'] },
    { id: 'private', icon: '🏫', bg: 'var(--sky-tint)', name: 'Private College', cost: '₹60K – ₹3L / year', dur: '4 years', tag: 'More facilities & exposure', pros: 'Easier admission, more choice of seats', cons: 'High fees; may need an education loan', go: ['/app/budget', 'Estimate the cost'] },
    { id: 'exam', icon: '📝', bg: 'var(--leaf-tint)', name: 'Entrance Exam', cost: '₹0 – ₹1L (coaching)', dur: '1 – 2 years', tag: 'Competitive route', pros: 'Can lead to a top government seat', cons: 'No guarantee; a year may pass before admission', go: ['/app/opportunities', 'See exams'] },
    { id: 'earn', icon: '💼', bg: 'var(--warn-bg)', name: 'Earn & Learn', cost: '₹5K – ₹20K / month', dur: '3 – 4 years', tag: 'Work while you learn', pros: 'Income from day one, no debt', cons: 'Slower progress; less time to study', go: ['/app/recommendations', 'See matching careers'] }
  ];
  const OPTIONS_10 = () => {
    const iti = MG.career('iti-trades');
    return [
      { id: 'govt', icon: '🏛️', bg: 'var(--brand-tint)', name: 'Government Polytechnic', cost: '₹10K – ₹40K / year', dur: '3 years', tag: 'Best for low budget', pros: 'Low fees; direct route to junior-engineer roles', cons: 'Merit or state entrance needed', go: ['/app/colleges', 'Open College Finder'] },
      { id: 'private', icon: '🏫', bg: 'var(--sky-tint)', name: 'Private Polytechnic', cost: '₹40K – ₹1.5L / year', dur: '3 years', tag: 'Easier admission', pros: 'More seats available', cons: 'Higher fees', go: ['/app/budget', 'Estimate the cost'] },
      { id: 'exam', icon: '📝', bg: 'var(--leaf-tint)', name: 'Class 11–12 then exams', cost: 'School fees + coaching', dur: '2 years + exam', tag: 'Keeps degree options open', pros: 'JEE / NEET / CUET all stay possible', cons: 'Longer before earning', go: ['/app/opportunities', 'See exams'] },
      { id: 'earn', icon: '💼', bg: 'var(--warn-bg)', name: 'ITI + Apprenticeship', cost: iti ? iti.fees.replace(/ per year/g, ' / yr') : 'Low', dur: '1 – 2 years', tag: 'Work while you learn', pros: 'Fast route to a paid trade; stipend during apprenticeship', cons: 'Degree later needs extra steps', go: ['/app/recommendations', 'See matching careers'] }
    ];
  };
  const wiProfiles = () => {
    const p = S.profile || {}; const cur = p.stage === 'Class 10' ? '10th Pass' : p.stage === 'College Graduate' ? 'Graduate' : p.stream ? `12th Pass (${/Science/.test(p.stream) ? 'Science' : /Commerce/.test(p.stream) ? 'Commerce' : 'Arts'})` : '12th Pass (Science)';
    return [...new Set([cur, '10th Pass', '12th Pass (Science)', '12th Pass (Commerce)', '12th Pass (Arts)'])];
  };

  MG.register('whatif', {
    layout: 'app',
    html: () => {
      const profs = wiProfiles(); if (!wi.profile || !profs.includes(wi.profile)) wi.profile = profs[0];
      const opts = wi.profile === '10th Pass' ? OPTIONS_10() : OPTIONS_12; const sc = SCENARIOS[wi.scenario];
      return `${back()}${head('What-if Career Simulator', 'Compare different education and career pathways based on your preferences.')}
      <div class="card"><div class="two-col">
        <div><label class="label" for="wi-p">Your current profile</label><select class="select" id="wi-p" data-chg="wiChange">${profs.map((x) => `<option ${x === wi.profile ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
        <div><label class="label" for="wi-s">What if I…</label><select class="select" id="wi-s" data-chg="wiChange">${SCENARIOS.map((x, i) => `<option value="${i}" ${i === wi.scenario ? 'selected' : ''}>${esc(x.q)}</option>`).join('')}</select></div></div></div>
      <div class="notice" style="background:var(--leaf-tint);border-color:var(--leaf);border-left-color:var(--leaf);color:var(--ink)">${ico('check', 18)}<div><b>Suggested for this situation:</b> ${esc(opts.find((o) => o.id === sc.best).name)}. ${esc(sc.note)}</div></div>
      <h3 style="margin:1rem 0 .7rem">Compare options</h3>
      <div class="grid-4">${opts.map((o) => `<div class="option-card ${o.id === sc.best ? 'best' : ''}"><div class="oi" style="background:${o.bg}">${o.icon}</div><h3 style="font-size:1rem">${esc(o.name)}</h3><p class="price">${esc(o.cost)}</p><p class="small muted">${esc(o.dur)}</p><p class="small" style="margin-top:.4rem;color:${o.id === sc.best ? 'var(--leaf)' : 'var(--ink-2)'};font-weight:700">${o.id === sc.best ? 'Suggested · ' : ''}${esc(o.tag)}</p></div>`).join('')}</div>
      <div style="text-align:center;margin-top:1.2rem"><button class="btn btn-primary" data-act="wiCompare">Compare & See Details</button></div>
      <p class="small muted" style="margin-top:1rem;text-align:center">Figures are indicative ranges for planning. Check the official site of each college or exam for current fees.</p>`;
    }
  });
  MG.chg.wiChange = () => { wi.profile = MG.$('#wi-p').value; wi.scenario = +MG.$('#wi-s').value; MG.render(); };
  MG.act.wiCompare = () => {
    const opts = wi.profile === '10th Pass' ? OPTIONS_10() : OPTIONS_12; const sc = SCENARIOS[wi.scenario];
    MG.modal(`<h2 style="padding-right:2.5rem">Compare your options</h2><p class="sub" style="margin:.3rem 0 1rem">If: “${esc(sc.q)}”</p>
      <div class="table-wrap"><table class="tbl" style="min-width:560px"><thead><tr><th>Option</th><th>Cost</th><th>Time</th><th>Upside</th><th>Watch out for</th><th></th></tr></thead><tbody>
      ${opts.map((o) => `<tr><td><b>${esc(o.name)}</b>${o.id === sc.best ? '<div class="chip green" style="margin-top:.3rem">Suggested</div>' : ''}</td><td>${esc(o.cost)}</td><td>${esc(o.dur)}</td><td>${esc(o.pros)}</td><td>${esc(o.cons)}</td><td><a class="btn btn-outline btn-sm" href="#${o.go[0]}">${esc(o.go[1])}</a></td></tr>`).join('')}</tbody></table></div>`);
  };

  /* ---------------- Budget planner ---------------- */
  const COURSES = {
    'B.Tech (4 years)': { years: 4, tuition: { govt: 24000, central: 150000, private: 120000 }, books: 8000, exam: 4000 },
    'Diploma – Polytechnic (3 years)': { years: 3, tuition: { govt: 25000, central: 25000, private: 90000 }, books: 6000, exam: 2500 },
    'MBBS (5.5 years)': { years: 5.5, tuition: { govt: 50000, central: 10000, private: 800000 }, books: 15000, exam: 5000 },
    'B.Sc (3 years)': { years: 3, tuition: { govt: 10000, central: 15000, private: 50000 }, books: 4000, exam: 2000 },
    'BA / B.Com (3 years)': { years: 3, tuition: { govt: 8000, central: 15000, private: 40000 }, books: 4000, exam: 2000 },
    'BCA (3 years)': { years: 3, tuition: { govt: 15000, central: 20000, private: 60000 }, books: 4000, exam: 2000 }
  };
  const COLLEGE_TYPES = { govt: 'Government College (state)', central: 'Central institute (NIT / IIT / central university)', private: 'Private College' };
  const LOCATIONS = { home: ['Home city (live with family)', 12000, 3000], state: ['Same state, hostel', 36000, 6000], other: ['Another state, hostel', 48000, 10000], metro: ['Metro city, hostel', 66000, 12000] };
  const SCHOLARSHIPS = [
    { id: 's1', name: 'Central Sector Scholarship (Govt of India)', short: 'Eligibility: Class 12 merit, family income limit', body: 'For college and university students who scored high in Class 12 and whose family income is under the limit set by the scheme. Apply on the National Scholarship Portal each year.', link: 'https://scholarships.gov.in', courses: 'all' },
    { id: 's2', name: 'Post-Matric Scholarships (SC / ST / OBC and others)', short: 'Eligibility: category and family income criteria', body: 'Central and state schemes that support tuition and maintenance costs for eligible categories after Class 10. Eligibility, income limits and amounts differ by scheme and state, so read the scheme page on the portal.', link: 'https://scholarships.gov.in', courses: 'all' },
    { id: 's3', name: 'AICTE Pragati Scholarship (for girls)', short: 'Technical degree or diploma, one girl per family', body: 'For girl students in AICTE-approved degree or diploma courses, with a family income limit. Check the current amount and rules on the portal before applying.', link: 'https://scholarships.gov.in', courses: ['B.Tech (4 years)', 'Diploma – Polytechnic (3 years)'] },
    { id: 's4', name: 'Education loans (PM-Vidyalaxmi / Vidya Lakshmi portal)', short: 'Apply for bank education loans in one place', body: 'A single portal to apply to several banks for education loans, including government-backed schemes. Compare interest rates and repayment terms before choosing.', link: 'https://www.vidyalakshmi.co.in', courses: 'all' }
  ];
  const bud = { course: 'B.Tech (4 years)', type: 'govt', loc: 'state' };

  MG.register('budget', {
    layout: 'app',
    html: () => {
      const c = COURSES[bud.course]; const tuition = c.tuition[bud.type]; const [locName, hostel, travel] = LOCATIONS[bud.loc];
      const rows = [['Tuition fees', tuition], ['Hostel & food', hostel], ['Books & material', c.books], ['Travel', travel], ['Exam fees', c.exam]];
      const total = rows.reduce((a, r) => a + r[1], 0); const years = c.years;
      const sch = SCHOLARSHIPS.filter((x) => x.courses === 'all' || x.courses.includes(bud.course));
      const opt = (o, cur) => Object.entries(o).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(Array.isArray(v) ? v[0] : v)}</option>`).join('');
      return `${back()}${head('Education Budget Planner', 'Estimate your total education cost and find available scholarships.')}
      <div class="grid-2" style="align-items:start">
        <div class="card"><div style="margin-bottom:.9rem"><label class="label" for="b-c">Course</label><select class="select" id="b-c" data-chg="budChange">${Object.keys(COURSES).map((k) => `<option ${k === bud.course ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></div>
          <div style="margin-bottom:.9rem"><label class="label" for="b-t">College type</label><select class="select" id="b-t" data-chg="budChange">${opt(COLLEGE_TYPES, bud.type)}</select></div>
          <div><label class="label" for="b-l">Where will you study?</label><select class="select" id="b-l" data-chg="budChange">${opt(LOCATIONS, bud.loc)}</select></div></div>
        <div class="card"><h3>Estimated cost breakdown</h3>
          ${rows.map(([l, v]) => `<div class="cost-row"><span>${l}</span><span>${inr(v)}</span></div>`).join('')}
          <div class="cost-row total"><span>Total (per year)</span><b>${inr(total)}</b></div>
          <div class="cost-row" style="border:0"><span class="muted">Monthly (approx.)</span><span>${inr(total / 12)}</span></div>
          <div class="cost-row" style="border:0"><span class="muted">Whole course (${years} yrs, approx.)</span><span>${inr(total * years)}</span></div></div></div>
      <div class="card"><h3>Available scholarships & funding</h3>${sch.map((x) => `<div class="sch"><span class="fs-ico" style="width:38px;height:38px">${ico('star', 18)}</span><div class="grow"><b>${esc(x.name)}</b><div class="small muted">${esc(x.short)}</div></div><button class="btn btn-outline btn-sm" data-act="schDetail" data-id="${x.id}">View Details</button></div>`).join('')}</div>
      <p class="small muted">Estimates are indicative and vary by state, college and year. Confirm fees on the college website and scholarship rules on the official portal.</p>`;
    }
  });
  MG.chg.budChange = () => { bud.course = MG.$('#b-c').value; bud.type = MG.$('#b-t').value; bud.loc = MG.$('#b-l').value; MG.render(); };
  MG.act.schDetail = (el) => {
    const x = SCHOLARSHIPS.find((s) => s.id === el.dataset.id);
    MG.modal(`<h2 style="padding-right:2.5rem">${esc(x.name)}</h2><p style="margin:.8rem 0">${esc(x.body)}</p><div class="notice">${ico('info', 18)}<div>Amounts, income limits and deadlines change every year. Confirm on the official portal before you apply.</div></div><div style="text-align:right"><a class="btn btn-primary" href="${x.link}" target="_blank" rel="noopener">Open official portal ${ico('external', 14)}</a></div>`, 'sm');
  };

  /* ---------------- Skill gap ---------------- */
  const EXTRAS = ['Communication', 'Time management', 'Basic computer skills'];
  const skKey = (cid) => `mg_skills_${S.user.id}_${cid}`;
  const skHave = (cid) => { try { return JSON.parse(localStorage.getItem(skKey(cid)) || '[]'); } catch (e) { return []; } };
  const sk = { cid: null };

  MG.register('skills', {
    layout: 'app',
    html: async (params) => {
      const data = await MG.loadSkills(); const m = await MG.ensureMatches();
      sk.cid = params[0] || sk.cid || (m && m.topMatches[0] && m.topMatches[0].career.id) || 'bca-bsc-cs';
      if (!MG.career(sk.cid)) sk.cid = 'bca-bsc-cs';
      const defined = Object.keys(data).filter((k) => k !== '_default' && MG.career(k));
      const others = S.careers.filter((c) => !defined.includes(c.id));
      const optHTML = (c) => `<option value="${esc(c.id)}" ${c.id === sk.cid ? 'selected' : ''}>${esc(c.name)}</option>`;
      return `${back()}${head('Skill Gap Analysis', 'Compare your current skills with the skills required for your target career.')}
      <div class="card"><label class="label" for="sk-c">Target career</label><select class="select" id="sk-c" data-chg="skCareer"><optgroup label="With a skill checklist">${defined.map((id) => optHTML(MG.career(id))).join('')}</optgroup><optgroup label="Other careers (basic checklist)">${others.map(optHTML).join('')}</optgroup></select></div>
      <div id="sk-body"></div>`;
    },
    mount: () => skRender()
  });
  async function skRender() {
    const data = await MG.loadSkills(); const c = MG.career(sk.cid); const req = MG.skillsFor(c, data).required;
    const pool = [...new Set([...req, ...EXTRAS])]; const have = skHave(sk.cid);
    const matched = req.filter((r) => have.includes(r)); const pct = Math.round((matched.length / req.length) * 100);
    const missing = req.filter((r) => !have.includes(r));
    const q = (s) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s + ' free course for beginners');
    MG.$('#sk-body').innerHTML = `<div class="skill-cols">
      <div class="card"><h3>Your skills</h3><p class="small muted" style="margin-bottom:.5rem">Tick what you can already do.</p>${pool.map((s, i) => `<label class="skill-item"><input type="checkbox" data-chg="skTick" value="${esc(s)}" ${have.includes(s) ? 'checked' : ''}> ${esc(s)}</label>`).join('')}
        <div style="margin-top:1rem"><div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:.35rem"><span>Overall match</span><span>${pct}%</span></div><div class="progress"><i style="width:${pct}%"></i></div></div></div>
      <div class="card"><h3>Required skills</h3>${req.map((s) => `<div class="skill-item">${have.includes(s) ? `<span class="tick">${ico('check', 18)}</span>` : `<span class="cross">${ico('x', 18)}</span>`}<span style="${have.includes(s) ? '' : 'color:var(--ink-2)'}">${esc(s)}</span></div>`).join('')}
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)"><b>Quick plan</b><div class="sch" style="border:0;padding-bottom:0"><div class="grow"><b>${esc(c.name)}</b><div class="small muted">${esc(c.part)}</div></div><button class="btn btn-outline btn-sm" data-act="setPlan" data-id="${esc(c.id)}">Start plan</button></div></div></div></div>
      ${missing.length ? `<div class="card"><h3>Learn next (${missing.length} to go)</h3><p class="small muted" style="margin-bottom:.4rem">Free starting points. Also see <a href="https://swayam.gov.in" target="_blank" rel="noopener">SWAYAM</a> and <a href="https://nptel.ac.in" target="_blank" rel="noopener">NPTEL</a>.</p>${missing.map((s) => `<div class="sch"><div class="grow"><b>${esc(s)}</b></div><a class="btn btn-ghost btn-sm" href="${q(s)}" target="_blank" rel="noopener">Find free videos ${ico('external', 14)}</a></div>`).join('')}</div>`
        : '<div class="notice" style="background:var(--leaf-tint);border-color:var(--leaf);border-left-color:var(--leaf);color:var(--ink)">You already have every skill on this checklist. Build a project or take a mock test to prove it.</div>'}`;
  }
  MG.chg.skCareer = (el) => { sk.cid = el.value; skRender(); };
  MG.chg.skTick = () => {
    const have = MG.$$('[data-chg="skTick"]:checked').map((i) => i.value);
    try { localStorage.setItem(skKey(sk.cid), JSON.stringify(have)); } catch (e) { /* ignore */ }
    skRender();
  };

  /* ---------------- 90-day plan ---------------- */
  const GENERIC = {
    govt: [
      ['Read the latest official notification', 'Download the syllabus and exam pattern', 'Study the basics (NCERT) for 12–15 hours a week', 'Make a weekly timetable and stick to it'],
      ['Solve 5 previous-year papers', 'Start an error notebook for wrong answers', 'Take 2 sectional tests', 'Revise your weakest topics'],
      ['Take 3 full-length timed mock tests', 'Fix repeated mistakes from the mocks', 'Keep certificates, ID and photo ready', 'Fill the application form on the official site']
    ],
    other: [
      ['Check eligibility and the entrance exam', 'Learn the syllabus basics', 'Join a free course (SWAYAM / NPTEL)', 'Set a weekly study timetable'],
      ['Practise previous-year questions', 'Build one small project or portfolio piece', 'Talk to a student or professional in this field', 'Shortlist colleges using the College Finder'],
      ['Take full-length mock tests', 'Prepare documents and scholarship forms', 'Apply to your shortlisted colleges', 'Write down a Plan B']
    ]
  };
  const NAMES = [['Build Your Foundation', 'Days 1 – 30'], ['Gain Practical Experience', 'Days 31 – 60'], ['Prepare for the Future', 'Days 61 – 90']];
  const buildPlan = (c, roadmap) => [1, 2, 3].map((n) => {
    const g = GENERIC[c.isGovt ? 'govt' : 'other'][n - 1]; let titles, name = NAMES[n - 1][0], days = NAMES[n - 1][1], focus = '';
    const ph = roadmap && roadmap['phase' + n];
    if (ph) {
      name = ph.name.replace(/^Phase \d:\s*/, ''); days = ph.days.replace(' to ', ' – '); focus = ph.focus;
      titles = ph.resources.slice(0, 3).map((r) => 'Study: ' + r.title);
      let i = 0; while (titles.length < 3) titles.push(g[i++]);
      titles.push('Milestone: ' + ph.milestone);
    } else titles = g;
    return { name, days, focus, tasks: titles.map((t, i) => ({ id: `p${n}t${i + 1}`, text: t })) };
  });
  const planPct = () => Math.round((S.roadmapProgress.filter((x) => /^p[1-3]t[1-4]$/.test(x)).length / MG.PLAN_TASKS) * 100);

  const planRoute = {
    layout: 'app',
    html: async () => {
      const id = S.activeCareerId; const c = id && MG.career(id);
      if (!c) {
        const m = await MG.ensureMatches();
        const ids = [...new Set([...(m ? m.topMatches.map((x) => x.career.id) : []), ...S.saved, 'bca-bsc-cs', 'ssc-cgl', 'bank-po'])].filter((x) => MG.career(x));
        return `${head('90-Day Action Plan', 'Your step-by-step guide to achieve your career goals.')}
          <div class="card empty"><h3>Pick a career to start your plan</h3><p>You get three 30-day stages with free resources and a tracker.</p>
          <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin-top:1rem"><select class="select" id="pl-pick" style="max-width:340px">${ids.map((x) => `<option value="${esc(x)}">${esc(MG.career(x).name)}</option>`).join('')}</select><button class="btn btn-primary" data-act="plStart">Start plan</button></div></div>`;
      }
      const { roadmap } = await MG.api('/api/careers/' + encodeURIComponent(id));
      const plan = buildPlan(c, roadmap); const pct = planPct();
      return `${head('90-Day Action Plan', `Your step-by-step guide to achieve your career goal: <b>${esc(c.name)}</b>`, `<div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-act="openCareer" data-id="${esc(c.id)}">Full career details</button><button class="btn btn-ghost btn-sm" data-act="plChange">Change plan</button></div>`)}
      <div class="card"><div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:.4rem"><span>Progress</span><span id="pl-pct">${pct}% Completed</span></div><div class="progress"><i id="pl-bar" style="width:${pct}%"></i></div></div>
      <div class="plan-cols">${plan.map((ph) => `<section class="plan-col"><h3>${esc(ph.name)}</h3><p class="days">${esc(ph.days)}</p>${ph.focus ? `<p class="small muted" style="margin-bottom:.5rem">${esc(ph.focus)}</p>` : ''}
        ${ph.tasks.map((t) => `<label class="task ${S.roadmapProgress.includes(t.id) ? 'done' : ''}"><input type="checkbox" data-chg="planTick" value="${t.id}" ${S.roadmapProgress.includes(t.id) ? 'checked' : ''}><span>${esc(t.text)}</span></label>`).join('')}</section>`).join('')}</div>
      <p class="small muted" style="margin-top:1rem">Search the resource names on YouTube, SWAYAM or NPTEL. Everything suggested is free.</p>`;
    }
  };
  MG.register('roadmap', planRoute);
  MG.register('plan', planRoute);

  MG.act.plStart = () => MG.setPlan(MG.$('#pl-pick').value);
  MG.act.plChange = () => {
    const m = S.matches; const ids = [...new Set([...(m ? m.topMatches.map((x) => x.career.id) : []), ...S.saved, 'bca-bsc-cs', 'ssc-cgl', 'bank-po'])].filter((x) => MG.career(x));
    MG.modal(`<h2 style="padding-right:2.5rem;margin-bottom:.6rem">Change plan</h2><p class="sub" style="margin-bottom:1rem">Switching resets your current progress.</p><select class="select" id="pl-pick2" style="margin-bottom:1rem">${ids.map((x) => `<option value="${esc(x)}" ${x === S.activeCareerId ? 'selected' : ''}>${esc(MG.career(x).name)}</option>`).join('')}</select><div style="text-align:right"><button class="btn btn-primary" data-act="plSwitch">Switch plan</button></div>`, 'sm');
  };
  MG.act.plSwitch = () => MG.setPlan(MG.$('#pl-pick2').value);
  MG.chg.planTick = async (el) => {
    const id = el.value;
    S.roadmapProgress = el.checked ? [...new Set([...S.roadmapProgress, id])] : S.roadmapProgress.filter((x) => x !== id);
    el.closest('.task').classList.toggle('done', el.checked);
    const pct = planPct(); MG.$('#pl-pct').textContent = pct + '% Completed'; MG.$('#pl-bar').style.width = pct + '%';
    try { await MG.api('/api/profile/progress', { method: 'POST', body: { userId: S.user.id, careerId: S.activeCareerId, progressDays: S.roadmapProgress } }); }
    catch (e) { MG.toast('Could not save progress.'); }
  };
})();
