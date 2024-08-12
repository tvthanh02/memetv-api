import passport from "passport";
import Google from "passport-google-oauth20";
import "dotenv/config";

const GoogleStrategy = Google.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, {
        googleId: profile.id,
        displayName: profile.displayName,
        avatar_url: profile.photos[0].value,
        email: profile.emails[0].value,
      });
    }
  )
);

export default passport;
