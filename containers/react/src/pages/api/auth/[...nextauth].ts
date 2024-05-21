/* NextAuth.js is an open-source authentication library for Next.js applications, 
    which makes it easy to implement authentication in your Next.js applications. 
    It provides a seamless way to manage user sessions, authenticate users with various providers, and handle user accounts. 
 */
import NextAuth from 'next-auth';
import FortyTwoProvider from 'next-auth/providers/42-school';

export default NextAuth({
  /*  Providers: These are services that handle user authentication. 
   */
  providers: [
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'public',
          response_type: 'code',
        },
      },
      profile: async (profile) => {
        return {
          id: profile.id,
          name: profile.displayname,
          email: profile.email,
          image: profile.image_url,
        };
      },
    }),
  ],
  /* Callbacks: Callbacks are functions that allow you to customize the authentication flow, 
      such as handling JWTs, managing sessions, and redirecting users.
   */
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure the URL is absolute
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});
