import { useState, useEffect, useRef, useCallback } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { WelcomePage } from "./components/WelcomePage";
import { MoodMeterPage } from "./components/MoodMeterPage";
import { SubEmotionsPage } from "./components/SubEmotionsPage";
import { AllEmotionsPage } from "./components/AllEmotionsPage";
import { ThankYouPage } from "./components/ThankYouPage";
import { LanguageSelector } from "./components/LanguageSelector";
import { QuadrantId } from "./data/emotions";

type Page = "welcome" | "mood-meter" | "sub-emotions" | "all-emotions" | "thank-you";

const INACTIVITY_TIMEOUT = 50000; // Reset after 50s of no activity
const CLICK_DEBOUNCE_MS = 500;

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantId | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");

  const { setLanguage } = useLanguage();

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClick = useRef<boolean>(false);

  const withClickProtection = useCallback(<T extends (...args: any[]) => void>(fn: T): T => {
    return ((...args: Parameters<T>) => {
      if (isProcessingClick.current) return;
      isProcessingClick.current = true;
      fn(...args);
      setTimeout(() => {
        isProcessingClick.current = false;
      }, CLICK_DEBOUNCE_MS);
    }) as T;
  }, []);

  const handleGetStarted = useCallback(() => {
    setCurrentPage("mood-meter");
  }, []);

  const handleSelectQuadrant = useCallback((quadrant: string) => {
    setSelectedQuadrant(quadrant as QuadrantId);
    setCurrentPage("sub-emotions");
  }, []);

  const handleSelectEmotion = useCallback((emotion: string) => {
    setSelectedEmotion(emotion);
    setCurrentPage("thank-you");
  }, []);

  const handleBack = useCallback(() => {
    setCurrentPage("mood-meter");
  }, []);

  const handleSeeAllEmotions = useCallback(() => {
    setCurrentPage("all-emotions");
  }, []);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    clearInactivityTimer();
    setSelectedQuadrant(null);
    setSelectedEmotion("");
    setCurrentPage("welcome");
    setLanguage('en');
  }, [clearInactivityTimer, setLanguage]);

  const armInactivityTimer = useCallback(() => {
    clearInactivityTimer();

    const shouldTrack =
      currentPage === "mood-meter" ||
      currentPage === "sub-emotions" ||
      currentPage === "all-emotions" ||
      currentPage === "thank-you";

    if (!shouldTrack) return;

    inactivityTimer.current = setTimeout(handleReset, INACTIVITY_TIMEOUT);
  }, [currentPage, clearInactivityTimer, handleReset]);

  // (Re)arm whenever the page changes
  useEffect(() => {
    armInactivityTimer();
  }, [armInactivityTimer]);

  // Any user activity restarts the clock
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'pointerdown', 'pointermove', 'click'];
    events.forEach((event) => document.addEventListener(event, armInactivityTimer));
    return () => {
      events.forEach((event) => document.removeEventListener(event, armInactivityTimer));
      clearInactivityTimer();
    };
  }, [armInactivityTimer, clearInactivityTimer]);

  return (
    <>
      {currentPage === "welcome" && (
        <WelcomePage onGetStarted={withClickProtection(handleGetStarted)} />
      )}

      {currentPage === "mood-meter" && (
        <MoodMeterPage
          onSelectQuadrant={withClickProtection(handleSelectQuadrant)}
          onSeeAllEmotions={withClickProtection(handleSeeAllEmotions)}
        />
      )}

      {currentPage === "sub-emotions" && selectedQuadrant && (
        <SubEmotionsPage
          quadrant={selectedQuadrant}
          onSelectEmotion={withClickProtection(handleSelectEmotion)}
          onBack={withClickProtection(handleBack)}
        />
      )}

      {currentPage === "all-emotions" && (
        <AllEmotionsPage
          onSelectEmotion={withClickProtection(handleSelectEmotion)}
          onBack={withClickProtection(handleBack)}
        />
      )}

      {currentPage === "thank-you" && (
        <ThankYouPage
          selectedEmotion={selectedEmotion}
          onReset={withClickProtection(handleReset)}
        />
      )}

      <LanguageSelector />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
