'use client';

import { useEffect, useState } from 'react';

interface ExitAnswer {
  question_id: string;
  original_value: string | string[];
  verified_value: string | string[] | null;
  questions: {
    question_text: string;
  };
}

interface Record {
  id: string;
  status: string;
  last_working_day: string | null;
  completed_at: string | null;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
  };
  exit_answers: ExitAnswer[];
}

export default function RestrictedPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/restricted');
        const data = await res.json();
        setRecords(data.records || []);
      } catch {
        console.error('Failed to fetch restricted data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = () => {
    const data = records.map(r => ({
      name: r.profiles?.full_name,
      email: r.profiles?.email,
      completed: r.completed_at,
      last_day: r.last_working_day,
      answers: r.exit_answers.map(a => ({
        question: a.questions?.question_text,
        original: a.original_value,
        verified: a.verified_value,
      })),
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exit-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return <div className="text-white">Loading restricted data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-400">⚠️ Restricted PII Vault</h1>
          <p className="text-gray-400">Access to sensitive employee exit data</p>
        </div>
        <button
          onClick={handleExport}
          className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
        >
          Export All Data
        </button>
      </div>

      {/* Warning Banner */}
      <div className="rounded-lg border border-red-700 bg-red-900/30 p-4">
        <p className="text-sm text-red-300">
          ⚠️ This section contains unmasked PII. Access is logged. Handle data responsibly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Records List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Exit Records</h2>
          {records.length === 0 ? (
            <p className="text-gray-400">No completed records</p>
          ) : (
            records.map(record => (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`cursor-pointer rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700 ${
                  selectedRecord?.id === record.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <p className="font-medium text-white">{record.profiles?.full_name}</p>
                <p className="text-sm text-gray-400">{record.profiles?.email}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Completed:{' '}
                  {record.completed_at ? new Date(record.completed_at).toLocaleDateString() : '-'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Record Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Record Details</h2>
          {selectedRecord ? (
            <div className="space-y-4 rounded-lg bg-gray-800 p-6">
              <div className="border-b border-gray-700 pb-4">
                <p className="text-lg font-medium text-white">
                  {selectedRecord.profiles?.full_name}
                </p>
                <p className="text-gray-400">{selectedRecord.profiles?.email}</p>
                <p className="text-sm text-gray-500">ID: {selectedRecord.profiles?.id}</p>
              </div>

              <div className="space-y-3">
                {selectedRecord.exit_answers.map((answer, idx) => (
                  <div key={idx} className="rounded bg-gray-700 p-3">
                    <p className="text-xs text-gray-400">{answer.questions?.question_text}</p>
                    <p className="mt-1 text-white">
                      {(() => {
                        const val = answer.verified_value ?? answer.original_value;
                        if (Array.isArray(val)) return val.join(', ');
                        return val || '(No answer)';
                      })()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-800 p-6 text-center text-gray-400">
              Select a record to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
