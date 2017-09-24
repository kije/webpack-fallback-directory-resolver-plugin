/// <reference types="webpack" />
import { ResolvePlugin } from "webpack";
export interface IFallbackDirectoryResolverPluginOptions {
    directories?: string[];
    prefix?: string;
}
export declare class FallbackDirectoryResolverPlugin extends ResolvePlugin {
    static defaultOptions: IFallbackDirectoryResolverPluginOptions;
    private options;
    constructor(options?: IFallbackDirectoryResolverPluginOptions);
    apply(resolver: any): void;
    resolveComponentPath(reqPath: string, fs: any): Promise<string | false>;
}
