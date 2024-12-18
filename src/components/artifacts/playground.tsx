"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, Pagination, Space, message } from "antd";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { LiveEditor, LivePreview, LiveProvider } from "react-live";
import * as echarts from "echarts";
import * as antd from "antd";
import * as antdIcons from "@ant-design/icons";
import styled, { keyframes } from 'styled-components';
import * as ahooks from "ahooks";
import * as datefns from "date-fns";
import { PreviewScreen } from "./preview-screen";
import { CopyOutlined } from "@ant-design/icons";

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise<void>((resolve, reject) => {
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        textArea.remove();
      }
    });
  }
}

interface PlaygroundProps {
  initialCode: string;
  historyCode: string[];
  setCode: (code:string) => void;
  isCodeLoading: boolean;
  currentPage: number;
  isPreview: boolean;
  setCurrentPage:(val: number) => void;
}

interface IframeProps {
  htmlContent: string;
}

const detectCodeType = (code:string) => {
  const htmlRegex = /^\s*<!DOCTYPE html>.*<html.*>.*<head>.*<body>.*<\/html>/s;
  if (htmlRegex.test(code)) {
    return 'HTML';
  }
  return 'React';
};

const CodeEditor = ({ onChange, isCodeLoading }: { onChange: (code: string) => void, isCodeLoading: boolean }) => {
  const { code, updateCode } = useActiveCode();
  const editorRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current) {
      const editorElement = editorRef.current.querySelector('.cm-scroller');
      if (editorElement) {
        editorElement.scrollTop = editorElement.scrollHeight;
      }
    }
  }, [code]);

  return (
    <div ref={editorRef}>
      <SandpackLayout>
        {detectCodeType(code) === 'React' && <SandpackFileExplorer />}
        <SandpackCodeEditor 
          showTabs={false}
          showLineNumbers={true}
          showInlineErrors={true}
          wrapContent={true}
          onChange={(newCode) => {
            updateCode(newCode);
            onChange(newCode);
          }}
          style={{
            height: '600px',
          }}
        />
      </SandpackLayout>
    </div>
  );
};

const PlaygroundContent = ({ 
  initialCode, 
  isPreview, 
  setCode, 
  currentPage, 
  setCurrentPage, 
  historyCode, 
  isCodeLoading 
}: PlaygroundProps) => {
  const [historyLength, setHistoryLength] = useState(historyCode.length);
  const [currentTab, setCurrentTab] = useState("preview");
  const [renderMode, setRenderMode] = useState<'react-live' | 'sandpack'>('react-live');
  const { sandpack } = useSandpack();
  const codeChangeRef = useRef(false);
  
  const scope = {
    styled,
    keyframes,
    ...antd,
    ...antdIcons,
    ...echarts,
    ...ahooks,
    ...datefns,
  };

  const handleChange = (val:string) => {
    if(!isCodeLoading){
      setCode(val);
      codeChangeRef.current = true;
    }
  }

  useEffect(() => {
    if(isCodeLoading){
      setCurrentTab("code")
    }else{
      setCurrentTab("preview")
    }
  },[isCodeLoading])

  useEffect(() => {
    setHistoryLength(historyCode.length)
    setCurrentPage(historyCode.length)
    if(currentTab === "preview" && codeChangeRef.current){
      setTimeout(() => {
        sandpack.runSandpack();
        codeChangeRef.current = false;
      }, 300);
    }
  },[historyCode])

  const PreviewWrapper = () => {
    return <PreviewScreen code={initialCode} />;
  };
  const IframeComponent = ({ htmlContent }: IframeProps) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return <iframe src={url} style={{ width: '100%', height: '500px' }}></iframe>;
  };

  const handleHistoryChange = (page: number) => {
    setCode(historyCode?.[page - 1]);
    setCurrentPage(page);
    setRenderMode('react-live');
  };

  useEffect(() => {
    setRenderMode('react-live');
  }, [initialCode]);

  const handleRenderError = () => {
    setRenderMode('sandpack');
  };

  const [previewHeight, setPreviewHeight] = useState(600);
  const startResizeRef = useRef<number | null>(null);
  const initialHeightRef = useRef<number>(600);

  const handleMouseDown = (e: React.MouseEvent) => {
    startResizeRef.current = e.clientY;
    initialHeightRef.current = previewHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (startResizeRef.current !== null) {
      const deltaY = e.clientY - startResizeRef.current;
      const newHeight = Math.max(300, Math.min(1000, initialHeightRef.current + deltaY));
      setPreviewHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    startResizeRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <LiveProvider code={initialCode} scope={scope} noInline={true}>
      <div className="flex flex-col h-full rounded-lg border border-gray-200 shadow-sm">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <TabsList className="w-full justify-start p-2 bg-transparent gap-2">
              {!isCodeLoading && (
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  预览
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="code"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                代码
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-4 bg-white">
            {!isCodeLoading && (
              <TabsContent value="preview" className="mt-0 h-full">
                <div className="rounded-lg border border-gray-200 bg-gray-50/30 overflow-hidden">
                  {detectCodeType(initialCode) === 'HTML' && 
                    <div style={{ height: previewHeight }}>
                      <IframeComponent htmlContent={initialCode} />
                    </div>
                  }
                  {detectCodeType(initialCode) === 'React' && (
                    <div style={{ height: previewHeight }}>
                      {renderMode === 'react-live' ? (
                        <PreviewScreen 
                          code={initialCode} 
                          onError={handleRenderError}
                        />
                      ) : (
                        <div className="h-full flex flex-col">
                          <div className="p-4 bg-red-50 border-b border-red-200">
                            <p className="text-red-600 text-sm">React Live 渲染失败，切换到 Sandpack 预览</p>
                          </div>
                          <div className="flex-1">
                            <SandpackPreview
                              showRefreshButton={true}
                              showRestartButton={true}
                              style={{ height: '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="sp-c-fVPbOs sp-c-fVPbOs-gMQIch-variant-light sp-wrapper">
                    <div 
                      className="h-4 bg-gray-100 hover:bg-gray-200 cursor-row-resize group relative border-t border-b border-gray-200"
                      onMouseDown={handleMouseDown}
                    >
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center">
                        <div className="w-16 h-4 flex flex-col justify-center items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-blue-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-blue-500"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="code" className="mt-0">
              <div className="rounded-lg border border-gray-200 bg-gray-50/30">
                <CodeEditor onChange={handleChange} isCodeLoading={isCodeLoading} />
              </div>
            </TabsContent>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50/50">
            {!isCodeLoading && !isPreview && (
              <Space size="middle" className="flex items-center">
                <span className="text-sm text-gray-600">历史版本:</span>
                <Pagination 
                  simple 
                  current={currentPage} 
                  pageSize={1} 
                  total={historyLength}
                  className="m-0" 
                  onChange={handleHistoryChange}
                  size="small"
                />
              </Space>
            )}
            {!isPreview && (
              <Button 
                type="primary" 
                size="small"
                className="flex items-center gap-2"
                icon={<CopyOutlined />}
                onClick={() => {
                  copyToClipboard(initialCode)
                    .then(() => message.success("已复制到剪贴板"))
                    .catch(err => console.error("复制失败: ", err))
                }}
              >
                复制代码
              </Button>
            )}
          </div>
        </Tabs>
      </div>
    </LiveProvider>
  );
};

export function Playground(props: PlaygroundProps) {
  return (
      <SandpackProvider
        template="react"
        files={{
          "/App.js": props.initialCode,
        }}
        customSetup={{
          dependencies: {
            "styled-components": "latest",
            "antd": "latest",
            "@ant-design/icons": "latest",
            "echarts": "latest",
            "ahooks": "latest",
            "date-fns": "latest"
          }
        }}
        options={{
          autorun: true,
          autoReload: true,
          initMode: "immediate",
          recompileMode: "delayed",
          recompileDelay: 1000,
        }}
      >
      <PlaygroundContent {...props} />
    </SandpackProvider>
  );
}
