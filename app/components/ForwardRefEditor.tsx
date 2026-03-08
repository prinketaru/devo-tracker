"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { ProseKitEditorHandle } from "./ProseKitEditor";

const Editor = dynamic(() => import("./ProseKitEditor").then(mod => mod.ProseKitEditor), { ssr: false });

export const ForwardRefEditor = forwardRef<ProseKitEditorHandle, { markdown?: string; className?: string }>(
  (props, ref) => <Editor {...props} ref={ref} />,
);

ForwardRefEditor.displayName = "ForwardRefEditor";

