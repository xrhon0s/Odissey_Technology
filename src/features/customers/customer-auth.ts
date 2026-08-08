import { z } from "zod";

import { CUSTOMER_PASSWORD_MIN_LENGTH } from "./customer-password";

const passwordSchema = z
  .string()
  .min(
    CUSTOMER_PASSWORD_MIN_LENGTH,
    `Usa al menos ${CUSTOMER_PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .max(200)
  .regex(/[A-Za-z]/, "Incluye al menos una letra.")
  .regex(/[0-9]/, "Incluye al menos un número.");

export const customerLoginSchema = z.object({
  email: z.email("Escribe un correo válido.").max(254),
  password: z.string().min(8).max(200),
});

export const customerRegistrationSchema = z
  .object({
    email: z.email("Escribe un correo válido.").max(254),
    fullName: z.string().trim().min(2, "Escribe tu nombre.").max(120),
    password: passwordSchema,
    passwordConfirmation: z.string(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9\s-]{6,19}$/, "Escribe un celular válido."),
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirmation"],
  });

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,19}$/, "Escribe un celular válido."),
});

export const customerPasswordUpdateSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["passwordConfirmation"],
  });

export const customerReturnPathSchema = z
  .enum(["/carrito", "/checkout", "/cuenta"])
  .catch("/cuenta");
