"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { Logo } from "../common/Logo";
import { Popover } from "../base/Headless";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { siteData } from "@/src/data/app";
import { User as UserType } from "@prisma/client"; // si tu utilises Prisma pour le type User

interface UserProfileProps {
  user?: Partial<UserType>;
  className?: string;
  hideName?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  className = "",
  hideName = false,
}) => {

  const {logout} = useAuth()

  return (
    <div className="">
      <div className="" />
      <div className="">
        <Popover className="inline-block">
          {({ close }) => (
            <>
              <Popover.Button
                variant="outline-secondary"
                className={twMerge("w-full sm:w-auto " + className)}
              >
                <Avatar
                  className="md:max-w-[25vw] xl:max-w-[20vw] 2xl:max-w-[15vw]"
                  tagline={user?.email || ""}
                  hideName={hideName}
                  name={`${user?.firstName || "User"}`}
                />
              </Popover.Button>
              <Popover.Panel placement="bottom-end">
                <div className="flex w-full min-w-64 flex-col gap-4 p-3 text-left text-slate-500 md:w-64">
                  <Avatar
                    href="/profile"
                    name={`${[user?.firstName, user?.lastName].filter(Boolean).join(" ")}`}
                    tagline={user?.email || ""}
                  />

                  <Link
                    onClick={() => {logout()}}
                    href="#"
                    className="flex w-full items-center gap-2 rounded-md p-3 hover:bg-red-500 hover:text-white"
                  >
                    <LogOut width={18} /> Se deconnecter
                  </Link>
                </div>
              </Popover.Panel>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
};

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();
  if(!user) return null

  return (
    <div className="w-full py-0">
      <div className="fixed z-[1000] flex w-full items-center justify-between gap-10 bg-white px-4 md:hidden">
        <Logo className="inline-flex w-fit border-b border-slate-100 p-2 py-2 pb-6 text-center text-sm md:p-10 md:text-xl" />
        <div className="flex h-full items-center gap-2">
          <UserProfile user={user} hideName />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-7 pt-24 md:flex-row md:items-center md:justify-between md:pb-0 md:pt-4">
        <div className="flex flex-col font-normal">
          <h3 className="text-md font-medium md:text-2xl">{title || siteData.siteName}</h3>
        </div>
        <div className="hidden gap-2 md:inline-flex">
          <UserProfile user={user} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
