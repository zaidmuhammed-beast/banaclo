# Model photography

Drop files here named `01.jpg` … `05.jpg` (one per look, matching the order in
`src/hero/models.js`) and each one fades in over the drawn placeholder figure on load.
A missing or failed file leaves the drawing in place, so this directory can stay empty.

- **Shape**: portrait, roughly 1:3 (the figure box is 260 × 780). Full length, head to
  shoes, with the model roughly centred.
- **Background**: cut out (transparent PNG/WebP) looks best against the dark stage — a
  photo with its own background will show as a rectangle.
- **Size**: these are shown full-screen at the close-up, so ~1200 px wide is plenty.

To change the filenames, captions, colourways or pose of a placeholder, edit
`src/hero/models.js`.
