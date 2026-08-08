import { describe, expect, it } from "vitest";

import {
  customerLoginSchema,
  customerPasswordUpdateSchema,
  customerRegistrationSchema,
  customerReturnPathSchema,
} from "./customer-auth";
import { getCustomerPasswordChecks } from "./customer-password";

describe("customerRegistrationSchema", () => {
  const validRegistration = {
    email: "cliente@example.com",
    fullName: "David Sánchez",
    password: "odissey2026",
    passwordConfirmation: "odissey2026",
    phone: "3126485885",
  };

  it("accepts a complete customer registration", () => {
    expect(
      customerRegistrationSchema.safeParse(validRegistration).success,
    ).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = customerRegistrationSchema.safeParse({
      ...validRegistration,
      passwordConfirmation: "otra-clave2026",
    });

    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    expect(
      customerRegistrationSchema.safeParse({
        ...validRegistration,
        password: "sololetras",
        passwordConfirmation: "sololetras",
      }).success,
    ).toBe(false);
  });
});

describe("getCustomerPasswordChecks", () => {
  it("reports password progress independently", () => {
    expect(getCustomerPasswordChecks("12345678", "87654321")).toEqual({
      hasLetter: false,
      hasMinimumLength: true,
      hasNumber: true,
      passwordsMatch: false,
    });
  });

  it("reports every requirement when passwords are ready", () => {
    expect(getCustomerPasswordChecks("odissey2026", "odissey2026")).toEqual({
      hasLetter: true,
      hasMinimumLength: true,
      hasNumber: true,
      passwordsMatch: true,
    });
  });
});

describe("customer authentication inputs", () => {
  it("rejects malformed login credentials", () => {
    expect(
      customerLoginSchema.safeParse({
        email: "correo-invalido",
        password: "123",
      }).success,
    ).toBe(false);
  });

  it("requires matching passwords on recovery", () => {
    expect(
      customerPasswordUpdateSchema.safeParse({
        password: "odissey2026",
        passwordConfirmation: "odissey2027",
      }).success,
    ).toBe(false);
  });

  it("only accepts known return paths", () => {
    expect(customerReturnPathSchema.parse("/checkout")).toBe("/checkout");
    expect(customerReturnPathSchema.parse("//malicious.example")).toBe(
      "/cuenta",
    );
    expect(customerReturnPathSchema.parse("https://malicious.example")).toBe(
      "/cuenta",
    );
  });
});
