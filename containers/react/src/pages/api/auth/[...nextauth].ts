/* NextAuth.js is an open-source authentication library for Next.js applications, 
    which makes it easy to implement authentication in your Next.js applications. 
    It provides a seamless way to manage user sessions, authenticate users with various providers, and handle user accounts. 
 */
import NextAuth from 'next-auth';
import FortyTwoProvider from 'next-auth/providers/42-school';
import { signIn } from 'next-auth/react';

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    FortyTwoProvider({
      clientId: process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET!,
    }),
    // ...add more providers here
  ],

  pages: {
    signIn: "https://api.intra.42.fr/oauth/authorize?client_id=" + process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID + "&redirect_uri=http%3A%2F%2F127.0.0.1%3A4242%2Fauth%2Fvalidate&response_type=code" 
  }

  
}

export default NextAuth(authOptions);

