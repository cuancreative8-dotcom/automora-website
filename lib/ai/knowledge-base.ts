import { readFile } from "node:fs/promises";
import path from "node:path";

const KNOWLEDGE_BASE_FILES = [
  "01_company_profile.md",
  "02_brand_guideline.md",
  "03_services.md",
  "04_product_knowledge.md",
  "05_business_problems.md",
  "06_recommendation_engine.md",
  "07_conversation_flow.md",
  "08_escalation_rules.md",
  "09_faq.md",
  "10_ai_personality.md",
  "11_prompt_system.md",
  "12_n8n_workflow.md",
] as const;

export type KnowledgeBaseDocument =
  (typeof KNOWLEDGE_BASE_FILES)[number];

export type KnowledgeBase = Record<
  KnowledgeBaseDocument,
  string
>;

const KNOWLEDGE_BASE_DIR = path.join(
  process.cwd(),
  "knowledge-base"
);

/**
 * Membaca seluruh dokumen Knowledge Base AutoMora.
 *
 * Fungsi ini hanya digunakan di sisi server.
 * Dokumen Knowledge Base tidak dikirim langsung ke browser.
 */
export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  const documents = await Promise.all(
    KNOWLEDGE_BASE_FILES.map(async (fileName) => {
      const filePath = path.join(
        KNOWLEDGE_BASE_DIR,
        fileName
      );

      const content = await readFile(filePath, "utf-8");

      return [fileName, content] as const;
    })
  );

  return Object.fromEntries(documents) as KnowledgeBase;
}

/**
 * Menggabungkan seluruh Knowledge Base menjadi
 * satu konteks teks untuk AI Engine.
 */
export async function getKnowledgeBaseContext(): Promise<string> {
  const knowledgeBase = await loadKnowledgeBase();

  return KNOWLEDGE_BASE_FILES.map((fileName) => {
    return [
      `===== ${fileName} =====`,
      knowledgeBase[fileName].trim(),
    ].join("\n");
  }).join("\n\n");
}