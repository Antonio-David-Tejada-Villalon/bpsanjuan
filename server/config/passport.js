const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const PublicUser = require('../models/PublicUser');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar si ya existe el usuario público con este Google ID
    let publicUser = await PublicUser.findOne({ googleId: profile.id });

    if (!publicUser) {
      // Crear nuevo usuario público
      publicUser = await PublicUser.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0]?.value || null
      });
    }

    return done(null, publicUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await PublicUser.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
