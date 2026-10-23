import { useEffect, useId, useState } from "react";
import { logError } from "../lib/userErrors";

export default function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" });
      return mermaid.render(`diagram-${id}`, chart);
    }).then(({ svg: rendered }) => {
      if (active) setSvg(rendered);
    }).catch((renderError: unknown) => {
      if (!active) return;
      setError(logError("diagram.render", renderError));
    });
    return () => { active = false; };
  }, [chart, id]);

  if (error) {
    return <div role="status" className="my-2 rounded-lg border border-clay/30 p-3 text-sm">{error}</div>;
  }
  return svg
    ? <div className="my-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
    : <p className="my-2 text-sm" role="status">Drawing diagram…</p>;
}
