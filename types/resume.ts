import React from 'react';

export interface ResumeSettings {
  fontSize?: number; // pt — base font size, default 10
  lineHeight?: number; // ratio, default 1.5
  marginH?: number; // left & right page margin (pt), default 50
  marginV?: number; // top & bottom page margin (pt), default 40
  entrySpacing?: number; // margin-bottom between entries (pt), default 8
}

export const DEFAULT_SETTINGS: Required<ResumeSettings> = {
  fontSize: 10,
  lineHeight: 1.5,
  marginH: 50,
  marginV: 40,
  entrySpacing: 8,
};

/** Resolved settings with all fields guaranteed */
export type RequiredResumeSettings = Required<ResumeSettings>;

export interface ParsedResume {
  sections: ResumeSection[];
  meta: ResumeMeta;
  raw: string;
  settings: ResumeSettings;
}

export interface ResumeMeta {
  name: string | null;
  email: string | null;
  title: string | null;
}

export interface ResumeSection {
  id: string;
  title: string;
  hint: SectionHint;
  items: SectionItem[];
}

export type SectionHint = 'keyvalue' | 'entries' | 'list' | 'text' | 'mixed';

export type SectionItem = KeyValueItem | EntryItem | BulletItem | TextItem;

export interface KeyValueItem {
  kind: 'keyvalue';
  key: string;
  value: string;
}

export interface EntryItem {
  kind: 'entry';
  raw: string;
  heading: string;
  role: string | null;
  organization: string | null;
  meta: string[];
  children: SectionItem[];
}

export interface BulletItem {
  kind: 'bullet';
  text: string;
}

export interface TextItem {
  kind: 'text';
  text: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'professional' | 'creative' | 'technical' | 'academic';
  thumbnail: string;
  component: React.ComponentType<TemplateProps>;
  pdfComponent: React.ComponentType<TemplateProps>;
}

export interface TemplateProps {
  resume: ParsedResume;
  /** When false, the template omits the name/title/contact header (for pages 2+) */
  showHeader?: boolean;
}

export interface ResumeVariant {
  id: string;
  userId: string;
  title: string;
  rawContent: string;
  templateId: string;
  clonedFromId: string | null;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
}
