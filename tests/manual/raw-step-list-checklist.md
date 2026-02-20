# RAW Step List Manual QA Checklist

- [ ] Create a step list from plain paragraph content using the `Insert Step` button.
- [ ] Press `Enter` in a step title (`Step N`) and confirm cursor moves into step description.
- [ ] Press `Enter` in a non-empty step description and confirm it creates a new paragraph in the same step.
- [ ] Verify `add new step` appears only at the end of the step list.
- [ ] Click `add new step` and confirm a new step is appended with heading title `Step N` and an empty description paragraph.
- [ ] Confirm no other action creates a new step (e.g. `Enter` from title/description).
- [ ] In the last step's last empty paragraph, press `Enter` once and confirm you remain in the step list.
- [ ] In the same paragraph, press `Enter` again and confirm you exit to a normal paragraph below the steps list.
- [ ] Delete the middle step and confirm numbering updates correctly.
- [ ] Confirm existing title text is not rewritten after deleting/reordering steps.
- [ ] Verify regular ordered lists (created from list dropdown) keep default styling.
- [ ] Paste rich text into a step description and confirm formatting remains valid.
- [ ] Insert image by upload and confirm render in editor and preview mode.
- [ ] Add a code block inside a step description and confirm render in editor and preview mode.
- [ ] Save/reload and confirm `add new step` is not persisted in document JSON/content.
- [ ] Publish the procedure and verify extracted `contentText` contains step headings and descriptions.
