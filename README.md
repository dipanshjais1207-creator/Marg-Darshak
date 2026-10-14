# Margdarshak (मार्गदर्शक)
### Grounded Career Navigation Platform for First-Generation College Students in India

Margdarshak is a focused, human-crafted web application built directly on the verified dataset **"Complete Career Guide: After Class 10, Class 12 & After Graduation (India)"**. It helps students navigate stream selection, entrance exams, 7th Pay Commission scales, and private sector options through a transparent, rule-based scoring system.

---

## 🌟 Key Features
1. **Zero Hallucination / Primary Dataset Integrity:**
   - All 63 career paths, durations, fees, syllabi, competition ratings, and starting salaries derive verbatim from the primary dataset.
   - Official disclaimer banner rendered prominently on every page.
2. **Transparent Rule-Based Scoring Formula:**
   - 30% Eligibility & Stream + 25% Interests & Subjects + 15% Family Budget Fit + 10% Time/Hours Commitment + 10% Past Activities & Real Projects + 10% Values & Sector Preference.
3. **Plan B Safety Net Pairing:**
   - Every "Extreme" competition career (e.g. UPSC, NEET, CA, JEE) is mandatory paired with an accessible, high-employability fallback from the PDF.
4. **Actionable 90-Day Execution Roadmaps:**
   - Structured into Days 1–30 (Foundations), Days 31–60 (Practice), and Days 61–90 (Proof) with verified free resources (NCERT ePathshala, SWAYAM, NPTEL, previous-year question portals) and interactive dashboard checkboxes.
5. **Counselor & Family Toolkit:**
   - Respectful conversational scripts for discussing career choices with traditional parents without conflict.
6. **Mobile-First Indian Design System:**
   - Warm terracotta/sand palette, crisp typography (`Lora` serif + `Plus Jakarta Sans` + `Noto Sans Devanagari`), zero AI buzzwords, and ultra-fast lightweight performance.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended; tested on v24)
- npm (Node Package Manager)

### Installation & Launch
1. Open PowerShell or Terminal in the project root:
   ```bash
   cd margdarshak
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧪 3-Minute Demo Flow for Reviewers
1. **Step 1 (0:00 - 0:30):** Click **"Continue as Guest (3-Min Demo)"** on the landing page. Inspect the conversational "My Journey So Far" onboarding form.
2. **Step 2 (0:30 - 1:00):** Proceed to the 6-question quick assessment. Click *"Fill Sample Answers (Quick Demo)"* and click *"Calculate My Career Matches"*.
3. **Step 3 (1:00 - 2:00):** Review the Top 3 matches. Note the explicit *"Why this suits you"* rationale, the 7th Pay / industry benchmark data badges, and the mandatory Plan B safety pairing.
4. **Step 4 (2:00 - 2:30):** Click *"Full PDF Specs & 90-Day Roadmap"* on any career card to inspect the exact 8 PDF fields and 30-day milestone buckets. Click *"Set as My Active 90-Day Plan"*.
5. **Step 5 (2:30 - 3:00):** View the student dashboard, toggle your milestone checkboxes, click *"Share on WhatsApp"* or print/save as a clean PDF snapshot, and test the secure logout.

---

## 🔒 Privacy & Data Guarantee
- Student passwords are encrypted using `bcrypt` (10 salt rounds).
- Stored locally in a high-performance SQLite database (`data/margdarshak.db`).
- Zero tracking scripts, zero sponsored advertisements, and single-click permanent data deletion via the student dashboard.
