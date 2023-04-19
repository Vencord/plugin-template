import { globalExternalsWithRegExp } from "@fal-works/esbuild-plugin-global-externals";

const names = {
    webpack: "Vencord.Webpack",
    "webpack/common": "Vencord.Webpack.Common",
    utils: "Vencord.Util",
    api: "Vencord.Api",
    components: "Vencord.Components"
};

export default globalExternalsWithRegExp({
    getModuleInfo(modulePath) {
        const path = modulePath.replace("@vencord/types/", "");

        if (path === "utils/types")
            return {
                varName: "Vencord.Plugins.External",
                type: "cjs"
            };

        let varName = names[path];
        if (!varName) {
            const altMapping = names[path.split("/")[0]];
            if (!altMapping) throw new Error("Unknown module path: " + modulePath);

            varName =
                altMapping +
                "." +
                // @ts-ignore
                path.split("/")[1].replaceAll("/", ".");
        }
        return {
            varName,
            type: "cjs"
        };
    },
    modulePathFilter: /^@vencord\/types.+$/
});
