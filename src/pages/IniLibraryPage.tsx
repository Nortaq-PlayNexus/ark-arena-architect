import { useCallback, useMemo, useState, type ChangeEventHandler } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Download,
  FileUp,
  Plus,
  Save,
  Trash2,
  Copy,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  INI_CATEGORY_LABELS,
  buildIniSnippet,
  deleteSnippet,
  exportIniLibraryJson,
  loadIniLibraryState,
  mergeIniLibraryImportJson,
  saveIniLibraryState,
  upsertSnippet,
  type IniSnippet,
  type IniSnippetCategory,
} from "@/lib/iniSnippetLibrary";

export default function IniLibraryPage() {
  const initial = loadIniLibraryState();
  const first = initial.snippets[0];
  const [state, setState] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(first?.id ?? null);
  const [draftTitle, setDraftTitle] = useState(first?.title ?? "");
  const [draftCategory, setDraftCategory] = useState<IniSnippetCategory>(first?.category ?? "game_user_settings");
  const [draftContent, setDraftContent] = useState(first?.content ?? "");
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<IniSnippetCategory>("game_user_settings");
  const [newContent, setNewContent] = useState("");

  const selected = useMemo(
    () => state.snippets.find((s) => s.id === selectedId) ?? null,
    [state.snippets, selectedId],
  );

  const persist = useCallback((next: typeof state) => {
    setState(next);
    saveIniLibraryState(next);
  }, []);

  // Keep draft in sync when selection changes
  const onSelectId = (id: string) => {
    setSelectedId(id);
    const s = state.snippets.find((x) => x.id === id);
    if (s) {
      setDraftTitle(s.title);
      setDraftCategory(s.category);
      setDraftContent(s.content);
    }
  };

  const saveDraft = () => {
    if (!selected) return;
    const nextSnip = buildIniSnippet({
      id: selected.id,
      title: draftTitle || "Untitled",
      category: draftCategory,
      content: draftContent,
    });
    persist(upsertSnippet(state, nextSnip));
    toast.success("Snippet saved");
  };

  const removeSelected = () => {
    if (!selected || !window.confirm(`Delete “${selected.title}”?`)) return;
    const next = deleteSnippet(state, selected.id);
    persist(next);
    const first = next.snippets[0];
    setSelectedId(first?.id ?? null);
    if (first) {
      setDraftTitle(first.title);
      setDraftCategory(first.category);
      setDraftContent(first.content);
    } else {
      setDraftTitle("");
      setDraftContent("");
    }
    toast.message("Snippet removed");
  };

  const addSnippet = () => {
    const snip = buildIniSnippet({
      title: newTitle.trim() || "New snippet",
      category: newCategory,
      content: newContent,
    });
    if (state.snippets.length >= 250) {
      toast.error("Library full (250 snippets). Export and delete some first.");
      return;
    }
    const next = upsertSnippet(state, snip);
    persist(next);
    setSelectedId(snip.id);
    setDraftTitle(snip.title);
    setDraftCategory(snip.category);
    setDraftContent(snip.content);
    setNewTitle("");
    setNewContent("");
    setAddOpen(false);
    toast.success("Snippet added");
  };

  const exportJson = () => {
    const blob = new Blob([exportIniLibraryJson(state)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_master_ini_library_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const importJsonFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const merged = mergeIniLibraryImportJson(text, state);
      if (!merged) {
        toast.error("Invalid backup JSON");
        return;
      }
      persist(merged);
      const first = merged.snippets[0];
      if (first) onSelectId(first.id);
      toast.success(`Imported — ${merged.snippets.length} snippets total`);
    };
    reader.readAsText(f);
  };

  const importIniFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const base = f.name.replace(/\.[^/.]+$/, "") || "Imported INI";
      const snip = buildIniSnippet({
        title: base.slice(0, 200),
        category: "other",
        content: text,
      });
      if (state.snippets.length >= 250) {
        toast.error("Library full");
        return;
      }
      const next = upsertSnippet(state, snip);
      persist(next);
      onSelectId(snip.id);
      toast.success("INI imported as new snippet");
    };
    reader.readAsText(f);
  };

  const clearAll = () => {
    if (!window.confirm("Delete all INI snippets in this browser?")) return;
    persist({ snippets: [] });
    setSelectedId(null);
    setDraftTitle("");
    setDraftContent("");
    toast.message("INI library cleared");
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(draftContent);
      toast.success("Content copied");
    } catch {
      toast.error("Clipboard denied");
    }
  };

  const sorted = useMemo(
    () => [...state.snippets].sort((a, b) => a.title.localeCompare(b.title)),
    [state.snippets],
  );

  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-[min(100%,96rem)] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ark-kicker">INI library</p>
            <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Snippets &amp; backups</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Store <code className="text-foreground">GameUserSettings.ini</code>, <code className="text-foreground">Engine.ini</code>, and
              related fragments locally in this browser. Sync with disk by exporting JSON — drop files into{" "}
              <code className="text-foreground">ark-inis-main/</code> when you want them in git.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              <Link to="/companions" className="text-primary underline-offset-4 hover:underline">
                Companions
              </Link>{" "}
              ·{" "}
              <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
                Settings
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="file" accept="application/json,.json" className="hidden" id="ini-import-json" onChange={importJsonFile} />
            <label htmlFor="ini-import-json">
              <Button type="button" variant="secondary" size="sm" className="gap-2" asChild>
                <span className="cursor-pointer">
                  <FileUp className="h-4 w-4" />
                  Import JSON
                </span>
              </Button>
            </label>
            <input type="file" accept=".ini,.INI,text/plain" className="hidden" id="ini-import-ini" onChange={importIniFile} />
            <label htmlFor="ini-import-ini">
              <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                <span className="cursor-pointer">
                  <FileCode className="h-4 w-4" />
                  Import .ini
                </span>
              </Button>
            </label>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={exportJson}>
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button type="button" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New snippet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New INI snippet</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                  <div>
                    <Label htmlFor="nt">Title</Label>
                    <Input id="nt" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-2" maxLength={200} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={(v) => setNewCategory(v as IniSnippetCategory)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(INI_CATEGORY_LABELS) as IniSnippetCategory[]).map((k) => (
                          <SelectItem key={k} value={k}>
                            {INI_CATEGORY_LABELS[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nc">Content</Label>
                    <Textarea
                      id="nc"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={12}
                      className="mt-2 font-mono text-xs"
                      spellCheck={false}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={addSnippet}>
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <Card className="border-primary/15 bg-card/80 lg:h-[min(70vh,640px)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Snippets</CardTitle>
              <CardDescription>{state.snippets.length} stored (max 250)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[min(58vh,520px)] px-4 pb-4">
                {sorted.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No snippets yet — add or import.</p>
                ) : (
                  <ul className="space-y-1">
                    {sorted.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => onSelectId(s.id)}
                          className={cn(
                            "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            s.id === selectedId
                              ? "border-primary/50 bg-primary/10 text-foreground"
                              : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50",
                          )}
                        >
                          <span className="block truncate font-medium text-foreground">{s.title}</span>
                          <span className="text-xs text-muted-foreground">{INI_CATEGORY_LABELS[s.category]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-primary/15 bg-card/80">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">Editor</CardTitle>
                <CardDescription>
                  {selected ? `Updated ${new Date(selected.updatedAt).toLocaleString()}` : "Select or create a snippet"}
                </CardDescription>
              </div>
              {selected && (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={() => void copyContent()}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button type="button" size="sm" className="gap-2" onClick={saveDraft}>
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="destructive" className="gap-2" onClick={removeSelected}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected ? (
                <p className="text-sm text-muted-foreground">Choose a snippet from the list or create a new one.</p>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="dt">Title</Label>
                      <Input id="dt" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="mt-2" maxLength={200} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={draftCategory} onValueChange={(v) => setDraftCategory(v as IniSnippetCategory)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(INI_CATEGORY_LABELS) as IniSnippetCategory[]).map((k) => (
                            <SelectItem key={k} value={k}>
                              {INI_CATEGORY_LABELS[k]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dc">INI content</Label>
                    <Textarea
                      id="dc"
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      rows={22}
                      className="mt-2 min-h-[320px] font-mono text-xs"
                      spellCheck={false}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
