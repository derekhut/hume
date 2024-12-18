"use client";

import { useCallback, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "@/components/ui/upload";
import { Icons } from "@/components/ui/icons";
import Markdown from "@/components/markdown/markdown";

interface MessageContent {
  type: string;
  text?: string;
  image?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string | MessageContent[];
  id: string;
}

interface ArtifactInfo {
  [key: string]: string;
}

const Artifact = ({
  title,
  loading = false,
  handleClick,
}: {
  title: string;
  loading?: boolean;
  handleClick?: () => void
}) => (
  <Card className="w-full max-w-sm bg-background border border-border ml-5 hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleClick}>
    <div className="flex items-center gap-3 p-3">
      <div className="bg-muted rounded-md p-2">
        {loading ? (
          <Icons.spinner className="h-5 w-5 animate-spin" />
        ) : (
          <Icons.code className="h-5 w-5 text-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {loading ? "Generating..." : "Click to open component"}
        </p>
      </div>
    </div>
  </Card>
);

const ChatMessage = ({ message, loadingArtifact }: { message: Message; loadingArtifact: boolean }) => {
  const isUser = message.role === "user";
  const messageContent = typeof message.content === "string"
    ? message.content
    : message.content?.find(c => c.type === "text")?.text || "";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex flex-col gap-2">
          <Avatar>
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" />
          </Avatar>
          {loadingArtifact && (
            <>
              <Artifact title="Loading Artifact..." loading={true} />
              <Separator className="my-2" />
            </>
          )}
        </div>
      )}
      {!loadingArtifact && (
        <div
          className={`${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground border border-border"
          } max-w-[70%] rounded-lg px-4 py-3`}
        >
          <Markdown text={messageContent} />
        </div>
      )}
      {isUser && (
        <Avatar>
          <AvatarFallback>You</AvatarFallback>
          <AvatarImage src="/user-avatar.png" />
        </Avatar>
      )}
    </div>
  );
};

export function ClientChat({
  setArtifactContent,
  setIsCodeLoading,
  historyCode,
  setCurrentPage
}: {
  setArtifactContent: (content: string) => void;
  setIsCodeLoading: (loading: boolean) => void;
  historyCode: string[];
  setCurrentPage: (val: number) => void;
}) {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/chat',
    headers: {
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`
    }
  });
  const [parsedMessages, setParsedMessages] = useState<Message[]>([]);
  const [artifactInfo, setArtifactInfo] = useState<ArtifactInfo>({});
  const [currentArtifact, setCurrentArtifact] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const parseMessage = useCallback((message: Message) => {
    let content = typeof message.content === "string" ? message.content : message.content?.[0]?.text;

    // Early return if no content
    if (!content) {
      return;
    }

    // Remove thinking tags
    content = content.replace(/<antthinking>.*?<\/antthinking>/gs, "");

    const artifactStartIndex = content.indexOf("<antartifact");
    const artifactEndIndex = content.indexOf("</antartifact>");

    if (artifactStartIndex !== -1) {
      const startTagEndIndex = content.indexOf(">", artifactStartIndex);
      if (startTagEndIndex === -1) {
        return;
      }

      const artifactContent = content.slice(startTagEndIndex + 1);
      setArtifactContent(artifactContent);

      if (artifactEndIndex !== -1) {
        const artifactContent = content.slice(
          startTagEndIndex + 1,
          artifactEndIndex
        );
        setArtifactContent(artifactContent);
        setArtifactInfo((prev) => ({
          ...prev,
          [message.id]: artifactContent,
        }));
        setIsCodeLoading(false);

        // Update content without artifact tags
        content =
          content.slice(0, artifactStartIndex) +
          content.slice(artifactEndIndex + "</antartifact>".length);
      } else {
        setCurrentArtifact(content.slice(artifactStartIndex));
        setIsCodeLoading(true);
        content = content.slice(0, artifactStartIndex);
      }
    } else if (currentArtifact) {
      if (artifactEndIndex !== -1) {
        const fullArtifact = currentArtifact + content.slice(0, artifactEndIndex);
        const artifactContent = fullArtifact.slice(
          fullArtifact.indexOf(">") + 1
        );
        setArtifactContent(artifactContent);
        content = content.slice(artifactEndIndex + "</antartifact>".length);
      } else {
        setCurrentArtifact(currentArtifact + content);
        content = "";
      }
    }

    if (content) {
      setParsedMessages((prevMessages) => {
        const existingIndex = prevMessages.findIndex(
          (m) => m.id === message.id
        );

        if (existingIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[existingIndex] = {
            ...message,
            content,
          };
          return updatedMessages;
        } else {
          return [...prevMessages, { ...message, content }];
        }
      });
    }
  }, [currentArtifact, setArtifactContent, setIsCodeLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        parseMessage(lastMessage as Message);
      }
    }
  }, [messages, parseMessage]);

  const handleSend = async () => {
    if (input.trim()) {
      try {
        const response = await fetch('/api/chat/rate-limit');
        if (!response.ok) {
          const { error } = await response.json();
          const indicator = document.getElementById('rate-limit-indicator');
          if (indicator) {
            indicator.textContent = error === 'Rate limit exceeded'
              ? 'Rate limit exceeded. Please wait.'
              : 'Error checking rate limit';
          }
          return;
        }

        const { remaining } = await response.json();
        const indicator = document.getElementById('rate-limit-indicator');
        if (indicator) {
          indicator.textContent = `${remaining} requests remaining`;
        }

        let inputContent: any = input.trim();
        if (imageBase64) {
          inputContent = [
            {
              "type": "text",
              "text": input.trim()
            },
            {
              "type": "image",
              "image": imageBase64,
            },
          ];
        }

        append({ content: inputContent, role: "user" });
        setCurrentArtifact("");
        setInput("");
        setImageBase64("");
        setImagePreview("");
      } catch (error) {
        console.error('Error:', error);
        const indicator = document.getElementById('rate-limit-indicator');
        if (indicator) {
          indicator.textContent = 'Error processing request';
        }
      }
    }
  };

  const beforeUpload = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const result = e.target.result;
        if (typeof result === 'string') {
          setImageBase64(result);
          setImagePreview(result);
        }
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              setImageBase64(e.target.result);
              setImagePreview(e.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">AI Assistant</h2>
        <div className="flex items-center gap-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground" id="rate-limit-indicator"></div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="grid gap-6">
          {parsedMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Icons.message className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No messages yet</h3>
                <p className="text-sm text-muted-foreground">Start a conversation to begin</p>
              </div>
            </div>
          ) : (
            parsedMessages.map((message, index) => (
              <div key={message.id}>
                <ChatMessage
                  message={message}
                  loadingArtifact={Boolean(currentArtifact) && isLoading && index === parsedMessages.length - 1}
                />
                {artifactInfo[message.id] && !isLoading && (
                  <Artifact
                    title="Click to Open"
                    handleClick={() => {
                      setArtifactContent(artifactInfo[message.id]);
                      setCurrentPage(historyCode.length);
                    }}
                  />
                )}
              </div>
            ))
          )}
          {isLoading && !currentArtifact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-12">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <span>Generating response...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-4">
        <div className="flex flex-col gap-4">
          {imagePreview && (
            <div className="relative w-20 h-20">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={handleRemoveImage}
              >
                <Icons.x className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Upload onUpload={beforeUpload} accept="image/*">
              <Button variant="outline" size="icon" type="button">
                <Icons.image className="h-4 w-4" />
              </Button>
            </Upload>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Type a message..."
              className="flex-1"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && !imageBase64) || isLoading}
              className="relative"
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
