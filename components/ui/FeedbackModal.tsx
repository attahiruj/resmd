'use client';

import { useState } from 'react';
import { Star, X } from '@phosphor-icons/react';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message: message.trim() || null }),
      });
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setSubmitting(false);
      setDone(true);
      setTimeout(onClose, 1400);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text">
              {done ? 'Thanks for the feedback!' : 'How was your experience?'}
            </h2>
            {!done && (
              <p className="text-xs text-muted mt-0.5">
                Your first export is ready. Help us improve resmd.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-faint hover:text-text hover:bg-surface-2 transition-colors duration-150 -mt-0.5 -mr-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {done ? (
          <p className="text-xs text-muted text-center py-2">
            We really appreciate it.
          </p>
        ) : (
          <>
            {/* Star rating */}
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 transition-transform duration-100 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  <Star
                    size={26}
                    weight={(hovered || rating) >= star ? 'fill' : 'regular'}
                    className={
                      (hovered || rating) >= star
                        ? 'text-accent'
                        : 'text-border'
                    }
                  />
                </button>
              ))}
            </div>

            {/* Optional message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything specific? (optional)"
              rows={3}
              maxLength={500}
              className="w-full text-xs text-text bg-surface-2 border border-border rounded-lg px-3 py-2 resize-none outline-none focus:border-accent transition-colors duration-150 placeholder:text-faint"
            />

            <div className="flex items-center justify-between mt-3">
              <button
                onClick={onClose}
                className="text-xs text-muted hover:text-text transition-colors duration-150"
              >
                Maybe later
              </button>
              <button
                onClick={handleSubmit}
                disabled={!rating || submitting}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  !rating || submitting
                    ? 'bg-accent/40 text-accent-text/60 cursor-not-allowed'
                    : 'bg-accent text-accent-text hover:bg-accent-hover'
                }`}
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
