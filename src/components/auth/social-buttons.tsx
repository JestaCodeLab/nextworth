import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.26a12 12 0 0 0 0 10.75l4.01-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.64l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.25 3.06-.98 1.03-2.16 1.63-3.42 1.53-.1-1.15.44-2.28 1.24-3.08.9-.91 2.24-1.55 3.43-1.51Zm3.94 16.3c-.4.94-.88 1.83-1.44 2.66-.79 1.16-1.71 2.6-3.13 2.61-1.26.02-1.59-.82-3.31-.81-1.72.01-2.08.82-3.34.8-1.42-.03-2.28-1.34-3.07-2.5C4.11 18.03 3 14.36 4.42 11.83c.71-1.26 1.98-2.06 3.36-2.08 1.28-.03 2.49.86 3.31.86.81 0 2.29-1.06 3.86-.9.66.03 2.5.27 3.69 2.02-.1.06-2.2 1.29-2.18 3.84.03 3.04 2.67 4.05 2.7 4.06Z" />
    </svg>
  );
}

/**
 * No OAuth provider is wired up yet (managed auth was ruled out — this app
 * uses in-house Passport/JWT), so these are visibly inert rather than
 * pretending to work. Included for visual parity with the mockups.
 */
export function SocialButtons({ variant }: { variant: "up" | "in" }) {
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" className="h-11 gap-2" disabled title="Not available yet">
          <GoogleIcon />
          Sign {variant} with Google
        </Button>
        <Button type="button" variant="outline" className="h-11 gap-2" disabled title="Not available yet">
          <AppleIcon />
          Sign {variant} with Apple
        </Button>
      </div>
    </>
  );
}
