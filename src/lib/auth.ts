import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession } from "better-auth/plugins";
import { client } from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "user",
            },
          };
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          role: (user as any).role || "user",
        },
        session,
      };
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET || "rDQA0mgKPSgqgKphs4NLjFQE7ncBVkx6",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

