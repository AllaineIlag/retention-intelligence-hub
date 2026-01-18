import { Question } from "@/constants/questions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionCardProps {
  question: Question;
  value: string | number | string[] | undefined;
  onChange: (value: string | number | string[]) => void;
  error?: string;
}

export function QuestionCard({
  question,
  value,
  onChange,
  error,
}: QuestionCardProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {question.text}
        </h2>
        {question.required && (
          <p className="text-sm text-zinc-500">* Required</p>
        )}
      </div>

      <div className="pt-4">{renderInput(question, value, onChange)}</div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-red-500/90"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function renderInput(
  question: Question,
  value: string | number | string[] | undefined,
  onChange: (val: string | number | string[]) => void,
) {
  switch (question.type) {
    case "text":
      return (
        <Textarea
          placeholder="Type your answer here..."
          className="min-h-[150px] border-zinc-700 bg-zinc-900/50 text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-zinc-600"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "scale":
      return (
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={cn(
                "group relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-xl font-bold transition-all sm:h-20 sm:w-20",
                value === num
                  ? "border-white bg-white text-black shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300",
              )}
            >
              {num}
              {value === num && (
                <motion.div
                  layoutId="scale-indicator"
                  className="absolute inset-0 rounded-2xl bg-white/20 blur-xl"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
          <div className="flex justify-between px-2 text-xs text-zinc-500 sm:hidden">
            <span>Dissatisfied</span>
            <span>Satisfied</span>
          </div>
        </div>
      );
    case "select":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options?.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={cn(
                "flex items-center justify-start rounded-xl border p-4 text-left transition-all",
                value === option
                  ? "border-white bg-white font-semibold text-black shadow-lg"
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      );
    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 border-zinc-700 bg-zinc-900/50 text-lg"
        />
      );
  }
}
