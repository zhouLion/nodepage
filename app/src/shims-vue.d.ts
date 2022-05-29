declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'docx-preview' {
  export interface Options {
    inWrapper: boolean;
    ignoreWidth: boolean;
    ignoreHeight: boolean;
    debug: boolean;
    className: string;
  }
  export function renderAsync(data: any, bodyContainer: HTMLElement, styleContainer?: HTMLElement, options?: Partial<Options>): PromiseLike<any>;
}
