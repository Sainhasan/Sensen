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
      <body style="margin:0;background:#0F1108;color:#CAD8DE;font-family:Inter,Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0F1108;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#17140D;border:1px solid rgba(202,216,222,0.16);border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="background:#241909;padding:28px 30px;color:#CAD8DE;border-bottom:1px solid rgba(202,216,222,0.14);">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
                      <tr>
                        <td style="width:44px;height:44px;border-radius:10px;background:#8DEBE8;color:#0F1108;font-size:22px;font-weight:800;text-align:center;vertical-align:middle;">
                          P
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#00F6ED;font-size:12px;font-weight:800;text-transform:uppercase;">New inquiry</div>
                          <div style="color:rgba(202,216,222,0.72);font-size:13px;margin-top:3px;">Portfolio contact form</div>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;color:#CAD8DE;">${safePayload.purpose}</h1>
                    <p style="margin:10px 0 0;color:rgba(202,216,222,0.72);font-size:15px;line-height:1.6;">
                      Ada pesan baru dari form kontak portfolio kamu.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:0 0 14px;">
                          <div style="font-size:12px;color:rgba(202,216,222,0.62);font-weight:800;text-transform:uppercase;">Nama</div>
                          <div style="font-size:18px;font-weight:800;margin-top:4px;color:#CAD8DE;">${safePayload.name}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 18px;">
                          <div style="font-size:12px;color:rgba(202,216,222,0.62);font-weight:800;text-transform:uppercase;">Kontak</div>
                          <div style="font-size:16px;margin-top:4px;">
                            <a href="mailto:${safePayload.contact}" style="color:#00F6ED;text-decoration:none;font-weight:800;">${safePayload.contact}</a>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(202,216,222,0.14);border-radius:12px;margin:4px 0 22px;background:#241909;">
                      <tr>
                        <td width="50%" style="padding:16px;border-right:1px solid rgba(202,216,222,0.14);">
                          <div style="font-size:12px;color:rgba(202,216,222,0.62);font-weight:800;text-transform:uppercase;">Keperluan</div>
                          <div style="font-size:15px;font-weight:800;margin-top:6px;color:#CAD8DE;">${safePayload.purpose}</div>
                        </td>
                        <td width="50%" style="padding:16px;">
                          <div style="font-size:12px;color:rgba(202,216,222,0.62);font-weight:800;text-transform:uppercase;">Budget</div>
                          <div style="font-size:15px;font-weight:800;margin-top:6px;color:#CAD8DE;">${safePayload.budget}</div>
                        </td>
                      </tr>
                    </table>

                    <div style="background:#0F1108;border:1px solid rgba(0,246,237,0.22);border-radius:12px;padding:18px;">
                      <div style="font-size:12px;color:#00F6ED;font-weight:800;text-transform:uppercase;margin-bottom:10px;">Pesan</div>
                      <div style="font-size:16px;line-height:1.7;color:#CAD8DE;">${safePayload.message}</div>
                    </div>

                    <p style="margin:22px 0 0;color:rgba(202,216,222,0.62);font-size:13px;line-height:1.6;">
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
