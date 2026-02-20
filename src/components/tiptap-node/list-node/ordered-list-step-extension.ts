import { OrderedList } from "@tiptap/extension-list";

export const OrderedListExtended = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-list-type"),
        renderHTML: (attributes) => {
          if (!attributes.listType) {
            return {};
          }

          return { "data-list-type": attributes.listType };
        },
      },
    };
  },
});

export default OrderedList;
