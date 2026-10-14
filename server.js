const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data', 'margdarshak.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    is_guest INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    stage TEXT,
    stream TEXT,
    percentage REAL,
    liked_subjects TEXT,
    disliked_subjects TEXT,
    activities_text TEXT,
    skills TEXT,
    languages TEXT,
    weekly_hours INTEGER,
    budget_level TEXT,
    relocation_pref TEXT,
    work_preference TEXT,
    family_situation TEXT,
    main_worry TEXT,
    assessment_answers TEXT,
    saved_career_id TEXT,
    progress_days TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS saved_careers (
    user_id TEXT NOT NULL,
    career_id TEXT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, career_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
db.pragma('foreign_keys = ON');

// Load Data Assets
const careersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'careers.json'), 'utf-8'));
const assessmentData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'assessment.json'), 'utf-8'));
const roadmapsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'roadmaps.json'), 'utf-8'));
const collegesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'colleges.json'), 'utf-8'));
const skillsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'skills.json'), 'utf-8'));

// Helper: Scoring and Recommendation Engine
function evaluateCareerMatch(profile, answers, career) {
  let score = 0;
  let breakdown = {
    eligibility: 0,
    interests: 0,
    budget: 0,
    timeFit: 0,
    strengthsActivities: 0,
    personalityValues: 0
  };
  let matchReasons = [];
  let cautionNotes = [];

  // --- 1. HARD FILTERS & ELIGIBILITY (Weight: 30%) ---
  let isEligible = true;
  const userStage = (profile.stage || '').toLowerCase();
  const careerPart = (career.part || '').toLowerCase();

  // Part 1: After 10th
  // Part 2: After 12th
  // Part 3: After Graduation
  if (userStage.includes('10') && (careerPart.includes('12') || careerPart.includes('graduation'))) {
    isEligible = false;
  } else if (userStage.includes('12') && careerPart.includes('graduation')) {
    isEligible = false;
  }

  // Stream requirement check
  const userStream = (profile.stream || '').toLowerCase();
  const reqStream = (career.streamRequired || '').toLowerCase();

  if (reqStream.includes('pcm') && !userStream.includes('pcm') && !userStream.includes('science')) {
    if (!userStream.includes('polytechnic')) isEligible = false;
  }
  if (reqStream.includes('pcb') && !userStream.includes('pcb') && !userStream.includes('biology')) {
    isEligible = false;
  }

  if (!isEligible) {
    return null; // Excluded by hard filter
  }

  breakdown.eligibility = 30; // Passed hard requirements

  // --- 2. INTERESTS & SUBJECT ALIGNMENT (Weight: 25%) ---
  let interestPoints = 10;
  const likedSubjects = (profile.liked_subjects || '').toLowerCase();
  const dislikedSubjects = (profile.disliked_subjects || '').toLowerCase();

  // Keyword check in liked vs disliked
  const careerKeywords = career.keywords || [];
  let likedMatches = 0;
  let dislikedMatches = 0;

  careerKeywords.forEach(kw => {
    if (likedSubjects.includes(kw)) likedMatches++;
    if (dislikedSubjects.includes(kw)) dislikedMatches++;
  });

  if (likedMatches > 0) {
    interestPoints += Math.min(15, likedMatches * 6);
    matchReasons.push(`Matches your interest in ${likedSubjects.split(',')[0].trim() || 'your chosen subjects'}`);
  }
  if (dislikedMatches > 0) {
    interestPoints -= Math.min(10, dislikedMatches * 5);
    cautionNotes.push(`Involves areas related to subjects you mentioned disliking`);
  }
  breakdown.interests = Math.max(5, Math.min(25, interestPoints));

  // --- 3. BUDGET FIT (Weight: 15%) ---
  const userBudget = (profile.budget_level || 'low').toLowerCase();
  const careerCost = (career.approxCostLevel || '').toLowerCase();
  let budgetScore = 10;

  if (userBudget.includes('low') || userBudget.includes('zero') || userBudget.includes('under 50k')) {
    if (career.isGovt || careerCost.includes('very low') || careerCost.includes('zero') || careerCost.includes('minimal')) {
      budgetScore = 15;
      matchReasons.push(`Fits your low/pocket-friendly budget (Govt fee scale or minimal exam fee)`);
    } else if (careerCost.includes('extreme') || careerCost.includes('high')) {
      budgetScore = 2;
      cautionNotes.push(`Fees in private colleges are high; needs education loan or strict merit seat`);
    } else {
      budgetScore = 9;
    }
  } else {
    budgetScore = 15;
  }
  breakdown.budget = budgetScore;

  // --- 4. TIME & AGE FIT (Weight: 10%) ---
  const userHours = parseInt(profile.weekly_hours || 15, 10);
  let timeScore = 8;
  if (career.competition === 'Extreme' && userHours < 15) {
    timeScore = 5;
    cautionNotes.push(`Extreme competition demands 20+ study hours/week, which exceeds your current time commitment`);
  } else if (userHours >= 15) {
    timeScore = 10;
  }
  breakdown.timeFit = timeScore;

  // --- 5. STRENGTHS & PAST ACTIVITIES (Weight: 10%) ---
  // Free-text matching with Hinglish handling
  const activityText = ((profile.activities_text || '') + ' ' + (profile.skills || '')).toLowerCase();
  let activityPoints = 4;
  let detectedSkills = [];

  careerKeywords.forEach(kw => {
    // Normalizing hindi transliterations
    if (activityText.includes(kw) || 
       (kw === 'coding' && (activityText.includes('code') || activityText.includes('programming') || activityText.includes('website') || activityText.includes('computer'))) ||
       (kw === 'sarkari' && (activityText.includes('govt') || activityText.includes('naukri') || activityText.includes('bharti') || activityText.includes('exam'))) ||
       (kw === 'police' && (activityText.includes('running') || activityText.includes('fitness') || activityText.includes('race') || activityText.includes('ncc'))) ||
       (kw === 'maths' && (activityText.includes('math') || activityText.includes('hisab') || activityText.includes('calculation')))) {
      activityPoints += 2;
      detectedSkills.push(kw);
    }
  });

  if (detectedSkills.length > 0) {
    matchReasons.push(`Connects with what you've already explored: ${[...new Set(detectedSkills)].slice(0, 3).join(', ')}`);
  }
  breakdown.strengthsActivities = Math.min(10, activityPoints);

  // --- 6. PERSONALITY, RISK & VALUES (Weight: 10%) ---
  let valueScore = 7;
  const workPref = (profile.work_preference || 'both').toLowerCase();
  if (workPref === 'govt' && career.isGovt) {
    valueScore += 3;
    matchReasons.push(`Aligns with your preference for government job stability & 7th Pay structure`);
  } else if (workPref === 'private' && !career.isGovt) {
    valueScore += 3;
    matchReasons.push(`Aligns with your preference for private industry growth and corporate opportunities`);
  }

  // Check Q1 & Q5 answers if available
  if (answers && answers.q5_govt_vs_private) {
    if (answers.q5_govt_vs_private === 'govt_stability' && career.isGovt) valueScore = 10;
    if (answers.q5_govt_vs_private === 'private_high_ceiling' && !career.isGovt) valueScore = 10;
  }

  breakdown.personalityValues = Math.min(10, valueScore);

  // Calculate Total Match %
  score = breakdown.eligibility + breakdown.interests + breakdown.budget + breakdown.timeFit + breakdown.strengthsActivities + breakdown.personalityValues;

  // Add default reason if empty
  if (matchReasons.length === 0) {
    matchReasons.push(`Fulfills standard academic and stream qualifications for ${career.streamRequired}`);
  }
  if (career.competition === 'Extreme' && cautionNotes.length === 0) {
    cautionNotes.push(`Extreme competition (all-India applicant pool); essential to prepare with a solid Plan B`);
  }

  return {
    score: Math.min(98, Math.max(45, score)),
    breakdown,
    matchReasons,
    cautionNotes
  };
}

// Helper: run the scoring engine across the whole dataset
function computeMatches(profileData, assessmentAnswers) {
  const matches = [];
  careersData.forEach(career => {
    const matchResult = evaluateCareerMatch(profileData, assessmentAnswers || {}, career);
    if (matchResult) {
      let planBDetails = null;
      if (career.planBRecommendation) {
        planBDetails = careersData.find(c => c.id === career.planBRecommendation) || null;
      }
      matches.push({
        career,
        score: matchResult.score,
        breakdown: matchResult.breakdown,
        reasons: matchResult.matchReasons,
        caution: matchResult.cautionNotes,
        planBCompanion: planBDetails
      });
    }
  });
  matches.sort((a, b) => b.score - a.score);

  const backupOption = matches.find(m => m.career.competition === 'Low' || m.career.competition === 'Moderate') || matches[matches.length - 1] || null;
  const emergingOption = matches.find(m => m.career.isEmerging) || careersData.find(c => c.isEmerging);

  return {
    totalEvaluated: careersData.length,
    eligibleCount: matches.length,
    topMatches: matches.slice(0, 5),
    allMatches: matches.slice(0, 30),
    backupOption,
    emergingOption
  };
}

// API Routes

// 1. Get Careers Dataset
app.get('/api/careers', (req, res) => {
  res.json(careersData);
});

// 2. Get Single Career with details
app.get('/api/careers/:id', (req, res) => {
  const career = careersData.find(c => c.id === req.params.id);
  if (!career) return res.status(404).json({ error: 'Career not found' });
  const roadmap = roadmapsData[career.id] || null;
  res.json({ career, roadmap });
});

// 3. Get Assessment Questions & Counselor Content
app.get('/api/assessment', (req, res) => {
  res.json(assessmentData);
});

// 4. Auth - Guest Login / Creation
app.post('/api/auth/guest', (req, res) => {
  const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const stmt = db.prepare('INSERT INTO users (id, name, email, is_guest) VALUES (?, ?, ?, 1)');
  stmt.run(guestId, 'Guest Student (अतिथि)', `${guestId}@margdarshak.local`);
  res.json({ success: true, user: { id: guestId, name: 'Guest Student', email: 'guest@margdarshak.local', is_guest: 1 } });
});

// 5. Auth - Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + Date.now();

    const stmt = db.prepare('INSERT INTO users (id, name, email, password_hash, is_guest) VALUES (?, ?, ?, ?, 0)');
    stmt.run(userId, name, email.toLowerCase().trim(), hash);

    res.json({ success: true, user: { id: userId, name, email: email.toLowerCase().trim(), is_guest: 0 } });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// 6. Auth - Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || user.is_guest) {
    return res.status(401).json({ error: 'No account found with this email.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, is_guest: 0 }
  });
});

// 7. Profile - Get
app.get('/api/profile/:userId', (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.params.userId);
  res.json(profile || null);
});

// 8. Profile - Save & Match
app.post('/api/profile/save-and-match', (req, res) => {
  const { userId, profileData, assessmentAnswers } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  // Save profile to SQLite
  const stmt = db.prepare(`
    INSERT INTO profiles (
      user_id, stage, stream, percentage, liked_subjects, disliked_subjects,
      activities_text, skills, languages, weekly_hours, budget_level,
      relocation_pref, work_preference, family_situation, main_worry,
      assessment_answers, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(user_id) DO UPDATE SET
      stage=excluded.stage, stream=excluded.stream, percentage=excluded.percentage,
      liked_subjects=excluded.liked_subjects, disliked_subjects=excluded.disliked_subjects,
      activities_text=excluded.activities_text, skills=excluded.skills, languages=excluded.languages,
      weekly_hours=excluded.weekly_hours, budget_level=excluded.budget_level,
      relocation_pref=excluded.relocation_pref, work_preference=excluded.work_preference,
      family_situation=excluded.family_situation, main_worry=excluded.main_worry,
      assessment_answers=excluded.assessment_answers, updated_at=CURRENT_TIMESTAMP
  `);

  stmt.run(
    userId,
    profileData.stage || 'Class 12',
    profileData.stream || 'Science (PCM)',
    profileData.percentage || 65,
    profileData.liked_subjects || '',
    profileData.disliked_subjects || '',
    profileData.activities_text || '',
    profileData.skills || '',
    profileData.languages || 'Hindi, English',
    profileData.weekly_hours || 15,
    profileData.budget_level || 'Low',
    profileData.relocation_pref || 'Anywhere',
    profileData.work_preference || 'both',
    profileData.family_situation || '',
    profileData.main_worry || '',
    JSON.stringify(assessmentAnswers || {})
  );

  res.json({ success: true, ...computeMatches(profileData, assessmentAnswers || {}) });
});

// 9. Save roadmap progress checkboxes
app.post('/api/profile/progress', (req, res) => {
  const { userId, careerId, progressDays } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(userId);
  db.prepare(`
    UPDATE profiles SET saved_career_id = ?, progress_days = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
  `).run(careerId, JSON.stringify(progressDays || []), userId);

  res.json({ success: true, message: 'Progress saved successfully.' });
});

// 10. Delete Account & Data
app.delete('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ success: true, message: 'Your account and data have been completely deleted.' });
});


// 11. Recompute matches for a returning user from the stored profile
app.get('/api/matches/:userId', (req, res) => {
  const p = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.params.userId);
  if (!p) return res.json({ success: false, error: 'No profile yet' });
  let answers = {};
  try { answers = JSON.parse(p.assessment_answers || '{}'); } catch (e) {}
  res.json({ success: true, ...computeMatches(p, answers) });
});

// 12. Partial profile update (edit profile screen)
app.put('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, ...fields } = req.body || {};
  if (name && String(name).trim()) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(String(name).trim().slice(0, 80), userId);
  }
  const allowed = ['stage', 'stream', 'percentage', 'liked_subjects', 'disliked_subjects', 'activities_text',
    'weekly_hours', 'budget_level', 'relocation_pref', 'work_preference', 'main_worry'];
  db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(userId);
  allowed.forEach(k => {
    if (fields[k] !== undefined) {
      db.prepare(`UPDATE profiles SET ${k} = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`).run(fields[k], userId);
    }
  });
  res.json({ success: true, profile: db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) });
});

// 13. Saved careers
app.get('/api/saved/:userId', (req, res) => {
  const rows = db.prepare('SELECT career_id FROM saved_careers WHERE user_id = ? ORDER BY saved_at DESC').all(req.params.userId);
  res.json(rows.map(r => r.career_id));
});

app.post('/api/saved', (req, res) => {
  const { userId, careerId } = req.body || {};
  if (!userId || !careerId) return res.status(400).json({ error: 'userId and careerId are required' });
  if (!careersData.find(c => c.id === careerId)) return res.status(404).json({ error: 'Career not found' });
  db.prepare('INSERT OR IGNORE INTO saved_careers (user_id, career_id) VALUES (?, ?)').run(userId, careerId);
  res.json({ success: true });
});

app.delete('/api/saved/:userId/:careerId', (req, res) => {
  db.prepare('DELETE FROM saved_careers WHERE user_id = ? AND career_id = ?').run(req.params.userId, req.params.careerId);
  res.json({ success: true });
});

// 14. College finder (state + course filters)
app.get('/api/colleges', (req, res) => {
  const { state, course } = req.query;
  let list = collegesData.colleges;
  if (state && state !== 'All') list = list.filter(c => c.state === state);
  if (course) list = list.filter(c => c.courses.includes(course));
  res.json({
    states: collegesData.states,
    courses: collegesData.courses,
    colleges: list
  });
});

// 15. Skill requirements for the Skill Gap Analysis
app.get('/api/skills', (req, res) => res.json(skillsData));

// 16. Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!message || !String(message).trim()) return res.status(400).json({ error: 'Please write a message.' });
  db.prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
    .run(String(name || '').slice(0, 80), String(email || '').slice(0, 120), String(message).slice(0, 2000));
  res.json({ success: true });
});

// Fallback to index.html for SPA feel
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Margdarshak Career Guidance Server is LIVE`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Local SQLite Database: ${dbPath}`);
  console.log(`  Dataset loaded: ${careersData.length} careers from Official Career Guide PDF`);
  console.log(`====================================================`);
});
