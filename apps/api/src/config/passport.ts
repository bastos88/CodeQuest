import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { findOrCreateOAuthUser } from '../services/auth.service.js';

type OAuthUser = Awaited<ReturnType<typeof findOrCreateOAuthUser>>;
type Done = (error: unknown, user?: OAuthUser | false) => void;
type OAuthStrategyConstructor = new (
  options: Record<string, unknown>,
  verify: (
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    done: Done,
  ) => void,
) => passport.Strategy;

const LooseGoogleStrategy =
  GoogleStrategy as unknown as OAuthStrategyConstructor;
const LooseGitHubStrategy =
  GitHubStrategy as unknown as OAuthStrategyConstructor;

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new LooseGoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: unknown,
        done: Done,
      ) => {
        try {
          const googleProfile = profile as {
            id: string;
            displayName?: string;
            photos?: Array<{ value: string }>;
            emails?: Array<{ value: string; verified?: boolean }>;
          };
          const email =
            googleProfile.emails?.find((item) => item.verified !== false)
              ?.value ?? googleProfile.emails?.[0]?.value;
          if (!email) {
            done(new Error('Google did not return a verified email'), false);
            return;
          }

          const user = await findOrCreateOAuthUser({
            provider: 'google',
            providerId: googleProfile.id,
            email,
            name:
              googleProfile.displayName ||
              email.split('@')[0] ||
              'Usuario CodeQuest',
            avatarUrl: googleProfile.photos?.[0]?.value ?? null,
          });
          done(null, user);
        } catch (error) {
          done(error, false);
        }
      },
    ),
  );
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new LooseGitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL,
        scope: ['read:user', 'user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: unknown,
        done: Done,
      ) => {
        try {
          const githubProfile = profile as {
            id: string;
            displayName?: string;
            username?: string;
            photos?: Array<{ value: string }>;
            emails?: Array<{ value: string }>;
            _json?: { email?: string | null };
          };
          const email =
            githubProfile.emails?.find((item) => item.value)?.value ??
            githubProfile._json?.email;

          if (!email) {
            done(new Error('GitHub did not return an email'), false);
            return;
          }

          const user = await findOrCreateOAuthUser({
            provider: 'github',
            providerId: githubProfile.id,
            email,
            name:
              githubProfile.displayName ||
              githubProfile.username ||
              email.split('@')[0] ||
              'Usuario CodeQuest',
            avatarUrl: githubProfile.photos?.[0]?.value ?? null,
          });
          done(null, user);
        } catch (error) {
          done(error, false);
        }
      },
    ),
  );
}

export { passport };
export type { OAuthUser };
