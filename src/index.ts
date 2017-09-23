import * as fs from "fs";
import * as path from "path";
// import {ResolvePlugin} from "webpack";

export interface IFallbackDirectoryResolverPluginOptions {
    directories?: string[];
    prefix?: string;
}

export class FallbackDirectoryResolverPlugin /* extends ResolvePlugin */ {
    public static defaultOptions: IFallbackDirectoryResolverPluginOptions = {
        directories: [],
        prefix: "fallback",
    };

    private options: IFallbackDirectoryResolverPluginOptions;

    public constructor(options: IFallbackDirectoryResolverPluginOptions = {}) {
        // super();
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
    }

    public apply(resolver: any) {
        const pathRegex = new RegExp(`^#${this.options.prefix}#/`);

        resolver.plugin("module", (request: any, callback: () => void) => {
            if (request.request.match(pathRegex)) {
                const req = request.request.replace(pathRegex, "");

                const resolvedComponentPath = this.resolveComponentPath(req);

                if (resolvedComponentPath) {
                    const obj = {
                        directory: request.directory,
                        path: request.path,
                        query: request.query,
                        request: resolvedComponentPath,
                    };
                    resolver.doResolve("resolve", obj, null, callback);
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
    }

    public resolveComponentPath(reqPath: string) {
        if (this.options.directories) {
            for (const k in this.options.directories) {
                if (this.options.directories.hasOwnProperty(k)) {
                    const dir = path.resolve(this.options.directories[k]);

                    if (fs.existsSync(dir)) {
                        const file = path.resolve(dir, reqPath);

                        if (fs.existsSync(file)) {
                            return file;
                        }
                    }
                }
            }
        }

        return false;
    }
}

module.exports = FallbackDirectoryResolverPlugin;