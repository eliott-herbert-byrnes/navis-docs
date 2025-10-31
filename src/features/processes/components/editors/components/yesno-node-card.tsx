"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { YesNoNode, YesNoContent } from "../../form/utils/process-edit-utils";

type YesNoNodeCardProps = {
  node: YesNoNode;
  onUpdateNode: (updates: Partial<YesNoNode>) => void;
  onNavigate: (nodeId: string, isBack?: boolean) => void;
  onCreateBranch: (parentId: string, branch: "yes" | "no") => void;
  onCreateEndNode: (parentId: string, branch: "yes" | "no") => void;
  canGoBack: boolean;
  isPreview: boolean;
  yesnoContent: YesNoContent;
};

export function YesNoNodeCard({
  node,
  onUpdateNode,
  onNavigate,
  onCreateBranch,
  onCreateEndNode,
  canGoBack,
  isPreview,
  yesnoContent,
}: YesNoNodeCardProps) {
  const yesNode = node.yesNodeId
    ? yesnoContent.nodes.find((n) => n.id === node.yesNodeId)
    : null;
  const noNode = node.noNodeId
    ? yesnoContent.nodes.find((n) => n.id === node.noNodeId)
    : null;

  // End node view
  if (node.isEndNode) {
    return (
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <CardTitle>End of Path</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPreview ? (
            <p className="text-muted-foreground">{node.endMessage}</p>
          ) : (
            <Textarea
              value={node.endMessage || ""}
              onChange={(e) => onUpdateNode({ endMessage: e.target.value })}
              placeholder="Enter end message..."
              rows={3}
            />
          )}
          {canGoBack && (
            <Button variant="outline" onClick={() => onNavigate("", true)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isPreview ? (
              <CardTitle>{node.question}</CardTitle>
            ) : (
              <Input
                value={node.question}
                onChange={(e) => onUpdateNode({ question: e.target.value })}
                className="text-lg font-semibold"
                placeholder="Enter your question..."
              />
            )}
          </div>
          {canGoBack && !isPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("", true)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
        {isPreview ? (
          node.description && <CardDescription>{node.description}</CardDescription>
        ) : (
          <Textarea
            value={node.description || ""}
            onChange={(e) => onUpdateNode({ description: e.target.value })}
            placeholder="Add description or context..."
            rows={2}
            className="mt-2"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yes Branch */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <span className="font-medium">Yes Path</span>
            {yesNode && <Badge variant="outline">{yesNode.isEndNode ? "End" : "Question"}</Badge>}
          </div>
          {yesNode ? (
            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="p-3">
                <p className="text-sm font-medium">{yesNode.question}</p>
                {!isPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(yesNode.id)}
                    className="mt-2 w-full"
                  >
                    Navigate to this node →
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            !isPreview && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateBranch(node.id, "yes")}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateEndNode(node.id, "yes")}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add End
                </Button>
              </div>
            )
          )}
        </div>

        {/* No Branch */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-4 h-4 text-red-600" />
            <span className="font-medium">No Path</span>
            {noNode && <Badge variant="outline">{noNode.isEndNode ? "End" : "Question"}</Badge>}
          </div>
          {noNode ? (
            <Card className="bg-red-50/50 border-red-200">
              <CardContent className="p-3">
                <p className="text-sm font-medium">{noNode.question}</p>
                {!isPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(noNode.id)}
                    className="mt-2 w-full"
                  >
                    Navigate to this node →
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            !isPreview && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateBranch(node.id, "no")}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateEndNode(node.id, "no")}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add End
                </Button>
              </div>
            )
          )}
        </div>

        {/* Warning for incomplete branches */}
        {!isPreview && (!yesNode || !noNode) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Complete both Yes and No paths to create a valid decision tree
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}