"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IntroExperience } from "@/components/intro/intro-experience";
import { Dashboard } from "@/components/dashboard";

const INTRO_SEEN_KEY = "sentinel:intro-seen";

function subscribe() {
  return () => {};
}

function getSnapshot(): string | null {
  return sessionStorage.getItem(INTRO_SEEN_KEY);
}

function getServerSnapshot(): undefined {
  return undefined;
}

export function AppExperience() {
  const storedFlag = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [completedThisSession, setCompletedThisSession] = useState(false);

  if (storedFlag === undefined) return null;

  const showIntro = !storedFlag && !completedThisSession;

  function completeIntro() {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    setCompletedThisSession(true);
  }

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <IntroExperience onComplete={completeIntro} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
