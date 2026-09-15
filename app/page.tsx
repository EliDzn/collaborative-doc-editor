"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

type Document = {
  id: number;
  title: string;
  owner_name: string;
  updated_at: string;
};

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = 2;

  async function loadDocuments() {
    const res = await fetch(`/api/documents?userId=${currentUserId}`);
    const data = await res.json();
    setDocuments(data);
  }

  async function createDocument() {
    setLoading(true);

    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUserId,
        title: "Untitled Document"
      })
    });

    await loadDocuments();
    setLoading(false);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Header */}
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          </div>

          <Button onClick={createDocument} disabled={loading}>
            {loading ? "Creating..." : "New document"}
          </Button>
        </header>

        {/* Documents */}
        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">No documents yet.</p>
            <Button
              variant="link"
              className="mt-1 px-0"
              onClick={createDocument}
              disabled={loading}
            >
              Create your first document
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your documents
            </div>

            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader className="flex flex-row items-center justify-between gap-6 py-4">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base font-medium">
                        {doc.title}
                      </CardTitle>

                      <CardDescription className="mt-1">
                        Owned by {doc.owner_name}
                      </CardDescription>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </span>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
