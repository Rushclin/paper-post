import Image from "next/image";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";
import { siteData } from "@/src/data/app";
import { BiBook } from "react-icons/bi";

export const Logo = ({ className = "", size = 40, justLogo = false }) => (
  <Link
    href="/?no_redirect=true"
    className={twMerge(
      "fff flex w-full items-center justify-center gap-2 whitespace-nowrap text-center text-2xl font-normal text-slate-600 " +
        className
    )}
  >
    {/* <Image
      width={size}
      height={size}
      alt={siteData.siteName}
      src={siteData.siteLogo}
    /> */}
    <BiBook className="text-foreground min-w-fit w-7 h-7" />
    {!justLogo && (
      <span className="relative flex flex-col items-end text-inherit">
        {siteData.siteName}
      </span>
    )}
  </Link>
);
