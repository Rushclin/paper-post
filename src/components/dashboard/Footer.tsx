import Link from "next/link";
import { twMerge } from "tailwind-merge";
import packageInfo from "../../../package.json";

export default function DashboardFooter({ className = "" }) {
  return (
    <div
      className={twMerge(
        "outfit flex w-full flex-wrap items-center justify-center gap-2 border-t border-slate-100 text-center text-slate-700 " +
          className,
      )}
    >
      <div className="text-xs">
        © 2025-{new Date().getFullYear()} {packageInfo.version}
        . All rights reserved.
      </div>
      <div className="flex justify-center gap-2 text-xs text-slate-700">
        <Link href="/privacy-policy" className="underline" target="_blank">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
