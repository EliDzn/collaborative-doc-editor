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
  const currentUserId = 2; // hardcoded as Alice for now — replaced by real selector in step 7

  async function loadDocuments() {
    const res = await fetch(`/api/documents?userId=${currentUserId}`);
    const data = await res.json();
    setDocuments(data);
  }

  async function createDocument() {
    setLoading(true);
    const res = await fetch("/api/documents", {
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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Documents</h1>
        <Button onClick={createDocument} disabled={loading}>
          {loading ? "Creating..." : "Create Document"}
        </Button>
      </div>

      {documents.length === 0 ? (
        <p className="text-muted-foreground">
          No documents yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle>{doc.title}</CardTitle>
                  <CardDescription>
                    Owned by {doc.owner_name} · Last updated{" "}
                    {new Date(doc.updated_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
