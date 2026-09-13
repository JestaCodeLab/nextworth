import type { OnboardingStep } from "@/lib/types";

export function onboardingStepPath(step: OnboardingStep): string {
  switch (step) {
    case "verification":
      return "/onboarding/verification";
    case "welcome":
      return "/onboarding/welcome";
    case "complete":
      return "/dashboard";
  }
}
