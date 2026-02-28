'use client'

import { useState } from 'react'

const STEPS = [
  {
    title: 'Write in ResMarkup',
    body: 'Your resume is plain text. Use # for sections, ## for entries, Key: Value for fields, and - for bullet points.',
    code: '# Bio\nName: Jane Smith\nEmail: jane@example.com\n\n# Experience\n## Engineer @ Stripe | 2022 – Now\n- Built core payments infrastructure',
  },
  {
    title: 'Preview live, swap templates',
    body: 'Every keystroke updates the preview instantly. Click the template name at the bottom of the preview to switch between designs — your content always stays the same.',
    code: null,
  },
  {
    title: 'Clone for every job',
    body: 'Clone any resume to create a tailored variant for a specific role. Each variant is fully independent — tweak one without affecting the others.',
    code: null,
  },
]

interface OnboardingModalProps {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('resmd_onboarded', '1')
      onClose()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Step progress bar */}
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-colors duration-200 ${
                i <= step ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <h2 className="text-sm font-semibold text-text mb-2">{current.title}</h2>
        <p className="text-xs text-muted leading-relaxed">{current.body}</p>

        {current.code && (
          <pre className="mt-4 text-xs font-mono text-secondary bg-surface-2 border border-border rounded-lg p-3 leading-5 whitespace-pre-wrap">
            {current.code}
          </pre>
        )}

        <div className="flex items-center justify-between mt-5">
          <span className="text-xs text-faint">{step + 1} / {STEPS.length}</span>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1.5 text-xs bg-accent text-accent-text rounded-lg hover:bg-accent-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
