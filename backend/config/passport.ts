import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

// ─── Startup Validation ──────────────────────────────────
const requiredEnvVars = [
  "BACKEND_URL",
  "FRONTEND_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing env var: ${key} — OAuth may not work correctly.`);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/users/auth/google/callback`,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any,
    ) => {
      try {
        const requestedRole =
          req.query?.state === "organizer" ? "organizer" : "user";

        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            googleId: profile.id,
            profileImage: profile.photos?.[0].value,
            role: requestedRole,
          });
        } else {
          user.googleId = profile.id;
          if (requestedRole === "organizer") {
            user.role = "organizer";
          }
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/users/auth/github/callback`,
      scope: ["user:email"],
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any,
    ) => {
      try {
        const requestedRole =
          req.query?.state === "organizer" ? "organizer" : "user";

        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value,
            githubId: profile.id,
            profileImage: profile.photos?.[0]?.value,
            role: requestedRole,
          });
        } else {
          user.githubId = profile.id;
          if (requestedRole === "organizer") {
            user.role = "organizer";
          }
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
