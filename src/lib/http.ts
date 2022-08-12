export const redirectTo = (location: string) => ({
  isBase64Encoded: false,
  statusCode: 302,
  multiValueHeaders: {
    Location: [location],
  },
  body: "",
});
