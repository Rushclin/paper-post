/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-undef */
/* eslint-disable react/display-name */
import { twMerge } from "tailwind-merge";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import clsx from "clsx";
import { ExtractProps } from "@/types/utils";

function Menu({
  children,
  className,
  ...props
}: ExtractProps<typeof HeadlessMenu>) {
  return (
    <HeadlessMenu
      as="div"
      className={twMerge(["relative", className])}
      {...props}
    >
      {children}
    </HeadlessMenu>
  );
}

Menu.Button = <C extends React.ElementType = "div">({
  as,
  children,
  className,
  ...props
}: ExtractProps<typeof HeadlessMenu.Button> & {
  as?: C;
} & React.ComponentPropsWithRef<C>) => {
  return (
    <HeadlessMenu.Button
      as={as}
      className={twMerge(["cursor-pointer", className])}
      {...props}
    >
      {children}
    </HeadlessMenu.Button>
  );
};

Menu.Items = ({
  children,
  className,
  placement = "bottom-end",
  ...props
}: ExtractProps<typeof HeadlessMenu.Items> & {
  placement?:
    | "top-start"
    | "top"
    | "top-end"
    | "right-start"
    | "right"
    | "right-end"
    | "bottom-end"
    | "bottom"
    | "bottom-start"
    | "left-start"
    | "left"
    | "left-end";
}) => {
  return (
    <Transition
      as={Fragment}
      enter="transition-all ease-linear duration-150"
      enterFrom="mt-5 invisible opacity-0 translate-y-1"
      enterTo="mt-1 visible opacity-100 translate-y-0"
      leave="transition-all ease-linear duration-150"
      leaveFrom="mt-1 visible opacity-100 translate-y-0"
      leaveTo="mt-5 invisible opacity-0 translate-y-1"
    >
      <div
        className={clsx([
          "absolute z-30",
          placement == "top-start" && "bottom-[100%] left-0",
          placement == "top" && "bottom-[100%] left-[50%] translate-x-[-50%]",
          placement == "top-end" && "bottom-[100%] right-0",
          placement == "right-start" && "left-[100%] translate-y-[-50%]",
          placement == "right" && "left-[100%] top-[50%] translate-y-[-50%]",
          placement == "right-end" && "bottom-0 left-[100%]",
          placement == "bottom-end" && "right-0 top-[100%]",
          placement == "bottom" && "left-[50%] top-[100%] translate-x-[-50%]",
          placement == "bottom-start" && "left-0 top-[100%]",
          placement == "left-start" && "right-[100%] translate-y-[-50%]",
          placement == "left" && "right-[100%] top-[50%] translate-y-[-50%]",
          placement == "left-end" && "bottom-0 right-[100%]",
        ])}
      >
        <HeadlessMenu.Items
          as="div"
          className={twMerge([
            "dark:bg-darkmode-600 rounded-lg border border-slate-200 bg-white p-2 shadow-[0px_3px_10px_#00000017]",
            className,
          ])}
          {...props}
        >
          {children}
        </HeadlessMenu.Items>
      </div>
    </Transition>
  );
};

Menu.Item = ({
  children,
  className,
  ...props
}: ExtractProps<typeof HeadlessMenu.Item>) => {
  return (
    <HeadlessMenu.Item
      as="a"
      className={twMerge([
        "dark:bg-darkmode-600 dark:hover:bg-darkmode-400 flex cursor-pointer items-center rounded-lg p-2 transition duration-300 ease-in-out hover:bg-slate-100",
        className,
      ])}
      {...props}
    >
      {children}
    </HeadlessMenu.Item>
  );
};

Menu.Divider = (props: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      className={twMerge([
        "dark:bg-darkmode-400 -mx-2 my-2 h-px bg-slate-200/60",
        props.className,
      ])}
    ></div>
  );
};

Menu.Header = (
  props: React.PropsWithChildren & React.ComponentPropsWithoutRef<"div">,
) => {
  return (
    <div className={twMerge(["p-2 font-medium", props.className])}>
      {props.children}
    </div>
  );
};

Menu.Footer = (
  props: React.PropsWithChildren & React.ComponentPropsWithoutRef<"div">,
) => {
  return (
    <div className={twMerge(["flex p-1", props.className])}>
      {props.children}
    </div>
  );
};

export default Menu;
