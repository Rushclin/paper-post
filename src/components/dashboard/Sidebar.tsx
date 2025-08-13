"use client";
import React from "react";
import { HomeIcon, LogOut, Truck, User } from "lucide-react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/src/hooks/useAuth";
import { Logo } from "../common/Logo";
import { usePathname } from "next/navigation";

interface MobileItemProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  route: string;
  name: string;
  active?: boolean;
  permissions?: Permissions[];
}

const MobileItem: React.FC<MobileItemProps> = ({
  Icon,
  route,
  name,
  active,
  permissions,
}) => {
  return (
    <Link
      href={route}
      className={twMerge(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md text-sm font-normal",
        active ? "fff text-base font-medium text-slate-800" : "text-slate-400"
      )}
    >
      <Icon
        className={twMerge(
          active ? "w-10" : "w-4",
          "flex-shrink-0 font-medium"
        )}
      />
      <small>{name}</small>
    </Link>
  );
};

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  route: string;
  name: string;
  active?: boolean;
  soon?: boolean;
  isNew?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  Icon,
  route,
  name,
  active,
  soon = false,
  isNew = false,
  ...props
}) => {
  const comp = (
    <>
      <div className="flex items-center justify-start gap-2">
        <Icon className="w-4 font-medium" />
        <span className="line-clamp-1">{name}</span>
      </div>
    </>
  );

  const className = twMerge(
    "items-center flex gap-2 justify-between my-1 p-1.5 sm:px-3 cursor-pointer text-sm rounded-md my-3",
    active
      ? "bg-slate-700 text-white font-medium fff text-base"
      : "text-slate-500 hover:text-slate-800 font-light hover:bg-slate-100"
  );

  return soon ? (
    <div className={className} {...props}>
      {comp}
    </div>
  ) : (
    <Link href={route} className={className}>
      {comp}
    </Link>
  );
};

interface MobileBarProps {
  className?: string;
}

export const MobileBar: React.FC<MobileBarProps> = ({ className }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div
      className={twMerge(
        "fixed bottom-0 z-50 flex h-[70px] w-screen justify-center bg-white outline outline-1 outline-primary/10",
        className
      )}
    >
      <>
        <MobileItem
          active={pathname.startsWith("/deliveries")}
          route="/deliveries"
          name="Talalalala"
          Icon={Truck}
        />
        <MobileItem
          active={pathname.startsWith("/account")}
          route="/account"
          name="Jslsls"
          Icon={User}
        />
        <MobileItem
          active={pathname.startsWith("/logout")}
          route="/logout"
          Icon={LogOut}
          name="kskks"
        />

        <MobileItem
          active={pathname.startsWith("/dashboard")}
          route="/dashboard"
          Icon={HomeIcon}
          name="kskskskssksk"
        />
        {/* Autres items similaires */}
      </>
    </div>
  );
};

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  return (
    <div
      className={twMerge(
        "h-screen min-w-60 border-slate-200 py-4 pt-0",
        className
      )}
    >
      <Logo className="w-full border-b border-slate-100 p-2 text-center text-sm md:p-10 md:text-xl" />
      <div className="overflow-auto px-2 md:px-4 xl:px-6">
        <div className="items mt-10 space-y-5">
          <SidebarItem
            active={pathname.startsWith("/dashboard")}
            route="/dashboard"
            name="Dashboard"
            Icon={Truck}
          />
          <SidebarItem
            active={pathname.startsWith("/article")}
            route="/article"
            name="Article"
            Icon={Truck}
          />
        </div>
      </div>
    </div>
  );
};
