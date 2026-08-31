"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { api } from "../../convex/_generated/api";

type PlayerIdState = "loading" | string;
type ShareState = "closed" | "name" | "choices";

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

export function DirectDropFlow({ inviteId }: { inviteId?: string }) {
  const playerId = useSyncExternalStore(
    subscribeToPlayerId,
    getClientPlayerIdSnapshot,
    getServerPlayerIdSnapshot,
  );

  if (playerId === "loading") {
    return <ShellLoading />;
  }

  return <DropFlowInner inviteId={inviteId} playerId={playerId} />;
}

function DropFlowInner({
  inviteId,
  playerId,
}: {
  inviteId?: string;
  playerId: string;
}) {
  const directFlowState = useQuery(
    api.directFlow.getFlowState,
    inviteId ? "skip" : { playerId },
  );
  const inviteFlowState = useQuery(
    api.directFlow.getInviteFlowState,
    inviteId ? { playerId, inviteId } : "skip",
  );
  const flowState = inviteId ? inviteFlowState : directFlowState;
  const startAttempt = useMutation(api.directFlow.startAttempt);
  const submitAnswer = useMutation(api.directFlow.submitAnswer);
  const continueAfterReveal = useMutation(api.directFlow.continueAfterReveal);
  const setDisplayName = useMutation(api.directFlow.setDisplayName);
  const getOrCreateInvite = useMutation(api.directFlow.getOrCreateInvite);
  const [isPending, startTransition] = useTransition();
  const [committedAnswer, setCommittedAnswer] = useState<{
    questionId: string;
    optionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>("closed");
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  if (flowState === undefined) {
    return <ShellLoading />;
  }

  if ("invalidInvite" in flowState && flowState.invalidInvite) {
    return <InvalidInviteScreen />;
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

  const challenger = flowState.challenger ?? null;

  const handleStart = () => {
    setError(null);
    startTransition(async () => {
      try {
        await startAttempt({ playerId, inviteId });
      } catch {
        setError("Could not start the challenge. Please try again.");
      }
    });
  };

  const ensureInvite = async () => {
    const origin = window.location.origin;
    const result = await getOrCreateInvite({
      playerId,
      dropId: flowState.drop.id,
      origin,
    });
    setShareMessage(result.invite.message);
    return result.invite;
  };

  const openShareChoices = () => {
    setError(null);
    setCopyStatus(null);
    setShareMessage(null);

    if (!flowState.player?.displayName) {
      setShareState("name");
      return;
    }

    startTransition(async () => {
      try {
        await ensureInvite();
        setShareState("choices");
      } catch {
        setError("Could not prepare your invite. Please try again.");
      }
    });
  };

  const saveNameAndContinue = (displayName: string) => {
    setError(null);
    setCopyStatus(null);
    startTransition(async () => {
      try {
        await setDisplayName({ playerId, displayName });
        await ensureInvite();
        setShareState("choices");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not save your name. Please try again.",
        );
      }
    });
  };

  const copyInvite = () => {
    if (!shareMessage) {
      setError("Could not copy that invite. Please try again.");
      return;
    }

    startTransition(async () => {
      try {
        await copyText(shareMessage);
        setCopyStatus("Invite copied");
      } catch {
        setError("Could not copy that invite. Please try again.");
      }
    });
  };

  const openWhatsApp = () => {
    if (!shareMessage) {
      setError("Could not open WhatsApp. Please try again.");
      return;
    }

    window.location.href = `https://wa.me/?text=${encodeURIComponent(
      shareMessage,
    )}`;
  };

  if (!flowState.attemptState) {
    if (challenger) {
      return (
        <InviteLandingScreen
          challenger={challenger}
          disabled={isPending}
          drop={flowState.drop}
          error={error}
          onStart={handleStart}
        />
      );
    }

    return (
      <HomeScreen
        disabled={isPending}
        drop={flowState.drop}
        error={error}
        onPlay={handleStart}
      />
    );
  }

  if (flowState.attemptState.attempt.stage === "result") {
    return (
      <>
        <ResultScreen
          challenger={challenger}
          disabled={isPending}
          drop={flowState.drop}
          error={error}
          onChallenge={openShareChoices}
          score={flowState.attemptState.result?.score ?? 0}
          total={flowState.drop.questionCount}
        />
        {shareState === "name" ? (
          <NameCaptureSheet
            disabled={isPending}
            error={error}
            onClose={() => setShareState("closed")}
            onSubmit={saveNameAndContinue}
          />
        ) : null}
        {shareState === "choices" ? (
          <ShareChoiceSheet
            copyStatus={copyStatus}
            disabled={isPending}
            onClose={() => setShareState("closed")}
            onCopy={copyInvite}
            onWhatsApp={openWhatsApp}
            score={flowState.attemptState.result?.score ?? 0}
            topicTitle={flowState.drop.topic.title}
            total={flowState.drop.questionCount}
          />
        ) : null}
      </>
    );
  }

  const question = flowState.attemptState.currentQuestion;

  if (!question) {
    return <ShellLoading />;
  }

  return (
    <PlayScreen
      areaTitle={flowState.drop.area.title}
      committedOptionId={
        committedAnswer?.questionId === question.id
          ? committedAnswer.optionId
          : null
      }
      disabled={isPending}
      error={error}
      onContinue={() => {
        setError(null);
        startTransition(async () => {
          try {
            await continueAfterReveal({
              playerId,
              dropId: flowState.drop.id,
            });
          } catch {
            setError("Could not continue. Please try again.");
          }
        });
      }}
      onSubmit={(selectedOptionId) => {
        setCommittedAnswer({
          questionId: question.id,
          optionId: selectedOptionId,
        });
        setError(null);
        startTransition(async () => {
          try {
            await submitAnswer({
              playerId,
              dropId: flowState.drop.id,
              questionId: question.id,
              selectedOptionId,
            });
          } catch {
            setCommittedAnswer(null);
            setError("Could not save that answer. Please try again.");
          }
        });
      }}
      question={question}
      questionCount={flowState.drop.questionCount}
      questionIndex={flowState.attemptState.attempt.currentQuestionIndex}
      reveal={flowState.attemptState.reveal}
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
          <p className="mt-3 text-base text-[#6d6255]">
            {drop.questionCount} questions
          </p>
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

function InviteLandingScreen({
  challenger,
  drop,
  disabled,
  error,
  onStart,
}: {
  challenger: Challenger;
  drop: PublicDrop;
  disabled: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const prompt =
    challenger.result.score === challenger.result.total
      ? "Can you match that?"
      : "Can you beat that?";

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
          {challenger.displayName} challenged you on {drop.topic.title}
        </h1>
        <p className="mt-5 text-2xl font-semibold text-[#3b6b82]">
          {challenger.displayName} got {challenger.result.score}/
          {challenger.result.total}
        </p>
        <p className="mt-3 text-xl font-semibold">{prompt}</p>
        <div className="mt-8 border-y border-[#d8cdbd] py-6">
          <h2 className="text-2xl font-semibold leading-snug">{drop.title}</h2>
          <p className="mt-3 text-base text-[#6d6255]">
            {drop.questionCount} questions. Learn something after every answer.
          </p>
        </div>
        <button
          className="mt-8 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={onStart}
          type="button"
        >
          {disabled ? "Starting..." : "Take the challenge"}
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
              disabled={disabled}
              isCorrect={reveal.correct}
              onContinue={onContinue}
              questionCount={questionCount}
              questionIndex={questionIndex}
              reveal={reveal}
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
          const isCompleted =
            index < currentIndex || (index === currentIndex && isReveal);
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
  challenger,
  drop,
  score,
  total,
  disabled,
  error,
  onChallenge,
}: {
  challenger: Challenger | null;
  drop: PublicDrop;
  score: number;
  total: number;
  disabled: boolean;
  error: string | null;
  onChallenge: () => void;
}) {
  const challengeCopy =
    score === total
      ? `Think someone can match your ${score}/${total}?`
      : `Think someone can beat your ${score}/${total}?`;
  const comparison = challenger
    ? getComparisonCopy(score, challenger)
    : null;

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Result
        </p>
        <h1 className="mt-4 text-7xl font-semibold tracking-normal">
          {score}/{total}
        </h1>
        {comparison ? (
          <>
            <p className="mt-5 text-2xl font-semibold leading-8">
              {comparison.headline}
            </p>
            <p className="mt-3 text-base text-[#6d6255]">
              You {score}/{total} | {challenger?.displayName}{" "}
              {challenger?.result.score}/{challenger?.result.total}
            </p>
          </>
        ) : (
          <p className="mt-5 text-xl leading-8">
            You knew {score} of {total} on this {drop.topic.title} challenge.
          </p>
        )}
        <p className="mt-5 text-base font-medium text-[#6d6255]">
          {drop.title}
        </p>
        <div className="mt-10">
          <p className="text-lg font-semibold">{challengeCopy}</p>
          <button
            className="mt-4 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={onChallenge}
            type="button"
          >
            {disabled ? "Preparing..." : "Challenge a friend"}
          </button>
          <button
            className="mt-3 min-h-12 w-full text-base font-semibold text-[#3b6b82] disabled:opacity-70"
            disabled
            type="button"
          >
            Your Space Journey - coming later
          </button>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function NameCaptureSheet({
  disabled,
  error,
  onClose,
  onSubmit,
}: {
  disabled: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (displayName: string) => void;
}) {
  const [displayName, setDisplayName] = useState("");

  return (
    <Sheet onClose={onClose} title="Challenge a friend">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(displayName);
        }}
      >
        <label
          className="block text-sm font-semibold text-[#6d6255]"
          htmlFor="display-name"
        >
          What should your friend see your name as?
        </label>
        <input
          autoComplete="given-name"
          autoFocus
          className="mt-3 min-h-14 w-full rounded-lg border border-[#d8cdbd] bg-white px-4 text-base text-[#221b14] outline-none focus:ring-4 focus:ring-[#8fb7c9]"
          disabled={disabled}
          id="display-name"
          maxLength={32}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="First name"
          type="text"
          value={displayName}
        />
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button
          className="mt-5 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || displayName.trim().length === 0}
          type="submit"
        >
          {disabled ? "Saving..." : "Continue"}
        </button>
      </form>
    </Sheet>
  );
}

function ShareChoiceSheet({
  copyStatus,
  disabled,
  onClose,
  onCopy,
  onWhatsApp,
  score,
  total,
  topicTitle,
}: {
  copyStatus: string | null;
  disabled: boolean;
  onClose: () => void;
  onCopy: () => void;
  onWhatsApp: () => void;
  score: number;
  total: number;
  topicTitle: string;
}) {
  return (
    <Sheet onClose={onClose} title="Challenge someone">
      <p className="text-sm font-medium text-[#6d6255]">
        Your score: {score}/{total} | {topicTitle}
      </p>
      <button
        className="mt-5 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onWhatsApp}
        type="button"
      >
        Challenge on WhatsApp
      </button>
      <button
        className="mt-3 min-h-14 w-full rounded-lg border border-[#b9ab98] bg-white px-5 text-base font-semibold text-[#221b14] shadow-sm transition hover:border-[#15262f] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onCopy}
        type="button"
      >
        Copy Invite
      </button>
      {copyStatus ? (
        <p className="mt-3 text-sm font-semibold text-[#2f6f4e]">
          {copyStatus}
        </p>
      ) : null}
    </Sheet>
  );
}

function Sheet({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-end bg-black/30 px-4 pb-4">
      <section
        aria-labelledby="share-sheet-title"
        className="mx-auto w-full max-w-md rounded-lg bg-[#f7f3ec] p-5 text-[#221b14] shadow-xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold" id="share-sheet-title">
            {title}
          </h2>
          <button
            className="min-h-10 min-w-10 rounded-full text-xl leading-none text-[#6d6255] hover:bg-[#ebe2d5] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9]"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">x</span>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

function InvalidInviteScreen() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
          This challenge link isn&apos;t available.
        </h1>
        <Link
          className="mt-8 flex min-h-14 w-full items-center justify-center rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9]"
          href="/"
        >
          Play the latest Space challenge
        </Link>
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

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

function getComparisonCopy(score: number, challenger: Challenger) {
  if (score > challenger.result.score) {
    return { headline: `You beat ${challenger.displayName}.` };
  }

  if (score < challenger.result.score) {
    return { headline: `${challenger.displayName} scored higher.` };
  }

  return { headline: `You tied ${challenger.displayName}.` };
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

type Challenger = {
  playerId: string;
  displayName: string;
  result: {
    score: number;
    total: number;
  };
};
