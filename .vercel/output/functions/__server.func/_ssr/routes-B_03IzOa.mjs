import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { P as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, k as Slot, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as RotateCcw, c as Link2, d as Check, f as ArrowRight, i as Search, l as GripVertical, o as Plus, r as Trash2, s as Pencil, t as X, u as Ellipsis } from "../_libs/lucide-react.mjs";
import { _ as useDroppable, a as MeasuringStrategy, b as CSS, c as closestCorners, i as KeyboardSensor, l as defaultDropAnimationSideEffects, m as rectIntersection, n as DragOverlay, o as MouseSensor, p as pointerWithin, s as TouchSensor, t as DndContext, v as useSensor, y as useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Label2, c as Separator2, i as ItemIndicator2, l as Trigger, n as Content2$1, o as Portal2$1, r as Item2, s as Root2$1, t as CheckboxItem2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-DDtbOxaK.mjs";
import { a as verticalListSortingStrategy, i as useSortable, n as arrayMove, r as sortableKeyboardCoordinates, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B_03IzOa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none select-none transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow-[var(--shadow-border)] hover:bg-primary/90",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:bg-elevated/80",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-elevated",
			danger: "bg-danger text-danger-fg hover:bg-danger/90"
		},
		size: {
			default: "h-11 px-4 pr-3.5",
			sm: "h-9 rounded-sm px-3 pr-2.5 text-sm",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		},
		static: {
			true: "",
			false: "active:not-disabled:scale-[0.96]"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default",
		static: false
	}
});
var Button = import_react.forwardRef(({ className, variant, size, static: isStatic, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		ref,
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			static: isStatic
		}), className),
		...props
	});
});
Button.displayName = "Button";
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/75 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
	...props
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed z-50 grid w-[calc(100%-2rem)] max-w-md gap-4 rounded-dialog bg-surface p-6 text-fg shadow-[var(--shadow-lift)] outline-none", "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", "max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0", "max-md:rounded-t-xl max-md:rounded-b-none", "max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))]", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.96]", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("font-display text-xl leading-snug font-medium tracking-tight text-balance", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm leading-normal text-muted text-pretty", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var COLUMN_IDS = [
	"todo",
	"doing",
	"done"
];
var COLUMN_META = {
	todo: {
		label: "To Do",
		hint: "Ready to start",
		tone: "bg-todo"
	},
	doing: {
		label: "Doing",
		hint: "In motion",
		tone: "bg-doing"
	},
	done: {
		label: "Done",
		hint: "Shipped",
		tone: "bg-done"
	}
};
function isColumnId(value) {
	return COLUMN_IDS.includes(value);
}
function dockId(columnId) {
	return `dock-${columnId}`;
}
function columnFromDroppable(id) {
	if (isColumnId(id)) return id;
	if (id.startsWith("dock-")) {
		const columnId = id.slice(5);
		if (isColumnId(columnId)) return columnId;
	}
	return null;
}
function normalizeTag(input) {
	return input.trim().replace(/\s+/g, " ").slice(0, 24);
}
function uniqueTags(tags, limit = 8) {
	const seen = /* @__PURE__ */ new Set();
	const next = [];
	for (const tag of tags) {
		const value = normalizeTag(tag);
		if (!value) continue;
		const key = value.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		next.push(value);
		if (next.length >= limit) break;
	}
	return next;
}
function parseUrl(input) {
	const trimmed = input.trim();
	if (!trimmed) return {
		ok: true,
		url: ""
	};
	let candidate = trimmed;
	if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) candidate = `https://${candidate}`;
	try {
		const url = new URL(candidate);
		if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false };
		return {
			ok: true,
			url: url.toString()
		};
	} catch {
		return { ok: false };
	}
}
function linkLabel(url) {
	try {
		const parsed = new URL(url);
		return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname === "/" ? "" : parsed.pathname}`;
	} catch {
		return url;
	}
}
function collectTags(cards) {
	return uniqueTags(Array.from(cards, (card) => card.tags).flat(), Number.POSITIVE_INFINITY);
}
function cardMatches(card, query, selectedTags) {
	if (selectedTags.length > 0) {
		const have = new Set(card.tags.map((tag) => tag.toLowerCase()));
		if (!selectedTags.some((tag) => have.has(tag.toLowerCase()))) return false;
	}
	const needle = query.trim().toLowerCase();
	if (!needle) return true;
	return [
		card.title,
		card.description,
		card.url,
		...card.tags
	].join(" ").toLowerCase().includes(needle);
}
function normalizeCardFields(card) {
	const parsed = parseUrl(typeof card.url === "string" ? card.url : "");
	return {
		id: card.id,
		title: card.title,
		description: typeof card.description === "string" ? card.description : "",
		url: parsed.ok ? parsed.url : "",
		tags: Array.isArray(card.tags) ? uniqueTags(card.tags) : [],
		createdAt: card.createdAt ?? (/* @__PURE__ */ new Date()).toISOString(),
		updatedAt: card.updatedAt ?? card.createdAt ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
var now = Date.now();
var iso = (daysAgo, hours = 0) => (/* @__PURE__ */ new Date(now - daysAgo * 864e5 - hours * 36e5)).toISOString();
var SEED_CARDS = {
	c1: {
		id: "c1",
		title: "Draft the Friday status note",
		description: "Pull wins, blockers, and next steps from this week’s lane. Keep it to one page.",
		url: "",
		tags: ["writing", "weekly"],
		createdAt: iso(4),
		updatedAt: iso(2, 3)
	},
	c2: {
		id: "c2",
		title: "Sketch the onboarding walkthrough",
		description: "Four screens, one idea each. Lead with the outcome, not the controls.",
		url: "https://www.figma.com",
		tags: ["design"],
		createdAt: iso(5),
		updatedAt: iso(1, 6)
	},
	c3: {
		id: "c3",
		title: "Book the Saturday trail slot",
		description: "Check weather by Thursday. If it storms, shift to the river loop.",
		url: "",
		tags: ["personal"],
		createdAt: iso(2),
		updatedAt: iso(2)
	},
	c4: {
		id: "c4",
		title: "Tighten the launch copy",
		description: "Cut the intro to four lines. Every sentence should earn its place.",
		url: "https://linear.app",
		tags: ["writing", "launch"],
		createdAt: iso(6),
		updatedAt: iso(0, 2)
	},
	c5: {
		id: "c5",
		title: "Review open pull requests",
		description: "Leave notes on naming and missing empty states before standup.",
		url: "https://github.com",
		tags: ["engineering"],
		createdAt: iso(1),
		updatedAt: iso(0, 5)
	},
	c6: {
		id: "c6",
		title: "Choose type and color",
		description: "Serif for the mark, sans for the board. Stone on ink, no extras.",
		url: "",
		tags: ["design"],
		createdAt: iso(8),
		updatedAt: iso(3)
	},
	c7: {
		id: "c7",
		title: "Persist board state",
		description: "Cards, order, and columns should survive a refresh.",
		url: "https://github.com",
		tags: ["engineering"],
		createdAt: iso(7),
		updatedAt: iso(3, 4)
	}
};
var SEED_COLUMNS = {
	todo: [
		"c1",
		"c2",
		"c3"
	],
	doing: ["c4", "c5"],
	done: ["c6", "c7"]
};
function stamp() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function newId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function columnOf(columns, id) {
	for (const columnId of COLUMN_IDS) if (columns[columnId].includes(id)) return columnId;
	return null;
}
var useBoardStore = create()(persist((set, get) => ({
	cards: SEED_CARDS,
	columns: SEED_COLUMNS,
	hasHydrated: false,
	setHasHydrated: (value) => set({ hasHydrated: value }),
	addCard: ({ title, description, url, tags, columnId }) => {
		const id = newId();
		const at = stamp();
		const card = {
			id,
			title: title.trim(),
			description: description.trim(),
			url,
			tags: uniqueTags(tags),
			createdAt: at,
			updatedAt: at
		};
		set((state) => ({
			cards: {
				...state.cards,
				[id]: card
			},
			columns: {
				...state.columns,
				[columnId]: [...state.columns[columnId], id]
			}
		}));
		return id;
	},
	updateCard: (id, { title, description, url, tags, columnId }) => {
		const state = get();
		const existing = state.cards[id];
		if (!existing) return;
		const from = columnOf(state.columns, id);
		let columns = state.columns;
		if (from && from !== columnId) columns = {
			...state.columns,
			[from]: state.columns[from].filter((item) => item !== id),
			[columnId]: [...state.columns[columnId], id]
		};
		set({
			columns,
			cards: {
				...state.cards,
				[id]: {
					...existing,
					title: title.trim(),
					description: description.trim(),
					url,
					tags: uniqueTags(tags),
					updatedAt: stamp()
				}
			}
		});
	},
	deleteCard: (id) => {
		const state = get();
		const from = columnOf(state.columns, id);
		if (!from) return;
		const { [id]: _removed, ...rest } = state.cards;
		set({
			cards: rest,
			columns: {
				...state.columns,
				[from]: state.columns[from].filter((item) => item !== id)
			}
		});
	},
	moveCard: (id, columnId) => {
		const state = get();
		const existing = state.cards[id];
		const from = columnOf(state.columns, id);
		if (!existing || !from || from === columnId) return;
		set({
			cards: {
				...state.cards,
				[id]: {
					...existing,
					updatedAt: stamp()
				}
			},
			columns: {
				...state.columns,
				[from]: state.columns[from].filter((item) => item !== id),
				[columnId]: [...state.columns[columnId], id]
			}
		});
	},
	setColumns: (columns) => set({ columns }),
	findColumn: (id) => {
		if (COLUMN_IDS.includes(id)) return id;
		return columnOf(get().columns, id);
	},
	resetBoard: () => set({
		cards: structuredClone(SEED_CARDS),
		columns: structuredClone(SEED_COLUMNS)
	})
}), {
	name: "cairn-board-v1",
	version: 2,
	storage: createJSONStorage(() => localStorage),
	partialize: (state) => ({
		cards: state.cards,
		columns: state.columns
	}),
	migrate: (persisted) => {
		const state = persisted;
		const cards = Object.fromEntries(Object.entries(state.cards ?? {}).map(([id, card]) => [id, normalizeCardFields(card)]));
		return {
			...state,
			cards
		};
	},
	skipHydration: true,
	onRehydrateStorage: () => () => {
		useBoardStore.setState({ hasHydrated: true });
	}
}));
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/75 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed z-50 grid w-[calc(100%-2rem)] max-w-md gap-4 rounded-dialog bg-surface p-6 text-fg shadow-[var(--shadow-lift)] outline-none", "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", "max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0", "max-md:rounded-t-xl max-md:rounded-b-none max-md:max-h-[90dvh] max-md:overflow-y-auto", "max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))]", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.96]", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
		className: "absolute top-3 right-3 flex size-11 items-center justify-center rounded-sm text-muted outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-elevated hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-[0.96]",
		"aria-label": "Close",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5 pr-8", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-xl leading-snug font-medium tracking-tight text-balance", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm leading-normal text-muted text-pretty", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		type,
		"data-slot": "input",
		className: cn("h-11 w-full min-w-0 rounded-sm bg-elevated px-3 text-base text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-subtle", "focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:cursor-not-allowed disabled:opacity-50", "md:text-sm", className),
		...props
	});
});
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	"data-slot": "label",
	className: cn("text-sm font-medium text-fg peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
	...props
}));
Label.displayName = Root.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		"data-slot": "textarea",
		className: cn("min-h-28 w-full resize-y rounded-sm bg-elevated px-3 py-2.5 text-base text-fg shadow-[var(--shadow-border)] outline-none transition-[box-shadow,background-color] duration-150 ease-out placeholder:text-subtle", "focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:cursor-not-allowed disabled:opacity-50", "md:text-sm", className),
		...props
	});
});
Textarea.displayName = "Textarea";
function TagChip({ label, selected = false, size = "sm", onSelect, onRemove }) {
	const classes = cn("inline-flex max-w-full shrink-0 items-center gap-1 rounded-full font-medium", "transition-[background-color,color,box-shadow] duration-150 ease-out", size === "sm" ? "h-7 px-2 text-xs" : "h-9 px-3 text-sm", selected ? "bg-primary text-primary-fg" : "bg-elevated text-muted shadow-[var(--shadow-border)]");
	if (onSelect) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelect,
		"aria-pressed": selected,
		className: cn(classes, "hover:text-fg"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})
	});
	if (onRemove) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: classes,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onRemove,
			className: "flex size-5 items-center justify-center rounded-full text-current hover:bg-surface/40",
			"aria-label": `Remove ${label}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: classes,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})
	});
}
function CardDialog({ open, mode, initial, suggestions, onOpenChange, onSubmit }) {
	const [title, setTitle] = (0, import_react.useState)(initial.title);
	const [description, setDescription] = (0, import_react.useState)(initial.description);
	const [url, setUrl] = (0, import_react.useState)(initial.url);
	const [tags, setTags] = (0, import_react.useState)(initial.tags);
	const [tagDraft, setTagDraft] = (0, import_react.useState)("");
	const [columnId, setColumnId] = (0, import_react.useState)(initial.columnId);
	const [error, setError] = (0, import_react.useState)(null);
	const [urlError, setUrlError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setTitle(initial.title);
		setDescription(initial.description);
		setUrl(initial.url);
		setTags(initial.tags);
		setTagDraft("");
		setColumnId(initial.columnId);
		setError(null);
		setUrlError(null);
	}, [open, initial]);
	function addTag(raw) {
		const next = uniqueTags([...tags, raw]);
		setTags(next);
		setTagDraft("");
	}
	function handleTagKeyDown(event) {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			if (tagDraft.trim()) addTag(tagDraft);
		}
		if (event.key === "Backspace" && !tagDraft && tags.length > 0) setTags(tags.slice(0, -1));
	}
	function handleSubmit(event) {
		event.preventDefault();
		const nextTitle = title.trim();
		if (!nextTitle) {
			setError("A title is required.");
			return;
		}
		const parsed = parseUrl(url);
		if (!parsed.ok) {
			setUrlError("Use a web link, starting with http or https.");
			return;
		}
		onSubmit({
			title: nextTitle,
			description: description.trim(),
			url: parsed.url,
			tags: uniqueTags([...tags, tagDraft]),
			columnId
		});
		onOpenChange(false);
	}
	const unusedSuggestions = suggestions.filter((tag) => !tags.some((item) => item.toLowerCase() === tag.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: mode === "create" ? "New card" : "Edit card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: mode === "create" ? "Give the work a name, a link if it has one, and the tags that belong with it." : "Update the notes, link, tags, or move it to another lane." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "card-title",
									children: "Title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "card-title",
									value: title,
									onChange: (event) => {
										setTitle(event.target.value);
										if (error) setError(null);
									},
									placeholder: "What needs to happen?",
									maxLength: 120,
									autoFocus: true,
									"aria-invalid": Boolean(error)
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									role: "alert",
									children: error
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "card-description",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "card-description",
								value: description,
								onChange: (event) => setDescription(event.target.value),
								placeholder: "Optional notes, context, or next steps.",
								maxLength: 600
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "card-url",
									children: "Link"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "card-url",
									type: "text",
									inputMode: "url",
									autoComplete: "url",
									value: url,
									onChange: (event) => {
										setUrl(event.target.value);
										if (urlError) setUrlError(null);
									},
									placeholder: "https://",
									"aria-invalid": Boolean(urlError)
								}),
								urlError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-danger",
									role: "alert",
									children: urlError
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: "Optional. Opens in a new tab."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "card-tags",
									children: "Tags"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagChip, {
										label: tag,
										onRemove: () => setTags(tags.filter((item) => item.toLowerCase() !== tag.toLowerCase()))
									}, tag.toLowerCase()))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "card-tags",
									value: tagDraft,
									onChange: (event) => setTagDraft(event.target.value),
									onKeyDown: handleTagKeyDown,
									onBlur: () => {
										if (tagDraft.trim()) addTag(tagDraft);
									},
									placeholder: tags.length >= 8 ? "Tag limit reached" : "Type a tag, then Enter",
									maxLength: 24,
									disabled: tags.length >= 8
								}),
								unusedSuggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: unusedSuggestions.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagChip, {
										label: tag,
										onSelect: () => addTag(tag)
									}, tag.toLowerCase()))
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "grid gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm font-medium text-fg",
								children: "Column"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-3 gap-1.5 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]",
								children: COLUMN_IDS.map((id) => {
									const selected = columnId === id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setColumnId(id),
										className: cn("flex h-11 items-center justify-center rounded-sm text-sm font-medium transition-[background-color,color] duration-150 ease-out", selected ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted hover:text-fg"),
										"aria-pressed": selected,
										children: COLUMN_META[id].label
									}, id);
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: mode === "create" ? "Add card" : "Save changes"
				})] })
			]
		}) })
	});
}
function BoardFilters({ query, tags, selected, onQueryChange, onToggleTag, onClear }) {
	const filtering = query.trim().length > 0 || selected.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "search",
					value: query,
					onChange: (event) => onQueryChange(event.target.value),
					placeholder: "Search titles, links, and tags",
					"aria-label": "Search cards",
					className: "pr-11 pl-10"
				}),
				query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onQueryChange(""),
					className: "absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-sm text-subtle hover:bg-surface hover:text-fg",
					"aria-label": "Clear search",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				}) : null
			]
		}), tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1.5",
			"aria-label": "Filter by tag",
			children: [tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagChip, {
				label: tag,
				size: "md",
				selected: selected.some((item) => item.toLowerCase() === tag.toLowerCase()),
				onSelect: () => onToggleTag(tag)
			}, tag.toLowerCase())), filtering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onClear,
				className: "text-muted",
				children: "Clear filters"
			}) : null]
		}) : null]
	});
}
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-44 overflow-hidden rounded-lg bg-surface p-1 text-fg shadow-[var(--shadow-lift)]", "origin-(--radix-dropdown-menu-content-transform-origin) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97]", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2$1.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, variant = "default", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-none select-none", "transition-[background-color,color] duration-150 ease-out", "focus:bg-elevated data-[disabled]:pointer-events-none data-[disabled]:opacity-40", variant === "danger" && "text-danger focus:text-danger", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("my-1 h-px bg-border", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2.5 py-1.5 text-xs font-medium text-muted", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-pointer items-center rounded-sm py-2 pr-2.5 pl-8 text-sm outline-none select-none focus:bg-elevated", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex size-4 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
function BoardHeader({ total, visible, filtering, onAdd, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex items-center justify-between gap-3 px-0.5 md:items-end md:px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hidden text-xs font-medium tracking-wide text-muted uppercase md:block",
					children: "Board"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl leading-tight font-medium tracking-tight italic text-fg md:text-4xl",
					children: "Cairn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-muted md:mt-1 md:text-sm text-pretty",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden md:inline",
						children: "A calm board for work in motion. "
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-subtle",
						children: filtering ? `${visible} of ${total} ${total === 1 ? "card" : "cards"}` : `${total} ${total === 1 ? "card" : "cards"}`
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: onAdd,
					className: "hidden sm:inline-flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New card"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onAdd,
					size: "icon",
					className: "sm:hidden",
					"aria-label": "New card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Board actions",
						className: "text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onSelect: onReset,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Restore sample board"]
					})
				})] })
			]
		})]
	});
}
function KanbanCardView({ card, columnId, isOverlay, isDragging, selectedTags = [], handleProps, onEdit, onDelete, onMove, onToggleTag }) {
	const [stamped, setStamped] = (0, import_react.useState)("");
	const href = parseUrl(card.url);
	const safeUrl = href.ok && href.url ? href.url : null;
	(0, import_react.useEffect)(() => {
		try {
			const date = new Date(card.updatedAt);
			if (Number.isNaN(date.getTime())) return;
			setStamped(formatDistanceToNow(date, { addSuffix: true }));
		} catch {
			setStamped("");
		}
	}, [card.updatedAt]);
	const destinations = COLUMN_IDS.filter((id) => id !== columnId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: cn("group rounded-md bg-card p-3 shadow-[var(--shadow-card)]", "transition-[box-shadow,opacity,transform] duration-150 ease-[var(--ease-smooth-out)]", "hover:shadow-[var(--shadow-border-hover)]", isDragging && "opacity-0", isOverlay && "max-w-sm rotate-1 scale-[1.02] cursor-grabbing shadow-[var(--shadow-lift)]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					suppressHydrationWarning: true,
					className: cn("mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-sm text-subtle", "transition-[color,background-color] duration-150 ease-out", "hover:bg-elevated hover:text-muted", "cursor-grab touch-none active:cursor-grabbing", isOverlay && "cursor-grabbing", handleProps?.disabled && "cursor-default opacity-30"),
					"aria-label": `Drag ${card.title}`,
					...handleProps,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onEdit(card.id),
							className: "w-full rounded-sm py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium leading-snug text-balance text-fg",
								children: card.title
							}), card.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 line-clamp-3 text-sm leading-normal text-pretty text-muted",
								children: card.description
							}) : null]
						}),
						safeUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: safeUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "mt-2 inline-flex max-w-full items-center gap-1.5 text-xs text-muted hover:text-fg",
							onClick: (event) => event.stopPropagation(),
							onPointerDown: (event) => event.stopPropagation(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: linkLabel(safeUrl)
							})]
						}) : null,
						card.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1",
							children: card.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagChip, {
								label: tag,
								selected: selectedTags.some((item) => item.toLowerCase() === tag.toLowerCase()),
								onSelect: onToggleTag ? () => onToggleTag(tag) : void 0
							}, tag.toLowerCase()))
						}) : null,
						stamped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-subtle tabular-nums",
							children: stamped
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						className: "size-11 shrink-0 text-subtle opacity-100 md:size-8 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
						"aria-label": `Actions for ${card.title}`,
						static: true,
						onPointerDown: (event) => event.stopPropagation(),
						onTouchStart: (event) => event.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: () => onEdit(card.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
						}),
						onMove ? destinations.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: () => onMove(card.id, id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" }),
								"Move to ",
								COLUMN_META[id].label
							]
						}, id)) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							variant: "danger",
							onSelect: () => onDelete(card.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete"]
						})
					]
				})] })
			]
		})
	});
}
function SortableKanbanCard({ card, columnId, selectedTags, dragDisabled, onEdit, onDelete, onMove, onToggleTag }) {
	const dragOccurred = (0, import_react.useRef)(false);
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
		id: card.id,
		disabled: dragDisabled,
		data: {
			type: "card",
			card
		}
	});
	(0, import_react.useEffect)(() => {
		if (isDragging) dragOccurred.current = true;
	}, [isDragging]);
	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};
	function handleEdit(id) {
		if (dragOccurred.current) {
			dragOccurred.current = false;
			return;
		}
		onEdit(id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: setNodeRef,
		style,
		className: cn(isDragging && "z-10"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanCardView, {
			card,
			columnId,
			isDragging,
			selectedTags,
			onEdit: handleEdit,
			onDelete,
			onMove,
			onToggleTag,
			handleProps: {
				ref: setActivatorNodeRef,
				disabled: dragDisabled,
				...attributes,
				...listeners
			}
		})
	});
}
function KanbanColumn({ columnId, cards, empty, filtering, selectedTags, dragDisabled, onAdd, onEdit, onDelete, onMove, onToggleTag }) {
	const { setNodeRef, isOver } = useDroppable({
		id: columnId,
		data: {
			type: "column",
			columnId
		}
	});
	const meta = COLUMN_META[columnId];
	const ids = cards.map((card) => card.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-column": columnId,
		className: cn("lane-slide flex h-full min-h-0 flex-col rounded-column bg-surface p-2", "transition-[box-shadow,background-color] duration-150 ease-[var(--ease-smooth-out)]", isOver && "bg-elevated/80 ring-1 ring-primary/70"),
		"aria-label": `${meta.label}, ${cards.length} ${cards.length === 1 ? "card" : "cards"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center gap-2 px-1.5 pt-1 pb-2 md:px-2 md:pt-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("size-2 shrink-0 rounded-full", meta.tone),
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-fg",
						children: meta.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "hidden text-xs text-subtle sm:block",
						children: meta.hint
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-muted tabular-nums",
					"aria-hidden": "true",
					children: cards.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "size-11 text-muted md:size-8",
					onClick: () => onAdd(columnId),
					"aria-label": `Add card to ${meta.label}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: setNodeRef,
			className: "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-0.5 pb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
				items: ids,
				strategy: verticalListSortingStrategy,
				children: cards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableKanbanCard, {
					card,
					columnId,
					selectedTags,
					dragDisabled,
					onEdit,
					onDelete,
					onMove,
					onToggleTag
				}, card.id))
			}), cards.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onAdd(columnId),
				className: cn("flex min-h-32 flex-1 flex-col items-center justify-center gap-1 rounded-md px-4 text-center", "shadow-[inset_0_0_0_1px_var(--color-border)]", "text-sm text-muted transition-[color,background-color] duration-150 ease-out", "hover:bg-elevated/50 hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: filtering && !empty ? "No matches here" : "Nothing here yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-subtle",
					children: filtering && !empty ? "Try another tag or search" : "Drop a card or add one"
				})]
			}) : null]
		})]
	});
}
function DockTarget({ columnId }) {
	const { setNodeRef, isOver } = useDroppable({
		id: dockId(columnId),
		data: {
			type: "dock",
			columnId
		}
	});
	const meta = COLUMN_META[columnId];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		className: cn("flex h-14 flex-col items-center justify-center gap-1 rounded-md bg-elevated text-xs font-medium text-muted", "shadow-[var(--shadow-border)] transition-[background-color,color,box-shadow] duration-150 ease-out", isOver && "bg-card text-fg ring-1 ring-primary/70"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("size-1.5 rounded-full", meta.tone),
			"aria-hidden": "true"
		}), meta.label]
	});
}
function LaneDock({ active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden", "transition-[opacity,transform] duration-150 ease-[var(--ease-smooth-out)]", active ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-2 opacity-0"),
		"aria-hidden": !active,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg bg-bg/90 p-2 shadow-[var(--shadow-lift)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 pb-2 text-center text-xs text-subtle",
				children: "Drop on a lane"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: COLUMN_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DockTarget, { columnId: id }, id))
			})]
		})
	});
}
function LaneSwitcher({ active, counts, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-1 rounded-md bg-elevated p-1 shadow-[var(--shadow-border)] md:hidden",
		role: "tablist",
		"aria-label": "Board lanes",
		children: COLUMN_IDS.map((id) => {
			const selected = active === id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "tab",
				"aria-selected": selected,
				onClick: () => onSelect(id),
				className: cn("flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-sm px-1 text-sm font-medium", "transition-[background-color,color] duration-150 ease-out", selected ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("size-1.5 shrink-0 rounded-full", COLUMN_META[id].tone),
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: COLUMN_META[id].label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-subtle",
						children: counts[id]
					})
				]
			}, id);
		})
	});
}
var dropAnimation = {
	duration: 220,
	easing: "cubic-bezier(0.22, 1, 0.36, 1)",
	sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } })
};
var collisionDetection = (args) => {
	const pointerHits = pointerWithin(args);
	const cardHit = pointerHits.find((hit) => !columnFromDroppable(String(hit.id)));
	if (cardHit) return [cardHit];
	if (pointerHits.length > 0) return pointerHits;
	const rectHits = rectIntersection(args);
	const rectCard = rectHits.find((hit) => !columnFromDroppable(String(hit.id)));
	if (rectCard) return [rectCard];
	if (rectHits.length > 0) return rectHits;
	return closestCorners(args);
};
function listsEqual(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	return a.every((id, index) => id === b[index]);
}
function KanbanBoard() {
	const cards = useBoardStore((s) => s.cards);
	const columns = useBoardStore((s) => s.columns);
	const addCard = useBoardStore((s) => s.addCard);
	const updateCard = useBoardStore((s) => s.updateCard);
	const deleteCard = useBoardStore((s) => s.deleteCard);
	const moveCard = useBoardStore((s) => s.moveCard);
	const setColumns = useBoardStore((s) => s.setColumns);
	const findColumn = useBoardStore((s) => s.findColumn);
	const resetBoard = useBoardStore((s) => s.resetBoard);
	(0, import_react.useEffect)(() => {
		const result = useBoardStore.persist.rehydrate();
		Promise.resolve(result).finally(() => {
			useBoardStore.setState({ hasHydrated: true });
		});
	}, []);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [dialog, setDialog] = (0, import_react.useState)({
		open: false,
		mode: "create",
		draft: {
			title: "",
			description: "",
			url: "",
			tags: [],
			columnId: "todo"
		}
	});
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const [activeLane, setActiveLane] = (0, import_react.useState)("todo");
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedTags, setSelectedTags] = (0, import_react.useState)([]);
	const scrollerRef = (0, import_react.useRef)(null);
	const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 180,
		tolerance: 8
	} }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const lists = (0, import_react.useMemo)(() => {
		const next = {
			todo: [],
			doing: [],
			done: []
		};
		for (const id of COLUMN_IDS) next[id] = columns[id].map((cardId) => cards[cardId]).filter(Boolean);
		return next;
	}, [cards, columns]);
	const filtering = query.trim().length > 0 || selectedTags.length > 0;
	const visibleLists = (0, import_react.useMemo)(() => {
		if (!filtering) return lists;
		return {
			todo: lists.todo.filter((card) => cardMatches(card, query, selectedTags)),
			doing: lists.doing.filter((card) => cardMatches(card, query, selectedTags)),
			done: lists.done.filter((card) => cardMatches(card, query, selectedTags))
		};
	}, [
		filtering,
		lists,
		query,
		selectedTags
	]);
	const allTags = (0, import_react.useMemo)(() => collectTags(Object.values(cards)), [cards]);
	const total = Object.keys(cards).length;
	const visibleTotal = visibleLists.todo.length + visibleLists.doing.length + visibleLists.done.length;
	const activeCard = activeId ? cards[String(activeId)] : void 0;
	const pendingCard = pendingDelete ? cards[pendingDelete] : void 0;
	const openCreate = (0, import_react.useCallback)((columnId = activeLane) => {
		setDialog({
			open: true,
			mode: "create",
			draft: {
				title: "",
				description: "",
				url: "",
				tags: [],
				columnId
			}
		});
	}, [activeLane]);
	const openEdit = (0, import_react.useCallback)((id) => {
		const card = useBoardStore.getState().cards[id];
		const columnId = useBoardStore.getState().findColumn(id) ?? "todo";
		if (!card) return;
		setDialog({
			open: true,
			mode: "edit",
			cardId: id,
			draft: {
				title: card.title,
				description: card.description,
				url: card.url ?? "",
				tags: card.tags ?? [],
				columnId
			}
		});
	}, []);
	function handleDialogSubmit(draft) {
		if (dialog.mode === "create") {
			addCard(draft);
			toast("Card added", { description: `Placed in ${COLUMN_META[draft.columnId].label}.` });
			return;
		}
		if (dialog.cardId) {
			updateCard(dialog.cardId, draft);
			toast("Card updated");
		}
	}
	function confirmDelete() {
		if (!pendingDelete) return;
		deleteCard(pendingDelete);
		toast("Card deleted");
		setPendingDelete(null);
	}
	function handleMove(id, columnId) {
		moveCard(id, columnId);
		toast("Card moved", { description: `Now in ${COLUMN_META[columnId].label}.` });
	}
	function toggleTag(tag) {
		setSelectedTags((current) => {
			if (current.some((item) => item.toLowerCase() === tag.toLowerCase())) return current.filter((item) => item.toLowerCase() !== tag.toLowerCase());
			return [...current, tag];
		});
	}
	function clearFilters() {
		setQuery("");
		setSelectedTags([]);
	}
	function scrollToLane(id) {
		const scroller = scrollerRef.current;
		if (!scroller) {
			setActiveLane(id);
			return;
		}
		const index = COLUMN_IDS.indexOf(id);
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		scroller.scrollTo({
			left: index * scroller.clientWidth,
			behavior: reduceMotion ? "auto" : "smooth"
		});
		setActiveLane(id);
	}
	function handleScrollerScroll() {
		const scroller = scrollerRef.current;
		if (!scroller || scroller.clientWidth === 0) return;
		const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
		const id = COLUMN_IDS[Math.max(0, Math.min(index, COLUMN_IDS.length - 1))];
		if (id && id !== activeLane) setActiveLane(id);
	}
	function handleDragStart(event) {
		setActiveId(event.active.id);
	}
	function handleDragOver(event) {
		const { active, over } = event;
		if (!over) return;
		const overId = String(over.id);
		const activeIdStr = String(active.id);
		if (activeIdStr === overId) return;
		const from = findColumn(activeIdStr);
		const to = columnFromDroppable(overId) ?? findColumn(overId);
		if (!from || !to || from === to) return;
		const current = useBoardStore.getState().columns;
		const fromItems = current[from].filter((id) => id !== activeIdStr);
		const toItems = current[to].filter((id) => id !== activeIdStr);
		const overIndex = toItems.indexOf(overId);
		const insertAt = overIndex === -1 ? toItems.length : overIndex;
		const next = {
			...current,
			[from]: fromItems,
			[to]: [
				...toItems.slice(0, insertAt),
				activeIdStr,
				...toItems.slice(insertAt)
			]
		};
		if (listsEqual(current[from], next[from]) && listsEqual(current[to], next[to])) return;
		setColumns(next);
	}
	function handleDragEnd(event) {
		const { active, over } = event;
		setActiveId(null);
		if (!over) return;
		const activeIdStr = String(active.id);
		const overId = String(over.id);
		const from = findColumn(activeIdStr);
		const to = columnFromDroppable(overId) ?? findColumn(overId);
		if (!from || !to) return;
		const current = useBoardStore.getState().columns;
		if (from === to) {
			const items = current[from];
			const oldIndex = items.indexOf(activeIdStr);
			const newIndex = columnFromDroppable(overId) ? items.length - 1 : items.indexOf(overId);
			if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
			setColumns({
				...current,
				[from]: arrayMove(items, oldIndex, newIndex)
			});
		}
	}
	function handleDragCancel() {
		setActiveId(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "board-shell flex h-dvh flex-col overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-3 px-3 py-3 md:gap-6 md:px-8 md:py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardHeader, {
						total,
						visible: visibleTotal,
						filtering,
						onAdd: () => openCreate(activeLane),
						onReset: () => {
							resetBoard();
							clearFilters();
							toast("Sample board restored");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardFilters, {
						query,
						tags: allTags,
						selected: selectedTags,
						onQueryChange: setQuery,
						onToggleTag: toggleTag,
						onClear: clearFilters
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LaneSwitcher, {
						active: activeLane,
						counts: {
							todo: visibleLists.todo.length,
							doing: visibleLists.doing.length,
							done: visibleLists.done.length
						},
						onSelect: scrollToLane
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
						sensors,
						collisionDetection,
						measuring: { droppable: { strategy: MeasuringStrategy.Always } },
						onDragStart: handleDragStart,
						onDragOver: handleDragOver,
						onDragEnd: handleDragEnd,
						onDragCancel: handleDragCancel,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: scrollerRef,
								onScroll: handleScrollerScroll,
								className: "lane-scroller flex min-h-0 flex-1 items-stretch overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:snap-none",
								children: COLUMN_IDS.map((columnId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
									columnId,
									cards: visibleLists[columnId],
									empty: lists[columnId].length === 0,
									filtering,
									selectedTags,
									dragDisabled: filtering,
									onAdd: openCreate,
									onEdit: openEdit,
									onDelete: setPendingDelete,
									onMove: handleMove,
									onToggleTag: toggleTag
								}, columnId))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LaneDock, { active: Boolean(activeId) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, {
								dropAnimation,
								children: activeCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanCardView, {
									card: activeCard,
									isOverlay: true,
									onEdit: () => {},
									onDelete: () => {}
								}) : null
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDialog, {
				open: dialog.open,
				mode: dialog.mode,
				initial: dialog.draft,
				suggestions: allTags,
				onOpenChange: (open) => setDialog((current) => ({
					...current,
					open
				})),
				onSubmit: handleDialogSubmit
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => {
					if (!open) setPendingDelete(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this card?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: pendingCard ? `“${pendingCard.title}” will be removed from the board. This cannot be undone.` : "This card will be removed from the board." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-danger text-danger-fg hover:bg-danger/90",
					onClick: confirmDelete,
					children: "Delete"
				})] })] })
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {});
}
//#endregion
export { Home as component };
