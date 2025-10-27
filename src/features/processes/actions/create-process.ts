"use server";
import { ActionState, fromErrorToActionState, toActionState } from "@/components/form/utils/to-action-state";
import { getSessionUser } from "@/lib/auth";

export const createProcess = async (_actionState: ActionState, formData: FormData) => {
    try {
        const user = await getSessionUser();
        if (!user) {
            return toActionState("ERROR", "Unauthorized", formData);
        }

        return toActionState("SUCCESS", "Process created successfully", formData);
    } catch (error) {
        return fromErrorToActionState(error, formData);
    }
}