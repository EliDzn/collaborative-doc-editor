"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Document = {
  id: number;
  title: string;
  content: string;
  owner_name: string;
  updated_by_name: string | null;
  updated_at: string;
  is_owner: boolean;
};

export default function DocumentPage() {
  const params = useParams();
  const id = params.id as string;
  const currentUserId = 2;

  const [doc, setDoc] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/documents/${id}?userId=${currentUserId}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDoc(data);
      setTitle(data.title);
      setContent(data.content);
      setLoading(false);
    }
    load();
  }, [id]);

  const save = useCallback(
    async (newTitle: string, newContent: string) => {
      setSaveState("saving");
      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          title: newTitle,
          content: newContent
        })
      });
      setSaveState("saved");
    },
    [id]
  );

  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => save(title, content), 800);
    return () => clearTimeout(timeout);
  }, [title, content, loading, save]);

  function insertSyntax(before: string, after: string = "") {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newContent =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setTimeout(() => textarea.focus(), 0);
  }

  function insertAtCursor(text: string) {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  }

  async function shareDocument() {
    await fetch(`/api/documents/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: currentUserId, targetUserId: 2 })
    });
    alert("Shared with Bob");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    insertAtCursor(data.content);
    e.target.value = "";
  }

  if (loading) return <div className="p-8 text-[16px]">Loading...</div>;
  if (notFound)
    return (
      <div className="p-8 text-[16px]">
        Document not found, or you do not have access.
      </div>
    );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-12 md:gap-x-6 lg:gap-x-8">
          {/* Header */}
          <div className="md:col-span-12">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Back to documents
              </Link>

              <span className="text-[13px] text-muted-foreground">
                {saveState === "saving"
                  ? "Saving..."
                  : saveState === "saved"
                    ? "Saved"
                    : ""}
              </span>
            </div>
          </div>

          {/* Document heading */}
          <div className="md:col-span-9">
            <h1 className="sr-only">{title || "Untitled Document"}</h1>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Document title"
              className="h-auto border-none px-0 !text-3xl !font-semibold tracking-tight shadow-none focus-visible:ring-0"
            />

            <p className="mt-2 text-[13px] text-muted-foreground">
              {doc?.is_owner ? "Owned by you" : `Shared by ${doc?.owner_name}`}
              {doc?.updated_by_name &&
                ` · Last edited by ${doc.updated_by_name}`}
            </p>
          </div>

          {/* Document action */}
          <div className="flex items-start justify-end md:col-span-3">
            {doc?.is_owner && (
              <Button onClick={shareDocument}>Share document</Button>
            )}
          </div>

          {/* Toolbar */}
          <div className="md:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-3 border-y py-2">
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("**", "**")}
                  className="font-bold"
                >
                  B
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("*", "*")}
                  className="italic"
                >
                  I
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("<u>", "</u>")}
                  className="underline"
                >
                  U
                </Button>

                <div className="mx-1 h-5 w-px bg-border" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("## ")}
                >
                  H
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("- ")}
                >
                  • List
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("1. ")}
                >
                  1. List
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertSyntax("[", "](url)")}
                >
                  Link
                </Button>

                <div className="mx-1 h-5 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent">
                    Upload
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    .txt or .md only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <section className="md:col-span-8">
            <div className="overflow-hidden rounded-lg border bg-background">
              <textarea
                id="editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[600px] w-full resize-none border-0 bg-transparent p-6 text-[16px] leading-7 font-mono focus:outline-none focus:ring-0"
                placeholder="Start writing..."
              />
            </div>
          </section>

          {/* Preview */}
          <section className="md:col-span-4">
            <div className="sticky top-6 overflow-hidden rounded-lg border bg-muted/20">
              <div className="border-b px-4 py-3">
                <p className="text-[13px] font-medium">Preview</p>
              </div>

              <div className="min-h-[600px] max-h-[600px] overflow-auto p-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {content || "*Preview appears here*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
