"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { api } from "../../convex/_generated/api";

type PlayerIdState = "loading" | string;
const playerIdStorageKey = "did-you-know.playerId";

function subscribeToPlayerId() {
  return () => {};
}

function getServerPlayerIdSnapshot(): PlayerIdState {
  return "loading";
}

function getOrCreatePlayerId() {
  const existing = window.localStorage.getItem(playerIdStorageKey);

  if (existing) {
    return existing;
  }

  const playerId = window.crypto.randomUUID();
  window.localStorage.setItem(playerIdStorageKey, playerId);
  return playerId;
}

function getClientPlayerIdSnapshot(): PlayerIdState {
  if (typeof window === "undefined") {
    return "loading";
  }

  return getOrCreatePlayerId();
}

export function DirectDropFlow() {
  const playerId = useSyncExternalStore(
    subscribeToPlayerId,
    getClientPlayerIdSnapshot,
    getServerPlayerIdSnapshot,
  );

  if (playerId === "loading") {
    return <ShellLoading />;
  }

  return <DirectDropFlowInner playerId={playerId} />;
}

function DirectDropFlowInner({ playerId }: { playerId: string }) {
  const flowState = useQuery(api.directFlow.getFlowState, { playerId });
  const startAttempt = useMutation(api.directFlow.startAttempt);
  const submitAnswer = useMutation(api.directFlow.submitAnswer);
  const continueAfterReveal = useMutation(api.directFlow.continueAfterReveal);
  const [isPending, startTransition] = useTransition();
  const [committedAnswer, setCommittedAnswer] = useState<{
    questionId: string;
    optionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (flowState === undefined) {
    return <ShellLoading />;
  }

  if (!flowState.drop) {
    return (
      <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
            Did You Know?
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            No Space challenge is live yet.
          </h1>
        </section>
      </main>
    );
  }

  if (!flowState.attemptState) {
    return (
      <HomeScreen
        drop={flowState.drop}
        disabled={isPending}
        error={error}
        onPlay={() => {
          setError(null);
          startTransition(async () => {
            try {
              await startAttempt({ playerId });
            } catch {
              setError("Could not start the challenge. Please try again.");
            }
          });
        }}
      />
    );
  }

  if (flowState.attemptState.attempt.stage === "result") {
    return (
      <ResultScreen
        drop={flowState.drop}
        score={flowState.attemptState.result?.score ?? 0}
        total={flowState.drop.questionCount}
      />
    );
  }

  const question = flowState.attemptState.currentQuestion;

  if (!question) {
    return <ShellLoading />;
  }

  return (
    <PlayScreen
      areaTitle={flowState.drop.area.title}
      question={question}
      questionIndex={flowState.attemptState.attempt.currentQuestionIndex}
      questionCount={flowState.drop.questionCount}
      reveal={flowState.attemptState.reveal}
      committedOptionId={
        committedAnswer?.questionId === question.id
          ? committedAnswer.optionId
          : null
      }
      disabled={isPending}
      error={error}
      onSubmit={(selectedOptionId) => {
        setCommittedAnswer({ questionId: question.id, optionId: selectedOptionId });
        setError(null);
        startTransition(async () => {
          try {
            await submitAnswer({
              playerId,
              questionId: question.id,
              selectedOptionId,
            });
          } catch {
            setCommittedAnswer(null);
            setError("Could not save that answer. Please try again.");
          }
        });
      }}
      onContinue={() => {
        setError(null);
        startTransition(async () => {
          try {
            await continueAfterReveal({ playerId });
          } catch {
            setError("Could not continue. Please try again.");
          }
        });
      }}
    />
  );
}

function HomeScreen({
  drop,
  disabled,
  error,
  onPlay,
}: {
  drop: PublicDrop;
  disabled: boolean;
  error: string | null;
  onPlay: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
          Test what you know. Then see if your friends know better.
        </h1>
        <div className="mt-8 border-y border-[#d8cdbd] py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3b6b82]">
            {drop.topic.title}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug">
            {drop.title}
          </h2>
          <p className="mt-3 text-base text-[#6d6255]">{drop.questionCount} questions</p>
        </div>
        <button
          className="mt-8 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={onPlay}
          type="button"
        >
          {disabled ? "Starting..." : "Play"}
        </button>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}

function PlayScreen({
  areaTitle,
  question,
  questionIndex,
  questionCount,
  reveal,
  committedOptionId,
  disabled,
  error,
  onSubmit,
  onContinue,
}: {
  areaTitle: string;
  question: PublicQuestion;
  questionIndex: number;
  questionCount: number;
  reveal: Reveal | null;
  committedOptionId: string | null;
  disabled: boolean;
  error: string | null;
  onSubmit: (selectedOptionId: string) => void;
  onContinue: () => void;
}) {
  const isReveal = reveal !== null;
  const selectedOptionId = reveal?.selectedOptionId ?? committedOptionId;

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-6 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#6d6255]">{areaTitle}</p>
          <ProgressIndicator
            currentIndex={questionIndex}
            isReveal={isReveal}
            total={questionCount}
          />
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <h1 className="text-3xl font-semibold leading-tight tracking-normal">
            {question.prompt}
          </h1>

          <div className="mt-8 grid gap-3">
            {question.options.map((option) => (
              <AnswerButton
                correctOptionId={reveal?.correctOptionId ?? null}
                disabled={disabled || isReveal || committedOptionId !== null}
                isCommitted={selectedOptionId === option.id}
                isCorrect={reveal?.correctOptionId === option.id}
                isReveal={isReveal}
                key={option.id}
                label={option.label}
                onClick={() => onSubmit(option.id)}
              />
            ))}
          </div>

          {isReveal ? (
            <RevealPanel
              isCorrect={reveal.correct}
              questionIndex={questionIndex}
              questionCount={questionCount}
              reveal={reveal}
              onContinue={onContinue}
              disabled={disabled}
            />
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function ProgressIndicator({
  currentIndex,
  isReveal,
  total,
}: {
  currentIndex: number;
  isReveal: boolean;
  total: number;
}) {
  return (
    <div
      aria-label={`Question ${currentIndex + 1} of ${total}`}
      className="flex items-center gap-2 text-sm font-medium text-[#6d6255]"
    >
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const isCompleted = index < currentIndex || (index === currentIndex && isReveal);
          const isCurrent = index === currentIndex && !isReveal;

          return (
            <span
              className={[
                "block h-2.5 w-2.5 rounded-full border",
                isCompleted
                  ? "border-[#2f6f4e] bg-[#2f6f4e]"
                  : isCurrent
                    ? "border-[#15262f] bg-transparent ring-2 ring-[#15262f]/20"
                    : "border-[#c7bcad] bg-transparent",
              ].join(" ")}
              key={index}
            />
          );
        })}
      </div>
      <span>
        {currentIndex + 1}/{total}
      </span>
    </div>
  );
}

function AnswerButton({
  label,
  isReveal,
  isCommitted,
  isCorrect,
  correctOptionId,
  disabled,
  onClick,
}: {
  label: string;
  isReveal: boolean;
  isCommitted: boolean;
  isCorrect: boolean;
  correctOptionId: string | null;
  disabled: boolean;
  onClick: () => void;
}) {
  const isWrongCommitted = isReveal && isCommitted && !isCorrect;
  const status = useMemo(() => {
    if (!isReveal) {
      return isCommitted ? "Your answer" : null;
    }
    if (isCorrect && isCommitted) {
      return "Correct - your answer";
    }
    if (isCorrect) {
      return "Correct";
    }
    if (isWrongCommitted) {
      return "Your answer";
    }
    return null;
  }, [isCommitted, isCorrect, isReveal, isWrongCommitted]);

  return (
    <button
      className={[
        "min-h-16 w-full rounded-lg border px-4 py-3 text-left text-base font-medium transition focus:outline-none focus:ring-4 focus:ring-[#8fb7c9]",
        isReveal
          ? "cursor-default"
          : "bg-white hover:border-[#15262f] hover:bg-[#fffaf2]",
        isCommitted && !isReveal ? "border-[#15262f] bg-[#fffaf2]" : "",
        isCorrect ? "border-[#2f6f4e] bg-[#eef8f1] text-[#173d29]" : "",
        isWrongCommitted ? "border-[#b55d4a] bg-[#fff4ef] text-[#663226]" : "",
        !isCommitted && !isCorrect ? "border-[#d8cdbd] bg-white" : "",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {status ? (
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em]">
            {status}
          </span>
        ) : null}
      </span>
      {isReveal && isCorrect && correctOptionId ? (
        <span className="sr-only">This is the correct answer.</span>
      ) : null}
    </button>
  );
}

function RevealPanel({
  isCorrect,
  questionIndex,
  questionCount,
  reveal,
  disabled,
  onContinue,
}: {
  isCorrect: boolean;
  questionIndex: number;
  questionCount: number;
  reveal: Reveal;
  disabled: boolean;
  onContinue: () => void;
}) {
  return (
    <section className="mt-6 border-t border-[#d8cdbd] pt-5">
      <p className="text-xl font-semibold">
        {isCorrect ? "You knew it." : "You didn't know."}
      </p>
      <p className="mt-3 text-base leading-7 text-[#51483d]">
        {reveal.explanation}
      </p>
      <a
        className="mt-4 inline-flex text-sm font-medium text-[#3b6b82] underline-offset-4 hover:underline"
        href={reveal.source.url}
        rel="noreferrer"
        target="_blank"
      >
        Source: {reveal.source.label}
      </a>
      <button
        className="mt-6 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onContinue}
        type="button"
      >
        {questionIndex === questionCount - 1 ? "See result" : "Next question"}
      </button>
    </section>
  );
}

function ResultScreen({
  drop,
  score,
  total,
}: {
  drop: PublicDrop;
  score: number;
  total: number;
}) {
  const challengeCopy =
    score === total
      ? `Think someone can match your ${score}/${total}?`
      : `Think someone can beat your ${score}/${total}?`;

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Result
        </p>
        <h1 className="mt-4 text-7xl font-semibold tracking-normal">
          {score}/{total}
        </h1>
        <p className="mt-5 text-xl leading-8">
          You knew {score} of {total} on this {drop.topic.title} challenge.
        </p>
        <p className="mt-5 text-base font-medium text-[#6d6255]">
          {drop.title}
        </p>
        <div className="mt-10">
          <p className="text-lg font-semibold">{challengeCopy}</p>
          <button
            className="mt-4 min-h-14 w-full rounded-lg border border-[#b9ab98] bg-[#ebe2d5] px-5 text-base font-semibold text-[#6d6255]"
            disabled
            type="button"
          >
            Challenge a friend - coming in M2
          </button>
          <button
            className="mt-3 min-h-12 w-full text-base font-semibold text-[#3b6b82]"
            disabled
            type="button"
          >
            Your Space Journey - coming later
          </button>
        </div>
      </section>
    </main>
  );
}

function ShellLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ec] px-5 text-[#221b14]">
      <p className="text-sm font-medium text-[#6d6255]">Loading...</p>
    </main>
  );
}

type PublicDrop = {
  id: string;
  topic: {
    id: string;
    title: string;
  };
  area: {
    id: string;
    title: string;
  };
  title: string;
  teaser: string;
  questionCount: number;
};

type PublicQuestion = {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
  }[];
};

type Reveal = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  correct: boolean;
  explanation: string;
  source: {
    label: string;
    url: string;
  };
};
