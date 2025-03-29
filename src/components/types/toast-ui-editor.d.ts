declare module '@toast-ui/editor' {
  import type { Editor as IEditor } from '@toast-ui/editor/types';

  interface EditorConstructor {
    new(options: any): IEditor;
  }

  const Editor: EditorConstructor;

  export default Editor;
  export * from '@toast-ui/editor/types';
}