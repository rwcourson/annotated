import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

const providers: Provider[] = [];

// Production auth: OAuth only (Google + X). Providers are registered only
// when their env keys are present so the app boots cleanly without them.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}
if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
  providers.push(Twitter);
}

// Dev-only demo sign in: pick-or-create a user by username. Gated to
// NODE_ENV === "development" so production stays OAuth-only.
if (process.env.NODE_ENV === "development") {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo sign in",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "ada" },
      },
      async authorize(credentials) {
        const raw =
          typeof credentials?.username === "string" ? credentials.username : "";
        const username = raw.trim().toLowerCase();
        if (!USERNAME_RE.test(username)) return null;
        const user = await prisma.user.upsert({
          where: { username },
          update: {},
          create: { username, name: username },
        });
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT sessions so the dev credentials provider works alongside OAuth.
  session: { strategy: "jwt" },
  providers,
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
  events: {
    // Assign a handle to OAuth users (credentials users already have one).
    async createUser({ user }) {
      const base = (
        user.email?.split("@")[0] ||
        user.name ||
        "user"
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 15) || "user";
      let username = base;
      let i = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base}${++i}`;
      }
      await prisma.user.update({ where: { id: user.id }, data: { username } });
    },
  },
} satisfies NextAuthConfig);
