import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.OAuth2({
      id: '42',
      name: '42',
      clientId: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      authorizationUrl: 'https://api.intra.42.fr/oauth/authorize?response_type=code',
      tokenUrl: 'https://api.intra.42.fr/oauth/token',
      userinfoUrl: 'https://api.intra.42.fr/v2/me',
      profile(profile) {
        return {
          id: profile.id,
          name: profile.displayname,
          email: profile.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session(session, token) {
      session.user.id = token.id;
      return session;
    },
  },
});
