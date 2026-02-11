"use client";

import type { ForwardedRef } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertThematicBreak,
  InsertTable,
  StrikeThroughSupSubToggles,
  Separator,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  imagePlugin,
  type MDXEditorMethods,
  type MDXEditorProps,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

type EditorProps = {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
} & MDXEditorProps;

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: EditorProps) {
  return (
    <MDXEditor
      className="dark-theme"
      {...props}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <Separator />
              <ListsToggle />
              <Separator />
              <InsertTable />
              <Separator />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]}
      ref={editorRef}
    />
  );
}

