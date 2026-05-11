import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
];

function missingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function normalizePayload(payload) {
  const currency = String(payload.currency || "IDR").trim().toUpperCase();

  return {
    name: String(payload.name || "").trim(),
    contact: String(payload.contact || "").trim(),
    purpose: String(payload.purpose || "").trim(),
    budget: String(payload.budget || "").trim(),
    currency: currency === "USD" ? "USD" : "IDR",
    message: String(payload.message || "").trim(),
  };
}

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function formatBudget(payload) {
  const digits = digitsOnly(payload.budget);

  if (!digits) {
    return "";
  }

  const separator = payload.currency === "USD" ? "," : ".";
  const formattedAmount = digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${payload.currency} ${formattedAmount}`;
}

function validatePayload(payload) {
  const requiredFields = ["name", "contact", "purpose", "message"];
  const missingFields = requiredFields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    return "Nama, kontak, keperluan, dan pesan wajib diisi.";
  }

  if (payload.message.length < 10) {
    return "Pesan minimal 10 karakter.";
  }

  if (payload.name.length > 120 || payload.contact.length > 160 || payload.purpose.length > 80) {
    return "Beberapa input terlalu panjang.";
  }

  if (payload.budget.length > 120 || payload.message.length > 2000) {
    return "Budget atau pesan terlalu panjang.";
  }

  return null;
}

export async function POST(request) {
  const envMissing = missingEnv();

  if (envMissing.length > 0) {
    console.error("Missing contact form environment variables:", envMissing.join(", "));
    return Response.json({ message: "Konfigurasi server belum lengkap." }, { status: 500 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Format request tidak valid." }, { status: 400 });
  }

  const payload = normalizePayload(body);
  const formattedBudget = formatBudget(payload);
  const validationError = validatePayload(payload);

  if (validationError) {
    return Response.json({ message: validationError }, { status: 400 });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });

  const { error: insertError } = await supabase.from("contact_inquiries").insert({
    name: payload.name,
    contact: payload.contact,
    purpose: payload.purpose,
    budget: formattedBudget || null,
    message: payload.message,
  });

  if (insertError) {
    console.error("Supabase insert failed:", insertError.message);
    return Response.json({ message: "Pesan belum bisa disimpan." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      subject: `Inquiry portfolio: ${payload.purpose}`,
      text: [
        "Ada pesan baru dari form portfolio.",
        "",
        `Nama: ${payload.name}`,
        `Kontak: ${payload.contact}`,
        `Keperluan: ${payload.purpose}`,
        `Budget: ${formattedBudget || "-"}`,
        "",
        "Pesan:",
        payload.message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend email failed:", error.message || error);
      return Response.json({ message: "Pesan tersimpan, tapi email notifikasi gagal dikirim." }, { status: 502 });
    }

    console.info("Resend email sent:", data?.id);
  } catch (error) {
    console.error("Resend email failed:", error.message);
    return Response.json({ message: "Pesan tersimpan, tapi email notifikasi gagal dikirim." }, { status: 502 });
  }

  return Response.json({ message: "Pesan berhasil dikirim." });
}
