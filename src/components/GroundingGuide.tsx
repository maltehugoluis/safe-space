"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ArrowRight, RotateCcw, Check, Fingerprint, Volume2, Smile, Activity } from "lucide-react";

// Types
type GroundingStep = {
  number: number;
  icon: React.ReactNode;
  title: string;
  instruction: string;
  placeholder: string;
  itemsCount: number;
};

export default function GroundingGuide() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps: GroundingStep[] = [
    {
      number: 5,
      icon: <Eye className="w-6 h-6 text-sage-600 dark:text-sage-400" />,
      title: "5 Dinge sehen",
      instruction: "Schaue dich um. Finde 5 Dinge in deiner Umgebung, die du bewusst sehen kannst. Nimm dir für jedes Ding einen Moment Zeit.",
      placeholder: "z.B. die Lampe, ein Buch, ein Fleck an der Wand...",
      itemsCount: 5,
    },
    {
      number: 4,
      icon: <Fingerprint className="w-6 h-6 text-sage-600 dark:text-sage-400" />,
      title: "4 Dinge spüren",
      instruction: "Spüre in deinen Körper und deine Umgebung hinein. Finde 4 Dinge, die du anfassen oder körperlich wahrnehmen kannst.",
      placeholder: "z.B. den Stoff deines T-Shirts, die Tischplatte, die Luft auf deiner Haut...",
      itemsCount: 4,
    },
    {
      number: 3,
      icon: <Volume2 className="w-6 h-6 text-sage-600 dark:text-sage-400" />,
      title: "3 Dinge hören",
      instruction: "Lausche ganz aufmerksam. Welche 3 Geräusche nimmst du in diesem Moment wahr?",
      placeholder: "z.B. das Ticken einer Uhr, Autorauschen in der Ferne, das Summen des Kühlschranks...",
      itemsCount: 3,
    },
    {
      number: 2,
      icon: <Activity className="w-6 h-6 text-sage-600 dark:text-sage-400" />,
      title: "2 Dinge riechen",
      instruction: "Atme tief durch die Nase ein. Versuche, 2 verschiedene Gerüche in deiner Umgebung wahrzunehmen.",
      placeholder: "z.B. Kaffeeduft, frische Wäsche, den Geruch von Regen...",
      itemsCount: 2,
    },
    {
      number: 1,
      icon: <Smile className="w-6 h-6 text-sage-600 dark:text-sage-400" />,
      title: "1 Ding schmecken",
      instruction: "Fokussiere dich auf deinen Mundraum. Kannst du 1 Sache schmecken? Oder nimm einen Schluck Wasser.",
      placeholder: "z.B. den Geschmack von Zahnpasta, Kaugummi, einen Schluck kaltes Wasser...",
      itemsCount: 1,
    },
  ];

  const currentStep = steps[currentStepIdx];

  // Initialize checks array for the current step
  React.useEffect(() => {
    setCheckedItems(new Array(currentStep.itemsCount).fill(false));
  }, [currentStepIdx]);

  const handleToggleCheck = (index: number) => {
    const nextChecked = [...checkedItems];
    nextChecked[index] = !nextChecked[index];
    setCheckedItems(nextChecked);
  };

  const allChecked = checkedItems.length > 0 && checkedItems.every(Boolean);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsCompleted(false);
    setCheckedItems([]);
  };

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key={currentStepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Header / Step Indicator */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs uppercase tracking-widest text-foreground/50 font-semibold">
                Erdung ({currentStepIdx + 1} / {steps.length})
              </span>
              <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border">
                {currentStep.icon}
                <span className="text-sm font-semibold">{currentStep.title}</span>
              </div>
            </div>

            {/* Instruction */}
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
              {currentStep.instruction}
            </p>

            {/* Interactive Items to check off */}
            <div className="flex flex-col gap-3 mb-8">
              {checkedItems.map((checked, idx) => (
                <button
                  key={idx}
                  onClick={() => handleToggleCheck(idx)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                    checked
                      ? "bg-sage-100/50 border-sage-300 text-sage-800 dark:bg-sage-950/40 dark:border-sage-800 dark:text-sage-300"
                      : "bg-background border-border text-foreground hover:border-sage-200"
                  }`}
                >
                  <span className={`text-sm ${checked ? "line-through opacity-60" : ""}`}>
                    {checked ? `Wahrgenommen #${idx + 1}` : `Wahrnehmen...`}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                      checked
                        ? "bg-sage-600 border-sage-600 text-white"
                        : "border-border bg-background"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!allChecked}
              className={`w-full py-3.5 rounded-full font-medium flex items-center justify-center gap-2 shadow-sm transition-all ${
                allChecked
                  ? "bg-sage-600 text-white hover:bg-sage-700 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-background border border-border text-foreground/45 cursor-not-allowed"
              }`}
            >
              {currentStepIdx === steps.length - 1 ? "Übung abschließen" : "Nächster Schritt"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-6 flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-sage-100 dark:bg-sage-900 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-sage-600 dark:text-sage-400 stroke-[3]" />
            </div>
            <h3 className="text-xl font-medium mb-3">Wunderbar gemacht</h3>
            <p className="text-sm text-foreground/75 leading-relaxed max-w-xs mb-8">
              Du hast dich erfolgreich mit dem Hier und Jetzt verbunden. Nimm dir einen Moment Zeit, um nachzuspüren.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-full border border-border bg-background text-sm font-medium hover:bg-sage-50 dark:hover:bg-sage-950 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Übung wiederholen
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
