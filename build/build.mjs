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
            jsxFactory: "VCR.createElement",
            jsxFragment: "VCR.Fragment",
            external: ["@vencord/types/*"],
            plugins: [vencordDep],
            footer: { js: `//# sourceURL=${encodeURI(p)}` },
            minify: !isDev,
            bundle: true,
            sourcemap: "linked",
            logLevel: "info"
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
