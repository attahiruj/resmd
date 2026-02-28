import React from 'react'
import type { TemplateDefinition, TemplateProps } from '@/types/resume'

const templates: TemplateDefinition[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design focused on content',
    category: 'minimal',
    isPro: false,
    thumbnail: '',
    component: React.lazy(() => import('@/components/templates/Minimal')) as React.ComponentType<TemplateProps>,
    pdfComponent: React.lazy(() => import('@/components/templates/pdf/Minimal')) as React.ComponentType<TemplateProps>,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with professional styling',
    category: 'professional',
    isPro: false,
    thumbnail: '',
    component: React.lazy(() => import('@/components/templates/Modern')) as React.ComponentType<TemplateProps>,
    pdfComponent: React.lazy(() => import('@/components/templates/pdf/Modern')) as React.ComponentType<TemplateProps>,
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Designed specifically for technical roles',
    category: 'technical',
    isPro: false,
    thumbnail: '',
    component: React.lazy(() => import('@/components/templates/Technical')) as React.ComponentType<TemplateProps>,
    pdfComponent: React.lazy(() => import('@/components/templates/pdf/Technical')) as React.ComponentType<TemplateProps>,
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Premium design for senior positions',
    category: 'professional',
    isPro: true,
    thumbnail: '',
    component: React.lazy(() => import('@/components/templates/Executive')) as React.ComponentType<TemplateProps>,
    pdfComponent: React.lazy(() => import('@/components/templates/pdf/Minimal')) as React.ComponentType<TemplateProps>,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic design for creative professionals',
    category: 'creative',
    isPro: true,
    thumbnail: '',
    component: React.lazy(() => import('@/components/templates/Creative')) as React.ComponentType<TemplateProps>,
    pdfComponent: React.lazy(() => import('@/components/templates/pdf/Minimal')) as React.ComponentType<TemplateProps>,
  },
]

export function getAllTemplates(): TemplateDefinition[] {
  return templates
}

export function getTemplate(id: string): TemplateDefinition | null {
  return templates.find(t => t.id === id) ?? null
}

export function getFreeTemplates(): TemplateDefinition[] {
  return templates.filter(t => !t.isPro)
}

// Server-safe: dynamic import (no React.lazy) for use in API routes / renderToBuffer
export async function getPdfComponent(templateId: string): Promise<React.ComponentType<TemplateProps>> {
  switch (templateId) {
    case 'modern':
      return (await import('@/components/templates/pdf/Modern')).default
    case 'technical':
      return (await import('@/components/templates/pdf/Technical')).default
    case 'minimal':
    default:
      return (await import('@/components/templates/pdf/Minimal')).default
  }
}
