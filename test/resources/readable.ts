import { Readable } from "stream";

export const readableToString = async (stream: Readable): Promise<string> => {
  return new Promise<string>((resolve) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk.toString();
    });
    stream.on("end", () => {
      resolve(data);
    });
  });
};
