import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User";

export default function configurePassport(passport: PassportStatic): void {
  // Local strategy: authenticate with email + password instead of the default
  // username field.
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "User not found with that email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    })
  );

  // Only the user ID is stored in the session...
  passport.serializeUser((user, done) => {
    done(null, (user as { id: string }).id);
  });

  // ...and looked back up on every request.
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  });
}
