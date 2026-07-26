import { describe, expect, it } from "vitest";

import {
  customerLoginSchema,
  customerPasswordUpdateSchema,
  customerRegistrationSchema,
} from "./customer-auth";

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
});
