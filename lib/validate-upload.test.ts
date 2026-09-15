import { describe, it, expect } from "vitest";
import { isAllowedFileType } from "./validate-upload";

describe("isAllowedFileType", () => {
  it("accepts .txt files", () => {
    expect(isAllowedFileType("notes.txt")).toBe(true);
  });

  it("accepts .md files", () => {
    expect(isAllowedFileType("README.md")).toBe(true);
  });

  it("rejects unsupported file types", () => {
    expect(isAllowedFileType("resume.docx")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isAllowedFileType("NOTES.TXT")).toBe(true);
  });
});
