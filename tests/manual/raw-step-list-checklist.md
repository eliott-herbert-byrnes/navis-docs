# RAW Step Container Manual QA Checklist

## Insertion
- [ ] Click the `Step` toolbar button from a normal paragraph and confirm a `stepsContainer` is inserted with one step card.
- [ ] Confirm the new step card shows the number badge (1) and a title pre-filled with "Step 1".
- [ ] Confirm the cursor lands in the step title after insertion.

## Keyboard Behaviour — Title
- [ ] Press `Enter` in a step title and confirm the cursor moves into the step body (first paragraph).
- [ ] Confirm `Enter` in the title does **not** create a new step or split the title.

## Keyboard Behaviour — Body
- [ ] Press `Enter` in a non-empty body paragraph and confirm a new paragraph is created inside the same step body.
- [ ] Press `Enter` in an empty body paragraph that is **not** the last paragraph of the last step and confirm a new paragraph is created normally.
- [ ] In the last step's last empty paragraph, press `Enter` once and confirm the cursor stays inside the step (first Enter swallowed).
- [ ] In the same paragraph, press `Enter` again and confirm the cursor exits to a normal paragraph below the `stepsContainer`.

## Add New Step
- [ ] Confirm the `+ add new step` button appears below the editor only when a `stepsContainer` exists.
- [ ] Click `+ add new step` and confirm a new step card is appended with the correct number and an empty title.
- [ ] Confirm the cursor focuses the new step title after append.
- [ ] Confirm no other action creates a new step (Enter from title, Enter from non-empty body paragraph, etc.).

## Rich Body Content
- [ ] Place cursor in a step body and insert a code block — confirm it renders inside the step card, not outside.
- [ ] Upload an image inside a step body and confirm it renders correctly in editor and preview mode.
- [ ] Insert a bullet list inside a step body and confirm it renders correctly.
- [ ] Use bold, italic, underline, and inline code marks inside a step body — confirm they work.
- [ ] Use inline code mark inside a step title — confirm it works.
- [ ] Confirm the Code Block toolbar button is **disabled** when cursor is in a step title and the tooltip explains why.
- [ ] Confirm the Code Block toolbar button is **enabled** when cursor is in a step body.

## Numbering
- [ ] Insert three steps and confirm CSS counter shows 1, 2, 3 in the number badges.
- [ ] Note: seed title text (`Step N`) in the title node is independent of the CSS badge counter — both are present by design.

## Persistence & Serialisation
- [ ] Save and reload the procedure — confirm all step content is preserved exactly.
- [ ] Confirm no `add new step` text or artifact appears in the saved `content.tiptap` JSON.
- [ ] Open `editor.getJSON()` in the browser console and confirm the shape is `stepsContainer > stepItem > stepTitle + stepBody`.

## Preview Mode
- [ ] Switch to preview mode and confirm steps render read-only with correct styling.
- [ ] Confirm the `+ add new step` button is hidden in preview mode.
- [ ] Confirm the toolbar is hidden in preview mode.

## Publish / Text Extraction
- [ ] Publish the procedure and verify the extracted `contentText` contains the step title text.
- [ ] Verify `contentText` contains step body paragraph text.
- [ ] Verify `contentText` contains code block text from inside a step body.
- [ ] Verify `contentText` does **not** contain `add new step`.

## Compatibility
- [ ] Open an existing document that uses the old `orderedList[data-list-type="steps"]` format and confirm it loads and displays without errors (no migration, but no breakage).
- [ ] Create a normal numbered list using the list dropdown and confirm it keeps default styling and keyboard behaviour.
