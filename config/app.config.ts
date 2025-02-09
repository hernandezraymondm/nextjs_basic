const appConfig = () => ({
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  REFRESH_DB_SESSION_EXPIRY: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  REFRESH_COOKIE_EXPIRY: 7 * 24 * 60 * 60, // 7 days
  TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000, // 4 minutes
  SECRET: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  },
  API_BASE_PATH: "/api",
});

export const config = appConfig();
