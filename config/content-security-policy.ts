import builder from 'content-security-policy-builder';
import { type FeatureFlags } from './feature-flags.ts';

const SELF = "'self'";

/**
 * Generate a Content Security Policy directive for a particular DIM environment (beta, release)
 */
export default function csp(featureFlags: FeatureFlags, dimApiHost: string) {
  const sentryOrigin =
    featureFlags.sentry && process.env.SENTRY_DSN ? new URL(process.env.SENTRY_DSN).origin : false;
  const baseCSP: Record<string, string[] | string | boolean> = {
    defaultSrc: ["'none'"],
    scriptSrc: [
      SELF,
      featureFlags.analytics && 'https://*.googletagmanager.com',
      featureFlags.analytics && 'https://*.google-analytics.com',
      // OpenCollective backers
      'https://opencollective.com',
    ].filter((source) => source !== false),
    workerSrc: [SELF],
    styleSrc: [
      SELF,
      // For our inline styles
      "'unsafe-inline'",
    ],
    connectSrc: [
      SELF,
      // Google Analytics
      featureFlags.analytics && 'https://*.google-analytics.com',
      featureFlags.analytics && 'https://*.analytics.google.com',
      featureFlags.analytics && 'https://*.googletagmanager.com',
      // Bungie.net API
      'https://www.bungie.net',
      // Sentry
      sentryOrigin,
      // Wishlists
      featureFlags.wishLists && 'https://raw.githubusercontent.com',
      featureFlags.wishLists && 'https://gist.githubusercontent.com',
      // DIM Sync
      dimApiHost,
      // Clarity
      featureFlags.clarityDescriptions && 'https://database-clarity.github.io',
      // Stream Deck Plugin
      featureFlags.elgatoStreamDeck && 'ws://localhost:9120',
      featureFlags.elgatoStreamDeck && 'http://localhost:9120',
      // Game2Give
      featureFlags.issueBanner && 'https://bungiefoundation.donordrive.com',
    ].filter((s) => s !== false),
    imgSrc: [
      SELF,
      // Webpack inlines some images
      'data:',
      // Bungie.net images
      'https://www.bungie.net',
      // Google analytics tracking
      featureFlags.analytics && 'https://*.google-analytics.com',
      featureFlags.analytics && 'https://*.googletagmanager.com',
      // OpenCollective backers
      'https://opencollective.com',
    ].filter((source) => source !== false),
    fontSrc: [SELF, 'data:'],
    childSrc: [SELF],
    frameSrc: [
      // OpenCollective backers
      'https://opencollective.com',
      // Mastodon feed
      'https://www.mastofeed.com/apiv2/feed',
    ],
    objectSrc: SELF,
    // Web app manifest
    manifestSrc: SELF,
    // Injected markup can't repoint relative URLs or post to another origin.
    // None of our forms submit cross-origin.
    baseUri: [SELF],
    formAction: [SELF],
  };

  return builder({
    directives: baseCSP,
  });
}
