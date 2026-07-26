# The Monthly Build: Submission Archive

A single static web page that displays teacher-built tool submissions for
**The Monthly Build**, the monthly AI-coding challenge on
[AI Coding for Educators](https://sites.google.com). It renders a filterable
card gallery (tags, month, search), a featured strip with live embeds, and a
prompt-journey modal — no backend, no build step, no framework, no keys.

It is hosted on GitHub Pages and embedded via iframe into the Google Site's
Archive page.

## How the data flows

1. Educators submit through a **Google Form**.
2. The Form feeds a **Google Sheet** (one row per submission).
3. Matthew reviews each row and sets `approved` to `yes` (and optionally
   `featured` to `yes`).
4. The Sheet is **published to the web**, and this page fetches it client-side
   on every load.

Only rows where `approved = yes` are shown (empty or `no` never renders).
Submitter emails stay in the private Form responses and never reach the
published "gallery" tab. Expected columns (exact names):

```
timestamp, name, role_context, month, tool_name, need, tool_url, repo_url,
prompt_journey, journey_url, screenshot_url, builder_link, tags, ai_tools,
approved, featured
```

## Configuring the Sheet URL

1. In the Google Sheet: **File → Share → Publish to web**, choose the responses
   sheet and **Comma-separated values (.csv)**, then copy the link.
   (A normal sheet URL also works if sharing is "anyone with the link".)
2. In `index.html`, paste it into the constant near the top of the script:
   ```js
   const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/…/pub?output=csv";
   ```
3. Commit and push once. Done.

While `SHEET_URL` is empty — or if the sheet can't be fetched — the page shows
the entries from `sample-data.js` with a "Sample data" badge.

## Updating content vs. updating code

- **Content updates need no deploy.** Approving a row, editing text, or adding
  a new submission in the Sheet shows up on the next page load — the page reads
  the published Sheet directly. (Google's publish cache can take a few minutes
  to refresh.)
- **Code updates deploy via push.** Any change to `index.html` or
  `sample-data.js` goes live automatically when pushed to `main`, via GitHub
  Pages.

## Local preview

Serve the folder over HTTP (needed for the sample-data script and embeds):

```bash
python3 -m http.server 8642
# then open http://localhost:8642
```

## The glossary page

`glossary.html` is a searchable glossary of vibe-coding terms for educators,
sharing the archive's palette and iframe-friendly layout. It reads its own
published Google Sheet (URL in the `GLOSSARY_SHEET_URL` constant at the top of
the file). Expected columns:

```
term, definition, example, category, month_introduced, image_url, demo_id
```

- Entries render alphabetically as expandable accordions (term + category pill;
  definition, example, image, and live demo inside).
- `image_url` is optional: a bare filename resolves to `images/glossary/` in
  this repo, full URLs are used as-is, and Google Drive share links are
  rewritten to thumbnail URLs. Images that fail to load are hidden.
- `demo_id` is optional: when it names an entry in the demo registry, a live
  interactive demo renders with a "View the code" toggle showing a clean,
  copyable teaching snippet.
- **Monthly embed**: `glossary.html?month=September%202026` shows only that
  month's terms (all expanded) under a "Key terms for …" heading — embed this
  filtered URL on each month's challenge page.

### Adding a new demo

In `glossary.html`, add one entry to the `DEMOS` registry:

```js
"my-demo": {
  build(stage) { /* append the live demo's DOM to stage */ },
  code: `<!-- the clean teachable snippet shown under "View the code" -->`
}
```

Then put `my-demo` in the sheet's `demo_id` column for the matching term.
(Inside `code`, write any closing script tag as `<\/script>`.)

## Embedding in the Google Site

Insert → Embed → By URL:

```
https://matthewignash-unified.github.io/monthly-build-gallery/
```

The page is compact, self-scrolling, and responsive from 320px up, so it works
inside an iframe at whatever size the Site gives it. The glossary embeds the
same way at `…/glossary.html` (optionally with `?month=`), and both pages show
an "Open the full …" link automatically when framed.

## Analytics

Both pages load GA4 (`G-FBDQ9MZHMB`). Custom events — never with personal data:
archive: `open_tool`, `open_code`, `open_journey` (tool_name), `filter_used`
(filter_type), `featured_loaded` (tool_name), `open_full_archive`; glossary:
`glossary_search`, `glossary_category` (category), `glossary_month_view`
(month), `demo_used` (demo_id), `code_copied` (demo_id).

## License

MIT — see [LICENSE](LICENSE).
