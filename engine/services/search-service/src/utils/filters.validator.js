"use strict";

const { z } = require("zod");

function sanitizeString(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 1000);
}

function sanitizeDate(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

const FilterSchema = z
  .object({
    dateRange: z
      .object({
        from: z
          .string()
          .transform(sanitizeDate)
          .refine((v) => v === undefined || !Number.isNaN(new Date(v).getTime()), {
            message: "Invalid date format for 'from'"
          })
          .optional(),
        to: z
          .string()
          .transform(sanitizeDate)
          .refine((v) => v === undefined || !Number.isNaN(new Date(v).getTime()), {
            message: "Invalid date format for 'to'"
          })
          .optional()
      })
      .optional(),
    domain: z
      .string()
      .transform(sanitizeString)
      .refine((v) => !v || /^([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/.test(v), {
        message: "Invalid domain format"
      })
      .optional(),
    contentType: z
      .string()
      .transform(sanitizeString)
      .optional()
  })
  .strict();

function buildDefault() {
  return {
    dateRange: undefined,
    domain: undefined,
    contentType: undefined
  };
}

function parse(filtersInput) {
  if (!filtersInput) return buildDefault();
  let raw;
  if (typeof filtersInput === "string") {
    try {
      raw = JSON.parse(filtersInput);
    } catch {
      const err = new Error("Invalid filters JSON");
      err.statusCode = 400;
      throw err;
    }
  } else if (typeof filtersInput === "object" && !Array.isArray(filtersInput)) {
    raw = filtersInput;
  } else {
    const err = new Error("Filters must be an object");
    err.statusCode = 400;
    throw err;
  }

  const parsed = FilterSchema.safeParse(raw);

  if (!parsed.success) {
    const err = new Error(`Invalid filters: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const result = buildDefault();
  Object.assign(result, parsed.data);
  return result;
}

module.exports = { parse };
