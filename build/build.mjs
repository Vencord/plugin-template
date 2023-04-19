import { context } from "esbuild";
import { cpSync, existsSync, readdirSync, rmSync } from "fs";
import vencordDep from "./vencordDep.mjs";
import Config from "../config.json" assert { type: "json" };
import { join } from "path";

const plugins = readdirSync("./plugins");

const isDev = process.argv.includes("--dev");
const watch = process.argv.includes("--watch");

const contexts = await Promise.all(
    plugins.map(p =>
        context({
            entryPoints: [`./plugins/${p}`],
            outfile: `dist/${p}.js`,
            format: "iife",
            globalName: "VencordPlugin",
            jsxFactory: "Vencord.Webpack.Common.React.createElement",
            jsxFragment: "Vencord.Webpack.Common.React.Fragment",
            external: ["@vencord/types/*"],
            plugins: [vencordDep],
            footer: { js: `return VencordPlugin;\n//# sourceURL=${encodeURI(p)}` },
            minify: !isDev,
            bundle: true,
            sourcemap: "linked",
            logLevel: "info",
            tsconfig: "./build/tsconfig.json"
        })
    )
);

function deploy() {
    const { autoDeploy, vencordDataDir } = Config;
    if (!autoDeploy) return;

    if (!existsSync(vencordDataDir)) {
        console.warn("Vencord data directory does not exist:", vencordDataDir);
        console.warn("Thus, deployment is skipped");
        console.warn("You can fix this by editing config.json");
        return;
    }

    if (autoDeploy && existsSync(vencordDataDir)) {
        const pluginDir = join(vencordDataDir, "plugins");

        rmSync(pluginDir, {
            recursive: true,
            force: true
        });

        cpSync("dist", pluginDir, {
            recursive: true
        });

        console.log("Deployed Plugins to", pluginDir);
    }
}

if (watch) {
    await Promise.all(contexts.map(ctx => ctx.watch()));
} else {
    await Promise.all(
        contexts.map(async ctx => {
            await ctx.rebuild();
            await ctx.dispose();
        })
    );
    deploy();
}
