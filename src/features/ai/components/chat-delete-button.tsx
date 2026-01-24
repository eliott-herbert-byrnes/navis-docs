"use client";

import { ChatDeleteDialog } from "./chat-delete-dialog";

const ChatDeleteButton = ({ clearMessage, isLoading }:
    {
        clearMessage: () => void;
        isLoading: boolean;
    }) => {

    const handleDelete = () => {
        clearMessage();
    };

    return (
        <ChatDeleteDialog
            title="Are you sure you want to delete this chat?"
            description="This action cannot be undone."
            isPending={isLoading}
            onConfirm={handleDelete}
        />
    );
};

export { ChatDeleteButton };
