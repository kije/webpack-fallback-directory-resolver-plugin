const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");

const existsAsync: (path: string) => Promise<boolean> = (path: string) => new Promise(
    (resolve: (result: boolean) => void) => {
        fs.exists(path, resolve);
    }
);

export interface IFallbackDirectoryResolverPluginOptions {
    directories?: string[];
    prefix?: string;
}

export class FallbackDirectoryResolverPlugin {
    public static defaultOptions: IFallbackDirectoryResolverPluginOptions = {
        directories: [],
        prefix: "fallback",
    };

    private options: IFallbackDirectoryResolverPluginOptions;
    private pathRegex: RegExp;

    public constructor(options: IFallbackDirectoryResolverPluginOptions = {}) {
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
        this.pathRegex = new RegExp(`^#${this.options.prefix}#/`);
    }

    public apply(resolver: any) {
        resolver.plugin("module", (request: any, callback: () => void) => {
            if (request.request.match(this.pathRegex)) {
                const req = request.request.replace(this.pathRegex, "");

                this.resolveComponentPath(req).then(
                    (resolvedComponentPath: string) => {
                        const obj = {
                            directory: request.directory,
                            path: request.path,
                            query: request.query,
                            request: resolvedComponentPath,
                        };
                        resolver.doResolve("resolve", obj, null, callback);
                    },
                    () => {
                        callback();
                    },
                );
            } else {
                callback();
            }
        });
    }

    public resolveComponentPath(reqPath: string): Promise<string> {
        if (this.options.directories) {
            return Promise.filter(
                this.options.directories.map((dir: string) => path.resolve(path.resolve(dir), reqPath)),
                (item: string) => existsAsync(item).then((exists: boolean) => exists).catch(() => false),
            ).any();
        }
        return Promise.reject("No Fallback directories!");
    }
}

module.exports = FallbackDirectoryResolverPlugin;
