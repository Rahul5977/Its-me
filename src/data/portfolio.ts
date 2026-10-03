// Single source of truth for the portfolio. Sourced from github.com/Rahul5977 (repos, READMEs, orgs).

export const profile = {
  name: "Rahul Raj",
  handle: "Rahul5977",
  role: "AI/ML + Full-Stack Engineer",
  institute: "IIT Bhilai",
  degree: "B.Tech, Data Science & Artificial Intelligence",
  location: "Bhilai, India",
  email: "rahul.raj9237@gmail.com",
  avatar: "https://avatars.githubusercontent.com/u/138022836?v=4",
  tagline: "I turn rough ideas into production-grade products.",
  bio: "I build AI systems that behave like real software: agents with guardrails, RAG that grades its own evidence, and backends that survive a 100× traffic spike. I spent summer 2026 as an AI Intern at SuperLiving, I competed for IIT Bhilai at Inter IIT Tech Meet 14.0, I maintain projects at OpenLake (IIT Bhilai's open-source club), and I'm now building MiniClaw, a security-first local AI agent.",
  philosophy: "ship real products, not toy demos",
  roles: [
    "AI/ML + Full-Stack Engineer",
    "Agentic RAG tinkerer",
    "Realtime & scalable backends",
    "Open-source maintainer @ OpenLake",
    "350+ LeetCode problem solver",
  ],
  socials: {
    github: "https://github.com/Rahul5977",
    linkedin: "https://www.linkedin.com/in/rahul-raj-iitbh/",
    leetcode: "https://leetcode.com/u/Rahul_Raj_99/",
    hashnode: "https://hashnode.com/@rajcode45",
  },
};

export const stats = [
  { label: "GitHub contributions / yr", value: 1430, suffix: "+" },
  { label: "Repositories", value: 90, suffix: "+" },
  { label: "LeetCode solved", value: 350, suffix: "+" },
  { label: "Students mentored", value: 100, suffix: "+" },
];

export type ProjectStatus = "Live" | "Building" | "Shipped" | "Design phase";
export type ProjectCategory = "AI Agents" | "Full Stack" | "NLP / ML" | "Systems";

export interface Project {
  id: string;
  name: string;
  kicker: string;
  description: string;
  highlights: string[];
  stack: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  year: string;
  /** HSL triplet used for the card glow. */
  glow: string;
  metrics?: { value: string; label: string }[];
  links: { github?: string; live?: string; note?: string };
}

export const nowBuilding = {
  name: "VeriMem",
  kicker: "NLP · fact-checking agent",
  description:
    "A fact-checking agent that verifies real-world claims against live web evidence. It grades every piece of evidence before trusting it (CRAG), learns from its own past verifications through a fine-tuned model (ExpRAG), and is stress-tested against deliberately poisoned sources and memories.",
  pipeline: ["claim", "retrieve", "grade (CRAG)", "recall (ExpRAG)", "verdict"],
  stack: ["Python", "LLMs", "CRAG", "ExpRAG", "Fine-tuning", "Web retrieval"],
  github: "https://github.com/Rahul5977/VeriMem",
};

export const featuredProjects: Project[] = [
  {
    id: "miniclaw",
    name: "MiniClaw",
    kicker: "Security-first personal AI agent",
    description:
      "A minimal, self-hosted AI agent that runs fully on your machine with local models via Ollama. It reads and writes files, runs shell commands and fetches the web, but only inside a sandboxed workspace, with explainable approvals and an undo button.",
    highlights: [
      "Agent loop with plan preview, per-step risk scoring and diff-based approvals",
      "/undo for every file change, plus a /panic emergency stop",
      "Memory inbox: the agent can only propose memories and warns on prompt injection",
      "Skills with permission manifests, and a Telegram + WhatsApp gateway with reminders",
    ],
    stack: ["TypeScript", "Bun", "Ollama", "SQLite", "Telegram API", "WhatsApp Cloud API"],
    category: "AI Agents",
    status: "Building",
    year: "2026",
    glow: "14 90% 60%",
    metrics: [
      { value: "5/8", label: "phases shipped" },
      { value: "100%", label: "local inference" },
      { value: "9", label: "safety features" },
    ],
    links: { github: "https://github.com/Rahul5977/MiniClaw" },
  },
  {
    id: "codearena",
    name: "CodeArena",
    kicker: "LeetCode-style competitive programming platform",
    description:
      "An online judge where people solve, submit and compete: sandboxed multi-language execution, timed contests with live leaderboards, curated DSA sheets, community discussions and an admin authoring suite.",
    highlights: [
      "Server-side verdicting, with hidden test cases that never leak to the client",
      "Isolated execution pipeline: a Judge0-compatible adapter over a self-hosted isolate sandbox",
      "ICPC-style contests with a live Socket.IO leaderboard",
      "Dockerized on AWS Lightsail behind Caddy (auto-TLS) and Cloudflare",
    ],
    stack: ["React 19", "Node.js", "Express", "Prisma", "PostgreSQL", "Socket.IO", "Docker", "Caddy"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "188 86% 53%",
    metrics: [
      { value: "5", label: "languages" },
      { value: "Live", label: "leaderboards" },
      { value: "AWS", label: "Lightsail" },
    ],
    links: { github: "https://github.com/Rahul5977/CodeArena", live: "https://codearena.kodexa.in" },
  },
  {
    id: "ai-ppt",
    name: "Kodexa AI-PPT",
    kicker: "A Gamma-class AI presentation SaaS",
    description:
      "Type a prompt and get a designed, editable, exportable slide deck. Generation runs asynchronously on a fleet of workers, an adaptive layout engine styles it, and an in-app AI agent refines it, all billed through a real subscription system.",
    highlights: [
      "Treats AI as untrusted infrastructure: circuit breakers, multi-provider fallback, daily spend kill-switch",
      "Durable, idempotent RabbitMQ jobs with progress streamed over SSE",
      "Adaptive layout engine, a deck-level AI agent, and PPTX export",
      "Better Auth, Paddle billing and quotas, with Prometheus + Grafana observability",
    ],
    stack: ["TanStack Start", "React 19", "Prisma 7", "RabbitMQ", "Redis", "Gemini + Imagen", "OpenAI", "Docker"],
    category: "AI Agents",
    status: "Building",
    year: "2026",
    glow: "258 90% 66%",
    metrics: [
      { value: "Multi", label: "LLM fallback" },
      { value: "Async", label: "worker fleet" },
      { value: "PPTX", label: "export" },
    ],
    links: { github: "https://github.com/Rahul5977/AI-Presentation-TanStack-Start" },
  },
  {
    id: "student-counselor",
    name: "For The Students · Counselor",
    kicker: "JEE / JoSAA counselling platform · Predict → Plan → Talk",
    description:
      "A rank-to-seat companion for the 8-week JoSAA window. It idles at about $0 for ten months and absorbs lakhs of students within minutes when a round result drops.",
    highlights: [
      "College predictor over 11,261 official JoSAA cutoffs across 121 institutes",
      "\"List Doctor\": a server-side checker that catches choice-ordering mistakes before lock-in",
      "Mentor marketplace for paid 1:1 video calls with verified seniors",
      "Serverless AWS (Lambda, DynamoDB, CloudFront, Cognito) with CDK, built for a 100× spike",
    ],
    stack: ["Next.js 14", "TypeScript", "AWS Lambda", "DynamoDB", "AWS CDK", "CloudFront"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "84 81% 55%",
    metrics: [
      { value: "11,261", label: "cutoffs" },
      { value: "<50ms", label: "p95 cache hit" },
      { value: "100×", label: "spike-ready" },
    ],
    links: { github: "https://github.com/Rahul5977/EngHub", live: "https://counsellor.kodexa.in/" },
  },
];

export const moreProjects: Project[] = [
  {
    id: "code-analyser",
    name: "Code-Analyser",
    kicker: "Multi-agent SAST platform",
    description:
      "A council of specialised ReAct agents on LangGraph that audits repos. Jobs are queued through BullMQ, progress streams into a live terminal, and the report ships with a Monaco diff of suggested fixes.",
    highlights: [],
    stack: ["TypeScript", "LangGraph", "BullMQ", "Redis", "React", "SSE"],
    category: "AI Agents",
    status: "Shipped",
    year: "2026",
    glow: "188 86% 53%",
    links: { github: "https://github.com/Rahul5977/Code-Analyser" },
  },
  {
    id: "saathi",
    name: "SAATHI",
    kicker: "Sentiment-aware peer-support assistant",
    description:
      "A culturally grounded Hinglish support bot for Indian students. Each turn runs safety screening → analyzer → phase/strategy → generation, with FAISS retrieval and Redis memory.",
    highlights: [],
    stack: ["Python", "FastAPI", "FAISS", "Redis", "WebSockets", "LLMs"],
    category: "NLP / ML",
    status: "Shipped",
    year: "2026",
    glow: "330 85% 62%",
    links: { github: "https://github.com/Rahul5977/SAATHI" },
  },
  {
    id: "nlp-toolkit",
    name: "NLP From Scratch",
    kicker: "Segmentation · POS · parsing · spelling",
    description:
      "Viterbi segmentation and HMM tagging for EN/ES (F1 0.958), an arc-standard dependency parser (LAS 0.75), a symmetric-delete spell checker (3.05× faster), and a live Streamlit grammar editor.",
    highlights: [],
    stack: ["Python", "NLTK", "scikit-learn", "PCFG", "Streamlit"],
    category: "NLP / ML",
    status: "Shipped",
    year: "2026",
    glow: "258 90% 66%",
    links: { note: "Private course repo" },
  },
  {
    id: "pond",
    name: "AI Pond Planner",
    kicker: "Geospatial AI for village water planning",
    description:
      "Draw a box on a satellite map and get terrain analysis, ranked pond sites, catchments, 45 years of rainfall stats and a costed design, served behind an nginx load balancer across 4 replicas.",
    highlights: [],
    stack: ["Python", "GIS / DEM", "Docker", "nginx", "CI"],
    category: "Systems",
    status: "Shipped",
    year: "2026",
    glow: "84 81% 55%",
    links: { github: "https://github.com/Rahul5977/AI-BasedPondAnalysis", live: "https://www.youtube.com/watch?v=MsWABr4THGA" },
  },
  {
    id: "codexa",
    name: "Codexa",
    kicker: "AI code-intelligence platform",
    description: "Repo-grounded chat and cross-file reference tracing over your codebase, using pgvector embeddings and LangChain.",
    highlights: [],
    stack: ["Next.js", "TypeScript", "LangChain", "pgvector"],
    category: "AI Agents",
    status: "Shipped",
    year: "2026",
    glow: "188 86% 53%",
    links: { github: "https://github.com/Rahul5977/Codexa-Client" },
  },
  {
    id: "ai-interviewer",
    name: "AI-Interviewer",
    kicker: "Realtime voice mock-interview simulator",
    description:
      "Streaming STT → LLM → TTS over WebRTC with LiveKit, agentic RAG for questions real companies have asked, MediaPipe proctoring and a rubric scorecard.",
    highlights: [],
    stack: ["LiveKit", "Python", "LangGraph", "pgvector", "WebRTC", "MediaPipe"],
    category: "AI Agents",
    status: "Design phase",
    year: "2026",
    glow: "14 90% 60%",
    links: { note: "Architecture phase" },
  },
  {
    id: "research-buddy",
    name: "Research Buddy",
    kicker: "Autonomous research-paper agent",
    description:
      "Turns a PDF into a structured booklet with summaries and citations, then opens a RAG chat over it. Uses a LangGraph supervisor. Built for the Intra IIT Tech Meet.",
    highlights: [],
    stack: ["Python", "LangGraph", "FastAPI", "unstructured", "RAG"],
    category: "AI Agents",
    status: "Shipped",
    year: "2025",
    glow: "258 90% 66%",
    links: { github: "https://github.com/Rahul5977/Research-Buddy" },
  },
  {
    id: "campusride",
    name: "CampusRide",
    kicker: "Realtime ride-sharing for IIT Bhilai",
    description: "Find the exact group to share a cab or auto with, then coordinate over realtime WebSocket chat.",
    highlights: [],
    stack: ["Next.js", "Node.js", "PostgreSQL", "WebSockets"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "84 81% 55%",
    links: { github: "https://github.com/Rahul5977/CampusRide", live: "https://campus-ride-bay.vercel.app" },
  },
  {
    id: "ascent",
    name: "Ascent",
    kicker: "DSA placement-prep tracker",
    description:
      "381 curated LeetCode/GfG problems across 21 phases, with a completion ring, pace curve, activity heatmap and contest rating tracker.",
    highlights: [],
    stack: ["React", "Vite", "Charts"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "188 86% 53%",
    links: { github: "https://github.com/Rahul5977/OneDay", live: "https://rahul5977.github.io/OneDay/" },
  },
  {
    id: "jossa",
    name: "JoSAA Choice Planner",
    kicker: "Drag-to-rank counselling planner",
    description:
      "Accessible drag-and-drop choice ordering with per-card safety badges, home-state warnings, and CSV/JSON import and export. No backend needed.",
    highlights: [],
    stack: ["Next.js", "TypeScript", "dnd-kit", "Tailwind"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "84 81% 55%",
    links: { live: "https://jossa-ebon.vercel.app" },
  },
  {
    id: "sentinel",
    name: "Sentinel-FOSS",
    kicker: "Multi-agent social-feed intelligence",
    description:
      "An end-to-end multi-agent engine that turns chaotic, high-volume social feeds into a prioritised, realtime geospatial dashboard.",
    highlights: [],
    stack: ["Multi-agent", "LLMs", "Geospatial", "Realtime"],
    category: "AI Agents",
    status: "Shipped",
    year: "2026",
    glow: "330 85% 62%",
    links: { github: "https://github.com/Rahul5977/Senital-FOSS" },
  },
  {
    id: "liftcode",
    name: "LiftCode",
    kicker: "Personal gym tracker",
    description: "A clean workout logger to plan splits, log sets and watch progressive overload over time.",
    highlights: [],
    stack: ["TypeScript", "React", "Vercel"],
    category: "Full Stack",
    status: "Live",
    year: "2026",
    glow: "14 90% 60%",
    links: { github: "https://github.com/Rahul5977/LiftCode", live: "https://v0-gym-workout-app-5w.vercel.app" },
  },
];

/** SuperLiving internship: engineering only, no product or business internals. */
export const internship = {
  role: "AI Intern",
  org: "SuperLiving",
  year: "Summer 2026",
  photos: [
    { src: "/photos/superliving-founders.jpg", caption: "With the founders", alt: "Rahul with the SuperLiving founders at the office" },
    { src: "/photos/superliving-team.jpg", caption: "The SuperLiving team", alt: "Rahul with the SuperLiving team at the office" },
  ],
  summary:
    "Over the summer, I designed and built an event-driven AI data platform from ingestion to dashboard: a pipeline of independent, queue-chained workers that turns raw social video into structured, queryable analytics. The rule throughout was that expensive AI work happens offline, so reads stay instant and cheap.",
  pipeline: [
    { id: "ingest", name: "Ingest", tech: "Platform APIs · key rotation", detail: "Pulls content from multiple social platforms, with API keys that auto-rotate when one hits its quota, so ingestion never stalls on a single limit." },
    { id: "normalize", name: "Normalize", tech: "Zod · Drizzle · Postgres", detail: "Each source is mapped into one normalized relational schema, with Zod contracts at every boundary and hand-authored SQL migrations." },
    { id: "transcribe", name: "Transcribe", tech: "FastAPI · Whisper · yt-dlp", detail: "A separate Python ASR microservice. If captions already exist it uses them and skips inference entirely; otherwise it runs a Hinglish-tuned Whisper Large-v3-Turbo, or the hosted API through a one-line switch." },
    { id: "tag", name: "AI-tag", tech: "LLM structured JSON", detail: "The LLM must return schema-constrained JSON, which is validated before it's written, so downstream analytics never ingest free-form text." },
    { id: "cluster", name: "Cluster", tech: "Embeddings · cron", detail: "Labels are embedded and grouped into emergent themes on a schedule. The categories come from the data instead of a hard-coded taxonomy." },
    { id: "aggregate", name: "Aggregate", tech: "Rollup tables · IST buckets", detail: "Time-series rollups (velocity, heatmaps, leaderboards) are precomputed into dedicated tables, bucketed by IST day." },
    { id: "serve", name: "Serve", tech: "Hono API · Redis cache", detail: "Dashboards read only from the rollups through a Redis cache. A page load never triggers an LLM call or a live aggregate." },
  ],
  decisions: [
    { title: "Queue-chained workers", body: "Each stage is its own BullMQ queue and enqueues the next when it finishes. Failures retry in isolation, and stages scale independently.", tag: "BullMQ · Redis" },
    { title: "AI off the read path", body: "LLM, ASR and clustering all run asynchronously. Reads hit precomputed rollups, so latency and cost stay flat as usage grows.", tag: "Rollups · cache" },
    { title: "Cheapest path first", body: "Use captions before ASR, and a local model before the paid API. Expensive inference only runs when it actually adds information.", tag: "Cost engineering" },
    { title: "Contracts everywhere", body: "Zod schemas guard every API and every LLM output, and SQL migrations are written by hand and reviewed, not auto-generated.", tag: "Zod · Drizzle" },
    { title: "Agent-ready analytics", body: "Analytics are also exposed as MCP tools, so AI agents can query the same data the dashboards use.", tag: "MCP" },
    { title: "Split deploy topology", body: "Docker Compose on EC2, with the ASR service on its own box so the GPU/CPU-heavy work never starves the API.", tag: "Docker · EC2" },
  ],
  stack: ["Next.js 16", "React 19", "TanStack Query", "Hono", "BullMQ", "Redis 7", "PostgreSQL 16", "Drizzle", "Zod", "FastAPI", "Whisper", "Transformers", "Docker", "AWS EC2", "MCP"],
  stats: [
    { value: "7", label: "pipeline stages" },
    { value: "10+", label: "async workers" },
    { value: "3", label: "deployables" },
    { value: "0", label: "LLM calls per page load" },
  ],
};

/** Inter IIT Tech Meet 14.0: sourced from the team's end-term report and repos. */
export const interIIT = {
  title: "Inter IIT Tech Meet 14.0",
  period: "December 2025",
  blurb:
    "The biggest stage for tech at the IITs: a week of high-stakes problem statements set by industry, judged by industry, built against the clock. I represented IIT Bhilai on two of them.",
  photos: [
    { src: "/photos/interiit-team-night.jpg", caption: "Team IIT Bhilai at Inter IIT 14.0", alt: "Rahul with IIT Bhilai teammates at Inter IIT Tech Meet 14.0" },
    { src: "/photos/interiit-badge.jpg", caption: "Participant ID · Pathway (HP3)", alt: "Rahul's Inter IIT Tech Meet 14.0 participant badge for the Pathway problem statement", position: "center 18%" },
    { src: "/photos/interiit-team.jpg", caption: "Between rounds", alt: "Rahul with IIT Bhilai teammates at Inter IIT Tech Meet 14.0" },
    { src: "/photos/interiit-rahul.jpg", caption: "Suited up for presentation day", alt: "Rahul in a suit at Inter IIT Tech Meet 14.0", position: "center 8%" },
  ],
  hp3: {
    code: "HP3",
    sponsor: "Pathway",
    name: "AEGIS",
    title: "Explainable multi-agent trading on a streaming engine",
    description:
      "A streaming-native trading assistant for retail investors. Market, news, social and filings feeds are fused in real time on Pathway. A PPO reinforcement-learning agent proposes allocations, then parallel “agentic cells” stress-test each pick in a three-round Bull vs. Bear debate before a validator agent signs off. Trades only go through when the RL signal and the agents agree, and an MCP server enforces exposure and risk limits.",
    flow: ["Pathway streams", "PPO allocator", "Bull vs Bear debate", "Validator", "MCP risk gate", "Execute"],
    highlights: [
      "Redis Streams decouple ingestion from four specialist agents (market, news, social, SEC) that run as independent consumer groups",
      "Online fine-tuning accepts a new model only if it beats the last one: 141 of 271 updates were accepted, with no degradation",
      "Parallel agentic cells cut the end-to-end cycle from 615 s to 73 s for 10 tickers",
      "Structured outputs, a validator agent and citation requirements guard against hallucination",
    ],
    metrics: [
      { value: "22.37%", label: "backtest return" },
      { value: "2.02", label: "Sharpe ratio" },
      { value: "8.4×", label: "faster pipeline" },
      { value: "15K/s", label: "events ingested" },
    ],
    stack: ["Pathway", "Redis Streams", "FinRL · PPO", "LLM agents", "MCP", "Alpaca", "Delta Lake", "Docker"],
    note: "3-month backtest window, Aug to Nov 2025",
  },
  np2: {
    code: "NP2",
    sponsor: "Jilo Health",
    name: "Non-invasive anemia screening",
    title: "Camera-only early screening for Tier-2/3 India",
    description:
      "Elderly people outside the metros rarely get early screening. We built an MVP that takes a single eye/eyelid photo, localises the eye with MediaPipe landmarks, segments the conjunctiva with OpenCV, and stores each job in the cloud for ML-based anemia risk prediction.",
    stack: ["React + TS", "FastAPI", "OpenCV", "MediaPipe", "Supabase", "Docker"],
    live: "https://jio-health.vercel.app",
  },
};

/** ForTheStudents (EngHub): the vision behind the JoSAA counselling platform. */
export const forTheStudents = {
  name: "ForTheStudents",
  live: "https://counsellor.kodexa.in/",
  github: "https://github.com/Rahul5977/EngHub",
  mission: "No student should lose a seat they earned because of a badly ordered list.",
  story:
    "Every year about 1.4 million students write JEE, then face JoSAA counselling. It's a multi-round process where you submit an ordered list of college–branch choices, and the algorithm gives you the highest one you clear. Order it badly and you can lose a seat you deserved, or a whole year. After mentoring 100+ JEE aspirants, I saw that this last mile mostly runs on guesswork, coaching-centre myths and expensive counsellors. ForTheStudents is my answer.",
  pillars: [
    { name: "Predict", body: "Enter your rank and see reachable colleges bucketed into Safe / Target / Reach, with your home-state quota applied and a calibrated chance %." },
    { name: "Plan", body: "Drag colleges into a choice list. The List Doctor flags the classic mistakes (no safe backups, a reach-heavy top, duplicates, a list that's too short) before you lock in." },
    { name: "Talk", body: "Book 1:1 video calls with verified seniors who are already studying at the colleges you're considering." },
  ],
  principles: [
    { title: "Official data only", body: "Every cutoff comes straight from the official JoSAA archive, 2020–2025. No third-party mirrors." },
    { title: "Explainable, not black-box", body: "Cutoffs are forecast with an ensemble of six classical estimators, each with an honest 80% uncertainty band. You can audit every number." },
    { title: "Built to stay cheap", body: "It costs about $0 to run in the ten idle months, yet it can absorb lakhs of students in the minutes after a result drops, so it can stay accessible." },
    { title: "Safe for minors", body: "Many users are under 18. There are no passwords to leak (sign-in goes through Cognito), access is role-based, and every action is audit-logged." },
  ],
  numbers: [
    { value: "1.4M", label: "JEE aspirants / year" },
    { value: "11,261", label: "official cutoffs" },
    { value: "121", label: "institutes covered" },
    { value: "≈$0", label: "idle running cost" },
  ],
  doctor: [
    { choice: "IIT Delhi · CSE", tag: "Reach", flag: null },
    { choice: "IIT Bombay · EE", tag: "Reach", flag: null },
    { choice: "IIT Madras · CSE", tag: "Reach", flag: "3 reaches stacked at the top" },
    { choice: "NIT Trichy · CSE", tag: "Target", flag: null },
    { choice: "NIT Trichy · CSE", tag: "Target", flag: "Duplicate choice" },
    { choice: "NIT Raipur · ECE", tag: "Safe", flag: "Only 1 safe backup — add more" },
  ],
};

export const experience = [
  {
    role: "AI Intern",
    org: "SuperLiving",
    period: "Summer 2026",
    type: "Internship",
    summary:
      "Engineered an event-driven AI data platform end to end: queue-chained workers, a pluggable Hinglish ASR microservice, schema-validated LLM pipelines, embedding clustering and precomputed analytics.",
    tags: ["Next.js", "Hono", "BullMQ", "Whisper", "PostgreSQL"],
  },
  {
    role: "HP3 + NP2 problem statements",
    org: "Inter IIT Tech Meet 14.0",
    period: "Dec 2025",
    type: "Competition",
    summary:
      "Represented IIT Bhilai on two problem statements: AEGIS, an explainable multi-agent trading system built on Pathway streaming (HP3), and an AI eye-image screening MVP for early anemia detection (NP2).",
    tags: ["Pathway", "Multi-agent", "RL (PPO)", "MCP", "Computer vision"],
  },
  {
    role: "Maintainer & Contributor",
    org: "OpenLake · Open Source Club, IIT Bhilai",
    period: "2025 — now",
    type: "Open Source",
    summary:
      "Shipped core Campus-Marketplace features (listing management, browse & search, club merch service, data models), and maintain projects across the OpenLake ecosystem.",
    tags: ["React", "Node.js", "MongoDB", "Code review"],
  },
  {
    role: "Developer",
    org: "DSAI Club · IIT Bhilai",
    period: "2025 — now",
    type: "Club",
    summary:
      "Designed the club's official website and built IntelliView (Google OAuth, resume parser, dashboard), an AI interview platform. Contributed to MerchMind and the AI/ML Compendium.",
    tags: ["TypeScript", "Next.js", "OAuth", "LLMs"],
  },
  {
    role: "Mentor",
    org: "Physics Wallah",
    period: "Earlier",
    type: "Mentorship",
    summary: "Mentored 100+ JEE aspirants. That's where the idea for the JoSAA counselling platform came from.",
    tags: ["Mentoring", "JEE"],
  },
  {
    role: "B.Tech, Data Science & AI",
    org: "Indian Institute of Technology Bhilai",
    period: "2023 — 2027",
    type: "Education",
    summary:
      "Coursework in NLP, ML, statistics, distributed systems and data visualisation. Inter IIT Tech Meet 14.0 contingent and Code Crusade winner.",
    tags: ["NLP", "ML", "Distributed Systems", "DSA"],
  },
];

export const achievements = [
  { title: "Code Crusade", detail: "Winner · IIT Bhilai", icon: "trophy" },
  { title: "JEE Advanced", detail: "AIR 5977", icon: "target" },
  { title: "JEE Mains", detail: "99.3 percentile", icon: "chart" },
  { title: "LeetCode", detail: "350+ problems solved", icon: "code" },
  { title: "Mentorship", detail: "100+ students mentored", icon: "users" },
  { title: "Inter IIT 14.0", detail: "HP3 (Pathway) + NP2 (Jilo Health)", icon: "medal" },
] as const;

export const skillGroups = [
  { name: "Languages", items: ["Python", "TypeScript", "JavaScript", "C++", "C", "SQL"] },
  { name: "Frontend", items: ["React 19", "Next.js", "TanStack Start", "Vite", "Tailwind", "Framer Motion"] },
  { name: "Backend", items: ["Node.js", "Express", "Hono", "FastAPI", "Socket.IO", "Bun"] },
  { name: "Data & Queues", items: ["PostgreSQL", "Prisma", "Drizzle", "Redis", "MongoDB", "DynamoDB", "RabbitMQ", "BullMQ"] },
  { name: "AI / ML", items: ["LangGraph", "LangChain", "RAG / CRAG", "pgvector", "FAISS", "PyTorch", "scikit-learn", "Whisper", "Ollama", "LiveKit"] },
  { name: "Cloud & DevOps", items: ["AWS", "AWS CDK", "Lambda", "Docker", "Caddy", "nginx", "Prometheus", "Grafana", "Linux"] },
];

export const marqueeTech = [
  "Python", "TypeScript", "React", "Next.js", "Node.js", "FastAPI", "LangGraph", "PostgreSQL",
  "Redis", "RabbitMQ", "Docker", "AWS", "PyTorch", "pgvector", "Ollama", "Socket.IO", "Prisma", "Bun",
];

export const openSource = [
  { repo: "OpenLake/Campus-Marketplace", title: "Listing management system core features", state: "merged" },
  { repo: "OpenLake/Campus-Marketplace", title: "Listing browse & search", state: "merged" },
  { repo: "OpenLake/Campus-Marketplace", title: "Club & society merch service", state: "merged" },
  { repo: "OpenLake/Campus-Marketplace", title: "[SPRINT-M25] feat: models created", state: "merged" },
  { repo: "dsai-iitbhilai/IntelliView", title: "Google OAuth, resume parser and dashboard", state: "merged" },
  { repo: "dsai-iitbhilai/DSAI-club-Website", title: "Official website design", state: "merged" },
];
