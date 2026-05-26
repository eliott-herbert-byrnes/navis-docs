import { describe, expect, it } from "vitest";
import {
  ORG_NAME_ALPHANUMERIC_MESSAGE,
  ORG_NAME_MAX_CREATE_MESSAGE,
  ORG_NAME_MAX_LENGTH_CREATE,
  ORG_NAME_MAX_LENGTH_RENAME,
  ORG_NAME_MAX_RENAME_MESSAGE,
  ORG_NAME_MIN_MESSAGE,
  getOrganizationNameValidationMessage,
  isOrganizationNameValid,
  organizationNameToSlug,
} from "@/lib/org-name";

describe("organizationNameToSlug", () => {
  it("lowercases and replaces non-alphanumeric characters with hyphens", () => {
    expect(organizationNameToSlug("Terra Nova Inc.")).toBe("terra-nova-inc");
    expect(organizationNameToSlug("ACME")).toBe("acme");
  });

  it("strips leading and trailing hyphens", () => {
    expect(organizationNameToSlug("---abc---")).toBe("abc");
  });

  it("returns an empty string for punctuation-only names", () => {
    expect(organizationNameToSlug("---")).toBe("");
  });
});

describe("isOrganizationNameValid", () => {
  it("rejects names shorter than the minimum length", () => {
    expect(isOrganizationNameValid("AB", ORG_NAME_MAX_LENGTH_CREATE)).toBe(
      false,
    );
  });

  it("accepts valid names at the minimum length", () => {
    expect(isOrganizationNameValid("IBM", ORG_NAME_MAX_LENGTH_CREATE)).toBe(
      true,
    );
  });

  it("rejects punctuation-only names", () => {
    expect(isOrganizationNameValid("---", ORG_NAME_MAX_LENGTH_CREATE)).toBe(
      false,
    );
  });

  it("accepts names with surrounding whitespace after trim", () => {
    expect(isOrganizationNameValid(" abc ", ORG_NAME_MAX_LENGTH_CREATE)).toBe(
      true,
    );
  });

  it("rejects names longer than the create maximum", () => {
    expect(
      isOrganizationNameValid("a".repeat(101), ORG_NAME_MAX_LENGTH_CREATE),
    ).toBe(false);
  });

  it("rejects names longer than the rename maximum", () => {
    expect(
      isOrganizationNameValid("a".repeat(101), ORG_NAME_MAX_LENGTH_RENAME),
    ).toBe(false);
  });
});

describe("getOrganizationNameValidationMessage", () => {
  it("returns the minimum length message for short names", () => {
    expect(
      getOrganizationNameValidationMessage("AB", ORG_NAME_MAX_LENGTH_CREATE),
    ).toBe(ORG_NAME_MIN_MESSAGE);
  });

  it("returns null for valid names", () => {
    expect(
      getOrganizationNameValidationMessage("IBM", ORG_NAME_MAX_LENGTH_CREATE),
    ).toBeNull();
  });

  it("returns the alphanumeric message for punctuation-only names", () => {
    expect(
      getOrganizationNameValidationMessage("---", ORG_NAME_MAX_LENGTH_CREATE),
    ).toBe(ORG_NAME_ALPHANUMERIC_MESSAGE);
  });

  it("returns null for valid names with surrounding whitespace", () => {
    expect(
      getOrganizationNameValidationMessage(" abc ", ORG_NAME_MAX_LENGTH_CREATE),
    ).toBeNull();
  });

  it("returns the create max length message for overly long create names", () => {
    expect(
      getOrganizationNameValidationMessage(
        "a".repeat(101),
        ORG_NAME_MAX_LENGTH_CREATE,
      ),
    ).toBe(ORG_NAME_MAX_CREATE_MESSAGE);
  });

  it("returns the rename max length message for overly long rename names", () => {
    expect(
      getOrganizationNameValidationMessage(
        "a".repeat(101),
        ORG_NAME_MAX_LENGTH_RENAME,
      ),
    ).toBe(ORG_NAME_MAX_RENAME_MESSAGE);
  });
});
