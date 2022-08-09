// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const redirectTo = (location: string): any => ({
  isBase64Encoded: false,
  statusCode: 302,
  multiValueHeaders: {
    Location: [location],
  },
  body: "",
});
