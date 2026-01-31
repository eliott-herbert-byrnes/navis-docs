import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { FlowContent } from "../components/editors/flow-editor";
import { YesNoContent } from "../components/form/utils/procedure-edit-utils";
import { Step } from "../components/editors/steps-editor";
import type { AppRouter } from "@/server/trpc/routers/_app";
import type { inferProcedureOutput } from "@trpc/server";

export type ProcedureForEdit = inferProcedureOutput<
  AppRouter["procedures"]["getForEdit"]
>["data"];

export type CategoryWithProcedures = inferProcedureOutput<
  AppRouter["procedures"]["categoriesWithProcedures"]
>["data"];

// export type ProcedureForView = inferProcedureOutput<
//   AppRouter["procedures"]["getForView"]
// >["data"];

export type ProcedureForView = Prisma.ProcedureGetPayload<{
  include: {
    publishedVersion: true;
  };
}>;

export type ProcedureForViewWithRelations = Prisma.ProcedureGetPayload<{
  include: {
    publishedVersion: true;
    team: true;
    category: true;
  };
}>;

export type ProcedureContentType = {
  tiptap?: JSONContent;
  steps?: Step[];
  flow?: FlowContent;
  yesno?: YesNoContent;
};
