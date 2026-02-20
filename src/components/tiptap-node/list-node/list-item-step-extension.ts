import { ListItem } from "@tiptap/extension-list";

// Allow step list items to start with a heading node.
// Default listItem schema requires a paragraph as the first child.
export const ListItemExtended = ListItem.extend({
  content: "block+",
});

export default ListItemExtended;
