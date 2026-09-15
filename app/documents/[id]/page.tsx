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
  const currentUserId = 1;

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
    setContent((prev) => prev + "\n\n" + data.content);
    e.target.value = "";
  }

  if (loading) return <div className="p-8 text-[16px]">Loading...</div>;
  if (notFound)
    return (
      <div className="p-8 text-[16px]">
        Document not found, or you don't have access.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-[13px] text-muted-foreground hover:underline"
      >
        ← Back to documents
      </Link>

      <div className="flex items-center justify-between mt-4 mb-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-[29px] font-semibold border-none px-0 h-auto focus-visible:ring-0 tracking-tight"
        />
        <span className="text-[13px] text-muted-foreground whitespace-nowrap ml-4">
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : ""}
        </span>
      </div>

      <p className="text-[13px] text-muted-foreground mb-5">
        {doc?.is_owner ? "Owned by you" : `Shared by ${doc?.owner_name}`}
        {doc?.updated_by_name && ` · Last edited by ${doc.updated_by_name}`}
      </p>

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/40">
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
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => insertSyntax("## ")}>
            H
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertSyntax("- ")}>
            • List
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertSyntax("1. ")}>
            1. List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertSyntax("[", "](url)")}
          >
            Link
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <label className="text-[13px] px-2 py-1.5 rounded cursor-pointer hover:bg-accent">
            Upload
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {doc?.is_owner && (
          <Button onClick={shareDocument} className="shrink-0">
            Share document
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          id="editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[400px] border rounded-md p-4 text-[16px] leading-relaxed font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Start writing... use the toolbar or markdown syntax directly"
        />
        <div className="w-full min-h-[400px] border rounded-md p-4 text-[16px] leading-relaxed prose prose-sm max-w-none overflow-auto">
          <ReactMarkdown>{content || "*Preview appears here*"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
