import { Prisma } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { FlowContent } from "../components/editors/flow-editor";
import { YesNoContent } from "../components/form/utils/process-edit-utils";
import { Step } from "../components/editors/steps-editor";
import type { AppRouter } from "@/server/trpc/routers/_app";
import type { inferProcedureOutput } from "@trpc/server";

export type ProcessForEdit = inferProcedureOutput<
  AppRouter["process"]["getForEdit"]
>["data"];

export type CategoryWithProcesses = inferProcedureOutput<
AppRouter["process"]["categoriesWithProcesses"]>["data"]

// export type ProcessForView = inferProcedureOutput<
//   AppRouter["process"]["getForView"]
// >["data"];


export type ProcessForView = Prisma.ProcessGetPayload<{
    include: {
        publishedVersion: true;
    }
}>;

export type ProcessForViewWithRelations = Prisma.ProcessGetPayload<{
    include: {
        publishedVersion: true;
        team: true;
        category: true;
    }
}>;

export type ProcessContentType = {
    tiptap?: JSONContent;
    steps?: Step[];
    flow?: FlowContent;
    yesno?: YesNoContent;
}