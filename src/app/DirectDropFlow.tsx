"use client";

import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { api } from "../../convex/_generated/api";

type PlayerIdState = "loading" | string;
type ShareState = "closed" | "auth" | "choices";
type PostResultView = "home" | "result";
type PendingAuthAction = "challenge" | "save";

const playerIdStorageKey = "did-you-know.playerId";
const pendingAuthActionStorageKey = "did-you-know.pendingAuthAction";
const authActionSearchParam = "dykAuthAction";
const playerIdListeners = new Set<() => void>();

function subscribeToPlayerId(listener: () => void) {
  playerIdListeners.add(listener);
  return () => {
    playerIdListeners.delete(listener);
  };
}

function getServerPlayerIdSnapshot(): PlayerIdState {
  return "loading";
}

function getOrCreatePlayerId() {
  const existing = window.localStorage.getItem(playerIdStorageKey);

  if (existing) {
    return existing;
  }

  const playerId = makeNewPlayerId();
  window.localStorage.setItem(playerIdStorageKey, playerId);
  return playerId;
}

function makeNewPlayerId() {
  return window.crypto.randomUUID();
}

function rotateBrowserPlayerId() {
  const playerId = makeNewPlayerId();
  window.localStorage.setItem(playerIdStorageKey, playerId);
  for (const listener of playerIdListeners) {
    listener();
  }
  return playerId;
}

function getClientPlayerIdSnapshot(): PlayerIdState {
  if (typeof window === "undefined") {
    return "loading";
  }

  return getOrCreatePlayerId();
}

function getPendingAuthAction() {
  const searchValue = new URLSearchParams(window.location.search).get(
    authActionSearchParam,
  );
  const value =
    searchValue ?? window.localStorage.getItem(pendingAuthActionStorageKey);
  return value === "challenge" || value === "save" ? value : null;
}

function makeAuthReturnPath({
  action,
  inviteId,
}: {
  action: PendingAuthAction;
  inviteId?: string;
}) {
  const path = inviteId ? `/i/${inviteId}` : "/";
  return `${path}?${authActionSearchParam}=${action}`;
}

function clearAuthReturnIntent() {
  window.localStorage.removeItem(pendingAuthActionStorageKey);

  const url = new URL(window.location.href);
  if (!url.searchParams.has(authActionSearchParam)) {
    return;
  }

  url.searchParams.delete(authActionSearchParam);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
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

  return (
    <DropFlowInner
      inviteId={inviteId}
      key={playerId}
      onPlayerIdRotated={rotateBrowserPlayerId}
      playerId={playerId}
    />
  );
}

function DropFlowInner({
  inviteId,
  onPlayerIdRotated,
  playerId,
}: {
  inviteId?: string;
  onPlayerIdRotated: () => void;
  playerId: string;
}) {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
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
  const ensureProfileAndClaim = useMutation(api.directFlow.ensureProfileAndClaim);
  const getOrCreateInvite = useMutation(api.directFlow.getOrCreateInvite);
  const [isPending, startTransition] = useTransition();
  const [committedAnswer, setCommittedAnswer] = useState<{
    questionId: string;
    optionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>("closed");
  const [authPurpose, setAuthPurpose] =
    useState<PendingAuthAction>("challenge");
  const [postResultView, setPostResultView] = useState<PostResultView>("home");
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareDisplayName, setShareDisplayName] = useState<string | null>(null);
  const [claimedProfile, setClaimedProfile] = useState<Profile | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [journeySavedNotice, setJourneySavedNotice] = useState(false);
  const completedPendingAuthAction = useRef<string | null>(null);

  const ensureInvite = useCallback(async () => {
    if (!flowState || !("drop" in flowState) || !flowState.drop) {
      throw new Error("Could not find this Drop.");
    }

    const origin = window.location.origin;
    const result = await getOrCreateInvite({
      playerId,
      dropId: flowState.drop.id,
      origin,
    });
    setShareMessage(result.invite.message);
    return result.invite;
  }, [flowState, getOrCreateInvite, playerId]);

  const completeAuthenticatedAction = useCallback(
    (action: PendingAuthAction) => {
      setError(null);
      startTransition(async () => {
        try {
          const claimResult = await ensureProfileAndClaim({ playerId });
          if (!claimResult.profile) {
            throw new Error("Profile was not available after sign-in.");
          }
          setClaimedProfile(claimResult.profile);
          if (claimResult.claimedCount > 0) {
            setJourneySavedNotice(true);
          }
          clearAuthReturnIntent();

          if (action === "challenge") {
            setShareDisplayName(claimResult.profile.displayName);
            await ensureInvite();
            setShareState("choices");
            setPostResultView("result");
          } else {
            setShareState("closed");
            setPostResultView("home");
          }
        } catch {
          setError("Could not finish sign-in. Please try again.");
          setShareState("closed");
        }
      });
    },
    [ensureInvite, ensureProfileAndClaim, playerId],
  );

  const handleSignOut = () => {
    setError(null);
    startTransition(async () => {
      try {
        await signOut();
        clearAuthReturnIntent();
        setShareState("closed");
        setShareMessage(null);
        setShareDisplayName(null);
        setCopyStatus(null);
        setClaimedProfile(null);
        setJourneySavedNotice(false);
        setIsAccountOpen(false);
        setPostResultView("home");
        onPlayerIdRotated();
      } catch {
        setError("Could not sign out. Please try again.");
      }
    });
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !flowState) {
      return;
    }

    const pendingAction = getPendingAuthAction();
    if (!pendingAction) {
      return;
    }

    const completionKey = `${pendingAction}:${playerId}`;
    if (completedPendingAuthAction.current === completionKey) {
      return;
    }

    completedPendingAuthAction.current = completionKey;
    completeAuthenticatedAction(pendingAction);
  }, [
    authLoading,
    completeAuthenticatedAction,
    flowState,
    isAuthenticated,
    playerId,
  ]);

  if (flowState === undefined || authLoading) {
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
            No challenge is available right now.
          </h1>
        </section>
      </main>
    );
  }

  const challenger = flowState.challenger ?? null;
  const profile = flowState.profile ?? claimedProfile;
  const attemptState = flowState.attemptState;

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

  const beginGoogleAuth = (action: PendingAuthAction) => {
    setError(null);
    window.localStorage.setItem(pendingAuthActionStorageKey, action);
    startTransition(async () => {
      try {
        await signIn("google", {
          redirectTo: makeAuthReturnPath({ action, inviteId }),
        });
      } catch {
        setError("Could not start Google sign-in. Please try again.");
      }
    });
  };

  const openAuthSheet = (action: PendingAuthAction) => {
    setAuthPurpose(action);
    setShareState("auth");
    setCopyStatus(null);
    setShareMessage(null);
    setError(null);
  };

  const openShareChoices = () => {
    setError(null);
    setCopyStatus(null);
    setShareMessage(null);

    if (!profile) {
      openAuthSheet("challenge");
      return;
    }

    startTransition(async () => {
      try {
        await ensureInvite();
        setShareDisplayName(profile.displayName);
        setShareState("choices");
      } catch {
        setError("Could not prepare your invite. Please try again.");
      }
    });
  };

  const saveJourney = () => {
    if (!profile) {
      openAuthSheet("save");
      return;
    }

    completeAuthenticatedAction("save");
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

  if (!attemptState) {
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
      <>
        <HomeScreen
          disabled={isPending}
          drop={flowState.drop}
          error={error}
          onGoogleSignIn={() => openAuthSheet("save")}
          onOpenAccount={profile ? () => setIsAccountOpen(true) : undefined}
          onPlay={handleStart}
          profile={profile}
          showGoogleSignIn={profile === null}
        />
        {isAccountOpen && profile ? (
          <AccountSheet
            disabled={isPending}
            email={profile.email}
            onClose={() => setIsAccountOpen(false)}
            onSignOut={handleSignOut}
            profileName={profile.displayName}
          />
        ) : null}
        {shareState === "auth" ? (
          <AuthSheet
            disabled={isPending}
            error={error}
            onClose={() => setShareState("closed")}
            onContinue={() => beginGoogleAuth(authPurpose)}
            purpose={authPurpose}
          />
        ) : null}
      </>
    );
  }

  if (attemptState.attempt.stage === "result") {
    const overlays = (
      <>
        {shareState === "auth" ? (
          <AuthSheet
            disabled={isPending}
            error={error}
            onClose={() => setShareState("closed")}
            onContinue={() => beginGoogleAuth(authPurpose)}
            purpose={authPurpose}
          />
        ) : null}
        {shareState === "choices" ? (
          <ShareChoiceSheet
            copyStatus={copyStatus}
            disabled={isPending}
            displayName={
              shareDisplayName ?? profile?.displayName ?? "A friend"
            }
            onClose={() => setShareState("closed")}
            onCopy={copyInvite}
            onWhatsApp={openWhatsApp}
            score={attemptState.result?.score ?? 0}
            topicTitle={flowState.drop.topic.name}
            total={flowState.drop.questionCount}
          />
        ) : null}
      </>
    );

    if (!inviteId && postResultView === "home") {
      return (
        <>
          <CaughtUpHomeScreen
            disabled={isPending}
            drop={flowState.drop}
            isAuthenticated={profile !== null}
            journeySavedNotice={journeySavedNotice}
            onOpenAccount={profile ? () => setIsAccountOpen(true) : undefined}
            onSaveJourney={saveJourney}
            onViewResult={() => setPostResultView("result")}
            profile={profile}
            score={attemptState.result?.score ?? 0}
            total={flowState.drop.questionCount}
          />
          {isAccountOpen && profile ? (
            <AccountSheet
              disabled={isPending}
              email={profile.email}
              onClose={() => setIsAccountOpen(false)}
              onSignOut={handleSignOut}
              profileName={profile.displayName}
            />
          ) : null}
          {overlays}
        </>
      );
    }

    return (
      <>
        <ResultScreen
          challenger={challenger}
          disabled={isPending}
          drop={flowState.drop}
          error={error}
          isAuthenticated={profile !== null}
          journeySavedNotice={journeySavedNotice}
          onBackToHome={() => setPostResultView("home")}
          onChallenge={openShareChoices}
          onOpenAccount={profile ? () => setIsAccountOpen(true) : undefined}
          onSaveJourney={saveJourney}
          profile={profile}
          score={attemptState.result?.score ?? 0}
          total={flowState.drop.questionCount}
        />
        {isAccountOpen && profile ? (
          <AccountSheet
            disabled={isPending}
            email={profile.email}
            onClose={() => setIsAccountOpen(false)}
            onSignOut={handleSignOut}
            profileName={profile.displayName}
          />
        ) : null}
        {overlays}
      </>
    );
  }

  const question = attemptState.currentQuestion;

  if (!question) {
    return <ShellLoading />;
  }

  return (
    <PlayScreen
      areaTitle={flowState.drop.area.name}
      committedOptionId={
        committedAnswer?.questionId === question.id
          ? committedAnswer.optionId
          : null
      }
      disabled={isPending}
      error={error}
      onContinue={() => {
        setError(null);
        if (attemptState.attempt.currentQuestionIndex === flowState.drop.questionCount - 1) {
          setPostResultView("result");
        }
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
      questionIndex={attemptState.attempt.currentQuestionIndex}
      reveal={attemptState.reveal}
    />
  );
}

function HomeScreen({
  drop,
  disabled,
  error,
  onGoogleSignIn,
  onOpenAccount,
  onPlay,
  profile,
  showGoogleSignIn,
}: {
  drop: PublicDrop;
  disabled: boolean;
  error: string | null;
  onGoogleSignIn: () => void;
  onOpenAccount?: () => void;
  onPlay: () => void;
  profile: Profile | null;
  showGoogleSignIn: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        {profile && onOpenAccount ? (
          <div className="mb-8 flex justify-end">
            <AccountChip
              disabled={disabled}
              onClick={onOpenAccount}
              profileName={profile.displayName}
            />
          </div>
        ) : null}
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
          Test what you know. Then see if your friends know better.
        </h1>
        <div className="mt-8 border-y border-[#d8cdbd] py-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3b6b82]">
            <span className="block text-xs text-[#7b6f60]">Topic</span>
            <span>{drop.topic.name}</span>
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
        {showGoogleSignIn ? (
          <button
            className="mt-4 min-h-12 w-full text-base font-semibold text-[#3b6b82] underline-offset-4 hover:underline disabled:opacity-60"
            disabled={disabled}
            onClick={onGoogleSignIn}
            type="button"
          >
            Continue with Google
          </button>
        ) : null}
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
          {challenger.displayName} challenged you on {drop.topic.name}
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

function CaughtUpHomeScreen({
  drop,
  score,
  total,
  isAuthenticated,
  journeySavedNotice,
  disabled,
  onOpenAccount,
  onViewResult,
  onSaveJourney,
  profile,
}: {
  drop: PublicDrop;
  score: number;
  total: number;
  isAuthenticated: boolean;
  journeySavedNotice: boolean;
  disabled: boolean;
  onOpenAccount?: () => void;
  onViewResult: () => void;
  onSaveJourney: () => void;
  profile: Profile | null;
}) {
  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        {profile && onOpenAccount ? (
          <div className="mb-8 flex justify-end">
            <AccountChip
              disabled={disabled}
              onClick={onOpenAccount}
              profileName={profile.displayName}
            />
          </div>
        ) : null}
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b6f60]">
          Did You Know?
        </p>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#3b6b82]">
          <span className="block text-xs text-[#7b6f60]">Topic</span>
          <span>{drop.topic.name}</span>
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-normal">
          You&apos;re caught up.
        </h1>
        <div className="mt-8 border-y border-[#d8cdbd] py-6">
          <h2 className="text-2xl font-semibold leading-snug">{drop.title}</h2>
          <p className="mt-3 text-base font-semibold text-[#6d6255]">
            Completed - {score}/{total}
          </p>
        </div>
        <button
          className="mt-8 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9]"
          onClick={onViewResult}
          type="button"
        >
          View result
        </button>
        <p className="mt-5 text-base text-[#6d6255]">
          More to discover in {drop.topic.name} soon.
        </p>
        {journeySavedNotice ? (
          <div className="mt-6 rounded-lg border border-[#b9d6c1] bg-[#eef8f1] p-4">
            <p className="font-semibold text-[#173d29]">Journey saved</p>
            <p className="mt-1 text-sm leading-6 text-[#356245]">
              Your progress is now connected to your Google account.
            </p>
          </div>
        ) : null}
        {!isAuthenticated ? (
          <div className="mt-6 border-t border-[#d8cdbd] pt-5">
            <p className="text-sm font-medium text-[#6d6255]">
              Saved on this device
            </p>
            <button
              className="mt-3 text-base font-semibold text-[#3b6b82] underline-offset-4 hover:underline disabled:opacity-60"
              disabled={disabled}
              onClick={onSaveJourney}
              type="button"
            >
              Save my journey
            </button>
          </div>
        ) : null}
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
  isAuthenticated,
  journeySavedNotice,
  onBackToHome,
  onChallenge,
  onOpenAccount,
  onSaveJourney,
  profile,
}: {
  challenger: Challenger | null;
  drop: PublicDrop;
  score: number;
  total: number;
  disabled: boolean;
  error: string | null;
  isAuthenticated: boolean;
  journeySavedNotice: boolean;
  onBackToHome: () => void;
  onChallenge: () => void;
  onOpenAccount?: () => void;
  onSaveJourney: () => void;
  profile: Profile | null;
}) {
  const challengeCopy =
    score === total
      ? `Think someone can match your ${score}/${total}?`
      : `Think someone can beat your ${score}/${total}?`;
  const comparison = challenger ? getComparisonCopy(score, challenger) : null;

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#221b14]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        {profile && onOpenAccount ? (
          <div className="mb-8 flex justify-end">
            <AccountChip
              disabled={disabled}
              onClick={onOpenAccount}
              profileName={profile.displayName}
            />
          </div>
        ) : null}
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
            You knew {score} of {total} on this {drop.topic.name} challenge.
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
            className="mt-3 min-h-12 w-full text-base font-semibold text-[#3b6b82] underline-offset-4 hover:underline disabled:opacity-70"
            disabled={disabled}
            onClick={onBackToHome}
            type="button"
          >
            Back to Home
          </button>
          {!isAuthenticated ? (
            <div className="mt-6 border-t border-[#d8cdbd] pt-5">
              <p className="text-sm font-medium text-[#6d6255]">
                Keep your {drop.topic.name} progress across devices.
              </p>
              <button
                className="mt-2 text-base font-semibold text-[#3b6b82] underline-offset-4 hover:underline disabled:opacity-60"
                disabled={disabled}
                onClick={onSaveJourney}
                type="button"
              >
                Save my journey
              </button>
            </div>
          ) : null}
          {journeySavedNotice ? (
            <div className="mt-6 rounded-lg border border-[#b9d6c1] bg-[#eef8f1] p-4">
              <p className="font-semibold text-[#173d29]">Journey saved</p>
              <p className="mt-1 text-sm leading-6 text-[#356245]">
                Your progress is now connected to your Google account.
              </p>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function AuthSheet({
  disabled,
  error,
  onClose,
  onContinue,
  purpose,
}: {
  disabled: boolean;
  error: string | null;
  onClose: () => void;
  onContinue: () => void;
  purpose: PendingAuthAction;
}) {
  const copy =
    purpose === "challenge"
      ? "Continue with Google so friends can see who challenged them."
      : "Continue with Google to keep your scores across devices.";

  return (
    <Sheet onClose={onClose} title="Create your profile">
      <p className="text-base leading-7 text-[#51483d]">{copy}</p>
      <button
        className="mt-5 min-h-14 w-full rounded-lg bg-[#15262f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#203946] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onContinue}
        type="button"
      >
        {disabled ? "Opening Google..." : "Continue with Google"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </Sheet>
  );
}

function AccountChip({
  disabled,
  onClick,
  profileName,
}: {
  disabled: boolean;
  onClick: () => void;
  profileName: string;
}) {
  return (
    <button
      className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#d8cdbd] bg-white px-4 text-sm font-semibold text-[#221b14] shadow-sm hover:border-[#15262f] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="truncate">{profileName}</span>
      <span aria-hidden="true" className="text-[#6d6255]">
        v
      </span>
      <span className="sr-only">Open account menu</span>
    </button>
  );
}

function AccountSheet({
  disabled,
  email,
  onClose,
  onSignOut,
  profileName,
}: {
  disabled: boolean;
  email?: string;
  onClose: () => void;
  onSignOut: () => void;
  profileName: string;
}) {
  return (
    <Sheet onClose={onClose} title={profileName}>
      {email ? (
        <p className="break-words text-sm font-medium text-[#6d6255]">
          {email}
        </p>
      ) : null}
      <p className="mt-4 text-base leading-7 text-[#51483d]">
        Your progress is saved to your profile.
      </p>
      <button
        className="mt-5 min-h-12 w-full rounded-lg border border-[#b9ab98] bg-white px-5 text-base font-semibold text-[#221b14] shadow-sm transition hover:border-[#15262f] focus:outline-none focus:ring-4 focus:ring-[#8fb7c9] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onSignOut}
        type="button"
      >
        {disabled ? "Signing out..." : "Sign out"}
      </button>
    </Sheet>
  );
}

function ShareChoiceSheet({
  copyStatus,
  disabled,
  displayName,
  onClose,
  onCopy,
  onWhatsApp,
  score,
  total,
  topicTitle,
}: {
  copyStatus: string | null;
  disabled: boolean;
  displayName: string;
  onClose: () => void;
  onCopy: () => void;
  onWhatsApp: () => void;
  score: number;
  total: number;
  topicTitle: string;
}) {
  return (
    <Sheet onClose={onClose} title={`Challenge as ${displayName}`}>
      <p className="text-sm font-medium text-[#6d6255]">
        Your score: {score}/{total} - {topicTitle}
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
        aria-labelledby="sheet-title"
        className="mx-auto w-full max-w-md rounded-lg bg-[#f7f3ec] p-5 text-[#221b14] shadow-xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold" id="sheet-title">
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
          Play the latest challenge
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
    name: string;
  };
  area: {
    id: string;
    name: string;
  };
  title: string;
  description: string;
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
  profileId: string;
  displayName: string;
  result: {
    score: number;
    total: number;
  };
};

type Profile = {
  id: string;
  displayName: string;
  email?: string;
};
