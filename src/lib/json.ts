import { isObject, toString } from "lodash";

export type Json = string | number | boolean | null | undefined | { [x: string]: Json | Json[] };

export const safeParse = (data: unknown): unknown => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (err) {
    return data;
  }
};

export const safeParseOrString = (data: unknown): object | string => {
  const parsed = safeParse(data);
  return isObject(parsed) ? parsed : toString(data);
};
