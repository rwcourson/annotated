# Contest demo video script

Target length: 2–3 minutes. Record the real unpacked extension and deployed site in one continuous journey.

1. Open an article, select one passage, and choose **Annotate selection with annotated**. Show the title, byline, date, passage, and original URL already filled in.
2. Add a short text note and publish. Open the public annotation, click the original source, and point out **File a claim**.
3. Open a YouTube video. Set a start and end no more than 90 seconds apart, publish, and play the bounded clip in the 426×240 player.
4. Open a podcast page. Capture a segment no more than 90 seconds, record a short voice note, and publish it.
5. Open the public feed. Follow a profile and add a comment to an annotation.
6. Close and reopen Chrome. Show that the sidebar is still connected to the same account.

End on the homepage with the production URL visible. Do not use mock screens or cut around failed states.

## Capture and delivery

- Capture source: macOS display 0 at 30 fps, with the real Chrome window and unpacked sidebar visible.
- Capture microphone: MacBook Pro Microphone, used for the recorded-commentary step.
- Review the exported MP4 for readable source URLs, no notifications or private tabs, working audio, and a complete final frame.
- Upload the approved file with:

  ```sh
  cd web
  vercel env run -e production --scope bg-rob -- npm run demo:upload -- /absolute/path/to/annotated-demo.mp4
  ```

- Save the returned public Blob URL as `DEMO_VIDEO_URL` in Vercel and in `SUBMISSION_DRAFT.md`, then rerun the release preflight.
