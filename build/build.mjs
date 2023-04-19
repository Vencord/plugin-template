import { context } from "esbuild";
import { readdirSync } from "fs";
import vencordDep from "./vencordDep.mjs";

const plugins = readdirSync("./plugins");

const isDev = process.argv.includes("--dev");
const watch = process.argv.includes("--watch");

const contexts = await Promise.all(
    plugins.map(p =>
        context({
            entryPoints: [`./plugins/${p}`],
            outfile: `dist/${p}/index.js`,
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

if (watch) {
    await Promise.all(contexts.map(ctx => ctx.watch()));
} else {
    await Promise.all(
        contexts.map(async ctx => {
            await ctx.rebuild();
            await ctx.dispose();
        })
    );
}
