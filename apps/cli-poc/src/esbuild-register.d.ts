// Adding types for esbuild-register package to avoid TypeScript errors

declare module 'esbuild-register' {
  import type { TransformOptions } from 'esbuild';
  // Taken from https://github.com/egoist/esbuild-register/blob/311a1ef067f0078faa870dcb6db6f29fa4ea61d1/src/node.ts#L92-L103
  interface RegisterOptions extends TransformOptions {
    extensions?: string[];
    /**
     * Auto-ignore node_modules. Independent of any matcher.
     * @default true
     */
    hookIgnoreNodeModules?: boolean;
    /**
     * A matcher function, will be called with path to a file. Should return truthy if the file should be hooked, falsy otherwise.
     */
    hookMatcher?(fileName: string): boolean;
  }

  interface RegisterResult {
    unregister: () => void;
  }

  export function register(esbuildOptions: RegisterOptions): RegisterResult;
}
