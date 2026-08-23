import { MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BotMark } from "./bot-mark";

type BoardHeaderProps = {
  onAdd: () => void;
  onReset: () => void;
};

export function BoardHeader({ onAdd, onReset }: BoardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-0.5 md:px-1">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 md:gap-x-3">
        <BotMark className="size-8 shrink-0 md:size-10" />
        <h1 className="font-display text-2xl leading-none font-semibold tracking-[0.04em] text-fg md:text-4xl">
          Bot Board
        </h1>
        <p className="col-start-2 mt-0.5 hidden text-xs text-muted md:mt-1 md:block md:text-sm text-pretty">
          Tasks your bots are working on.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button onClick={onAdd} className="mr-2 hidden sm:inline-flex">
          <Plus className="size-4" />
          New task
        </Button>
        <Button
          onClick={onAdd}
          size="icon"
          className="mr-2 sm:hidden"
          aria-label="New task"
        >
          <Plus className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Board actions"
              className="text-muted"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onReset}>
              <RotateCcw className="size-4" />
              Restore sample board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
