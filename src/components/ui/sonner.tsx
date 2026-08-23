import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      offset={24}
      toastOptions={{
        classNames: {
          toast:
            "bg-surface text-fg shadow-[var(--shadow-lift)] border-0 font-sans",
          title: "text-fg",
          description: "text-muted",
        },
      }}
    />
  );
}
