import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 🔥 add this
      name?: string | null;
      email?: string | null;
      image?: string | null;
      country?:string|null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
