# ECONSCO email template (Mailchimp)

`econsco-newsletter.html` is a newsletter template in the website's navy and lime style.
It's 600 px wide, collapses to one column on phones, and includes Outlook-safe buttons.

## Use it in Mailchimp

1. Upload the logo once: **Content → My files → Upload**, choose
   `../econsco/assets/img/logo-light.png`, then copy its URL.
2. Open `econsco-newsletter.html` and replace the logo `src`
   (`https://econsco.com/wp-content/themes/econsco/assets/img/logo-light.png`) with that URL.
   You can skip this once the theme is live on econsco.com, because the original URL then works.
3. **Campaigns → Create → Email**, then choose **Code your own → Paste in code** (classic builder), paste the
   file and save. To reuse it, choose **Content → Email templates → Create template → Code your own**.
4. Fill in **Subject** and **Preview text** in the campaign settings.
5. Send a test email to yourself before scheduling.

## Editing

- The blocks marked `mc:edit` (hero, stat, article, call to action) are editable in Mailchimp's
  classic editor. Everything else is edited in the code.
- Merge tags used: `*|FNAME|*` (with a "Hi there" fallback), `*|ARCHIVE|*`, `*|MC_PREVIEW_TEXT|*`,
  `*|LIST:ADDRESSLINE|*`, `*|UPDATE_PROFILE|*`, `*|UNSUB|*`, `*|CURRENT_YEAR|*`. Mailchimp
  requires the unsubscribe link and address, so keep those two.
- Buttons appear twice: once for Outlook (inside `<!--[if mso]>`) and once for every other
  client. Change the link and text in both places.
- Social links aren't included yet. Add them in the footer next to `econsco.com`.
