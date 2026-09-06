// Brand marks used in the composer footer and integration cards. Paths are
// copied verbatim from hyperagent.com so the marks render pixel-identical.
import type { SVGProps } from "react";

type IconProps = { size?: number; className?: string };

export function HyperagentMark({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16.4805 0C19.2192 0.000148464 21.4403 2.22119 21.4404 4.95996C21.4404 7.69884 19.2193 9.91977 16.4805 9.91992C12.8578 9.91992 9.91992 12.8578 9.91992 16.4805C9.91977 19.2193 7.69884 21.4404 4.95996 21.4404C2.22119 21.4403 0.000148466 19.2192 0 16.4805C0 13.7416 2.2211 11.5206 4.95996 11.5205C8.58259 11.5205 11.5205 8.58259 11.5205 4.95996C11.5206 2.2211 13.7416 0 16.4805 0ZM16.5098 11.5C19.249 11.5 21.4695 13.7208 21.4697 16.46C21.4697 19.1993 19.2491 21.4199 16.5098 21.4199C13.7705 21.4198 11.5498 19.1992 11.5498 16.46C11.55 13.7209 13.7707 11.5001 16.5098 11.5ZM4.95996 0C7.69922 0 9.9198 2.22074 9.91992 4.95996C9.91992 7.69929 7.69929 9.91992 4.95996 9.91992C2.22074 9.9198 0 7.69922 0 4.95996C0.000126519 2.22081 2.22081 0.000126521 4.95996 0Z" fill="currentColor"></path>
    </svg>
  );
}

export function AirtableLogo({ size = 16, className = "shrink-0" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="10 8 180 152" aria-label="Airtable logo"><path className="fill-black dark:fill-white" d="M90.039 12.367 24.079 39.66c-3.667 1.519-3.63 6.729.062 8.192l66.235 26.266a24.58 24.58 0 0 0 18.12 0l66.236-26.266c3.69-1.463 3.729-6.673.06-8.191l-65.958-27.294a24.58 24.58 0 0 0-18.795 0M105.312 88.46v65.617c0 3.12 3.147 5.258 6.048 4.108l73.806-28.648a4.42 4.42 0 0 0 2.79-4.108V59.813c0-3.121-3.147-5.258-6.048-4.108l-73.806 28.648a4.42 4.42 0 0 0-2.79 4.108M88.078 91.846l-21.904 10.576-2.224 1.075-46.238 22.155c-2.93 1.414-6.672-.722-6.672-3.978V60.088c0-1.178.604-2.195 1.414-2.96a5 5 0 0 1 1.12-.84c1.104-.663 2.68-.84 4.02-.31L87.71 83.76c3.564 1.414 3.844 6.408.368 8.087"></path></svg>;
}

export function GmailLogo({ size = 16, className = "shrink-0" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="52 42 88 66" aria-label="Gmail logo"><path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"></path><path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"></path><path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"></path><path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"></path><path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"></path></svg>;
}

export function SlackLogo({ size = 16, className = "shrink-0" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 124 124" aria-label="Slack logo"><g transform="rotate(90, 62, 62)"><path fill="#36C5F0" d="M26.4 78.6c0 7.1-5.8 12.9-12.9 12.9S.6 85.7.6 78.6c0-7.1 5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V78.6z"></path><path fill="#2EB67D" d="M45.8 26.4c-7.1 0-12.9-5.8-12.9-12.9S38.7.6 45.8.6s12.9 5.8 12.9 12.9v12.9H45.8zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H13.5C6.4 58.7.6 52.9.6 45.8s5.8-12.9 12.9-12.9h32.3z"></path><path fill="#ECB22E" d="M97.6 45.8c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97.6V45.8zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V13.5C65.3 6.4 71.1.6 78.2.6s12.9 5.8 12.9 12.9v32.3z"></path><path fill="#E01E5A" d="M78.2 97.6c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97.6h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H78.2z"></path></g></svg>;
}

export type { SVGProps };
