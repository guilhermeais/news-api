module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  cron: {
    enabled: true,
  },
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "d12cee72021641559cf4ca51d7fd9ca9"),
    },
  },
});
