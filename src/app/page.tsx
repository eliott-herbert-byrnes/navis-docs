'use client';

import { EmptyState } from "@/components/empty-state";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {

  return (
    <>
      <Heading
        title="Departments"
        description="Manage your departments"
        actions={
            <Button variant="outline">
            <PlusIcon className="w-4 h-4" />
            Add Department
          </Button>
        }
      />

      <EmptyState
        title="No departments found"
        body="Create a new department to get started"
      />
    </>
  );
}
