const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");

const existsAsync = (path: string) => new Promise((resolve) => {
    fs.exists(path, resolve);
});

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

    public constructor(options: IFallbackDirectoryResolverPluginOptions = {}) {
        this.options = Object.assign(FallbackDirectoryResolverPlugin.defaultOptions, options);
    }

    public apply(resolver: any) {
        const pathRegex = new RegExp(`^#${this.options.prefix}#/`);

        resolver.plugin("module", (request: any, callback: () => void) => {
            if (request.request.match(pathRegex)) {
                const req = request.request.replace(pathRegex, "");

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
