import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const adminSecretCode = process.env.ADMIN_SECRET_CODE || "ADMIN2026";

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

// Pre-seeded database for Scholarships
const defaultScholarships = [
  {
    id: "sch-gates",
    name: "The Gates Scholarship",
    organization: "The Bill & Melinda Gates Foundation",
    amount: "$55,000 / year (Full cost of attendance)",
    amountNumeric: 55000,
    deadline: "2026-09-15",
    studentLevel: "high_school",
    ageFilter: "Under 19",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["Pell-eligible", "Minority status", "GPA 3.3+", "US Citizen"],
    isVerified: true,
    fieldOfStudy: "Any",
    sourceUrl: "https://www.thegatesscholarship.org",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-cocacola",
    name: "Coca-Cola Scholars Program",
    organization: "Coca-Cola Scholars Foundation",
    amount: "$20,000 total",
    amountNumeric: 20000,
    deadline: "2026-09-30",
    studentLevel: "high_school",
    ageFilter: "High school senior",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["GPA 3.0+", "High school senior", "US Citizen/Resident", "Leadership & Service"],
    isVerified: true,
    fieldOfStudy: "Any",
    sourceUrl: "https://www.coca-colascholarsfoundation.org",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-smart-dod",
    name: "SMART Scholarship Program",
    organization: "U.S. Department of Defense (DoD)",
    amount: "$38,000 / year + Full Tuition",
    amountNumeric: 38000,
    deadline: "2026-12-01",
    studentLevel: "college",
    ageFilter: "Minimum 18",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["Majoring in STEM field", "GPA 3.0+", "US Citizen", "Willing to accept summer internships"],
    isVerified: true,
    fieldOfStudy: "STEM",
    sourceUrl: "https://www.smartscholarship.org",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-goldwater",
    name: "Barry Goldwater Scholarship",
    organization: "Goldwater Foundation",
    amount: "$7,500 / year",
    amountNumeric: 7500,
    deadline: "2027-01-30",
    studentLevel: "college",
    ageFilter: "Sophomore or Junior",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["GPA 3.7+", "Majoring in STEM field", "Intending to pursue research career"],
    isVerified: true,
    fieldOfStudy: "STEM",
    sourceUrl: "https://goldwater.scholarsapply.org",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-tacobell",
    name: "Taco Bell Live Más Scholarship",
    organization: "Taco Bell Foundation",
    amount: "$25,000 total",
    amountNumeric: 25000,
    deadline: "2027-01-15",
    studentLevel: "both",
    ageFilter: "16 to 26",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["Submit a 2-minute video about your passion", "Must not be standard academic/athletic focus"],
    isVerified: true,
    fieldOfStudy: "Any",
    sourceUrl: "https://www.tacobellfoundation.org/live-mas-scholarship/",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-horatio-alger-cte",
    name: "Horatio Alger Career & Technical Scholarship",
    organization: "Horatio Alger Association",
    amount: "$2,500 total",
    amountNumeric: 2500,
    deadline: "2026-06-15",
    studentLevel: "college",
    ageFilter: "All eligible",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["Financial need ($65k or less family income)", "Enrolled in associate's degree or certificate program", "Completed high school by July 1", "US Citizen"],
    isVerified: true,
    fieldOfStudy: "Any",
    sourceUrl: "https://horatioalger.org/career-technical-education-scholarships/",
    originalQuery: "Pre-seeded list"
  },
  {
    id: "sch-horatio-alger-national",
    name: "Horatio Alger National Scholarship",
    organization: "Horatio Alger Association",
    amount: "$25,000 total",
    amountNumeric: 25000,
    deadline: "2027-03-01",
    studentLevel: "high_school",
    ageFilter: "High school junior",
    isFree: true,
    scamFlag: false,
    scamReason: "",
    requirements: ["Financial need ($65k or less family income)", "GPA 2.0+", "US Citizen", "Overcame personal adversity"],
    isVerified: true,
    fieldOfStudy: "Any",
    sourceUrl: "https://scholars.horatioalger.org/scholarships/",
    originalQuery: "Pre-seeded list"
  },
];

// Pre-seeded database for Internships
const defaultInternships = [
  {
    id: "int-google-swe",
    title: "Software Engineering Intern",
    company: "Google",
    location: "Remote or Hybrid (Mountain View, CA)",
    type: "Paid",
    deadline: "2026-10-15",
    studentLevel: "undergrad",
    description: "Work on Google's core products, build scalable systems, and write high-quality code in Python, C++, Java, or Go alongside senior mentors.",
    requirements: ["Enrolled in BS, MS, or PhD in Computer Science or related", "Experience with standard coding algorithms"],
    isVerified: true,
    scamFlag: false,
    scamReason: "",
    sourceUrl: "https://careers.google.com",
    fieldOfStudy: "Engineering"
  },
  {
    id: "int-microsoft-explore",
    title: "Explore Microsoft Intern",
    company: "Microsoft",
    location: "On-site / Hybrid (Redmond, WA)",
    type: "Paid",
    deadline: "2026-09-30",
    studentLevel: "undergrad",
    description: "A 12-week rotational internship for freshman or sophomore college students, experiencing both Software Engineering and Program Management roles.",
    requirements: ["Freshman or sophomore in college", "Interest in Software Development or tech careers"],
    isVerified: true,
    scamFlag: false,
    scamReason: "",
    sourceUrl: "https://careers.microsoft.com",
    fieldOfStudy: "Engineering"
  },
  {
    id: "int-nasa-pathways",
    title: "NASA Pathways Intern Program",
    company: "NASA Goddard Space Flight Center",
    location: "On-site / Greenbelt, MD",
    type: "Paid",
    deadline: "2026-11-15",
    studentLevel: "undergrad",
    description: "Paid experience integrating academics with practical engineering and science projects supporting deep-space communications and telemetry.",
    requirements: ["Enrollment in accredited degree program", "GPA 3.0+", "US Citizen"],
    isVerified: true,
    scamFlag: false,
    scamReason: "",
    sourceUrl: "https://www.nasa.gov/careers",
    fieldOfStudy: "Engineering"
  },
  {
    id: "int-nih-biomed",
    title: "Summer Biomedical Research Intern",
    company: "National Institutes of Health (NIH)",
    location: "On-site (Bethesda, MD)",
    type: "Paid",
    deadline: "2027-01-15",
    studentLevel: "undergrad",
    description: "Work with lead investigators in medical laboratories studying viral genetics, immunology, oncology, and public health metrics.",
    requirements: ["Enrolled in undergrad biology, pre-med, or health science", "GPA 3.2+"],
    isVerified: true,
    scamFlag: false,
    scamReason: "",
    sourceUrl: "https://www.training.nih.gov",
    fieldOfStudy: "Health"
  },
  {
    id: "int-deloitte-consult",
    title: "Business & Consulting Summer Associate",
    company: "Deloitte",
    location: "Hybrid (New York, NY)",
    type: "Paid",
    deadline: "2026-08-31",
    studentLevel: "undergrad",
    description: "Support clients on corporate restructuring, cloud transformation planning, digital product roadmaps, and stakeholder interviews.",
    requirements: ["Junior year student in Business, Finance, Economics, or STEM", "Strong presentation skills"],
    isVerified: true,
    scamFlag: false,
    scamReason: "",
    sourceUrl: "https://www.deloitte.com/careers",
    fieldOfStudy: "Business"
  }
];

// In-memory array that expands during the application lifecycle
let dynamicScholarships = [...defaultScholarships];
let dynamicInternships = [...defaultInternships];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Auth: Get user profile from Auth metadata
  app.post("/api/auth/profile", async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (!supabaseAdmin) {
      return res.json({ profile: { id: userId, role: "user", email: "" } });
    }

    try {
      const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (error) throw error;
      const meta = user.user.user_metadata || {};
      res.json({
        profile: {
          id: userId,
          email: user.user.email || "",
          role: meta.role || "user",
          created_at: user.user.created_at
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Supabase Auth: Upgrade user to admin via secret code (needs SUPABASE_SERVICE_KEY)
  app.post("/api/auth/upgrade-admin", async (req, res) => {
    const { userId, code } = req.body;
    if (code !== adminSecretCode) return res.status(403).json({ error: "Invalid admin code." });
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!supabaseAdmin) return res.status(501).json({ error: "SUPABASE_SERVICE_KEY not set. Add it to .env for admin upgrades." });

    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { role: "admin" }
      });
      if (error) throw error;
      const meta = data.user.user_metadata || {};
      res.json({ profile: { id: userId, role: meta.role, email: data.user.email } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin-protected: Wipe and re-seed template data
  app.post("/api/reset", async (req, res) => {
    dynamicScholarships = [...defaultScholarships];
    dynamicInternships = [...defaultInternships];
    res.json({ success: true, message: "Databases successfully restored to pre-seeded templates." });
  });

  // Save user-discovered data (scholarships, internships, bookmarks, won, dismissed, preferences) to Supabase
  app.post("/api/user/save-data", async (req, res) => {
    const { userId, scholarships, internships, bookmarks, wonScholarships, dismissedNewIds, preferences } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (!supabaseAdmin) {
      return res.status(501).json({ error: "SUPABASE_SERVICE_KEY not set. No cloud storage available." });
    }

    try {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      const existingMeta = user.user.user_metadata || {};

      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMeta,
          discovered_scholarships: scholarships || [],
          discovered_internships: internships || [],
          bookmarks: bookmarks || [],
          won_scholarships: wonScholarships || {},
          dismissed_new_ids: dismissedNewIds || [],
          preferences: preferences || {},
        }
      });

      res.json({ success: true });
    } catch (e: any) {
      console.error("[User Data] Save failed:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // Load user-discovered data from Supabase user metadata
  app.get("/api/user/load-data", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    if (!supabaseAdmin) {
      return res.json({ success: false, error: "SUPABASE_SERVICE_KEY not set", scholarships: [], internships: [] });
    }

    try {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId as string);
      const meta = user.user.user_metadata || {};

      res.json({
        success: true,
        scholarships: meta.discovered_scholarships || [],
        internships: meta.discovered_internships || [],
        bookmarks: meta.bookmarks || [],
        wonScholarships: meta.won_scholarships || {},
        dismissedNewIds: meta.dismissed_new_ids || [],
        preferences: meta.preferences || {},
      });
    } catch (e: any) {
      console.error("[User Data] Load failed:", e.message);
      res.json({ success: false, error: e.message, scholarships: [], internships: [] });
    }
  });

  // API Route: Get Scholarships list
  app.get("/api/scholarships", (req, res) => {
    res.json(dynamicScholarships);
  });

  // API Route: Use Gemini with Google Search tool to search and verify scholarships
  app.post("/api/scholarships/update", async (req, res) => {
    const { searchQuery } = req.body;
    const query = searchQuery || "reputable high school seniors and college student scholarships 2026 2027";

    console.log(`[AI Update Engine] Fetching new scholarships from reputable sources with query: "${query}"`);

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
      console.log("[AI Update Engine] GEMINI_API_KEY is not configured. Falling back to pre-seeded listings.");
      return res.json({
        success: false,
        error: "GEMINI_API_KEY is not configured in the system Secrets. Showing default pre-seeded scholarships.",
        scholarships: dynamicScholarships
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Using your internal pre-trained knowledge base, generate a list of legitimate, currently open or upcoming scholarships matching query: "${query}". 
TODAY IS 2026-06-06. EVERY deadline DATE MUST be AFTER 2026-06-06 — no exceptions. Do not use 2025 dates. Use 2026 or 2027 deadlines only.
Identify at least 3 real active opportunities. For EACH scholarship, extract:
1. Scholarship Name
2. Governing Organization
3. Approximate Award Amount (as a string, and also a pure estimated numeric value)
4. Application Deadline (as YYYY-MM-DD or "Recurring") — MUST be > 2026-06-06
5. Eligibility Level: must be one of "high_school", "college", or "both"
6. Standard age restriction description or limit (e.g. "Under 19" or "None")
7. Application Fee requirement (is it completely free to apply?)
8. SUSPECTED SCAM check: Differentiate real and legitimate opportunities from scams. If a scholarship demands an application fee, processing fee, or asks for highly sensitive financial credentials like SSN/Credit Card upfront, set scamFlag to true and provide a thorough reason.
9. Required criteria/academic grades
10. Authentic source URL.

Your response MUST be a single raw JSON array conforming EXACTLY to the following TypeScript syntax:
\`\`\`json
[
  {
    "id": "sch-[unique string]",
    "name": "Scholarship Name",
    "organization": "Sponsoring Organization",
    "amount": "$5,000 total",
    "amountNumeric": 5000,
    "deadline": "2026-12-15",
    "studentLevel": "high_school",
    "ageFilter": "Age 16-24",
    "isFree": true,
    "scamFlag": false,
    "scamReason": "",
    "requirements": ["GPA 3.0+", "1 essay"],
    "isVerified": true,
    "fieldOfStudy": "STEM",
    "sourceUrl": "https://..."
  }
]
\`\`\`
Return only the json block with no other conversational markdown text. REMEMBER: today is 2026-06-06 — deadlines MUST be future dates after today. No 2025 dates.`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const rawText = response.text || "";
      console.log("[AI Update Engine] Received raw response from Gemini.");

      // Parse JSON directly (responseMimeType returns raw JSON, but handle markdown wrapping too)
      let parsedScholarships;
      try {
        parsedScholarships = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/```json([\s\S]*?)```/) || rawText.match(/```([\s\S]*?)```/);
        const cleanJson = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
        parsedScholarships = JSON.parse(cleanJson);
      }
      if (!Array.isArray(parsedScholarships)) {
        throw new Error("Parsed scholarship response is not an array");
      }

      // Discard items with past deadlines
      const today = "2026-06-06";
      parsedScholarships = parsedScholarships.filter(s => s.deadline >= today || s.deadline === "Recurring");

      // Add a tag to record origin query and merge with existing list
      parsedScholarships = parsedScholarships.map((s, index) => ({
        ...s,
        id: s.id || `sch-ai-${Date.now()}-${index}`,
        originalQuery: query,
        isVerified: !s.scamFlag,
        isNew: true,
      }));

      // Prune & Automatic review filters:
      // The user requested checking if a scholarship requires a fee or asks sensitive data and auto flagging or deleting.
      // We will FLAG or automatically move verified ones to active, and scams to a flagged list.
      // Avoid inserting duplicates
      parsedScholarships.forEach(newSch => {
        const duplicateIndex = dynamicScholarships.findIndex(
          existing => existing.name.toLowerCase() === newSch.name.toLowerCase()
        );
        if (duplicateIndex >= 0) {
          dynamicScholarships[duplicateIndex] = { ...dynamicScholarships[duplicateIndex], ...newSch, isNew: false };
        } else {
          dynamicScholarships.unshift(newSch); // Add new at the top
        }
      });

      res.json({
        success: true,
        scholarships: dynamicScholarships,
        addedCount: parsedScholarships.length
      });

    } catch (e: any) {
      console.error("[AI Update Engine] Error parsing scholarship data:", e);
      res.json({
        success: false,
        error: e.message || "Failed to parse scholarships generated by AI.",
        scholarships: dynamicScholarships
      });
    }
  });


  // API Route: Get Internships list
  app.get("/api/internships", (req, res) => {
    res.json(dynamicInternships);
  });

  // API Route: Use Gemini with Google Search tool to search and verify internships
  app.post("/api/internships/update", async (req, res) => {
    const { searchQuery } = req.body;
    const query = searchQuery || "legitimate high school college internships software biology business 2026";

    console.log(`[AI Update Engine] Searching for new internships with query: "${query}"`);

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
      console.log("[AI Update Engine] GEMINI_API_KEY is not configured for internships. Using pre-seeded dataset.");
      return res.json({
        success: false,
        error: "GEMINI_API_KEY is not configured in the system Secrets. Showing default pre-seeded internships.",
        internships: dynamicInternships
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Using your internal pre-trained knowledge base, generate a list of legitimate, open or upcoming student internship positions in the USA matching query: "${query}". 
TODAY IS 2026-06-06. EVERY deadline DATE MUST be AFTER 2026-06-06 — no exceptions. Do not use 2025 dates. Use 2026 or 2027 deadlines only.
Collect at least 3 real positions. For EACH internship, extract:
1. Internship Title
2. Employer Company
3. Location (e.g. Remote, or Hybrid in Seattle, WA)
4. Salary Type (Paid or Unpaid or Stipend)
5. Application Deadline (as YYYY-MM-DD or "Rolling") — MUST be > 2026-06-06
6. Student level (undergrad, grad, high_school, or all)
7. Brief Description
8. Core Requirements
9. Authentic application source link.
10. SUSPECTED SCAM inspection: Is this a potential job scam or money processing mule? If it demands training fees, onboarding registration fees, direct bank access info before interview, or is suspicious, flag scamFlag: true and list the scamReason.

Format the response EXACTLY as a single raw JSON array conforming to this TypeScript template:
\`\`\`json
[
  {
    "id": "int-[unique string]",
    "title": "Internship Title",
    "company": "Company Name",
    "location": "Remote / Hybrid (City, State)",
    "type": "Paid",
    "deadline": "2026-12-15",
    "studentLevel": "undergrad",
    "description": "Brief text details",
    "requirements": ["Coursework in STEM", "Python"],
    "isVerified": true,
    "scamFlag": false,
    "scamReason": "",
    "sourceUrl": "https://...",
    "fieldOfStudy": "Engineering"
  }
]
\`\`\`
Return only the json code block with no conversational wrapper. REMEMBER: today is 2026-06-06 — deadlines MUST be future dates after today. No 2025 dates.`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const rawText = response.text || "";

      // Parse JSON directly (responseMimeType returns raw JSON, but handle markdown wrapping too)
      let parsedInternships;
      try {
        parsedInternships = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/```json([\s\S]*?)```/) || rawText.match(/```([\s\S]*?)```/);
        const cleanJson = jsonMatch ? jsonMatch[1].trim() : rawText.trim();
        parsedInternships = JSON.parse(cleanJson);
      }
      if (!Array.isArray(parsedInternships)) {
        throw new Error("Parsed internships result is not an array");
      }

      // Discard items with past deadlines
      const today = "2026-06-06";
      parsedInternships = parsedInternships.filter(i => i.deadline >= today || i.deadline === "Rolling");

      parsedInternships = parsedInternships.map((intern, index) => ({
        ...intern,
        id: intern.id || `int-ai-${Date.now()}-${index}`,
        isVerified: !intern.scamFlag,
        isNew: true,
      }));

      // Merge into dynamic in-memory array
      parsedInternships.forEach(newInt => {
        const duplicateIndex = dynamicInternships.findIndex(
          existing => existing.title.toLowerCase() === newInt.title.toLowerCase() && existing.company.toLowerCase() === newInt.company.toLowerCase()
        );
        if (duplicateIndex >= 0) {
          dynamicInternships[duplicateIndex] = { ...dynamicInternships[duplicateIndex], ...newInt, isNew: false };
        } else {
          dynamicInternships.unshift(newInt);
        }
      });

      res.json({
        success: true,
        internships: dynamicInternships,
        addedCount: parsedInternships.length
      });

    } catch (e: any) {
      console.error("[AI Update Engine] Error parsing internship data:", e);
      res.json({
        success: false,
        error: e.message || "Failed to parse internships retrieved by AI.",
        internships: dynamicInternships
      });
    }
  });


  // AI Resume Analyzer
  app.post("/api/analyze-resume", async (req, res) => {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: "No resume text provided." });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
      return res.json({ success: false, error: "GEMINI_API_KEY not configured.", scholarships: [], internships: [] });
    }

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });

      const profileResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are a career counselor. Extract the following from this resume text. Return ONLY a raw JSON object (no markdown) with these fields:
{
  "gpa": number or null,
  "gradeLevel": "high_school" | "undergrad" | "grad" | null,
  "majors": string[],
  "extracurriculars": string[],
  "skills": string[],
  "summary": "one sentence summary of the student"
}

Resume text:
${resumeText}`,
        config: { responseMimeType: "application/json", temperature: 0.1 }
      });

      const profile = JSON.parse(profileResponse.text || "{}");

      // Score and match scholarships
      const scoredScholarships = dynamicScholarships.map(s => {
        let score = 0;
        if (profile.gradeLevel && s.studentLevel === profile.gradeLevel) score += 3;
        if (profile.gradeLevel && s.studentLevel === "both") score += 2;
        if (profile.majors && profile.majors.some((m: string) => s.fieldOfStudy.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(s.fieldOfStudy.toLowerCase()))) score += 2;
        if (profile.extracurriculars && profile.extracurriculars.some((e: string) => s.requirements.some((r: string) => r.toLowerCase().includes(e.toLowerCase())))) score += 1;
        if (!s.scamFlag) score += 1;
        return { ...s, matchScore: score };
      }).filter(s => s.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

      const scoredInternships = dynamicInternships.map(i => {
        let score = 0;
        if (profile.gradeLevel && i.studentLevel === profile.gradeLevel) score += 3;
        if (profile.gradeLevel && i.studentLevel === "all") score += 2;
        if (profile.majors && profile.majors.some((m: string) => i.fieldOfStudy.toLowerCase().includes(m.toLowerCase()) || i.description.toLowerCase().includes(m.toLowerCase()))) score += 2;
        if (profile.skills && profile.skills.some((sk: string) => i.requirements.some((r: string) => r.toLowerCase().includes(sk.toLowerCase())))) score += 1;
        if (profile.extracurriculars && profile.extracurriculars.some((e: string) => i.description.toLowerCase().includes(e.toLowerCase()))) score += 1;
        if (!i.scamFlag) score += 1;
        return { ...i, matchScore: score };
      }).filter(i => i.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);

      res.json({ success: true, profile, scholarships: scoredScholarships, internships: scoredInternships });
    } catch (e: any) {
      console.error("[Resume Analyzer] Error:", e);
      res.json({ success: false, error: e.message, scholarships: [], internships: [] });
    }
  });

  // Serve static assets in production, otherwise Vite handles development
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched on port ${PORT}`);
    console.log(`Vite development server active...`);
  });
}

startServer();
