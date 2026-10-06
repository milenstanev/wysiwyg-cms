"use client";

import { useState, FormEvent } from "react";

export interface ContactComponentProps {
  editable?: boolean;
}

/** Simple contact form (mailto). */
export function ContactComponent({ editable }: ContactComponentProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editable) return;
    const subject = encodeURIComponent(`Contact from ${name || "website"}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div data-component="contact" className="space-y-[var(--space-3)] max-w-md">
      {editable && (
        <p className="text-xs text-[var(--muted)]">Contact form (mailto on submit)</p>
      )}
      {sent && !editable ? (
        <p className="text-sm text-[var(--foreground)]" role="status">
          Opening your email client…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-[var(--space-3)]">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Name</span>
            <input
              type="text"
              required={!editable}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-[var(--space-1)] w-full border border-[var(--border)] rounded-lg px-[var(--space-3)] py-[var(--space-2)] bg-[var(--surface)]"
              aria-label="Your name"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              type="email"
              required={!editable}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-[var(--space-1)] w-full border border-[var(--border)] rounded-lg px-[var(--space-3)] py-[var(--space-2)] bg-[var(--surface)]"
              aria-label="Your email"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Message</span>
            <textarea
              required={!editable}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-[var(--space-1)] w-full border border-[var(--border)] rounded-lg px-[var(--space-3)] py-[var(--space-2)] bg-[var(--surface)]"
              aria-label="Your message"
            />
          </label>
          <button
            type="submit"
            disabled={editable}
            className="px-[var(--space-4)] py-[var(--space-2)] bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
