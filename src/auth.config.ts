import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { canonicalEmail } from "@/lib/email-canonical";
import { verifyOtpAndConsume } from "@/lib/otp";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const rawEmail =
          typeof credentials?.email === "string"
            ? credentials.email
            : undefined;
        const code =
          typeof credentials?.code === "string"
            ? credentials.code.trim()
            : undefined;
        if (!rawEmail || !code) return null;

        const email = rawEmail.trim().toLowerCase();
        const canonical = canonicalEmail(rawEmail);
        const ok = await verifyOtpAndConsume(email, code);
        if (!ok) return null;

        const existing = await prisma.user.findUnique({
          where: { canonicalEmail: canonical },
        });
        const user = existing
          ? await prisma.user.update({
              where: { id: existing.id },
              data: { emailVerified: new Date() },
            })
          : await prisma.user.create({
              data: {
                email,
                canonicalEmail: canonical,
                name: email.split("@")[0],
                emailVerified: new Date(),
              },
            });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/auth/sign-in" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return false;

      const isOAuth =
        account?.type === "oauth" || account?.type === "oidc";
      if (!isOAuth) return true;

      const canonical = canonicalEmail(user.email);
      const existing = await prisma.user.findUnique({
        where: { canonicalEmail: canonical },
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            email: user.email,
            canonicalEmail: canonical,
            name: user.name ?? null,
            image: user.image ?? null,
            emailVerified: new Date(),
            ...(account.providerAccountId
              ? {
                  accounts: {
                    create: {
                      type: account.type,
                      provider: account.provider,
                      providerAccountId: account.providerAccountId,
                      access_token: account.access_token,
                      token_type: account.token_type,
                      scope: account.scope,
                      id_token: account.id_token,
                      expires_at: account.expires_at,
                    },
                  },
                }
              : {}),
          },
        });
        return true;
      }

      if (account?.provider && account.providerAccountId) {
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: existing.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            expires_at: account.expires_at,
          },
          update: {},
        });
      }
      (user as { id?: string }).id = existing.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
