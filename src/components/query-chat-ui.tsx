"use client";

import { useCompletion } from "@ai-sdk/react";
import { Bot, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QueryChatUIProps {
  query: string;
}

export function QueryChatUI({ query }: QueryChatUIProps) {
  const [activeTab, setActiveTab] = useState<"claude" | "chatgpt">("claude");

  // Claude completion
  const claudeCompletion = useCompletion({
    api: "/api/ai/chat/claude",
    initialInput: query,
    streamProtocol: "text",
  });

  // ChatGPT completion
  const chatgptCompletion = useCompletion({
    api: "/api/ai/chat/chatgpt",
    initialInput: query,
    streamProtocol: "text",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Test Query with AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "claude" | "chatgpt")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="claude" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Claude
            </TabsTrigger>
            <TabsTrigger value="chatgpt" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              ChatGPT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claude" className="space-y-4">
            <form
              onSubmit={claudeCompletion.handleSubmit}
              className="space-y-4"
            >
              <div>
                <Input
                  name="prompt"
                  value={claudeCompletion.input}
                  onChange={claudeCompletion.handleInputChange}
                  placeholder="Enter your query..."
                  disabled={claudeCompletion.isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={claudeCompletion.isLoading}
                className="w-full"
              >
                {claudeCompletion.isLoading ? (
                  <>
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
                    Claude is thinking...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Ask Claude
                  </>
                )}
              </Button>
            </form>

            {/* Claude Response */}
            {(claudeCompletion.completion || claudeCompletion.isLoading) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="font-medium">Claude Response</span>
                  {claudeCompletion.isLoading && (
                    <Badge variant="secondary" className="text-xs">
                      Streaming...
                    </Badge>
                  )}
                </div>
                <div className="min-h-[100px] rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                  <p className="whitespace-pre-wrap text-sm">
                    {claudeCompletion.completion}
                    {claudeCompletion.isLoading && (
                      <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500" />
                    )}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chatgpt" className="space-y-4">
            <form
              onSubmit={chatgptCompletion.handleSubmit}
              className="space-y-4"
            >
              <div>
                <Input
                  name="prompt"
                  value={chatgptCompletion.input}
                  onChange={chatgptCompletion.handleInputChange}
                  placeholder="Enter your query..."
                  disabled={chatgptCompletion.isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={chatgptCompletion.isLoading}
                className="w-full"
              >
                {chatgptCompletion.isLoading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    ChatGPT is thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask ChatGPT
                  </>
                )}
              </Button>
            </form>

            {/* ChatGPT Response */}
            {(chatgptCompletion.completion || chatgptCompletion.isLoading) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">ChatGPT Response</span>
                  {chatgptCompletion.isLoading && (
                    <Badge variant="secondary" className="text-xs">
                      Streaming...
                    </Badge>
                  )}
                </div>
                <div className="min-h-[100px] rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                  <p className="whitespace-pre-wrap text-sm">
                    {chatgptCompletion.completion}
                    {chatgptCompletion.isLoading && (
                      <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-green-500" />
                    )}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Text */}
        {!claudeCompletion.completion &&
          !claudeCompletion.isLoading &&
          !chatgptCompletion.completion &&
          !chatgptCompletion.isLoading && (
            <div className="mt-4 py-4 text-center">
              <p className="text-muted-foreground text-sm">
                Enter your query and click the button to see how{" "}
                {activeTab === "claude" ? "Claude" : "ChatGPT"} responds.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
