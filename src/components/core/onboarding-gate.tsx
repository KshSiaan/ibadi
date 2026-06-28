"use client";

import { useEffect, useState } from "react";
import Onboarding, { STORAGE_KEY } from "./onboarding";
import PrivacyModal, { PRIVACY_KEY } from "./privacy-modal";

type Stage = "loading" | "onboarding" | "privacy" | "done";

export default function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("loading");

  useEffect(() => {
    const onboarded = !!localStorage.getItem(STORAGE_KEY);
    const privacyAccepted = !!localStorage.getItem(PRIVACY_KEY);

    if (!onboarded) {
      setStage("onboarding");
    } else if (!privacyAccepted) {
      setStage("privacy");
    } else {
      setStage("done");
    }
  }, []);

  if (stage === "loading") return null;

  if (stage === "onboarding") {
    return <Onboarding onDone={() => setStage("privacy")} />;
  }

  if (stage === "privacy") {
    return (
      <>
        {children}
        <PrivacyModal onAccept={() => setStage("done")} />
      </>
    );
  }

  return <>{children}</>;
}
