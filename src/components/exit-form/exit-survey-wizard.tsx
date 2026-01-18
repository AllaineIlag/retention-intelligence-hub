"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/constants/questions";
import { QuestionCard } from "@/components/exit-form/question-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check } from "lucide-react";

interface ExitSurveyWizardProps {
  questions: Question[];
  employeeName: string;
  token: string;
}

export function ExitSurveyWizard({
  questions,
  employeeName,
  token,
}: ExitSurveyWizardProps) {
  // const router = useRouter(); // Unused
  const [currentStep, setCurrentStep] = useState(-1); // -1 is the intro screen
  const [answers, setAnswers] = useState<
    Record<string, string | number | string[]>
  >({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string | number | string[]) => {
    setError(undefined);
    if (currentStep >= 0) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    }
  };

  const handleNext = async () => {
    // Validation
    if (currentStep >= 0) {
      if (currentQuestion.required && !answers[currentQuestion.id]) {
        setError("Please provide an answer to continue.");
        return;
      }
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit
      await submitForm();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/exit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });

      if (!response.ok) throw new Error("Submission failed");

      setIsCompleted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[50vh] flex-col items-center justify-center text-center text-white"
      >
        <div className="mb-6 rounded-full bg-green-500/10 p-8 ring-1 ring-green-500/50">
          <Check className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="mb-2 text-3xl font-bold">
          Thank You, {employeeName.split(" ")[0]}
        </h2>
        <p className="max-w-md text-zinc-400">
          Your feedback has been securely vaulted. We wish you the absolute best
          in your next chapter.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-16">
      {/* Intro Screen */}
      <AnimatePresence mode="wait">
        {currentStep === -1 ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-start space-y-6"
          >
            <div className="space-y-2">
              <span className="text-sm font-semibold tracking-widest text-blue-400 uppercase">
                Exit Interview
              </span>
              <h1 className="text-4xl leading-tight font-bold text-white md:text-5xl">
                Departure Protocol
              </h1>
              <p className="max-w-lg text-lg text-zinc-400">
                Hello, {employeeName}. Before you disconnect, we ask for your
                candid feedback. Your insights shape the future of the floor.
              </p>
            </div>
            <Button
              size="lg"
              className="mt-8 h-14 rounded-full px-8 text-lg font-semibold"
              onClick={() => setCurrentStep(0)}
            >
              Begin Session
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {/* Progress Bar */}
            <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <QuestionCard
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
              error={error}
            />

            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-300"
              >
                Back
              </button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="group h-12 rounded-full px-6"
              >
                {currentStep === questions.length - 1 ? (
                  isSubmitting ? (
                    "Submitting..."
                  ) : (
                    "Complete"
                  )
                ) : (
                  <>
                    Next{" "}
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
