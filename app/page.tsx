"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const navItems = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "experience", label: "EXPERIENCE" },
  { id: "skills", label: "SKILLS" },
  { id: "projects", label: "PROJECTS" },
  { id: "contact", label: "CONTACT" },
];

const contact = {
  email: "qa.automation.engineer@example.com",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
};

type PortfolioData = {
  profile: typeof contact & {
    name: string;
    role: string;
  };
  skills: string[];
  projects: Project[];
};

type Project = {
  title: string;
  stack: string[];
  copy: string;
};

const timeline = [
  {
    year: "2025 — Present",
    title: "AI QA Automation Engineer",
    copy: "Designing intelligent automation layers, AI-assisted QA flows, API contracts, and resilient validation systems.",
    detail: "Focus: Playwright orchestration, AI test generation review, prompt security checks, cloud validation.",
  },
  {
    year: "2023 — 2025",
    title: "QA & Playwright Automation",
    copy: "Built stable UI and API suites for modern web platforms with fast feedback and clear release risk signals.",
    detail: "Focus: E2E flows, REST assertions, regression coverage, Dockerized execution, CI visibility.",
  },
];

const skills = [
  "Playwright",
  "TypeScript",
  "REST API",
  "AI Testing",
  "Docker",
  "Git",
  "Jenkins",
  "Linux",
  "Security Testing",
];

const projects: Project[] = [
  {
    title: "AI QA Dashboard",
    stack: ["AI QA", "React", "Metrics"],
    copy: "Signal-focused dashboard for test coverage, prompt risks, flaky flows, and automation health.",
  },
  {
    title: "Playwright Automation System",
    stack: ["Playwright", "TS", "CI"],
    copy: "Scalable E2E architecture with fixtures, page models, visual checks, and release smoke paths.",
  },
  {
    title: "Object Storage Testing",
    stack: ["API", "S3", "Cloud"],
    copy: "Validation suite for bucket flows, permissions, uploads, metadata, and edge-case object behavior.",
  },
  {
    title: "AI Assistant Security Testing",
    stack: ["Security", "LLM", "QA"],
    copy: "Adversarial prompt checks, data leakage scenarios, guardrail validation, and abuse-case coverage.",
  },
  {
    title: "Cloud Platform QA",
    stack: ["Docker", "Linux", "REST"],
    copy: "Regression strategy for platform services, role access, background jobs, and operational reliability.",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0 },
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useActiveSection() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.36em] text-white/54">
      <span className="h-px w-12 bg-oxide/80" />
      {children}
    </div>
  );
}

function TimelinePanel() {
  const [open, setOpen] = useState(0);

  return (
    <aside className="border-l border-white/34 pl-4 md:pl-5">
      <div className="mb-8 text-[10px] uppercase tracking-[0.24em] text-white/44">17/06/2016 - Present</div>
      <div className="space-y-6">
        {timeline.map((item, index) => (
          <motion.button
            key={item.title}
            type="button"
            aria-expanded={open === index}
            onClick={() => setOpen(open === index ? -1 : index)}
            whileHover={{ x: 6 }}
            className="group w-full border-y border-white/16 py-5 text-left transition-colors hover:border-oxide/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/52">{item.year}</div>
            <div className="mt-4 flex items-start gap-3">
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-white/70 text-[9px]">
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl leading-none tracking-[0.16em] md:text-2xl">{item.title}</h3>
                <p className="mt-4 text-xs leading-relaxed text-white/72">{item.copy}</p>
                <AnimatePresence>
                  {open === index ? (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-4 text-[11px] leading-relaxed text-white/48"
                    >
                      {item.detail}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <a
        href="/vyacheslav-rovensky-qa-cv.txt"
        download
        className="mt-10 inline-block border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-white/70 transition-colors hover:border-oxide hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
      >
        Download full CV
      </a>
    </aside>
  );
}

function OrbitalCore() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const reverse = useTransform(scrollYProgress, [0, 1], [0, -180]);

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[380px] place-items-center">
      <motion.div
        style={{ rotate }}
        className="absolute inset-[4%] rounded-full border border-white/24 shadow-redglow"
      >
        <span className="absolute left-[12%] top-[16%] h-px w-20 rotate-45 bg-white/42" />
        <span className="absolute bottom-[24%] right-[8%] h-px w-20 rotate-45 bg-white/42" />
      </motion.div>
      <motion.div style={{ rotate: reverse }} className="absolute inset-[14%] rounded-full border border-white/36" />
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.55, 0.86, 0.55] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[31%] rounded-full border border-oxide/50"
      />
      <div className="relative text-center">
        <div className="text-[clamp(4rem,9vw,6.5rem)] leading-none tracking-[-0.04em]">
          <span>Q</span>
          <span className="outlined-text">A</span>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.42em] text-white/56">Automation Matrix</div>
      </div>
      <motion.span
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-[7%] h-5 w-5 rotate-45 border-b border-r border-oxide"
      />
    </div>
  );
}

function RightNav({ active }: { active: string }) {
  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-8 hidden border-l border-white/26 pl-4 lg:block"
    >
      <div className="flex flex-col gap-5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="group flex items-center gap-3 text-left text-[10px] uppercase tracking-[0.18em] text-white/76 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
          >
            <span
              className={`size-2 rounded-full border transition-all ${
                active === item.id ? "border-oxide bg-oxide shadow-redglow" : "border-white/70 group-hover:border-oxide"
              }`}
            />
            <span className="transition-colors group-hover:text-oxide">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function AboutPanel() {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="clip-panel border border-white/18 bg-white/[0.045] p-6 shadow-panel backdrop-blur-xl md:p-8"
    >
      <SectionLabel>ABOUT ME</SectionLabel>
      <p className="max-w-2xl text-sm leading-7 text-white/76">
        Hi. I build QA automation systems that make releases less fragile: intelligent Playwright suites,
        API validation, risk-based coverage, CI feedback, and AI-assisted workflows that still keep human
        engineering judgment at the center.
      </p>
      <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.18em] text-white/58 sm:grid-cols-3">
        <span>Scalable test architecture</span>
        <span>Cloud platform validation</span>
        <span>Security-minded QA</span>
      </div>
      <motion.a
        href="#experience"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("experience");
        }}
        whileHover={{ x: 8 }}
        className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-white transition-colors hover:text-oxide focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
      >
        <span className="size-2 rounded-full border border-oxide" />
        Read More
      </motion.a>
    </motion.div>
  );
}

function ContactForm({ profile }: { profile: PortfolioData["profile"] }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(result?.error || "Message was not saved. Please try again.");
      setStatus("error");
      return;
    }

    setForm({ name: "", email: "", message: "" });
    setStatus("sent");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submitMessage} className="grid gap-3">
        <input
          required
          minLength={2}
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="border border-white/18 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white outline-none transition-colors placeholder:text-white/32 focus:border-oxide"
          placeholder="Name"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="border border-white/18 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white outline-none transition-colors placeholder:text-white/32 focus:border-oxide"
          placeholder="Email"
        />
        <textarea
          required
          minLength={10}
          rows={5}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="resize-none border border-white/18 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.14em] text-white outline-none transition-colors placeholder:text-white/32 focus:border-oxide"
          placeholder="Message"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="border border-oxide bg-oxide px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-1 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? "Sending" : "Send Message"}
        </button>
        {status === "sent" ? <p className="text-xs uppercase tracking-[0.18em] text-white/62">Message sent to email.</p> : null}
        {status === "error" ? <p className="text-xs leading-6 text-oxide">{error}</p> : null}
      </form>

      <div className="flex flex-col justify-end gap-5 text-sm leading-7 text-white/68">
        <p>Available for QA automation, Playwright architecture, AI QA workflows, API validation, and cloud platform testing.</p>
        <div className="flex flex-wrap gap-3">
          <a
            className="border border-white/18 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-oxide hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
            href={`mailto:${profile.email}?subject=QA%20Automation%20Project`}
          >
            Email
          </a>
          <a
            className="border border-white/18 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-oxide hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="border border-white/18 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/72 transition-colors hover:border-oxide hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const active = useActiveSection();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    profile: {
      name: "Vyacheslav Rovensky",
      role: "QA Automation Engineer",
      ...contact,
    },
    skills,
    projects,
  });

  useEffect(() => {
    fetch("/api/portfolio")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Portfolio API failed");
        }
        return response.json() as Promise<PortfolioData>;
      })
      .then(setPortfolio)
      .catch(() => {
        setPortfolio((current) => current);
      });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <motion.div className="fixed left-0 top-0 z-50 h-0.5 origin-left bg-oxide" style={{ scaleX }} />
      <div className="noise" />

      <section id="home" className="relative z-10 min-h-screen px-5 py-8 md:px-8 lg:px-12">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1340px] grid-cols-1 gap-8 md:grid-cols-[270px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_132px] xl:grid-cols-[310px_minmax(0,1fr)_148px]">
          <div className="order-2 md:order-1">
            <TimelinePanel />
          </div>

          <div className="order-1 grid overflow-hidden border border-white/26 bg-[#111413]/92 shadow-panel backdrop-blur-sm md:order-2">
            <div className="relative grid min-h-[640px] grid-rows-[auto_1fr_auto] p-5 md:p-8 lg:p-10">
              <div className="pointer-events-none absolute right-0 top-0 hidden h-20 w-20 bg-oxide/80 shadow-redglow md:block" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-white/30" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-white/30" />

              <header className="relative z-10 flex items-start justify-between gap-6 pr-20 md:pr-28">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.36em] text-white/54">Portfolio / QA Systems</div>
                  <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,5.8vw,5.9rem)] font-normal uppercase leading-[1.02] tracking-[0.08em]">
                    QA Automation Engineer
                  </h1>
                </div>
              </header>

              <div className="relative z-10 grid items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative z-10 max-w-sm">
                  <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/64">
                    <span className="size-2 rounded-full bg-oxide" />
                    About Me
                  </div>
                  <p className="text-sm leading-7 text-white/78">
                    Focused on intelligent automation, scalable testing systems, AI-assisted QA workflows, and
                    modern cloud platform validation.
                  </p>
                  <p className="mt-7 text-xs uppercase leading-6 tracking-[0.18em] text-white/48">
                    Playwright • AI QA • API Testing • Automation Architecture
                  </p>
                  <a
                    href="#about"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection("about");
                    }}
                    className="mt-9 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white transition-colors hover:text-oxide focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-oxide"
                  >
                    <span className="size-2 rounded-full border border-oxide" />
                    Read More
                  </a>
                </div>

                <motion.div>
                  <OrbitalCore />
                </motion.div>
              </div>

              <footer className="relative z-10 flex flex-col justify-between gap-5 border-t border-white/18 pt-5 text-[10px] uppercase tracking-[0.24em] text-white/48 sm:flex-row">
                <span>Automation / Validation / Security</span>
                <span>Scroll to inspect</span>
              </footer>
            </div>
          </div>

          <div className="order-3 hidden lg:block">
            <RightNav active={active} />
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>01 / SYSTEM PROFILE</SectionLabel>
            <h2 className="max-w-xl text-4xl uppercase leading-tight tracking-[0.14em] md:text-6xl">
              Intelligent QA for complex products.
            </h2>
          </div>
          <AboutPanel />
        </div>
      </section>

      <section id="experience" className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <SectionLabel>02 / EXPERIENCE</SectionLabel>
            <h2 className="text-4xl uppercase tracking-[0.14em] md:text-5xl">QA Automation Experience</h2>
          </div>
          <div className="grid gap-4">
            {timeline.map((item, index) => (
              <motion.article
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group clip-panel border border-white/16 bg-white/[0.035] p-6 transition-all hover:-translate-y-1 hover:border-oxide/70 hover:shadow-redglow"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <span className="text-xs uppercase tracking-[0.28em] text-white/52">{item.year}</span>
                  <span className="h-px flex-1 bg-white/14 md:mt-2" />
                  <span className="text-xs uppercase tracking-[0.22em] text-white/42">Node 0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-2xl uppercase tracking-[0.12em]">{item.title}</h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>03 / SKILLS</SectionLabel>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <h2 className="text-4xl uppercase leading-tight tracking-[0.14em] md:text-6xl">Technical surface area.</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  variants={reveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.035 }}
                  whileHover={{ y: -6 }}
                  className="group relative min-h-32 overflow-hidden border border-white/16 bg-[#111]/88 p-5"
                >
                  <span className="absolute right-0 top-0 h-7 w-10 bg-oxide/70 transition-all group-hover:w-16" aria-hidden="true" />
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/42">SKILL/{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-8 text-lg uppercase tracking-[0.12em]">{skill}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 border-y border-white/16 py-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel>04 / AI QA + PLAYWRIGHT</SectionLabel>
            <h2 className="text-4xl uppercase leading-tight tracking-[0.14em] md:text-5xl">
              Automation architecture with AI acceleration.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-white/70">
            <p>
              I use AI to draft scenarios, discover risk surfaces, summarize failures, and accelerate coverage
              mapping, then harden the output with deterministic Playwright tests and API-level assertions.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Prompt risk checks", "Trace-driven debugging", "API contract guards"].map((item) => (
                <div key={item} className="border border-white/14 p-4 text-xs uppercase tracking-[0.16em] text-white/62">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>05 / PROJECTS</SectionLabel>
          <h2 className="max-w-3xl text-4xl uppercase leading-tight tracking-[0.14em] md:text-6xl">
            Interactive quality systems.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {portfolio.projects.map((project, index) => (
              <motion.article
                key={project.title}
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.06 }}
                whileHover={{ scale: 1.018 }}
                className={`group relative overflow-hidden border border-white/16 bg-white/[0.035] p-6 transition-colors hover:border-oxide/70 ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-oxide transition-transform duration-500 group-hover:scale-x-100" />
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-2xl uppercase tracking-[0.12em]">{project.title}</h3>
                  <span className="h-px w-16 shrink-0 bg-oxide/90" aria-hidden="true" />
                </div>
                <p className="mt-8 max-w-2xl text-sm leading-7 text-white/68">{project.copy}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {project.stack.map((tag) => (
                    <span key={tag} className="border border-white/18 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 px-5 py-24 md:px-12">
        <div className="mx-auto max-w-6xl border border-white/18 bg-[#121212]/86 p-7 shadow-panel md:p-10">
          <SectionLabel>06 / CONTACT</SectionLabel>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <h2 className="text-4xl uppercase leading-tight tracking-[0.14em] md:text-6xl">
              Ready to validate the next platform.
            </h2>
            <ContactForm profile={portfolio.profile} />
          </div>
        </div>
      </section>
    </main>
  );
}
