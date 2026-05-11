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

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createEmailText(payload, formattedBudget) {
  return [
    "Ada pesan baru dari form portfolio.",
    "",
    `Nama: ${payload.name}`,
    `Kontak: ${payload.contact}`,
    `Keperluan: ${payload.purpose}`,
    `Budget: ${formattedBudget || "-"}`,
    "",
    "Pesan:",
    payload.message,
  ].join("\n");
}

function createEmailHtml(payload, formattedBudget) {
  const safePayload = {
    name: escapeHtml(payload.name),
    contact: escapeHtml(payload.contact),
    purpose: escapeHtml(payload.purpose),
    budget: escapeHtml(formattedBudget || "-"),
    message: escapeHtml(payload.message).replace(/\n/g, "<br />"),
  };

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Inquiry Portfolio</title>
      </head>
      <body style="margin:0;background:#f4f7fb;color:#16202a;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dce3ec;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background:#102027;padding:28px 30px;color:#ffffff;">
                    <div style="display:inline-block;background:#0f8b8d;color:#ffffff;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;margin-bottom:16px;">
                      New portfolio inquiry
                    </div>
                    <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;">${safePayload.purpose}</h1>
                    <p style="margin:10px 0 0;color:#c9d4df;font-size:15px;line-height:1.6;">
                      Ada pesan baru dari form kontak portfolio kamu.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:0 0 14px;">
                          <div style="font-size:12px;color:#667085;font-weight:700;text-transform:uppercase;">Nama</div>
                          <div style="font-size:18px;font-weight:800;margin-top:4px;">${safePayload.name}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 18px;">
                          <div style="font-size:12px;color:#667085;font-weight:700;text-transform:uppercase;">Kontak</div>
                          <div style="font-size:16px;margin-top:4px;">
                            <a href="mailto:${safePayload.contact}" style="color:#0f8b8d;text-decoration:none;font-weight:700;">${safePayload.contact}</a>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dce3ec;border-radius:10px;margin:4px 0 22px;">
                      <tr>
                        <td width="50%" style="padding:16px;border-right:1px solid #dce3ec;">
                          <div style="font-size:12px;color:#667085;font-weight:700;text-transform:uppercase;">Keperluan</div>
                          <div style="font-size:15px;font-weight:700;margin-top:6px;">${safePayload.purpose}</div>
                        </td>
                        <td width="50%" style="padding:16px;">
                          <div style="font-size:12px;color:#667085;font-weight:700;text-transform:uppercase;">Budget</div>
                          <div style="font-size:15px;font-weight:700;margin-top:6px;">${safePayload.budget}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#f8fafc;border:1px solid #dce3ec;border-radius:10px;padding:18px;">
                      <div style="font-size:12px;color:#667085;font-weight:700;text-transform:uppercase;margin-bottom:10px;">Pesan</div>
                      <div style="font-size:16px;line-height:1.7;color:#26313d;">${safePayload.message}</div>
                    </div>

                    <p style="margin:22px 0 0;color:#667085;font-size:13px;line-height:1.6;">
                      Data ini juga sudah tersimpan di Supabase pada tabel contact_inquiries.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
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
      subject: `${payload.purpose}`,
      html: createEmailHtml(payload, formattedBudget),
      text: createEmailText(payload, formattedBudget),
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
