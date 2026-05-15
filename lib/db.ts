import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Profile = {
  name: string;
  role: string;
  email: string;
  github: string;
  linkedin: string;
};

export type Project = {
  title: string;
  stack: string[];
  copy: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type Database = {
  profile: Profile;
  skills: string[];
  projects: Project[];
  messages: ContactMessage[];
};

const dbPath = path.join(process.cwd(), "data", "db.json");

async function readDatabase(): Promise<Database> {
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw) as Database;
}

async function writeDatabase(database: Database) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

export async function getPortfolioData() {
  const database = await readDatabase();

  return {
    profile: database.profile,
    skills: database.skills,
    projects: database.projects,
  };
}

export async function saveContactMessage(input: Omit<ContactMessage, "id" | "createdAt">) {
  const database = await readDatabase();
  const message: ContactMessage = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  database.messages.unshift(message);
  await writeDatabase(database);

  return message;
}
