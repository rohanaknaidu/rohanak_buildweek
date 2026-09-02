"use client";

import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
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
import type { Id } from "../../convex/_generated/dataModel";

type PlayerIdState = "loading" | string;
type ShareState = "closed" | "auth" | "choices";
type PendingAuthAction = "challenge" | "compare" | "save";
type ActiveDropSelection = {
  dropId: string;
  source: "storage" | "url" | "user";
};

const playerIdStorageKey = "did-you-know.playerId";
const pendingAuthActionStorageKey = "did-you-know.pendingAuthAction";
const activeDropStorageKey = "did-you-know.activeDropId";
const authActionSearchParam = "dykAuthAction";
const dropIdSearchParam = "dykDropId";
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
  return value === "challenge" || value === "compare" || value === "save"
    ? value
    : null;
}

function getPendingDropSelection(): ActiveDropSelection | null {
  const searchValue = new URLSearchParams(window.location.search).get(
    dropIdSearchParam,
  );

  if (searchValue) {
    return {
      dropId: searchValue,
      source: "url",
    };
  }

  const storageValue = window.localStorage.getItem(activeDropStorageKey);

  return storageValue
    ? {
        dropId: storageValue,
        source: "storage",
      }
    : null;
}

function makeAuthReturnPath({
  action,
  dropId,
  inviteId,
}: {
  action: PendingAuthAction;
  dropId?: string | null;
  inviteId?: string;
}) {
  const path = inviteId ? `/i/${inviteId}` : "/";
  const params = new URLSearchParams({ [authActionSearchParam]: action });

  if (dropId) {
    params.set(dropIdSearchParam, dropId);
  }

  return `${path}?${params.toString()}`;
}

function clearAuthReturnIntent() {
  window.localStorage.removeItem(pendingAuthActionStorageKey);
  window.localStorage.removeItem(activeDropStorageKey);

  const url = new URL(window.location.href);
  if (
    !url.searchParams.has(authActionSearchParam) &&
    !url.searchParams.has(dropIdSearchParam)
  ) {
    return;
  }

  url.searchParams.delete(authActionSearchParam);
  url.searchParams.delete(dropIdSearchParam);
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
  const router = useRouter();
  const [activeDropSelection, setActiveDropSelection] =
    useState<ActiveDropSelection | null>(() =>
      inviteId ? null : getPendingDropSelection(),
    );
  const [activePairId, setActivePairId] =
    useState<Id<"knowledgePairs"> | null>(null);
  const activeDropId = activeDropSelection?.dropId ?? null;
  const homeState = useQuery(
    api.directFlow.getHomeState,
    inviteId ? "skip" : { playerId },
  );
  const directFlowState = useQuery(
    api.directFlow.getFlowState,
    !inviteId && activeDropId ? { playerId, dropId: activeDropId } : "skip",
  );
  const inviteFlowState = useQuery(
    api.directFlow.getInviteFlowState,
    inviteId ? { playerId, inviteId } : "skip",
  );
  const pairState = useQuery(
    api.directFlow.getPairState,
    activePairId ? { pairId: activePairId } : "skip",
  );
  const flowState = inviteId ? inviteFlowState : directFlowState;
  const shouldRecoverFromStaleStoredDrop =
    !inviteId &&
    activeDropSelection?.source === "storage" &&
    directFlowState !== undefined &&
    !directFlowState.drop;
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
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareDisplayName, setShareDisplayName] = useState<string | null>(null);
  const [shareContext, setShareContext] = useState<{
    score: number;
    total: number;
    topicTitle: string;
  } | null>(null);
  const [claimedProfile, setClaimedProfile] = useState<Profile | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [journeySavedNotice, setJourneySavedNotice] = useState(false);
  const completedPendingAuthAction = useRef<string | null>(null);

  const ensureInviteForDrop = useCallback(async (dropId: string) => {
    const origin = window.location.origin;
    const result = await getOrCreateInvite({
      playerId,
      dropId,
      origin,
    });
    setShareMessage(result.invite.message);
    return result.invite;
  }, [getOrCreateInvite, playerId]);

  const completeAuthenticatedAction = useCallback(
    (action: PendingAuthAction) => {
      setError(null);
      startTransition(async () => {
        try {
          const claimResult = await ensureProfileAndClaim({
            playerId,
            pairFromInviteId:
              action === "compare" && inviteId ? inviteId : undefined,
          });
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
            if (!flowState || !("drop" in flowState) || !flowState.drop) {
              throw new Error("Could not find this Drop.");
            }
            await ensureInviteForDrop(flowState.drop.id);
            setShareContext({
              score: flowState.attemptState?.result?.score ?? 0,
              total: flowState.drop.questionCount,
              topicTitle: flowState.drop.topic.name,
            });
            setShareState("choices");
          } else if (action === "compare" && claimResult.pair) {
            setShareState("closed");
            setActivePairId(claimResult.pair.id);
          } else {
            setShareState("closed");
            setActiveDropSelection(null);
          }
        } catch {
          setError("Could not finish sign-in. Please try again.");
          setShareState("closed");
        }
      });
    },
    [ensureInviteForDrop, ensureProfileAndClaim, flowState, inviteId, playerId],
  );

  const handleSignOut = () => {
    setError(null);
    startTransition(async () => {
      try {
        await signOut();
        clearAuthReturnIntent();
        setShareState("closed");
        setShareMessage(null);
        setShareContext(null);
        setShareDisplayName(null);
        setCopyStatus(null);
        setClaimedProfile(null);
        setJourneySavedNotice(false);
        setIsAccountOpen(false);
        setActivePairId(null);
        setActiveDropSelection(null);
        window.localStorage.removeItem(activeDropStorageKey);
        onPlayerIdRotated();
      } catch {
        setError("Could not sign out. Please try again.");
      }
    });
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const pendingAction = getPendingAuthAction();
    if (!pendingAction) {
      return;
    }

    if (pendingAction === "challenge" && !flowState) {
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

  useEffect(() => {
    if (!shouldRecoverFromStaleStoredDrop) {
      return;
    }

    window.localStorage.removeItem(activeDropStorageKey);
  }, [shouldRecoverFromStaleStoredDrop]);

  const currentProfile =
    homeState && homeState !== undefined
      ? (homeState.profile ?? claimedProfile)
      : flowState && "profile" in flowState
        ? (flowState.profile ?? claimedProfile)
        : claimedProfile;

  const openPairChallenge = useCallback(
    (summary: PairDropSummary) => {
      if (!currentProfile || summary.myScore === null) {
        return;
      }

      setError(null);
      setCopyStatus(null);
      setShareMessage(null);
      setShareContext(null);
      startTransition(async () => {
        try {
          await ensureInviteForDrop(summary.drop.id);
          setShareContext({
            score: summary.myScore ?? 0,
            total: summary.total,
            topicTitle: summary.drop.topic.name,
          });
          setShareDisplayName(currentProfile.displayName);
          setShareState("choices");
        } catch {
          setError("Could not prepare your invite. Please try again.");
        }
      });
    },
    [currentProfile, ensureInviteForDrop],
  );

  if (authLoading) {
    return <ShellLoading />;
  }

  if (activePairId) {
    if (pairState === undefined) {
      return <ShellLoading />;
    }

    return (
      <>
        <PairScreen
          disabled={isPending}
          error={error}
          onBackToHome={() => {
            setActivePairId(null);
            if (inviteId) {
              router.push("/");
            }
          }}
          onChallengeDrop={openPairChallenge}
          pair={pairState}
        />
        {shareState === "choices" && shareContext ? (
          <ShareChoiceSheet
            copyStatus={copyStatus}
            disabled={isPending}
            displayName={shareDisplayName ?? currentProfile?.displayName ?? "A friend"}
            onClose={() => setShareState("closed")}
            onCopy={copyInvite}
            onWhatsApp={openWhatsApp}
            score={shareContext.score}
            topicTitle={shareContext.topicTitle}
            total={shareContext.total}
          />
        ) : null}
      </>
    );
  }

  if (!inviteId && (!activeDropId || shouldRecoverFromStaleStoredDrop)) {
    if (homeState === undefined) {
      return <ShellLoading />;
    }

    const profile = homeState.profile ?? claimedProfile;

    return (
      <>
        <HomeScreen
          disabled={isPending}
          error={error}
          exploredCount={homeState.exploredCount}
          onGoogleSignIn={() => openAuthSheet("save")}
          onOpenAccount={profile ? () => setIsAccountOpen(true) : undefined}
          onOpenDrop={(dropId, status) => {
            setError(null);
            setActivePairId(null);
            setActiveDropSelection({ dropId, source: "user" });
            window.localStorage.setItem(activeDropStorageKey, dropId);
            if (status === "completed") {
              return;
            }

            startTransition(async () => {
              try {
                await startAttempt({ playerId, dropId });
              } catch {
                setActiveDropSelection(null);
                window.localStorage.removeItem(activeDropStorageKey);
                setError("Could not start the challenge. Please try again.");
              }
            });
          }}
          profile={profile}
          pairs={homeState.pairs}
          onOpenPair={(pairId) => {
            setError(null);
            setActivePairId(pairId);
          }}
          showGoogleSignIn={profile === null}
          totalCount={homeState.totalCount}
          trails={homeState.trails}
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

  if (flowState === undefined) {
    return <ShellLoading />;
  }

  if ("invalidInvite" in flowState && flowState.invalidInvite) {
    return <InvalidInviteScreen />;
  }

  if (!flowState.drop) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-8 text-[#fff8e8]">
        <WorldAtmosphere />
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f2c184]">
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
        await startAttempt({
          playerId,
          inviteId,
          dropId: inviteId ? undefined : activeDropId ?? undefined,
        });
      } catch {
        setError("Could not start the challenge. Please try again.");
      }
    });
  };

  function beginGoogleAuth(action: PendingAuthAction) {
    setError(null);
    window.localStorage.setItem(pendingAuthActionStorageKey, action);
    if (!inviteId && flowState?.drop) {
      window.localStorage.setItem(activeDropStorageKey, flowState.drop.id);
    }
    startTransition(async () => {
      try {
        await signIn("google", {
          redirectTo: makeAuthReturnPath({
            action,
            dropId: inviteId ? null : flowState?.drop?.id,
            inviteId,
          }),
        });
      } catch {
        setError("Could not start Google sign-in. Please try again.");
      }
    });
  }

  function openAuthSheet(action: PendingAuthAction) {
    setAuthPurpose(action);
    setShareState("auth");
    setCopyStatus(null);
    setShareMessage(null);
    setError(null);
  }

  const openShareChoices = () => {
    setError(null);
    setCopyStatus(null);
    setShareMessage(null);
    setShareContext(null);

    if (!profile) {
      openAuthSheet("challenge");
      return;
    }

    startTransition(async () => {
      try {
        if (!flowState || !("drop" in flowState) || !flowState.drop) {
          throw new Error("Could not find this Drop.");
        }
        await ensureInviteForDrop(flowState.drop.id);
        setShareContext({
          score: flowState.attemptState?.result?.score ?? 0,
          total: flowState.drop.questionCount,
          topicTitle: flowState.drop.topic.name,
        });
        setShareDisplayName(profile.displayName);
        setShareState("choices");
      } catch {
        setError("Could not prepare your invite. Please try again.");
      }
    });
  };

  const saveJourney = () => {
    if (!profile) {
      openAuthSheet(challenger ? "compare" : "save");
      return;
    }

    completeAuthenticatedAction(challenger ? "compare" : "save");
  };

  function copyInvite() {
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
  }

  function openWhatsApp() {
    if (!shareMessage) {
      setError("Could not open WhatsApp. Please try again.");
      return;
    }

    window.location.href = `https://wa.me/?text=${encodeURIComponent(
      shareMessage,
    )}`;
  }

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

    return <ShellLoading />;
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

    return (
      <>
        <ResultScreen
          challenger={challenger}
          disabled={isPending}
          drop={flowState.drop}
          error={error}
          isAuthenticated={profile !== null}
          journeySavedNotice={journeySavedNotice}
          onBackToHome={() => {
            setActiveDropSelection(null);
            window.localStorage.removeItem(activeDropStorageKey);
          }}
          onChallenge={openShareChoices}
          onExploreNext={
            flowState.trailContext?.nextDrop
              ? () => {
                  const nextDropId = flowState.trailContext?.nextDrop?.id;
                  if (!nextDropId) {
                    return;
                  }
                  setError(null);
                  setShareState("closed");
                  setActiveDropSelection({
                    dropId: nextDropId,
                    source: "user",
                  });
                  window.localStorage.setItem(activeDropStorageKey, nextDropId);
                  startTransition(async () => {
                    try {
                      await startAttempt({ playerId, dropId: nextDropId });
                    } catch {
                      setError(
                        "Could not start the next challenge. Please try again.",
                      );
                    }
                  });
                }
              : undefined
          }
          onOpenAccount={profile ? () => setIsAccountOpen(true) : undefined}
          onSaveJourney={saveJourney}
          profile={profile}
          score={attemptState.result?.score ?? 0}
          trailContext={flowState.trailContext}
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
      committedOptionId={
        committedAnswer?.questionId === question.id
          ? committedAnswer.optionId
          : null
      }
      disabled={isPending}
      drop={flowState.drop}
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
      questionIndex={attemptState.attempt.currentQuestionIndex}
      reveal={attemptState.reveal}
    />
  );
}

type TerritoryTheme = {
  accent: string;
  secondary: string;
  motif: string;
  pattern: string;
};

const defaultTheme: TerritoryTheme = {
  accent: "#f2c184",
  secondary: "#8fb7c9",
  motif: "default",
  pattern:
    "linear-gradient(135deg, rgba(242, 193, 132, 0.10), transparent 38%), repeating-linear-gradient(90deg, rgba(255, 248, 232, 0.05) 0 1px, transparent 1px 58px)",
};

const visualFamilies: Record<string, Omit<TerritoryTheme, "motif" | "pattern">> =
  {
    cosmic: {
      accent: "#f2c184",
      secondary: "#6f9dff",
    },
    gravitational: {
      accent: "#8fb7c9",
      secondary: "#f2c184",
    },
    organic: {
      accent: "#d67f7f",
      secondary: "#a4d6b2",
    },
  };

const visualMotifs: Record<string, Pick<TerritoryTheme, "motif" | "pattern">> = {
  orbit: {
    motif: "orbit",
    pattern:
      "radial-gradient(circle at 20% 20%, rgba(242, 193, 132, 0.16) 0 1px, transparent 2px), radial-gradient(circle at 80% 30%, rgba(111, 157, 255, 0.14) 0 1px, transparent 2px), repeating-linear-gradient(115deg, rgba(255, 248, 232, 0.04) 0 1px, transparent 1px 72px)",
  },
  "falling-arc": {
    motif: "falling-arc",
    pattern:
      "repeating-radial-gradient(ellipse at 65% 30%, rgba(143, 183, 201, 0.18) 0 1px, transparent 2px 36px), linear-gradient(140deg, rgba(143, 183, 201, 0.08), transparent 48%)",
  },
  "microgravity-body": {
    motif: "microgravity-body",
    pattern:
      "repeating-linear-gradient(155deg, rgba(214, 127, 127, 0.10) 0 2px, transparent 2px 28px), radial-gradient(circle at 72% 28%, rgba(164, 214, 178, 0.12), transparent 28%)",
  },
};

type ArtworkDescriptor = {
  motif: "rings" | "arc" | "body";
};

const visualArtworks: Record<string, ArtworkDescriptor> = {
  "solar-system-orbits": { motif: "rings" },
  "planetary-surprise": { motif: "rings" },
  "gravity-freefall": { motif: "arc" },
  "orbital-fall": { motif: "arc" },
  "body-in-microgravity": { motif: "body" },
  "fluid-shift": { motif: "body" },
};

function getTerritoryTheme(visualIdentity?: VisualIdentity): TerritoryTheme {
  if (!visualIdentity) {
    return defaultTheme;
  }

  const family = visualFamilies[visualIdentity.family];
  const motif = visualMotifs[visualIdentity.motif];

  if (!family || !motif) {
    return defaultTheme;
  }

  return {
    ...family,
    ...motif,
  };
}

function WorldAtmosphere({ theme = defaultTheme }: { theme?: TerritoryTheme }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: theme.pattern }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 border-b border-[#fff8e8]/8"
      />
    </>
  );
}

function TerritoryMark({
  large = false,
  theme,
}: {
  large?: boolean;
  theme: TerritoryTheme;
}) {
  const size = large ? "h-24 w-24" : "h-16 w-16";

  if (theme.motif === "falling-arc") {
    return (
      <div
        aria-hidden="true"
        className={`${size} relative rounded-full border border-[var(--accent)]/45`}
      >
        <span className="absolute left-1/2 top-1/2 h-[1px] w-[92%] -translate-x-1/2 -translate-y-1/2 rotate-12 bg-[var(--accent)]/70" />
        <span className="absolute left-1/2 top-1/2 h-[1px] w-[76%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] bg-[var(--accent)]/45" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
      </div>
    );
  }

  if (theme.motif === "microgravity-body") {
    return (
      <div
        aria-hidden="true"
        className={`${size} relative rounded-[2rem] border border-[var(--accent)]/45`}
      >
        <span className="absolute left-1/2 top-3 h-[calc(100%-1.5rem)] w-[1px] -translate-x-1/2 bg-[var(--accent)]/55" />
        <span className="absolute left-1/2 top-1/2 h-10 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/55" />
        <span className="absolute bottom-3 left-1/2 h-3 w-8 -translate-x-1/2 rounded-full bg-[var(--accent)]/70" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${size} relative rounded-full border border-[var(--accent)]/45`}
    >
      <span className="absolute left-1/2 top-1/2 h-[54%] w-[112%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-full border border-[var(--accent)]/55" />
      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
      <span className="absolute right-2 top-3 h-2 w-2 rounded-full bg-[#fff8e8]/80" />
    </div>
  );
}

function ArtworkSignal({
  artworkId,
  theme,
}: {
  artworkId?: string;
  theme: TerritoryTheme;
}) {
  const artwork = artworkId ? visualArtworks[artworkId] : null;

  if (!artwork) {
    return <TerritoryMark theme={theme} />;
  }

  if (artwork.motif === "arc") {
    return (
      <div
        aria-hidden="true"
        className="relative h-24 w-24 rounded-full border border-[var(--accent)]/35"
      >
        <span className="absolute left-2 top-11 h-2 w-2 rounded-full bg-[#fff8e8]" />
        <span className="absolute left-1/2 top-1/2 h-[72%] w-[110%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border border-[var(--accent)]/50" />
        <span className="absolute bottom-5 right-4 h-4 w-4 rounded-full bg-[var(--accent)]" />
      </div>
    );
  }

  if (artwork.motif === "body") {
    return (
      <div
        aria-hidden="true"
        className="relative h-24 w-24 rounded-[2rem] border border-[var(--accent)]/35"
      >
        <span className="absolute left-1/2 top-4 h-9 w-9 -translate-x-1/2 rounded-full border border-[var(--accent)]/45" />
        <span className="absolute left-1/2 top-12 h-9 w-12 -translate-x-1/2 rounded-full bg-[var(--accent)]/20" />
        <span className="absolute bottom-5 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative h-24 w-24 rounded-full border border-[var(--accent)]/35"
    >
      <span className="absolute left-1/2 top-1/2 h-[66%] w-[120%] -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-full border border-[var(--accent)]/55" />
      <span className="absolute left-1/2 top-1/2 h-[44%] w-[90%] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] rounded-full border border-[var(--accent)]/35" />
      <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
      <span className="absolute right-3 top-4 h-2 w-2 rounded-full bg-[#fff8e8]/85" />
    </div>
  );
}

function HomeScreen({
  disabled,
  error,
  exploredCount,
  onGoogleSignIn,
  onOpenAccount,
  onOpenDrop,
  onOpenPair,
  pairs,
  profile,
  showGoogleSignIn,
  totalCount,
  trails,
}: {
  disabled: boolean;
  error: string | null;
  exploredCount: number;
  onGoogleSignIn: () => void;
  onOpenAccount?: () => void;
  onOpenDrop: (dropId: string, status: HomeDropStatus) => void;
  onOpenPair: (pairId: Id<"knowledgePairs">) => void;
  pairs: PairSummary[];
  profile: Profile | null;
  showGoogleSignIn: boolean;
  totalCount: number;
  trails: HomeTrail[];
}) {
  const visibleTrail = trails[0] ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-6 text-[#f8f0df]">
      <WorldAtmosphere />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        {profile && onOpenAccount ? (
          <div className="mb-6 flex justify-end">
            <AccountChip
              disabled={disabled}
              onClick={onOpenAccount}
              profileName={profile.displayName}
            />
          </div>
        ) : null}
        {visibleTrail ? (
          <div className="grid flex-1 gap-10 pb-8 pt-4 lg:grid-cols-[0.9fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e6a95f]">
                Did You Know?
              </p>
              <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[0.96] tracking-normal text-[#fff8e8] sm:text-6xl">
                Follow a thread through the unknown.
              </h1>
              <div className="mt-8 max-w-md border-l border-[#e6a95f]/50 pl-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8fb7c9]">
                  Guided Trail
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[#fff8e8]">
                  {visibleTrail.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-[#c9c0ad]">
                  {visibleTrail.description}
                </p>
                <p className="mt-5 inline-flex rounded-full border border-[#e6a95f]/40 bg-[#e6a95f]/10 px-3 py-1 text-sm font-semibold text-[#f2c184]">
                  {exploredCount} of {totalCount} explored
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-6 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-[#e6a95f]/20 via-[#8fb7c9]/50 to-[#d67f7f]/20 sm:left-8" />
              <div className="space-y-5">
                {visibleTrail.drops.map((summary, index) => (
                  <TrailDropRow
                    bridge={
                      index < visibleTrail.drops.length - 1
                        ? visibleTrail.bridges?.[index] ?? null
                        : null
                    }
                    disabled={disabled}
                    index={index}
                    key={summary.drop.id}
                    onOpenDrop={onOpenDrop}
                    summary={summary}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <h2 className="mt-8 text-3xl font-semibold leading-tight tracking-normal">
            No challenge is available right now.
          </h2>
        )}
        {pairs.length > 0 ? (
          <section className="mx-auto mb-6 w-full max-w-5xl border-t border-[#fff8e8]/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8fb7c9]">
              With people
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pairs.map((pair) => (
                <button
                  className="rounded-2xl border border-[#fff8e8]/14 bg-[#fff8e8]/8 p-4 text-left transition hover:border-[#f2c184]/55 focus:outline-none focus:ring-4 focus:ring-[#f2c184]/30"
                  disabled={disabled}
                  key={pair.id}
                  onClick={() => onOpenPair(pair.id)}
                  type="button"
                >
                  <p className="text-lg font-semibold text-[#fff8e8]">
                    You & {pair.otherProfile.displayName}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#c9c0ad]">
                    {pair.sharedExplorationCount} shared{" "}
                    {pair.sharedExplorationCount === 1
                      ? "exploration"
                      : "explorations"}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        {showGoogleSignIn ? (
          <button
            className="mx-auto mb-4 min-h-12 w-full max-w-md text-base font-semibold text-[#f2c184] underline-offset-4 hover:underline disabled:opacity-60"
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

function TrailDropRow({
  bridge,
  disabled,
  index,
  onOpenDrop,
  summary,
}: {
  bridge: string | null;
  disabled: boolean;
  index: number;
  onOpenDrop: (dropId: string, status: HomeDropStatus) => void;
  summary: HomeDropSummary;
}) {
  const isCompleted = summary.status === "completed";
  const isInProgress = summary.status === "inProgress";
  const actionLabel = getHomeActionLabel(summary);
  const theme = getTerritoryTheme(summary.drop.experience.visualIdentity);

  return (
    <div className="relative grid grid-cols-[3rem_1fr] gap-3 sm:grid-cols-[4rem_1fr]">
      <div aria-hidden="true" className="relative z-10 flex flex-col items-center">
        <span
          className={[
            "mt-3 flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold shadow-[0_0_35px_rgba(255,255,255,0.08)] sm:h-14 sm:w-14",
            isCompleted
              ? "border-[var(--accent)] bg-[var(--accent)] text-[#101114]"
              : isInProgress
                ? "border-[var(--accent)] bg-[#101114] text-[var(--accent)]"
                : "border-[#f8f0df]/25 bg-[#17191e] text-[#c9c0ad]",
          ].join(" ")}
          style={{ "--accent": theme.accent } as CSSProperties}
        >
          {isCompleted ? "Seen" : index + 1}
        </span>
      </div>
      <article
        className={[
          "relative overflow-hidden rounded-2xl border p-5 shadow-2xl transition",
          isCompleted
            ? "border-[var(--accent)]/60 bg-[#f8f0df]/95 text-[#17120d]"
            : "border-[#f8f0df]/15 bg-[#f8f0df]/8 text-[#fff8e8] hover:border-[var(--accent)]/70",
        ].join(" ")}
        style={{ "--accent": theme.accent } as CSSProperties}
      >
        <div className="absolute right-3 top-3 opacity-80">
          <ArtworkSignal
            artworkId={summary.drop.experience.visualIdentity.artwork?.hero}
            theme={theme}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
          {summary.drop.topic.name}
        </p>
        <p
          className={[
            "mt-1 text-sm font-semibold",
            isCompleted ? "text-[#4e5b5f]" : "text-[#c9d6d8]",
          ].join(" ")}
        >
          {summary.drop.area.name}
        </p>
        <h3 className="mt-4 max-w-[18rem] text-2xl font-semibold leading-tight">
          {summary.drop.title}
        </h3>
        <p
          className={[
            "mt-3 max-w-[22rem] text-sm leading-6",
            isCompleted ? "text-[#5d554b]" : "text-[#c9c0ad]",
          ].join(" ")}
        >
          {summary.drop.description}
        </p>
        <button
          className={[
            "mt-5 min-h-12 w-full rounded-full px-4 text-base font-bold transition focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-60",
            isCompleted
              ? "border border-[#17120d]/15 bg-[#17120d] text-[#fff8e8] hover:bg-[#2a221a]"
              : "bg-[var(--accent)] text-[#101114] shadow-[0_0_35px_rgba(255,255,255,0.08)] hover:brightness-110",
          ].join(" ")}
          style={{ "--accent": theme.accent } as CSSProperties}
          disabled={disabled}
          onClick={() => onOpenDrop(summary.drop.id, summary.status)}
          type="button"
        >
          {disabled ? "Opening..." : actionLabel}
        </button>
      </article>
      {bridge ? (
        <div className="col-start-2 -mt-1 pb-1 pl-1">
          <p className="inline-flex rounded-full border border-[#f8f0df]/12 bg-[#101114]/80 px-4 py-2 text-sm font-semibold leading-6 text-[#f2c184]">
            {bridge}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function getHomeActionLabel(summary: HomeDropSummary) {
  if (summary.status === "completed") {
    return `Explored - ${summary.score ?? 0}/${summary.total} correct`;
  }

  if (summary.status === "inProgress") {
    return `Continue - ${summary.currentQuestionNumber ?? 1}/${summary.total} questions`;
  }

  return `Explore - ${summary.total} questions`;
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
  const theme = getTerritoryTheme(drop.experience.visualIdentity);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-8 text-[#fff8e8]"
      style={{ "--accent": theme.accent } as CSSProperties}
    >
      <WorldAtmosphere theme={theme} />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <ArtworkSignal
          artworkId={drop.experience.visualIdentity.artwork?.hero}
          theme={theme}
        />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-[#fff8e8]">
          {challenger.displayName} challenged you on {drop.topic.name}
        </h1>
        <p className="mt-5 text-2xl font-semibold text-[var(--accent)]">
          {challenger.displayName} got {challenger.result.score}/
          {challenger.result.total}
        </p>
        <p className="mt-3 text-xl font-semibold text-[#e7dcc8]">{prompt}</p>
        <div className="mt-8 rounded-3xl border border-[#fff8e8]/14 bg-[#fff8e8]/8 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            {drop.area.name}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug">
            {drop.title}
          </h2>
          <p className="mt-3 text-base text-[#c9c0ad]">
            {drop.questionCount} questions. Learn something after every answer.
          </p>
        </div>
        <button
          className="mt-8 min-h-14 w-full rounded-full bg-[var(--accent)] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-60"
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
  drop,
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
  drop: PublicDrop;
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
  const theme = getTerritoryTheme(drop.experience.visualIdentity);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-6 text-[#fff8e8]"
      style={{ "--accent": theme.accent } as CSSProperties}
    >
      <WorldAtmosphere theme={theme} />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
              {drop.topic.name}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#c9c0ad]">
              {drop.area.name}
            </p>
          </div>
          <ProgressIndicator
            currentIndex={questionIndex}
            isReveal={isReveal}
            total={questionCount}
          />
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-8 flex justify-end">
            <ArtworkSignal
              artworkId={drop.experience.visualIdentity.artwork?.hero}
              theme={theme}
            />
          </div>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-normal text-[#fff8e8]">
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
              drop={drop}
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
      className="flex items-center gap-2 text-sm font-semibold text-[#c9c0ad]"
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
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : isCurrent
                    ? "border-[#fff8e8] bg-transparent ring-2 ring-[var(--accent)]/35"
                    : "border-[#fff8e8]/25 bg-transparent",
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
        "min-h-16 w-full rounded-2xl border px-4 py-4 text-left text-base font-semibold transition focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35",
        isReveal
          ? "cursor-default"
          : "border-[#fff8e8]/15 bg-[#fff8e8]/8 text-[#fff8e8] hover:border-[var(--accent)]/80 hover:bg-[#fff8e8]/12",
        isCommitted && !isReveal
          ? "border-[var(--accent)] bg-[var(--accent)]/12"
          : "",
        isCorrect
          ? "border-[#73d99f] bg-[#73d99f]/14 text-[#dfffe9]"
          : "",
        isWrongCommitted ? "border-[#ff9a7a] bg-[#ff9a7a]/14 text-[#ffe4db]" : "",
        !isCommitted && !isCorrect ? "" : "",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {status ? (
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-current/80">
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
  drop,
  isCorrect,
  questionIndex,
  questionCount,
  reveal,
  disabled,
  onContinue,
}: {
  drop: PublicDrop;
  isCorrect: boolean;
  questionIndex: number;
  questionCount: number;
  reveal: Reveal;
  disabled: boolean;
  onContinue: () => void;
}) {
  const theme = getTerritoryTheme(drop.experience.visualIdentity);

  return (
    <section className="mt-7 rounded-3xl border border-[var(--accent)]/35 bg-[#fff8e8] p-5 text-[#17120d] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-5 flex justify-end opacity-80">
        <ArtworkSignal
          artworkId={drop.experience.visualIdentity.artwork?.reveal}
          theme={theme}
        />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7a5a2f]">
        {isCorrect ? "You knew it." : "You didn't know."}
      </p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#17120d]">
        Here&apos;s the strange part.
      </h2>
      <p className="mt-4 text-lg leading-8 text-[#3f382f]">
        {reveal.explanation}
      </p>
      <a
        className="mt-5 inline-flex text-sm font-semibold text-[#35677b] underline-offset-4 hover:underline"
        href={reveal.source.url}
        rel="noreferrer"
        target="_blank"
      >
        Source: {reveal.source.label}
      </a>
      <button
        className="mt-6 min-h-14 w-full rounded-full bg-[#101114] px-5 text-base font-bold text-[#fff8e8] shadow-sm transition hover:bg-[#25211c] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-60"
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
  onExploreNext,
  onOpenAccount,
  onSaveJourney,
  profile,
  trailContext,
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
  onExploreNext?: () => void;
  onOpenAccount?: () => void;
  onSaveJourney: () => void;
  profile: Profile | null;
  trailContext: TrailContext | null;
}) {
  const challengeCopy =
    score === total
      ? `Think someone can match your ${score}/${total}?`
      : `Think someone can beat your ${score}/${total}?`;
  const comparison = challenger ? getComparisonCopy(score, challenger) : null;
  const theme = getTerritoryTheme(drop.experience.visualIdentity);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-7 text-[#fff8e8]"
      style={{ "--accent": theme.accent } as CSSProperties}
    >
      <WorldAtmosphere theme={theme} />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3.5rem)] w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <div>
        {profile && onOpenAccount ? (
          <div className="mb-8 flex justify-end">
            <AccountChip
              disabled={disabled}
              onClick={onOpenAccount}
              profileName={profile.displayName}
            />
          </div>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
          Explored
        </p>
        <h1 className="mt-4 text-8xl font-semibold leading-none tracking-normal text-[#fff8e8] sm:text-9xl">
          {score}/{total}
        </h1>
        {comparison ? (
          <>
            <p className="mt-6 text-3xl font-semibold leading-tight">
              {comparison.headline}
            </p>
            <p className="mt-3 text-base font-semibold text-[#c9c0ad]">
              You {score}/{total} | {challenger?.displayName}{" "}
              {challenger?.result.score}/{challenger?.result.total}
            </p>
            {challenger?.overlap ? (
              <>
                <OverlapGrid
                  className="mt-5 max-w-xl"
                  otherName={challenger.displayName}
                  overlap={challenger.overlap}
                />
                <DifferenceDiscoveries
                  className="mt-4 max-w-xl"
                  otherName={challenger.displayName}
                  overlap={challenger.overlap}
                />
              </>
            ) : null}
          </>
        ) : (
          <p className="mt-6 max-w-md text-2xl leading-9 text-[#e7dcc8]">
            You knew {score} of {total} on this {drop.topic.name} challenge.
          </p>
        )}
        <p className="mt-6 max-w-md text-base font-semibold text-[#c9c0ad]">
          {drop.title}
        </p>
        </div>
        <div>
          <div className="rounded-[2rem] border border-[#fff8e8]/14 bg-[#fff8e8]/8 p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
                  {drop.topic.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#c9c0ad]">
                  {drop.area.name}
                </p>
              </div>
              <ArtworkSignal
                artworkId={drop.experience.visualIdentity.artwork?.hero}
                theme={theme}
              />
            </div>
            {trailContext?.nextDrop && onExploreNext ? (
          <section
            className={[
              "rounded-3xl border p-5",
              challenger
                ? "border-[#fff8e8]/16 bg-[#101114]/60"
                : "border-[var(--accent)]/50 bg-[var(--accent)]/12",
            ].join(" ")}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              Continue the trail
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#fff8e8]">
              {trailContext.nextDrop.title}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#c9c0ad]">
              {trailContext.nextDrop.topic.name} /{" "}
              {trailContext.nextDrop.area.name}
            </p>
            <button
              className={[
                "mt-5 min-h-12 w-full rounded-full px-4 text-base font-bold transition focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-60",
                challenger
                  ? "border border-[#fff8e8]/25 bg-[#fff8e8] text-[#101114] hover:bg-white"
                  : "bg-[var(--accent)] text-[#101114] shadow-sm hover:brightness-110",
              ].join(" ")}
              disabled={disabled}
              onClick={onExploreNext}
              type="button"
            >
              Explore next
            </button>
          </section>
            ) : (
              <section className="rounded-3xl border border-[#fff8e8]/16 bg-[#101114]/60 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Trail complete
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  You reached the end of this thread.
                </h2>
              </section>
            )}
        <div className="mt-6">
          <p className="text-lg font-semibold text-[#fff8e8]">{challengeCopy}</p>
          <button
            className="mt-4 min-h-14 w-full rounded-full bg-[#fff8e8] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/35 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={onChallenge}
            type="button"
          >
            {disabled ? "Preparing..." : "Challenge a friend"}
          </button>
          <button
            className="mt-3 min-h-12 w-full text-base font-bold text-[#f2c184] underline-offset-4 hover:underline disabled:opacity-70"
            disabled={disabled}
            onClick={onBackToHome}
            type="button"
          >
            Back to Home
          </button>
          {!isAuthenticated ? (
            <div className="mt-6 border-t border-[#fff8e8]/12 pt-5">
              <p className="text-sm font-medium text-[#c9c0ad]">
                {challenger
                  ? `Save this comparison and see what you discover differently from ${challenger.displayName}.`
                  : `Keep your ${drop.topic.name} progress across devices.`}
              </p>
              <button
                className="mt-2 text-base font-semibold text-[#f2c184] underline-offset-4 hover:underline disabled:opacity-60"
                disabled={disabled}
                onClick={onSaveJourney}
                type="button"
              >
                {challenger
                  ? `Keep comparing with ${challenger.displayName}`
                  : "Save my journey"}
              </button>
            </div>
          ) : null}
          {journeySavedNotice ? (
            <div className="mt-6 rounded-2xl border border-[#73d99f]/40 bg-[#73d99f]/12 p-4">
              <p className="font-semibold text-[#dfffe9]">Journey saved</p>
              <p className="mt-1 text-sm leading-6 text-[#c9c0ad]">
                Your progress is now connected to your Google account.
              </p>
            </div>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PairScreen({
  disabled,
  error,
  onBackToHome,
  onChallengeDrop,
  pair,
}: {
  disabled: boolean;
  error: string | null;
  onBackToHome: () => void;
  onChallengeDrop: (summary: PairDropSummary) => void;
  pair: PairState | null;
}) {
  if (!pair) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-8 text-[#fff8e8]">
        <WorldAtmosphere />
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f2c184]">
            Did You Know?
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
            This comparison is not available.
          </h1>
          <button
            className="mt-8 min-h-14 w-full rounded-full bg-[#f2c184] px-5 text-base font-bold text-[#101114]"
            onClick={onBackToHome}
            type="button"
          >
            Back to Home
          </button>
        </section>
      </main>
    );
  }

  const sharedDrops = pair.drops.filter((summary) => summary.overlap);
  const challengeableDrops = pair.drops.filter(
    (summary) => summary.myScore !== null && summary.theirScore === null,
  );
  const theirOnlyDrops = pair.drops.filter(
    (summary) => summary.myScore === null && summary.theirScore !== null,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-7 text-[#fff8e8]">
      <WorldAtmosphere />
      <section className="relative z-10 mx-auto w-full max-w-5xl py-8">
        <button
          className="mb-8 text-sm font-bold text-[#f2c184] underline-offset-4 hover:underline"
          disabled={disabled}
          onClick={onBackToHome}
          type="button"
        >
          Back to Home
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8fb7c9]">
          Knowledge between us
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-none tracking-normal text-[#fff8e8] sm:text-7xl">
          You & {pair.otherProfile.displayName}
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-8 text-[#c9c0ad]">
          {sharedDrops.length} shared{" "}
          {sharedDrops.length === 1 ? "exploration" : "explorations"} so far.
          See where your answers overlapped and where they differed.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            {pair.drops.map((summary) => (
              <PairDropCard
                disabled={disabled}
                key={summary.drop.id}
                onChallengeDrop={onChallengeDrop}
                otherName={pair.otherProfile.displayName}
                summary={summary}
              />
            ))}
          </div>
          <aside className="rounded-[2rem] border border-[#fff8e8]/14 bg-[#fff8e8]/8 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f2c184]">
              Next spark
            </p>
            {challengeableDrops[0] ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  {pair.otherProfile.displayName} has not explored{" "}
                  {challengeableDrops[0].drop.title} yet.
                </h2>
                <button
                  className="mt-5 min-h-12 w-full rounded-full bg-[#fff8e8] px-4 text-base font-bold text-[#101114] transition hover:bg-white disabled:opacity-60"
                  disabled={disabled}
                  onClick={() => onChallengeDrop(challengeableDrops[0])}
                  type="button"
                >
                  Challenge {pair.otherProfile.displayName}
                </button>
              </>
            ) : theirOnlyDrops[0] ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  {pair.otherProfile.displayName} explored{" "}
                  {theirOnlyDrops[0].drop.title}.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#c9c0ad]">
                  Explore it from Home to add another comparison.
                </p>
              </>
            ) : (
              <p className="mt-3 text-base leading-7 text-[#c9c0ad]">
                Explore another Drop, then challenge{" "}
                {pair.otherProfile.displayName} to keep building this
                comparison.
              </p>
            )}
          </aside>
        </div>
        {error ? <p className="mt-5 text-sm text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}

function PairDropCard({
  disabled,
  onChallengeDrop,
  otherName,
  summary,
}: {
  disabled: boolean;
  onChallengeDrop: (summary: PairDropSummary) => void;
  otherName: string;
  summary: PairDropSummary;
}) {
  const theme = getTerritoryTheme(summary.drop.experience.visualIdentity);

  return (
    <section
      className="rounded-[2rem] border border-[#fff8e8]/14 bg-[#fff8e8]/8 p-5"
      style={{ "--accent": theme.accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
            {summary.drop.topic.name}
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">
            {summary.drop.title}
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#c9c0ad]">
            {summary.drop.area.name}
          </p>
        </div>
        <ArtworkSignal
          artworkId={summary.drop.experience.visualIdentity.artwork?.hero}
          theme={theme}
        />
      </div>

      {summary.overlap ? (
        <>
          <p className="mt-5 text-lg font-semibold">
            You {summary.myScore}/{summary.total} | {otherName}{" "}
            {summary.theirScore}/{summary.total}
          </p>
          <OverlapGrid
            className="mt-4"
            otherName={otherName}
            overlap={summary.overlap}
          />
          <DifferenceDiscoveries
            className="mt-4"
            otherName={otherName}
            overlap={summary.overlap}
          />
        </>
      ) : summary.myScore !== null ? (
        <div className="mt-5 rounded-3xl border border-[var(--accent)]/30 bg-[#101114]/45 p-4">
          <p className="text-base font-semibold">
            You explored this. {otherName} has not.
          </p>
          <button
            className="mt-4 min-h-12 w-full rounded-full bg-[#fff8e8] px-4 text-base font-bold text-[#101114] transition hover:bg-white disabled:opacity-60"
            disabled={disabled}
            onClick={() => onChallengeDrop(summary)}
            type="button"
          >
            Challenge {otherName}
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-[#fff8e8]/14 bg-[#101114]/45 p-4">
          <p className="text-base font-semibold">
            {otherName} explored this. You have not yet.
          </p>
        </div>
      )}
    </section>
  );
}

function OverlapGrid({
  className = "",
  otherName,
  overlap,
}: {
  className?: string;
  otherName: string;
  overlap: AnswerOverlap;
}) {
  return (
    <div className={`grid gap-2 sm:grid-cols-2 ${className}`}>
      <OverlapTile label="Both knew" value={overlap.bothKnew} />
      <OverlapTile
        label={`You knew, ${otherName} missed`}
        value={overlap.youKnewTheyMissed}
      />
      <OverlapTile
        label={`${otherName} knew, you missed`}
        value={overlap.theyKnewYouMissed}
      />
      <OverlapTile label="Neither knew" value={overlap.neitherKnew} />
    </div>
  );
}

function DifferenceDiscoveries({
  className = "",
  otherName,
  overlap,
}: {
  className?: string;
  otherName: string;
  overlap: AnswerOverlap;
}) {
  const hasDifferences =
    overlap.youKnewTheyMissedDiscoveries.length > 0 ||
    overlap.theyKnewYouMissedDiscoveries.length > 0;

  if (!hasDifferences) {
    return null;
  }

  return (
    <div className={`grid gap-3 ${className}`}>
      <DiscoveryList
        discoveries={overlap.youKnewTheyMissedDiscoveries}
        title={`You knew this. ${otherName} didn't.`}
      />
      <DiscoveryList
        discoveries={overlap.theyKnewYouMissedDiscoveries}
        title={`${otherName} knew this. You didn't.`}
      />
    </div>
  );
}

function DiscoveryList({
  discoveries,
  title,
}: {
  discoveries: AnswerDifference[];
  title: string;
}) {
  if (discoveries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[#fff8e8]/12 bg-[#101114]/45 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f2c184]">
        {title}
      </p>
      <div className="mt-3 space-y-3">
        {discoveries.map((discovery) => (
          <article key={discovery.questionId}>
            <p className="text-sm font-semibold leading-6 text-[#fff8e8]">
              {discovery.prompt}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#c9c0ad]">
              {discovery.explanation}
            </p>
            <a
              className="mt-2 inline-flex text-xs font-bold uppercase tracking-[0.16em] text-[#8fb7c9] underline-offset-4 hover:underline"
              href={discovery.source.url}
              rel="noreferrer"
              target="_blank"
            >
              Source: {discovery.source.label}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function OverlapTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#fff8e8]/12 bg-[#101114]/45 p-3">
      <p className="text-2xl font-semibold text-[#fff8e8]">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#c9c0ad]">
        {label}
      </p>
    </div>
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
      : purpose === "compare"
        ? "Continue with Google to keep this comparison and see what you discover differently."
        : "Continue with Google to keep your scores across devices.";

  return (
    <Sheet onClose={onClose} title="Create your profile">
      <p className="text-base leading-7 text-[#c9c0ad]">{copy}</p>
      <button
        className="mt-5 min-h-14 w-full rounded-full bg-[#fff8e8] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35 disabled:cursor-not-allowed disabled:opacity-60"
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
      className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#fff8e8]/18 bg-[#fff8e8]/10 px-4 text-sm font-bold text-[#fff8e8] shadow-sm backdrop-blur hover:border-[#f2c184]/60 focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35 disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="break-words text-sm font-medium text-[#c9c0ad]">
          {email}
        </p>
      ) : null}
      <p className="mt-4 text-base leading-7 text-[#c9c0ad]">
        Your progress is saved to your profile.
      </p>
      <button
        className="mt-5 min-h-12 w-full rounded-full border border-[#fff8e8]/25 bg-[#fff8e8] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35 disabled:cursor-not-allowed disabled:opacity-60"
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
      <p className="text-sm font-medium text-[#c9c0ad]">
        Your score: {score}/{total} - {topicTitle}
      </p>
      <button
        className="mt-5 min-h-14 w-full rounded-full bg-[#fff8e8] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onWhatsApp}
        type="button"
      >
        Challenge on WhatsApp
      </button>
      <button
        className="mt-3 min-h-14 w-full rounded-full border border-[#fff8e8]/25 bg-transparent px-5 text-base font-bold text-[#fff8e8] shadow-sm transition hover:border-[#fff8e8]/60 focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onCopy}
        type="button"
      >
        Copy Invite
      </button>
      {copyStatus ? (
        <p className="mt-3 text-sm font-semibold text-[#a4d6b2]">
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
    <div className="fixed inset-0 z-10 flex items-end bg-black/60 px-4 pb-4 backdrop-blur-sm">
      <section
        aria-labelledby="sheet-title"
        className="mx-auto w-full max-w-md rounded-3xl border border-[#fff8e8]/14 bg-[#15161a] p-5 text-[#fff8e8] shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold" id="sheet-title">
            {title}
          </h2>
          <button
            className="min-h-10 min-w-10 rounded-full text-xl leading-none text-[#c9c0ad] hover:bg-[#fff8e8]/10 focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35"
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
    <main className="relative min-h-screen overflow-hidden bg-[#101114] px-5 py-8 text-[#fff8e8]">
      <WorldAtmosphere />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f2c184]">
          Did You Know?
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal">
          This challenge link isn&apos;t available.
        </h1>
        <Link
          className="mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-[#f2c184] px-5 text-base font-bold text-[#101114] shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#f2c184]/35"
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101114] px-5 text-[#fff8e8]">
      <WorldAtmosphere />
      <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.24em] text-[#f2c184]">
        Loading...
      </p>
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
  experience: {
    centralIdea: string;
    exitUnderstanding: string;
    visualIdentity: VisualIdentity;
  };
  questionCount: number;
};

type VisualIdentity = {
  family: string;
  motif: string;
  artwork?: {
    hero?: string;
    reveal?: string;
  };
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
  overlap: AnswerOverlap | null;
};

type AnswerOverlap = {
  bothKnew: number;
  youKnewTheyMissed: number;
  theyKnewYouMissed: number;
  neitherKnew: number;
  youKnewTheyMissedDiscoveries: AnswerDifference[];
  theyKnewYouMissedDiscoveries: AnswerDifference[];
};

type AnswerDifference = {
  questionId: string;
  prompt: string;
  explanation: string;
  source: {
    label: string;
    url: string;
  };
};

type HomeDropStatus = "unstarted" | "inProgress" | "completed";

type HomeDropSummary = {
  drop: PublicDrop;
  status: HomeDropStatus;
  currentQuestionNumber: number | null;
  score: number | null;
  total: number;
};

type PairSummary = {
  id: Id<"knowledgePairs">;
  otherProfile: SocialProfile;
  sharedExplorationCount: number;
};

type PairDropSummary = {
  drop: PublicDrop;
  myScore: number | null;
  theirScore: number | null;
  total: number;
  overlap: AnswerOverlap | null;
};

type PairState = {
  id: Id<"knowledgePairs">;
  otherProfile: SocialProfile;
  drops: PairDropSummary[];
};

type HomeTrail = {
  id: string;
  title: string;
  description: string;
  bridges?: string[];
  drops: HomeDropSummary[];
};

type TrailContext = {
  trail: {
    id: string;
    title: string;
    description: string;
    bridges?: string[];
  };
  position: number;
  total: number;
  previousDrop: PublicDrop | null;
  nextDrop: PublicDrop | null;
};

type Profile = {
  id: string;
  displayName: string;
  email?: string;
};

type SocialProfile = {
  id: string;
  displayName: string;
};
