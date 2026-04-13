import type { ProgramStep, ProgramStepId } from '@/features/programs/types';

type ProgramStepTabsProps = {
  activeStep: ProgramStepId;
  activeStepClassName: string;
  inactiveStepClassName: string;
  onStepChange: (step: ProgramStepId) => void;
  steps: ProgramStep[];
};

export function ProgramStepTabs({
  activeStep,
  activeStepClassName,
  inactiveStepClassName,
  onStepChange,
  steps,
}: ProgramStepTabsProps) {
  return (
    <div className="mb-6 grid gap-2 sm:grid-cols-3">
      {steps.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onStepChange(item.id)}
          className={`rounded-2xl border px-4 py-3 text-left transition-all ${
            activeStep === item.id ? activeStepClassName : inactiveStepClassName
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-[0.2em]">
            Adim {item.id}
          </div>
          <div className="mt-1 text-sm font-semibold">{item.title}</div>
        </button>
      ))}
    </div>
  );
}
