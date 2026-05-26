import { z } from "zod";

export const ORG_NAME_MIN_LENGTH = 3;
export const ORG_NAME_MAX_LENGTH_CREATE = 100;
export const ORG_NAME_MAX_LENGTH_RENAME = 100;

export const ORG_NAME_MIN_MESSAGE =
  "Organization name must be at least 3 characters.";
export const ORG_NAME_MAX_CREATE_MESSAGE =
  "Organization name must be less than 100 characters.";
export const ORG_NAME_MAX_RENAME_MESSAGE =
  "Organization name must be less than 100 characters.";
export const ORG_NAME_ALPHANUMERIC_MESSAGE =
  "Organization name must contain at least one letter or number.";
export const ORG_NAME_SLUG_MESSAGE =
  "Organization name must contain characters that form a valid URL slug.";

export function organizationNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function hasOrganizationNameLetterOrNumber(name: string): boolean {
  return /[a-zA-Z0-9]/.test(name.trim());
}

export function isOrganizationNameValid(
  name: string,
  maxLength: number,
): boolean {
  const trimmed = name.trim();
  if (trimmed.length < ORG_NAME_MIN_LENGTH || trimmed.length > maxLength) {
    return false;
  }
  if (!hasOrganizationNameLetterOrNumber(trimmed)) {
    return false;
  }
  return organizationNameToSlug(trimmed).length > 0;
}

export function getOrganizationNameValidationMessage(
  name: string,
  maxLength: number,
): string | null {
  const trimmed = name.trim();

  if (trimmed.length < ORG_NAME_MIN_LENGTH) {
    return ORG_NAME_MIN_MESSAGE;
  }
  if (trimmed.length > maxLength) {
    return maxLength === ORG_NAME_MAX_LENGTH_CREATE
      ? ORG_NAME_MAX_CREATE_MESSAGE
      : ORG_NAME_MAX_RENAME_MESSAGE;
  }
  if (!hasOrganizationNameLetterOrNumber(trimmed)) {
    return ORG_NAME_ALPHANUMERIC_MESSAGE;
  }
  if (organizationNameToSlug(trimmed).length === 0) {
    return ORG_NAME_SLUG_MESSAGE;
  }
  return null;
}

const baseOrgName = z.string().trim();

export const createOrgNameSchema = baseOrgName
  .min(ORG_NAME_MIN_LENGTH, { message: ORG_NAME_MIN_MESSAGE })
  .max(ORG_NAME_MAX_LENGTH_CREATE, { message: ORG_NAME_MAX_CREATE_MESSAGE })
  .refine(hasOrganizationNameLetterOrNumber, {
    message: ORG_NAME_ALPHANUMERIC_MESSAGE,
  })
  .refine((name) => organizationNameToSlug(name).length > 0, {
    message: ORG_NAME_SLUG_MESSAGE,
  });

export const renameOrgNameSchema = baseOrgName
  .min(ORG_NAME_MIN_LENGTH, { message: ORG_NAME_MIN_MESSAGE })
  .max(ORG_NAME_MAX_LENGTH_RENAME, { message: ORG_NAME_MAX_RENAME_MESSAGE })
  .refine(hasOrganizationNameLetterOrNumber, {
    message: ORG_NAME_ALPHANUMERIC_MESSAGE,
  })
  .refine((name) => organizationNameToSlug(name).length > 0, {
    message: ORG_NAME_SLUG_MESSAGE,
  });
