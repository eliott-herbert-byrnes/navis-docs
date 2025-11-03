"use client";
import { useCallback, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MoveRight, PlusCircle, CheckCircle } from "lucide-react";
import {
  ProcessContent,
  YesNoContent,
  YesNoNode,
} from "../form/utils/process-edit-utils";

type YesNoPairsEditorProps = {
  content: ProcessContent;
  onChange: (content: ProcessContent) => void;
  isPreview: boolean;
};

export function YesNoPairsEditor({ content, onChange, isPreview }: YesNoPairsEditorProps) {
  const initialContent: YesNoContent = content?.yesno || {
    nodes: [
      {
        id: "start",
        question: "Start",
        description: "Root",
      },
    ],
    startNodeId: "start",
  };

  const [yesnoContent, setYesnoContent] = useState<YesNoContent>(initialContent);
  const [currentPath, setCurrentPath] = useState<string[]>([initialContent.startNodeId || "start"]);

  const syncToParent = useCallback(
    (newContent: YesNoContent) => {
      onChange({
        ...content,
        yesno: newContent,
      });
    },
    [content, onChange]
  );

  const currentNodeId = currentPath[currentPath.length - 1];
  const currentNode = useMemo(
    () => yesnoContent.nodes.find((node) => node.id === currentNodeId),
    [yesnoContent.nodes, currentNodeId]
  );

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<YesNoNode>) => {
      const newNodes = yesnoContent.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...updates } : node
      );
      const newContent = { ...yesnoContent, nodes: newNodes };
      setYesnoContent(newContent);
      syncToParent(newContent);
    },
    [yesnoContent, syncToParent]
  );

  const createChildNode = useCallback(
    (parentId: string, branch: "yes" | "no", asEnd = false) => {
      const newNodeId = `node-${Date.now()}`;
      const newNode: YesNoNode = asEnd
        ? {
            id: newNodeId,
            question: "End of process",
            description: "",
            isEndNode: true,
            endMessage: "End of process",
          }
        : {
            id: newNodeId,
            question: "Card title",
            description: "Add a short description",
          };

      const updatedNodes = yesnoContent.nodes
        .map((n) =>
          n.id === parentId
            ? {
                ...n,
                [branch === "yes" ? "yesNodeId" : "noNodeId"]: newNodeId,
              }
            : n
        );

      const newContent = { ...yesnoContent, nodes: [...updatedNodes, newNode] };
      setYesnoContent(newContent);
      syncToParent(newContent);
      toast.success("Card added");
    },
    [yesnoContent, syncToParent]
  );

  const createEndNode = useCallback(
    (parentId: string, branch: "yes" | "no") => {
      createChildNode(parentId, branch, true);
    },
    [createChildNode]
  );

  const navigateToNode = useCallback(
    (nodeId: string, isBack: boolean = false) => {
      if (isBack) {
        setCurrentPath((prev) => prev.slice(0, - 1));
      } else {
        setCurrentPath((prev) => [...prev, nodeId]);
      }
    },
    []
  );

  const resetToStart = useCallback(() => {
    setCurrentPath([yesnoContent.startNodeId || "start"]);
    toast.info("Returned to start");
  }, [yesnoContent.startNodeId]);

  const getChild = useCallback(
    (node: YesNoNode | undefined | null, branch: "yes" | "no") => {
      if (!node) return null;
      const id = branch === "yes" ? node.yesNodeId : node.noNodeId;
      if (!id) return null;
      return yesnoContent.nodes.find((n) => n.id === id) || null;
    },
    [yesnoContent.nodes]
  );

  if (!currentNode) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No content found. Please refresh.</p>
      </Card>
    );
  }

  const leftChild = getChild(currentNode, "yes");
  const rightChild = getChild(currentNode, "no");

  const renderChildEditor = (
    child: YesNoNode | null,
    branch: "yes" | "no"
  ) => {
    if (!child) {
      return (
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => createChildNode(currentNode.id, branch)}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add card
          </Button>
          <Button variant="outline" onClick={() => createEndNode(currentNode.id, branch)}>
            <CheckCircle className="w-4 h-4 mr-2" /> Add end card
          </Button>
        </div>
      );
    }

    if (child.isEndNode) {
      return (
        <div className="space-y-3">
          <Input
            value={child.question}
            onChange={(e) => updateNode(child.id, { question: e.target.value })}
            placeholder="End title"
          />
          <Textarea
            value={child.endMessage || ""}
            onChange={(e) => updateNode(child.id, { endMessage: e.target.value })}
            placeholder="End description"
            rows={3}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigateToNode(child.id)}>
              View end
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Input
          value={child.question}
          onChange={(e) => updateNode(child.id, { question: e.target.value })}
          placeholder="Card title"
        />
        <Textarea
          value={child.description || ""}
          onChange={(e) => updateNode(child.id, { description: e.target.value })}
          placeholder="Card description"
          rows={3}
        />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigateToNode(child.id)}>
            Go to next set <MoveRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderChildPreview = (child: YesNoNode | null) => {
    if (!child) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="p-6 text-center text-muted-foreground">
            Not configured
          </CardContent>
        </Card>
      );
    }
    if (child.isEndNode) {
      return (
        <Card className="cursor-pointer hover:border-primary" onClick={() => navigateToNode(child.id)}>
          <CardHeader>
            <CardTitle>{child.question || "End of process"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{child.endMessage || ""}</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="cursor-pointer hover:border-primary" onClick={() => navigateToNode(child.id)}>
        <CardHeader>
          <CardTitle>{child.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{child.description}</p>
        </CardContent>
      </Card>
    );
  };

  if (currentNode.isEndNode) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          {currentPath.length > 1 && (
            <Button variant="ghost" size="sm" onClick={() => navigateToNode("", true)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetToStart}>
            <Home className="w-4 h-4 mr-2" /> Start
          </Button>
        </div>
        {isPreview ? (
          <>
            <h3 className="text-xl font-semibold mb-2">{currentNode.question || "End of process"}</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">{currentNode.endMessage}</p>
          </>
        ) : (
          <div className="space-y-3 max-w-xl mx-auto">
            <Input
              value={currentNode.question}
              onChange={(e) => updateNode(currentNode.id, { question: e.target.value })}
              placeholder="End title"
            />
            <Textarea
              value={currentNode.endMessage || ""}
              onChange={(e) => updateNode(currentNode.id, { endMessage: e.target.value })}
              placeholder="End description"
              rows={3}
            />
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {currentPath.length > 1 && (
          <Button variant="ghost" size="sm" onClick={() => navigateToNode("", true)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={resetToStart}>
          <Home className="w-4 h-4 mr-2" /> Start
        </Button>
        {!isPreview && (
          <span className="text-sm text-muted-foreground">Depth: {currentPath.length - 1}</span>
        )}
      </div>

      {/* Two cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left card */}
        <Card className="p-4">
          {!isPreview ? (
            renderChildEditor(leftChild, "yes")
          ) : (
            renderChildPreview(leftChild)
          )}
        </Card>

        {/* Right card */}
        <Card className="p-4">
          {!isPreview ? (
            renderChildEditor(rightChild, "no")
          ) : (
            renderChildPreview(rightChild)
          )}
        </Card>
      </div>

      {/* {isPreview && (
        <div className="text-sm text-muted-foreground text-center">
          Total cards: {yesnoContent.nodes.length} | End cards: {yesnoContent.nodes.filter((n) => n.isEndNode).length}
        </div>
      )} */}
    </div>
  );
}


