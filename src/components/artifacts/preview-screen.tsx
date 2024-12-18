"use client";

import { useEffect, useState, useRef } from "react";
import * as React from "react";
import * as Babel from "@babel/standalone";
import * as echarts from "echarts";
import * as antd from "antd"
import styled, { keyframes } from 'styled-components';
import * as ahooks from "ahooks"
import * as antdIcons from "@ant-design/icons";
import * as datefns from "date-fns";
import { SandpackPreview } from "@codesandbox/sandpack-react";

interface PreviewScreenProps {
  code: string;
  onError: () => void;
}

class ErrorBoundary extends React.Component<
  { 
    children: React.ReactNode;
    onError?: () => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // 错误时不渲染任何内容，因为会切换到 Sandpack
    }

    return this.props.children;
  }
}

const importToVariablePlugin = ({ types: t }: any) => ({
  visitor: {
    ImportDeclaration(path: any) {
      const declarations = path.node.specifiers
        .map((specifier: any) => {
          if (t.isImportDefaultSpecifier(specifier)) {
            return t.variableDeclarator(
              specifier.local,
              t.memberExpression(
                t.identifier("scope"),
                t.identifier(specifier.local.name)
              )
            );
          } else if (t.isImportSpecifier(specifier)) {
            if (path.node.source.value === "react") {
              return t.variableDeclarator(
                specifier.local,
                t.memberExpression(
                  t.memberExpression(
                    t.identifier("scope"),
                    t.identifier("React")
                  ),
                  specifier.imported
                )
              );
            } else {
              return t.variableDeclarator(
                specifier.local,
                t.memberExpression(t.identifier("scope"), specifier.imported)
              );
            }
          }
          return null;
        })
        .filter(Boolean);

      path.replaceWith(t.variableDeclaration("const", declarations));
    },
    ExportDefaultDeclaration(path: any) {
      path.replaceWith(
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(
              t.identifier("exports"),
              t.identifier("default")
            ),
            path.node.declaration
          )
        )
      );
    },
  },
});

export function PreviewScreen({ code, onError }: PreviewScreenProps) {
  const [component, setComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;

    const compileAndRender = async () => {
      try {
        const transpiledCode = Babel.transform(code, {
          presets: ["react"],
          plugins: [importToVariablePlugin],
        }).code;

        if (!transpiledCode) {
          throw new Error("编译失败");
        }

        const scope = {
          React: {
            ...React,
            useState: React.useState,
            useEffect: React.useEffect,
          },
          styled,
          keyframes,
          ...antdIcons,
          ...antd,
          ...ahooks,
          ...echarts,
          ...datefns,
        };

        const fullCode = `
          const exports = {};
          ${transpiledCode}
          return exports.default;
        `;

        const evalCode = new Function("scope", fullCode);
        const ComponentToRender = evalCode(scope);

        if (typeof ComponentToRender !== "function") {
          throw new Error("代码必须导出一个有效的 React 组件");
        }

        if (isMounted) {
          setComponent(() => ComponentToRender);
        }
      } catch (error: any) {
        if (isMounted) {
          onError();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    compileAndRender();

    return () => {
      isMounted = false;
    };
  }, [code, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-pulse">加载中...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      {component && React.createElement(component)}
    </ErrorBoundary>
  );
}
