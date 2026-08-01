import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

/** Render a short soft sine tone as a 16-bit PCM mono WAV (so the seeded
 *  audio commentary actually plays something). */
function toneWav(seconds = 3, freq = 392): Buffer {
  const rate = 22050;
  const n = Math.floor(seconds * rate);
  const data = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const env = Math.min(1, t * 8, (seconds - t) * 4); // fade in/out
    const sample =
      0.35 * env * Math.sin(2 * Math.PI * freq * t) +
      0.15 * env * Math.sin(2 * Math.PI * freq * 1.5 * t);
    data.writeInt16LE(Math.round(sample * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function main() {
  const isHostedPostgres = /^postgres(?:ql)?:\/\//i.test(
    process.env.DATABASE_URL ?? ""
  );
  if (isHostedPostgres && process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    throw new Error(
      "Refusing to wipe hosted Postgres. Set ALLOW_DESTRUCTIVE_SEED=true for an intentional initial seed."
    );
  }

  // Idempotent: wipe the explicitly selected seed database first.
  await prisma.claim.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.apiToken.deleteMany();
  await prisma.annotation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Seed one playable audio commentary file. Hosted environments use Blob;
  // local development retains the filesystem path.
  const demoAudio = toneWav();
  let demoAudioUrl = "/uploads/seed-comment.wav";
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put("demo/seed-comment.wav", demoAudio, {
      access: "public",
      addRandomSuffix: false,
      contentType: "audio/wav",
      cacheControlMaxAge: 31_536_000,
    });
    demoAudioUrl = blob.url;
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    mkdirSync(uploadsDir, { recursive: true });
    writeFileSync(path.join(uploadsDir, "seed-comment.wav"), demoAudio);
  }

  const ada = await prisma.user.create({
    data: { username: "ada", name: "Ada Wexler" },
  });
  const rhea = await prisma.user.create({
    data: { username: "rhea", name: "Rhea Kapoor" },
  });
  const milo = await prisma.user.create({
    data: { username: "milo", name: "Milo Tran" },
  });
  const june = await prisma.user.create({
    data: { username: "june", name: "June Okafor" },
  });

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const a1 = await prisma.annotation.create({
    data: {
      userId: ada.id,
      type: "video",
      sourceUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
      title: "3Blue1Brown — But what is a neural network?",
      siteName: "YouTube",
      author: "3Blue1Brown",
      publishedAt: new Date("2017-10-05"),
      startSec: 612,
      endSec: 690,
      comment:
        "The gradient descent visual at 10:12 is the single best explanation of backprop intuition I've seen. Watch how he ties the 'nudge' idea to the cost surface — this is the clip I send to everyone who asks how training actually works.",
      createdAt: new Date(now - 1 * day),
    },
  });

  const a2 = await prisma.annotation.create({
    data: {
      userId: rhea.id,
      type: "audio",
      sourceUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      title: "Episode 214 — The quiet collapse of local news",
      siteName: "The Long Now Pod",
      author: "D. Alvarez",
      publishedAt: new Date(now - 20 * day),
      startSec: 45,
      endSec: 120,
      comment:
        "The stat dropped at ~1:10 — that most counties now have zero daily reporters — reframed the whole episode for me. Everything after this segment is downstream of it.",
      createdAt: new Date(now - 2 * day),
    },
  });

  const a3 = await prisma.annotation.create({
    data: {
      userId: milo.id,
      type: "article",
      sourceUrl: "https://www.theverge.com/2025/4/11/ai-browsers-race",
      title: "The AI browser race is really a fight over your attention",
      siteName: "The Verge",
      author: "Sample Author",
      publishedAt: new Date(now - 12 * day),
      quote:
        "Whoever owns the browser owns the question you were about to ask — and increasingly, the answer you never thought to verify.",
      comment:
        "This sentence is the whole article. Everything else is product detail.",
      createdAt: new Date(now - 3 * day),
    },
  });

  const a4 = await prisma.annotation.create({
    data: {
      userId: ada.id,
      type: "video",
      sourceUrl: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
      title: "Steve Jobs — Stanford Commencement Address",
      siteName: "YouTube",
      author: "Stanford",
      publishedAt: new Date("2005-06-12"),
      startSec: 780,
      endSec: 855,
      commentAudioUrl: demoAudioUrl,
      comment:
        "I recorded my reaction instead of writing it — the 'connecting the dots' segment hits different when you hear it in full.",
      createdAt: new Date(now - 4 * day),
    },
  });

  const a5 = await prisma.annotation.create({
    data: {
      userId: june.id,
      type: "article",
      sourceUrl: "https://stratechery.com/2025/aggregation-and-the-open-web",
      title: "Aggregation theory and the shrinking open web",
      siteName: "Stratechery",
      author: "Ben Thompson (sample)",
      publishedAt: new Date(now - 8 * day),
      quote:
        "The open web didn't lose because it was worse; it lost because distribution beat quality, and aggregation is distribution made into a business model.",
      comment:
        "Bookmark this passage for the next time someone asks why every feed looks the same.",
      createdAt: new Date(now - 5 * day),
    },
  });

  const a6 = await prisma.annotation.create({
    data: {
      userId: rhea.id,
      type: "article",
      sourceUrl: "https://www.theatlantic.com/ideas/2025/05/attention-span-myth",
      title: "The attention span myth we keep telling ourselves",
      siteName: "The Atlantic",
      author: "Sample Writer",
      publishedAt: new Date(now - 6 * day),
      quote:
        "People will watch a three-hour video essay about a TV show they have never seen. The problem was never attention — it was trust.",
      comment:
        "Genuinely changed how I think about 'short-form brainrot' discourse. The receipts are in the middle of the piece.",
      createdAt: new Date(now - 6 * day),
    },
  });

  const a7 = await prisma.annotation.create({
    data: {
      userId: milo.id,
      type: "article",
      sourceUrl: "https://arstechnica.com/gadgets/2025/6/browser-extensions-manifest-v3",
      title: "What Manifest V3 means for the extensions you rely on",
      siteName: "Ars Technica",
      author: "Sample Reporter",
      publishedAt: new Date(now - 4 * day),
      quote:
        "Every extension you love is a negotiation between a platform that wants predictability and a developer who wants power.",
      createdAt: new Date(now - 7 * day),
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        annotationId: a1.id,
        userId: rhea.id,
        text: "Used this exact clip in a study group last week. Perfect cut.",
      },
      {
        annotationId: a1.id,
        userId: milo.id,
        text: "The cost-surface framing is underrated. Great pick.",
      },
      {
        annotationId: a2.id,
        userId: june.id,
        text: "That stat made me stop the episode and just sit with it.",
      },
      {
        annotationId: a3.id,
        userId: ada.id,
        text: "'Owns the question you were about to ask' — brutal and true.",
      },
      {
        annotationId: a4.id,
        userId: june.id,
        text: "The audio commentary is a nice touch. More of this format please.",
      },
      {
        annotationId: a6.id,
        userId: milo.id,
        text: "Trust, not attention. Framing stolen, cited, annotated.",
      },
    ],
  });

  await prisma.follow.createMany({
    data: [
      { followerId: rhea.id, followeeId: ada.id },
      { followerId: milo.id, followeeId: ada.id },
      { followerId: june.id, followeeId: ada.id },
      { followerId: ada.id, followeeId: rhea.id },
      { followerId: milo.id, followeeId: rhea.id },
      { followerId: june.id, followeeId: milo.id },
    ],
  });

  const demoToken = process.env.SEED_DEMO_TOKEN?.trim();
  if (demoToken) {
    await prisma.apiToken.create({ data: { token: demoToken, userId: ada.id } });
  }

  const counts = {
    users: await prisma.user.count(),
    annotations: await prisma.annotation.count(),
    comments: await prisma.comment.count(),
    follows: await prisma.follow.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`Demo API token: ${demoToken ? "created" : "not created"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
