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

If the sheet can't be fetched, the page shows a friendly "couldn't load —
please refresh" message.

## Updating content vs. updating code

- **Content updates need no deploy.** Approving a row, editing text, or adding
  a new submission in the Sheet shows up on the next page load — the page reads
  the published Sheet directly. (Google's publish cache can take a few minutes
  to refresh.)
- **Code updates deploy via push.** Any change to the HTML or JS files goes
  live automatically when pushed to `main`, via GitHub Pages.

## Monthly turnover — no page or embed edits, ever

When a new month starts, everything happens in the sheets:

1. **Challenges sheet**: set the finished month's `status` to `complete` and
   the new month's row to `active`. The archive banner, month chips, and
   `current.html` all follow automatically.
2. **Glossary sheet**: tag the new month's terms in `month_introduced`.
   They appear in `current.html`'s "Key terms this month" section (and in
   `?month=` deep links) on the next page load.

No HTML changes, no embed URL changes on the Google Site.

## Local preview

Serve the folder over HTTP:

```bash
python3 -m http.server 8642
# then open http://localhost:8642
```

## The challenges layer

A third published Google Sheet (URL in the `CHALLENGES_URL` constant in both
`index.html` and `current.html`) describes each month's challenge. Columns:

```
month, title, host_name, host_context, host_link, host_bio, need,
challenge, video_url, recording_url, status
```

`host_bio` is optional small-print text under the host line on both the
archive's challenge header and `current.html`.

`status` is `upcoming`, `active`, or `complete`. It powers:

- **Archive month headers** — filtering the archive to a month shows that
  month's challenge above the submissions: title, host (linked when
  `host_link` is set), the need and challenge text, and click-to-load
  YouTube embeds for `video_url` ("Watch the challenge intro") and
  `recording_url` ("Watch the share-out"). Empty fields are skipped.
- **Month chips** — the unfiltered archive shows a row of challenge-month
  chips (newest first) that apply the month filter.
- **`current.html`** — renders only the `active` row as a compact challenge
  card, followed by static "How a month runs" and four-part-template
  sections. With no active row it shows "The next challenge is coming soon".
  Embed it on the Site's challenge page like the other pages.

If the challenges sheet can't be fetched, the archive renders normally
without the challenge layer.

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
- The shared data-source URL, demo registry, and entry rendering live in
  `glossary-lib.js`, used by both `glossary.html` and `current.html`.
- **Suggest a term**: paste a pre-filled Google Form link into
  `SUGGEST_TERM_URL` in `glossary-lib.js` (in the Form: Send → Get
  pre-filled link, type `{term}` as the term answer, copy the link).
  "Suggest a term" links then appear under the glossary list, in the
  no-results state (pre-filled with the search text), and in
  `current.html`'s key-terms section. While the constant is empty the
  links stay hidden.
- `glossary.html?month=September%202026` still works for deep links and the
  archive, but nothing on the site depends on it monthly — `current.html`
  shows the active month's key terms automatically.

### Adding a new demo

In `glossary-lib.js`, add one entry to the `DEMOS` registry:

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
(month), `demo_used` (demo_id), `code_copied` (demo_id); challenges (archive
and current.html): `challenge_video` and `challenge_recording` (month).

## License

MIT — see [LICENSE](LICENSE).
