import type { Resume, UserProfile } from '@/types/resume';
import { getDbProvider } from '@/lib/db/server';

export const createResume = (
  userId: string,
  title: string,
  rawContent: string,
  templateId: string
): Promise<Resume> =>
  getDbProvider().createResume(userId, title, rawContent, templateId);

export const updateResumeContent = (
  resumeId: string,
  rawContent: string,
  templateId: string,
  title?: string
): Promise<void> =>
  getDbProvider().updateResumeContent(resumeId, rawContent, templateId, title);

export const getUserResumes = (userId: string): Promise<Resume[]> =>
  getDbProvider().getUserResumes(userId);

export const getResume = (resumeId: string): Promise<Resume | null> =>
  getDbProvider().getResume(resumeId);

export const cloneResume = (
  sourceResumeId: string,
  newTitle: string,
  userId: string
): Promise<Resume> =>
  getDbProvider().cloneResume(sourceResumeId, newTitle, userId);

export const deleteResume = (resumeId: string): Promise<void> =>
  getDbProvider().deleteResume(resumeId);

export const getResumeBySlug = (slug: string): Promise<Resume | null> =>
  getDbProvider().getResumeBySlug(slug);

export const getUserProfile = (userId: string): Promise<UserProfile | null> =>
  getDbProvider().getUserProfile(userId);
