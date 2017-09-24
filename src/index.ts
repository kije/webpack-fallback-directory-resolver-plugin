import * as path from "path";

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

                this.resolveComponentPath(req, resolver.fs).then(
                    (resolvedComponentPath: string) => {
                        console.log(resolvedComponentPath);
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

    public resolveComponentPath(reqPath: string, fs: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (this.options.directories) {
                let resolved = false;
                let numChecked = 0;
                let numTotal = this.options.directories.length;
                for (const k in this.options.directories) {
                    if (this.options.directories.hasOwnProperty(k)) {
                        const dir = path.resolve(this.options.directories[k]);
                        const file = path.resolve(dir, reqPath);

                        fs.exists(file, (exists: boolean) => {
                            numChecked++;
                            console.log(file, exists, resolved);
                            if (!resolved) {
                                if (exists) {
                                    resolved = true;
                                    resolve(file);
                                } else if (numChecked === (numTotal)) {
                                    reject();
                                }
                            }
                        });
                    }
                }
            } else {
                reject();
            }
        });
    }
}

module.exports = FallbackDirectoryResolverPlugin;
