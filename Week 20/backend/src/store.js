import { mkdir, readFile, writeFile, access } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function loadApplications(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await access(filePath);
  } catch {
    await writeFile(filePath, '[]\n', 'utf8');
  }

  const raw = await readFile(filePath, 'utf8');
  if (!raw.trim()) {
    return [];
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function saveApplications(filePath, applications) {
  await writeFile(filePath, `${JSON.stringify(applications, null, 2)}\n`, 'utf8');
}

export function createApplicationStore(filePath) {
  return {
    async listApplications() {
      return loadApplications(filePath);
    },
    async addApplication(payload) {
      const applications = await loadApplications(filePath);
      const application = {
        id: crypto.randomUUID(),
        status: 'received',
        submittedAt: new Date().toISOString(),
        ...payload,
      };

      applications.unshift(application);
      await saveApplications(filePath, applications);
      return application;
    },
  };
}