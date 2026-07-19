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

## Embedding in the Google Site

Insert → Embed → By URL:

```
https://matthewignash-unified.github.io/monthly-build-gallery/
```

The page is compact, self-scrolling, and responsive from 320px up, so it works
inside an iframe at whatever size the Site gives it.

## License

MIT — see [LICENSE](LICENSE).
