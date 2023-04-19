import { GlobalContextMenuPatchCallback, addGlobalContextMenuPatch, removeGlobalContextMenuPatch } from "@vencord/types/api/ContextMenu";
import { definePluginSettings } from "@vencord/types/api/settings";
import definePlugin, { OptionType } from "@vencord/types/utils/types";
import { findStoreLazy } from "@vencord/types/webpack";
import { Menu } from "@vencord/types/webpack/common";

// This is already a webpack common so maybe don't search it again.
// just an example heh :3
const UserStore = findStoreLazy("UserStore") as typeof import("@vencord/types/webpack/common").UserStore;

const settings = definePluginSettings({
    cuteSetting: {
        type: OptionType.STRING,
        description: "A very cute setting",
        default: "so cute!"
    }
});

const patchContextMenu: GlobalContextMenuPatchCallback = (navId, children) => () => {
    children.unshift((
        <Menu.MenuItem
            id="example-context-menu-item"
            label="read if cute"
            action={() => {
                alert(":3");
            }}
        />
    ));
};

export default definePlugin({
    name: "MyExamplePlugin",
    description: "Very cute plugin",
    authors: [
        {
            name: "Me",
            id: 1234567890n
        }
    ],

    settings,

    patches: [],

    start() {
        console.log(this.name, "just started");

        addGlobalContextMenuPatch(patchContextMenu);

        console.log(UserStore.getCurrentUser().username, "is", settings.store.cuteSetting);
    },

    stop() {
        console.log(this.name, "just stopped");

        removeGlobalContextMenuPatch(patchContextMenu);
    }
});
