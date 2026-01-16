'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Answer } from '@/types/exit-form';

const TABS = ['Employee Information', 'Exit Questionnaires', 'Consent', 'Summary'];

export default function ExitFormPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [questionsRes, resignationRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/resignation'),
        ]);

        const questionsData = await questionsRes.json();
        const resignationData = await resignationRes.json();

        if (questionsData.questions) {
          setQuestions(questionsData.questions);
        }

        // Pre-fill answers if exists
        if (resignationData.resignation?.exit_answers) {
          const existingAnswers: Record<string, string | string[]> = {};
          resignationData.resignation.exit_answers.forEach(
            (ans: { question_id: string; original_value: string | string[] }) => {
              existingAnswers[ans.question_id] = ans.original_value;
            }
          );
          setAnswers(existingAnswers);
        }
      } catch {
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter visible questions based on conditional logic
  const visibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!q.depends_on_question_id || !q.condition_values) return true;

      const parentAnswer = answers[q.depends_on_question_id];
      if (!parentAnswer) return false;

      const parentValues = Array.isArray(parentAnswer) ? parentAnswer : [parentAnswer];
      return q.condition_values.some(cv => parentValues.includes(cv));
    });
  }, [questions, answers]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveProgress = async () => {
    const answersArray = Object.entries(answers).map(([question_id, value]) => ({
      question_id,
      value,
    }));

    await fetch('/api/resignation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersArray }),
    });
  };

  const handleSubmit = async () => {
    if (!consent) {
      setError('Please accept the terms and conditions');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Save answers first
      await handleSaveProgress();

      // Submit form
      const res = await fetch('/api/resignation/submit', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        router.push('/success');
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch {
      setError('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-white">Loading form...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white">Exit Interview Form</h1>

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-gray-700">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(index)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                currentTab === index
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8 rounded-xl bg-gray-900 p-6">
          {/* Tab 1: Employee Information */}
          {currentTab === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Employee Information</h2>
              <p className="text-gray-400">
                Your information is pre-filled from your account. Please verify it is correct.
              </p>
              <div className="rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-400">
                  This section will display read-only employee data.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Exit Questionnaires */}
          {currentTab === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Exit Questionnaires</h2>
              {visibleQuestions.map(question => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    {question.question_text}
                  </label>

                  {/* Radio */}
                  {question.type === 'radio' && question.options && (
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <label key={option} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={e => handleAnswerChange(question.id, e.target.value)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox */}
                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map(option => (
                        <label key={option} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            value={option}
                            checked={((answers[question.id] as string[]) || []).includes(option)}
                            onChange={e => {
                              const current = (answers[question.id] as string[]) || [];
                              const updated = e.target.checked
                                ? [...current, option]
                                : current.filter(v => v !== option);
                              handleAnswerChange(question.id, updated);
                            }}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Text */}
                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={(answers[question.id] as string) || ''}
                      onChange={e => handleAnswerChange(question.id, e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                      placeholder="Your answer..."
                    />
                  )}

                  {/* Scale */}
                  {question.type === 'scale' && question.options && (
                    <div className="flex flex-wrap gap-2">
                      {question.options.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, option)}
                          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                            answers[question.id] === option
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Consent */}
          {currentTab === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Terms and Consent</h2>
              <div className="rounded-lg bg-gray-800 p-4 text-sm text-gray-300">
                <p>
                  By checking the box below, I confirm that all information provided is accurate and
                  complete to the best of my knowledge. I understand that this exit interview data
                  will be used to improve workplace conditions and may be shared in anonymized form
                  for organizational analysis.
                </p>
              </div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="h-5 w-5 text-blue-600"
                />
                <span className="text-white">I agree to the terms and conditions</span>
              </label>
            </div>
          )}

          {/* Tab 4: Summary */}
          {currentTab === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Summary</h2>
              <p className="text-gray-400">Review your answers before submitting.</p>

              <div className="space-y-4">
                {visibleQuestions.map(question => (
                  <div key={question.id} className="rounded-lg bg-gray-800 p-4">
                    <p className="text-sm text-gray-400">{question.question_text}</p>
                    <p className="mt-1 text-white">
                      {Array.isArray(answers[question.id])
                        ? (answers[question.id] as string[]).join(', ')
                        : answers[question.id] || '(Not answered)'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-gray-800 p-4">
                <p className="text-sm text-gray-400">Consent</p>
                <p className={`mt-1 ${consent ? 'text-green-400' : 'text-red-400'}`}>
                  {consent ? '✓ Accepted' : '✗ Not accepted'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <div className="mt-4 rounded-lg bg-red-900/50 p-4 text-red-300">{error}</div>}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentTab(prev => Math.max(0, prev - 1))}
            disabled={currentTab === 0}
            className="rounded-lg bg-gray-700 px-6 py-2 text-white disabled:opacity-50"
          >
            Previous
          </button>

          {currentTab < TABS.length - 1 ? (
            <div className="flex gap-4">
              <button
                onClick={handleSaveProgress}
                className="rounded-lg bg-gray-600 px-6 py-2 text-white"
              >
                Save Progress
              </button>
              <button
                onClick={() => setCurrentTab(prev => prev + 1)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white"
              >
                Next
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !consent}
              className="rounded-lg bg-green-600 px-6 py-2 text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
