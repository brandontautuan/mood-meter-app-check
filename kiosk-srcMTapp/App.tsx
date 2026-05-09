import { useState, useEffect, useRef, useCallback } from "react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { useTranslation } from "./data/translations";
import { WelcomePage } from "./components/WelcomePage";
import { MoodMeterPage } from "./components/MoodMeterPage";
import { SubEmotionsPage } from "./components/SubEmotionsPage";
import { AllEmotionsPage } from "./components/AllEmotionsPage";
import { ThankYouPage } from "./components/ThankYouPage";
import { LanguageSelector } from "./components/LanguageSelector";
import { QuadrantId } from "./data/emotions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { motion, AnimatePresence } from "motion/react";

type Page = "welcome" | "mood-meter" | "sub-emotions" | "all-emotions" | "thank-you";

// Inactivity timings (adjust here for different durations)
const PROMPT_TIMEOUT = 60000; // Show prompt after 60 seconds
const COUNTDOWN_SECONDS = 15; // Countdown duration once prompt appears
const RESET_TIMEOUT = COUNTDOWN_SECONDS * 1000; // Reset once countdown completes
const CLICK_DEBOUNCE_MS = 500; // Prevent rapid clicks - only process first click within this window

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantId | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  
  const { getThemeColors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  const colors = getThemeColors();
  
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const promptTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const autoResetTimer = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClick = useRef<boolean>(false);

  // Debounce wrapper to prevent rapid clicks - handles functions with or without parameters
  const withClickProtection = useCallback(<T extends (...args: any[]) => void>(fn: T): T => {
    return ((...args: Parameters<T>) => {
      if (isProcessingClick.current) {
        return; // Ignore if already processing a click
      }
      isProcessingClick.current = true;
      fn(...args);
      // Reset after debounce period
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

  const clearTimers = useCallback(() => {
    if (promptTimer.current) {
      clearTimeout(promptTimer.current);
      promptTimer.current = null;
    }
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (autoResetTimer.current) {
      clearTimeout(autoResetTimer.current);
      autoResetTimer.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    clearTimers();
    setSelectedQuadrant(null);
    setSelectedEmotion("");
    setCurrentPage("welcome");
    setShowWarning(false);
    setCountdown(COUNTDOWN_SECONDS);
    setLanguage('en');
  }, [clearTimers, setLanguage]);

  const resetTimers = useCallback(() => {
    clearTimers();
    
    // Skip timers on welcome page only
    const shouldTrack =
      currentPage === "mood-meter" ||
      currentPage === "sub-emotions" ||
      currentPage === "all-emotions" ||
      currentPage === "thank-you";

    if (!shouldTrack) {
      setShowWarning(false);
      return;
    }

    // Show prompt after inactivity threshold
    promptTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(COUNTDOWN_SECONDS);

      // Failsafe reset in case countdown doesn't fire
      autoResetTimer.current = setTimeout(() => {
        handleReset();
      }, RESET_TIMEOUT);
    }, PROMPT_TIMEOUT);

    // Safety reset in case anything else goes wrong (prompt + countdown duration + grace)
    inactivityTimer.current = setTimeout(() => {
      handleReset();
    }, PROMPT_TIMEOUT + RESET_TIMEOUT + 1000);
  }, [currentPage, clearTimers, handleReset]);

  const handleUserActivity = useCallback(() => {
    if (showWarning) {
      setShowWarning(false);
      setCountdown(COUNTDOWN_SECONDS);
    }
    resetTimers();
  }, [showWarning, resetTimers]);

  const handleStayActive = () => {
    setShowWarning(false);
    setCountdown(COUNTDOWN_SECONDS);
    resetTimers();
  };

  // Drive the countdown while the warning is visible
  useEffect(() => {
    if (!showWarning) return;

    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }
          setShowWarning(false);
          handleReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    };
  }, [showWarning, handleReset]);

  // Auto-reset when countdown finishes while warning is visible
  useEffect(() => {
    if (showWarning && countdown <= 0) {
      handleReset();
    }
  }, [showWarning, countdown, handleReset]);

  // Start timer when page changes (but not on welcome page)
  useEffect(() => {
    resetTimers();
  }, [resetTimers]);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'pointerdown', 'pointermove', 'click'];
    
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearTimers();
    };
  }, [handleUserActivity, clearTimers]);

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

      {/* Inactivity Warning Dialog */}
      <AlertDialog open={showWarning}>
        <AlertDialogContent className={`${colors.cardBg} ${colors.text} border-2 ${colors.text.replace('text-', 'border-')} max-w-md`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center`}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <span>{t.areYouStillThere}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className={`${colors.text} opacity-80 text-center pt-4`}>
              {t.stayActiveInstruction}
              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className={`text-5xl my-4 bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}
                >
                  {countdown}
                </motion.div>
              </AnimatePresence>
              {t.secondsRemaining}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center sm:justify-center">
            <motion.button
              onClick={handleStayActive}
              className={`px-8 py-3 bg-gradient-to-br ${colors.gradient} text-white rounded-full shadow-lg`}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              {t.stillHere}
            </motion.button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
