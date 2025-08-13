/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface AvatarContentProps {
  size?: number;
  photoZoom?: number | null;
  name: string;
  htmlName?: ReactNode;
  tagline?: string;
  taglineClassName?: string;
  photoURL?: string;
  defaultUrl?: string;
  hideName?: boolean;
  dataTestForCustomerName?: string;
}

const AvatarContent: React.FC<AvatarContentProps> = ({
  size = 40,
  name,
  htmlName,
  tagline = "",
  taglineClassName = "",
  photoURL,
  defaultUrl,
  hideName = false,
  dataTestForCustomerName,
}) => {
  return (
    <>
      <div className="flex-shrink-0">
        <img
          width={size}
          height={size}
          className={twMerge(
            "aspect-square cursor-pointer rounded-full bg-slate-50 object-cover"
          )}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            target.onerror = null; 

            if (target.src.includes("https://ui-avatars")) {
              target.src = "/logo.png";
            } else {
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name || "User"
              )}&color=065F46&background=D1FAE5`;
            }
          }}
          src={
            photoURL ||
            defaultUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name || "User"
            )}&color=065F46&background=D1FAE5`
          }
          alt={name || "User"}
        />
      </div>
      {!hideName && (
        <div className="ml-3 flex flex-col items-start justify-center">
          <div
            className="line-clamp-1 break-all text-sm font-medium text-gray-700"
            title={name}
            data-test={dataTestForCustomerName}
          >
            {htmlName || name}
          </div>
          <div
            className={twMerge(
              "line-clamp-1 text-xs font-normal text-gray-500",
              taglineClassName
            )}
          >
            {tagline}
          </div>
        </div>
      )}
    </>
  );
};

interface AvatarProps extends AvatarContentProps {
  onClick?: () => void;
  as?: "div" | "span" | "button";
  className?: string;
  href?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  photoURL,
  photoZoom = null,
  size = 40,
  name,
  tagline,
  onClick,
  defaultUrl,
  as = "div",
  className = "",
  taglineClassName = "",
  href,
  htmlName,
  hideName = false,
  dataTestForCustomerName,
  ...props
}) => {
  if (!href) {
    const Component = as;
    return (
      <Component
        {...props}
        onClick={onClick}
        className={twMerge(
          `flex items-center ${
            onClick
              ? "cursor-pointer rounded-md px-2 py-1 hover:bg-slate-50"
              : ""
          }`,
          className
        )}
      >
        <AvatarContent
          hideName={hideName}
          photoZoom={photoZoom}
          size={size}
          name={name}
          tagline={tagline}
          photoURL={photoURL}
          defaultUrl={defaultUrl}
          htmlName={htmlName}
          taglineClassName={taglineClassName}
          dataTestForCustomerName={dataTestForCustomerName}
        />
      </Component>
    );
  }

  return (
    <Link
      {...props}
      href={href}
      className={twMerge(
        `flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-slate-50`,
        className
      )}
    >
      <AvatarContent
        hideName={hideName}
        photoZoom={photoZoom}
        size={size}
        name={name}
        tagline={tagline}
        photoURL={photoURL}
        defaultUrl={defaultUrl}
        htmlName={htmlName}
        taglineClassName={taglineClassName}
        dataTestForCustomerName={dataTestForCustomerName}
      />
    </Link>
  );
};
