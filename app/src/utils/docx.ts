import { renderAsync } from 'docx-preview';

export function previewDoc(blob: Blob, container: HTMLElement) {
  return renderAsync(blob, container, undefined, {
    debug: false,
    // @ts-ignore
    experimental: false
  });
}
