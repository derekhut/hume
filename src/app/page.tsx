"use client";

import { ClientChat } from "@/components/artifacts/chat";
import { Playground } from "@/components/artifacts/playground";
import React, { Suspense, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const initialCode = `

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes\`
  from { opacity: 0; }
  to { opacity: 1; }
\`;


const Container = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: #f0f0f0;
  animation: \${fadeIn} 2s ease-in;
\`;

const Title = styled.h1\`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
\`;

const AnimatedComponent = () => {
  return (
    <Container>
      <Title>Artifacts Preview</Title>
    </Container>
  );
};

export default AnimatedComponent;
`;


function PageContent() {
  const [code, setCode] = React.useState(initialCode);
  const [historyCode, setHistoryCode] = React.useState<any>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isCodeLoading, setIsCodeLoading] = React.useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    setIsPreview(searchParams.get('preview') === '1');
  }, [searchParams]);
  useEffect(() => {
    if(!isCodeLoading){
      const newCode = [...historyCode]
      newCode.push(code)
      setHistoryCode(newCode);
    }
  },[isCodeLoading]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('eventData', event.data)
      if (typeof event.data === 'object' && event.data !== null && event.data.html) {
        setCode(event.data.html);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full rounded-lg border border-border overflow-hidden"
      >
        {!isPreview && (
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full bg-background border-r border-border">
              <ClientChat
                historyCode={historyCode}
                setArtifactContent={setCode}
                setIsCodeLoading={setIsCodeLoading}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </ResizablePanel>
        )}
        <ResizableHandle className="w-2 bg-muted hover:bg-muted-foreground/10 transition-colors group relative">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 opacity-100">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2">
              <div className="w-1 h-16 flex flex-col justify-center items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50 group-hover:bg-primary/50 transition-colors"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50 group-hover:bg-primary/50 transition-colors"></div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50 group-hover:bg-primary/50 transition-colors"></div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-popover rounded-md py-2 px-3 whitespace-nowrap shadow-md">
                <div className="text-popover-foreground text-xs">Drag to resize</div>
              </div>
            </div>
          </div>
        </ResizableHandle>
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full bg-background">
            <Playground
              initialCode={code}
              setCode={setCode}
              historyCode={historyCode}
              isCodeLoading={isCodeLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isPreview={isPreview}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
