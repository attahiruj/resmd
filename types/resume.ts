
import React from 'react'

export interface ParsedResume {
  sections: ResumeSection[]
  meta: ResumeMeta
  raw: string
}

export interface ResumeMeta {
  name: string | null
  email: string | null
  title: string | null
}

export interface ResumeSection {
  id: string
  title: string
  hint: SectionHint
  items: SectionItem[]
}

export type SectionHint = 'keyvalue' | 'entries' | 'list' | 'text' | 'mixed'

export type SectionItem = KeyValueItem | EntryItem | BulletItem | TextItem

export interface KeyValueItem {
  kind: 'keyvalue'
  key: string
  value: string
}

export interface EntryItem {
  kind: 'entry'
  raw: string
  heading: string
  role: string | null
  organization: string | null
  meta: string[]
  children: SectionItem[]
}

export interface BulletItem {
  kind: 'bullet'
  text: string
}

export interface TextItem {
  kind: 'text'
  text: string
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  category: 'minimal' | 'professional' | 'creative' | 'technical' | 'academic'
  isPro: boolean
  thumbnail: string
  component: React.ComponentType<TemplateProps>
  pdfComponent: React.ComponentType<TemplateProps>
}

export interface TemplateProps {
  resume: ParsedResume
  isPro: boolean
}

export interface ResumeVariant {
  id: string
  userId: string
  title: string
  rawContent: string
  templateId: string
  forkedFromId: string | null
  isPublic: boolean
  publicSlug: string | null
  createdAt: string
  updatedAt: string
}

export interface VariantSnapshot {
  id: string
  variantId: string
  rawContent: string
  message: string
  templateId: string
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  isPro: boolean
  stripeCustomerId: string | null
  proExpiresAt: string | null
  aiUsageThisMonth: number
  createdAt: string
}