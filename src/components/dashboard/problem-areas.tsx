"use client";

import { AlertTriangle } from "lucide-react";

interface ProblemArea {
  question_id: string;
  text?: string;
  average_score: number;
}

interface ProblemAreasTableProps {
  data: ProblemArea[];
}

export function ProblemAreasTable({ data }: ProblemAreasTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
      <div className="border-b border-white/10 bg-white/5 p-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-white">Attention Required</h3>
        </div>
        <p className="text-xs text-zinc-500">
          Areas with lowest satisfaction scores (&lt; 3.5)
        </p>
      </div>

      <div className="p-0">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            No critical problem areas detected yet. Good job!
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Question / Topic</th>
                <th className="px-6 py-3 text-right font-medium">Avg Score</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((item) => (
                <tr key={item.question_id} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    {item.text || item.question_id}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-300">
                    {item.average_score.toFixed(1)} / 5.0
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full max-w-[80px] overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${
                            item.average_score < 3.0
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${(item.average_score / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
