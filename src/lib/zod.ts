import validator from "validator";
import { z } from "zod";

const DECIMAL_RADIX = 10;

export const stringToBooleanDisabledByDefault = () =>
  z
    .string()
    .refine(validator.isBoolean)
    .default("0")
    .transform((data) => validator.toBoolean(data));

export const stringToNumberWithDefault = (def: string) =>
  z
    .string()
    .refine(validator.isNumeric)
    .default(def)
    .transform((data) => parseInt(data, DECIMAL_RADIX));

export const stringToNumber = () =>
  z
    .string()
    .refine(validator.isNumeric)
    .transform((data) => parseInt(data, DECIMAL_RADIX));
