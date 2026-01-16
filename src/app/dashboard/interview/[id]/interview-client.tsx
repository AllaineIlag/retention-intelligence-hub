'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExitAnswer {
  id: string;
  question_id: string;
  original_value: string | string[];
  verified_value: string | string[] | null;
  questions: {
    question_text: string;
    type: string;
    options: string[] | null;
  };
}

interface Resignation {
  id: string;
  status: string;
  last_working_day: string | null;
  scheduled_interview_date: string | null;
  profiles: {
    email: string;
    full_name: string | null;
  };
  exit_answers: ExitAnswer[];
}

export default function InterviewClient({ resignationId }: { resignationId: string }) {
  const router = useRouter();
  const [resignation, setResignation] = useState<Resignation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifiedAnswers, setVerifiedAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/interview/${resignationId}`);
        const data = await res.json();
        setResignation(data.resignation);

        // Initialize verified answers
        const verified: Record<string, string | string[]> = {};
        data.resignation?.exit_answers?.forEach((ans: ExitAnswer) => {
          verified[ans.id] = ans.verified_value ?? ans.original_value;
        });
        setVerifiedAnswers(verified);
      } catch {
        console.error('Failed to fetch interview data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resignationId]);

  const handleVerify = (answerId: string, value: string | string[]) => {
    setVerifiedAnswers(prev => ({ ...prev, [answerId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const verified_answers = Object.entries(verifiedAnswers).map(([id, verified_value]) => ({
        id,
        verified_value,
      }));

      await fetch(`/api/interview/${resignationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified_answers }),
      });
    } catch {
      console.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      await fetch(`/api/interview/${resignationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      router.push('/dashboard/queue');
    } catch {
      console.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading interview data...</div>;
  }

  if (!resignation) {
    return <div className="text-red-400">Interview not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Interview Verification</h1>
          <p className="text-gray-400">
            {resignation.profiles?.full_name || resignation.profiles?.email}
          </p>
        </div>
        <div className="flex gap-4">
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              resignation.status === 'pending'
                ? 'bg-yellow-900/50 text-yellow-300'
                : resignation.status === 'approved'
                  ? 'bg-green-900/50 text-green-300'
                  : resignation.status === 'completed'
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-gray-700 text-gray-300'
            }`}
          >
            {resignation.status}
          </span>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exit Interview Answers</h2>
        {resignation.exit_answers?.map(answer => (
          <div key={answer.id} className="rounded-xl bg-gray-800 p-6">
            <p className="text-sm text-gray-400">{answer.questions?.question_text}</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Original Answer */}
              <div>
                <p className="text-xs uppercase text-gray-500">Employee Response</p>
                <p className="mt-1 text-white">
                  {Array.isArray(answer.original_value)
                    ? answer.original_value.join(', ')
                    : answer.original_value || '(No answer)'}
                </p>
              </div>

              {/* Verified Answer */}
              <div>
                <p className="text-xs uppercase text-gray-500">Verified Response</p>
                {answer.questions?.type === 'text' ? (
                  <input
                    type="text"
                    value={(verifiedAnswers[answer.id] as string) || ''}
                    onChange={e => handleVerify(answer.id, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                  />
                ) : (
                  <select
                    value={(verifiedAnswers[answer.id] as string) || ''}
                    onChange={e => handleVerify(answer.id, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                  >
                    {answer.questions?.options?.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between border-t border-gray-700 pt-6">
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-gray-700 px-6 py-2 text-white"
        >
          Back
        </button>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Verifications'}
          </button>

          {resignation.status === 'approved' && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={saving}
              className="rounded-lg bg-green-600 px-6 py-2 text-white disabled:opacity-50"
            >
              Mark Complete
            </button>
          )}

          {resignation.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('approved')}
                disabled={saving}
                className="rounded-lg bg-green-600 px-6 py-2 text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange('declined')}
                disabled={saving}
                className="rounded-lg bg-red-600 px-6 py-2 text-white disabled:opacity-50"
              >
                Decline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
