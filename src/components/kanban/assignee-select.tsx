import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Person } from "@/lib/board/types";
import { cn } from "@/lib/utils";

type AssigneeSelectProps = {
  id?: string;
  people: Person[];
  value: string;
  onChange: (userId: string) => void;
};

export function AssigneeSelect({
  id,
  people,
  value,
  onChange,
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = people.find((person) => person.userId === value);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      person.name.toLowerCase().includes(needle),
    );
  }, [people, query]);

  function choose(userId: string) {
    onChange(userId);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="assignee-select-list"
          className={cn(
            "flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-sm bg-elevated px-3 text-left text-base text-fg shadow-[var(--shadow-border)] outline-none",
            "transition-[box-shadow,background-color] duration-150 ease-out",
            "focus-visible:ring-2 focus-visible:ring-ring/70 md:text-sm",
          )}
        >
          <span className={cn("truncate", !selected && "text-subtle")}>
            {selected?.name ?? "Unassigned"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-1"
        align="start"
      >
        {people.length > 6 ? (
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="h-10 w-full rounded-sm bg-elevated px-2.5 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/70"
            aria-label="Search people"
          />
        ) : null}
        <div
          id="assignee-select-list"
          role="listbox"
          aria-label="Assignees"
          className={cn(
            "max-h-52 overflow-y-auto",
            people.length > 6 && "mt-1",
          )}
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => choose("")}
            className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm outline-none transition-[background-color] duration-150 ease-out hover:bg-elevated focus-visible:bg-elevated"
          >
            <Check
              className={cn("size-4 shrink-0", value ? "opacity-0" : "opacity-100")}
            />
            <span className="truncate text-muted">Unassigned</span>
          </button>
          {matches.map((person) => {
            const selectedPerson = person.userId === value;
            return (
              <button
                key={person.userId}
                type="button"
                role="option"
                aria-selected={selectedPerson}
                onClick={() => choose(person.userId)}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm outline-none transition-[background-color] duration-150 ease-out hover:bg-elevated focus-visible:bg-elevated"
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    selectedPerson ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{person.name}</span>
              </button>
            );
          })}
          {matches.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-subtle">No one matches</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
