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

        let varName = names[path];
        if (!varName) {
            const elements = path.split("/");
            varName = names[elements.shift()];
            if (!varName) throw new Error("Unknown module path: " + modulePath);

            if (varName !== "Vencord.Util" || elements[0] === "types") varName += "." + elements.join(".");
        }

        return {
            varName,
            type: "cjs"
        };
    },

    modulePathFilter: /^@vencord\/types.+$/
});
