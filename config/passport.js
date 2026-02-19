const passport = require("passport");
const { Strategy: GitHubStrategy } = require("passport-github2");
const { ObjectId } = require("mongodb");

function configurePassport(app) {
  const callbackURL =
    process.env.CALLBACK_URL || "http://localhost:8080/auth/github/callback";

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL,
        scope: ["user:email"]
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const db = app.locals.db;
          const now = new Date();

          // Upsert: update profile fields on every login, set createdAt only on first
          const user = await db.collection("users").findOneAndUpdate(
            { githubId: profile.id },
            {
              $set: {
                username: profile.username,
                displayName: profile.displayName || profile.username,
                email: profile.emails?.[0]?.value ?? null,
                avatarUrl: profile.photos?.[0]?.value ?? null,
                profileUrl:
                  profile.profileUrl ||
                  `https://github.com/${profile.username}`,
                lastLogin: now
              },
              $setOnInsert: {
                githubId: profile.id,
                createdAt: now
              }
            },
            { upsert: true, returnDocument: "after" }
          );

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Store only the user's _id in the session cookie
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // On each request, look up the full user document from the stored _id
  passport.deserializeUser(async (id, done) => {
    try {
      const db = app.locals.db;
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = configurePassport;
