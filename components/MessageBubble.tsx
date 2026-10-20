import { isValidElement } from "react";
import type { ComponentProps, ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "./MermaidDiagram";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function MessageBubble({ role, content, streaming = false }: MessageBubbleProps) {
  const isUser = role === "user";
  const components = {
    code({ className, children, ...props }: ComponentProps<"code">) {
      const language = /language-(\w+)/.exec(className ?? "")?.[1];
      if (language === "mermaid") return <MermaidDiagram chart={String(children).replace(/\n$/, "")} />;
      return <code className={className} {...props}>{children}</code>;
    },
    pre({ children }: ComponentProps<"pre">) {
      const code = Array.isArray(children) ? children[0] : children;
      if (isValidElement(code) && code.type === MermaidDiagram) return code as ReactElement;
      return <pre className="my-2 overflow-x-auto rounded-lg bg-night/5 p-3">{children}</pre>;
    },
  };

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${isUser ? "bg-savanna text-white" : "card"}`}>
        <div className={`prose-chat break-words ${isUser ? "text-white" : ""}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content || (streaming ? " " : "")}
          </ReactMarkdown>
          {streaming && <span className="ml-1 inline-block animate-pulse" aria-label="Assistant is responding">▍</span>}
        </div>
      </div>
    </article>
  );
}
