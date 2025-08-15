import Link from "next/link";
import React from "react";
import { siteData } from "@/src/data/app";
import { BiBook } from "react-icons/bi";

export const Logo = ({}) => (
  <Link href="/" className="flex items-center gap-2">
    <BiBook className="text-foreground min-w-fit w-7 h-7" />
    <span className="manrope text-xl font-semibold text-foreground cursor-pointer recoleta">
      {siteData.siteName}
    </span>
  </Link>
);
