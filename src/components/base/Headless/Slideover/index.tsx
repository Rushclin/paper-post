/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */
import { twMerge } from "tailwind-merge";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment, createContext, useContext, useRef, useState } from "react";
import { ExtractProps } from "@/types/utils";

type Size = "sm" | "md" | "lg" | "xl";

const slideoverContext = createContext<{
  open: boolean;
  zoom: boolean;
  size: Size;
}>({
  open: false,
  zoom: false,
  size: "md",
});

function Slideover({
  children,
  className,
  as = "div",
  open = false,
  onClose,
  staticBackdrop,
  size = "md",
  ...props
}: ExtractProps<typeof HeadlessDialog> & {
  size?: Size;
  staticBackdrop?: boolean;
}) {
  const focusElement = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(false);

  return (
    <slideoverContext.Provider
      value={{
        open: open,
        zoom: zoom,
        size: size,
      }}
    >
      <Transition appear as={Fragment} show={open}>
        <HeadlessDialog
          as={as}
          onClose={(value) => {
            if (!staticBackdrop) {
              return onClose(value);
            } else {
              setZoom(true);
              setTimeout(() => {
                setZoom(false);
              }, 300);
            }
          }}
          initialFocus={focusElement}
          className={twMerge(["relative z-[60]", className])}
          {...props}
        >
          {children}
        </HeadlessDialog>
      </Transition>
    </slideoverContext.Provider>
  );
}

Slideover.Panel = ({
  children,
  className,
  as = "div",
  ...props
}: ExtractProps<typeof HeadlessDialog.Panel> & {
  size?: Size;
}) => {
  const slideover = useContext(slideoverContext);
  return (
    <>
      <Transition.Child
        as="div"
        enter="ease-in-out duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in-out duration-[400ms]"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="from-theme-1/50 via-theme-2/50 fixed inset-0 bg-gradient-to-b to-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <Transition.Child
        as="div"
        enter="ease-in-out duration-500"
        enterFrom="opacity-0 -mr-[100%]"
        enterTo="opacity-100 mr-0"
        leave="ease-in-out duration-[400ms]"
        leaveFrom="opacity-100 mr-0"
        leaveTo="opacity-0 -mr-[100%]"
        className="fixed inset-y-0 right-0"
      >
        <HeadlessDialog.Panel
          as={as}
          className={twMerge([
            "dark:bg-darkmode-600 relative ml-auto flex h-screen w-[90%] flex-col bg-white shadow-md transition-transform",
            slideover.size == "md" && "sm:w-[460px]",
            slideover.size == "sm" && "sm:w-[300px]",
            slideover.size == "lg" && "sm:w-[600px]",
            slideover.size == "xl" && "sm:w-[600px] lg:w-[900px]",
            slideover.zoom && "scale-105",
            className,
          ])}
          {...props}
        >
          {children}
        </HeadlessDialog.Panel>
      </Transition.Child>
    </>
  );
};

Slideover.Title = ({
  children,
  className,
  as = "div",
  ...props
}: ExtractProps<typeof HeadlessDialog.Title>) => {
  return (
    <HeadlessDialog.Title
      as={as}
      className={twMerge([
        "dark:border-darkmode-400 flex items-center border-b border-slate-200/60 px-5 py-3",
        className,
      ])}
      {...props}
    >
      {children}
    </HeadlessDialog.Title>
  );
};

Slideover.Description = ({
  children,
  className,
  as = "div",
  ...props
}: ExtractProps<typeof HeadlessDialog.Description>) => {
  return (
    <HeadlessDialog.Description
      as={as}
      className={twMerge(["flex-1 overflow-y-auto p-5", className])}
      {...props}
    >
      {children}
    </HeadlessDialog.Description>
  );
};

Slideover.Footer = <C extends React.ElementType = "div">({
  children,
  className,
  as,
  ...props
}: {
  as?: C;
} & React.PropsWithChildren &
  React.ComponentPropsWithoutRef<C>) => {
  const Component = as || "div";

  return (
    <Component
      className={twMerge([
        "dark:border-darkmode-400 border-t border-slate-200/60 px-5 py-3 text-right",
        className,
      ])}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Slideover;
