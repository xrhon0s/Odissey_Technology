import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Usa al menos 8 caracteres.")
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

export const customerPasswordResetRequestSchema = z.object({
  email: z.email("Escribe un correo válido.").max(254),
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
