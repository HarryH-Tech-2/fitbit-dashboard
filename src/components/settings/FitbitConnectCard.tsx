import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Link, Unlink, User, ExternalLink } from 'lucide-react';
import type { FitbitProfile } from '../../types/fitbit';

interface Props {
  connected: boolean;
  profile: FitbitProfile | null;
  clientId: string;
  error: string | null;
  onClientIdChange: (id: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const baseUrl = window.location.origin + window.location.pathname;
const termsUrl = window.location.origin + '/terms.html';
const privacyUrl = window.location.origin + '/privacy.html';

const REGISTRATION_FIELDS: { label: string; hint: string; copyable?: boolean; important?: boolean }[] = [
  { label: 'Application Name', hint: 'e.g. "My Workout Timer"' },
  { label: 'Description', hint: 'e.g. "Interval timer with heart rate tracking"' },
  { label: 'Application Website URL', hint: baseUrl, copyable: true },
  { label: 'Organization', hint: 'Your name or organization' },
  { label: 'Organization Website URL', hint: baseUrl, copyable: true },
  { label: 'Terms of Service URL', hint: termsUrl, copyable: true },
  { label: 'Privacy Policy URL', hint: privacyUrl, copyable: true },
  { label: 'OAuth 2.0 Application Type', hint: 'Select "Personal"', important: true },
  { label: 'Redirect URL', hint: baseUrl, copyable: true, important: true },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-600 active:scale-95 transition-all"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function FitbitConnectCard({
  connected,
  profile,
  clientId,
  error,
  onClientIdChange,
  onConnect,
  onDisconnect,
}: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Fitbit Integration</h3>

      {connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <User size={20} className="text-slate-400" />
            )}
            <span className="text-sm font-medium">
              {profile?.displayName ?? 'Connected'}
            </span>
          </div>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 active:scale-95 transition-transform"
          >
            <Unlink size={14} />
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-750 transition-colors"
          >
            <span>Setup guide: Register a Fitbit app</span>
            {guideOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {guideOpen && (
            <div className="rounded-lg bg-slate-800/60 p-3 space-y-3">
              <a
                href="https://dev.fitbit.com/apps/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300"
              >
                Open Fitbit App Registration
                <ExternalLink size={11} />
              </a>

              <div className="space-y-2">
                {REGISTRATION_FIELDS.map(({ label, hint, copyable, important }) => (
                  <div key={label} className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">{label}</span>
                      {important && (
                        <span className="rounded bg-teal-900/50 px-1 py-px text-[9px] text-teal-400">
                          important
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-300">
                        {hint}
                      </code>
                      {copyable && <CopyButton text={hint} />}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500">
                After registering, copy the <strong className="text-slate-400">Client ID</strong> and paste it below.
              </p>
            </div>
          )}

          <input
            type="text"
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            placeholder="Fitbit Client ID (e.g. 23ABCD)"
            className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-slate-600"
          />
          <button
            onClick={onConnect}
            disabled={!clientId}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 active:scale-95 transition-transform"
          >
            <Link size={14} />
            Connect Fitbit
          </button>
          {error && <p className="text-xs text-interval">{error}</p>}
        </div>
      )}
    </div>
  );
}
