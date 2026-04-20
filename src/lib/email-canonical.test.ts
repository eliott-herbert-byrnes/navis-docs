import { describe, expect, it } from "vitest";
import { canonicalEmail } from "@/lib/email-canonical";

describe("canonicalEmail", () => {
  it("maps googlemail.com to gmail.com", () => {
    expect(canonicalEmail("foo@googlemail.com")).toBe("foo@gmail.com");
  });

  it("leaves gmail.com unchanged", () => {
    expect(canonicalEmail("foo@gmail.com")).toBe("foo@gmail.com");
  });

  it("preserves dots in the local part", () => {
    expect(canonicalEmail("joe.bloggs@gmail.com")).toBe("joe.bloggs@gmail.com");
    expect(canonicalEmail("j.o.e@gmail.com")).toBe("j.o.e@gmail.com");
  });

  it("preserves plus-addressing in the local part", () => {
    expect(canonicalEmail("foo+bar@gmail.com")).toBe("foo+bar@gmail.com");
    expect(canonicalEmail("foo+tag@googlemail.com")).toBe("foo+tag@gmail.com");
  });

  it("folds case and trims whitespace", () => {
    expect(canonicalEmail("  Foo@GMAIL.COM  ")).toBe("foo@gmail.com");
    expect(canonicalEmail("Joe@GOOGLEMAIL.COM")).toBe("joe@gmail.com");
  });

  it("does not normalise non-Gmail providers", () => {
    expect(canonicalEmail("user@outlook.com")).toBe("user@outlook.com");
    expect(canonicalEmail("User@OUTLOOK.COM")).toBe("user@outlook.com");
    expect(canonicalEmail("a@yahoo.co.uk")).toBe("a@yahoo.co.uk");
  });

  it("returns trimmed lowercase when there is no @", () => {
    expect(canonicalEmail("  not-an-email  ")).toBe("not-an-email");
  });
});
