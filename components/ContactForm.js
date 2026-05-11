"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  contact: "",
  purpose: "Belajar web",
  budget: "",
  currency: "IDR",
  message: "",
};

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function formatBudget(value, currency) {
  const digits = digitsOnly(value);

  if (!digits) {
    return "";
  }

  const separator = currency === "USD" ? "," : ".";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    if (name === "currency") {
      setForm((current) => ({
        ...current,
        currency: value,
        budget: formatBudget(current.budget, value),
      }));
      return;
    }

    if (name === "budget") {
      setForm((current) => ({
        ...current,
        budget: formatBudget(value, current.currency),
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pesan belum bisa dikirim.");
      }

      setForm(initialForm);
      setStatus({
        type: "success",
        message: "Pesan terkirim. Aku akan cek dan balas secepatnya.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Terjadi kendala. Coba lagi sebentar lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-panel" onSubmit={submitForm}>
      {status.type === "success" ? (
        <div className="alert alert-success">{status.message}</div>
      ) : null}
      {status.type === "error" ? (
        <div className="alert alert-danger">{status.message}</div>
      ) : null}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold" htmlFor="name">
            Nama
          </label>
          <input
            className="form-control"
            id="name"
            name="name"
            onChange={updateField}
            placeholder="Nama kamu"
            required
            type="text"
            value={form.name}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold" htmlFor="contact">
            Email atau WhatsApp
          </label>
          <input
            className="form-control"
            id="contact"
            name="contact"
            onChange={updateField}
            placeholder="email@domain.com / 08..."
            required
            type="text"
            value={form.contact}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold" htmlFor="purpose">
            Keperluan
          </label>
          <select
            className="form-select"
            id="purpose"
            name="purpose"
            onChange={updateField}
            required
            value={form.purpose}
          >
            <option>Belajar web</option>
            <option>Minta fee pembuatan web</option>
            <option>Kerja sama</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold" htmlFor="budget">
            Budget
          </label>
          <div className="input-group" style={{ display: "flex", gap: "8px" }}>
            <select
              className="form-select"
              name="currency"
              onChange={updateField}
              value={form.currency}
              style={{ flex: "0 0 auto", minWidth: "100px" }}
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
            </select>
            <input
              className="form-control"
              id="budget"
              inputMode="numeric"
              name="budget"
              onChange={updateField}
              placeholder={form.currency === "USD" ? "1,000" : "1.000.000"}
              type="text"
              value={form.budget}
              style={{ flex: "1" }}
            />
          </div>
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold" htmlFor="message">
            Pesan
          </label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            onChange={updateField}
            placeholder="Ceritain kebutuhanmu di sini."
            required
            rows="5"
            value={form.message}
          />
        </div>

        <div className="col-12">
          <button
            className="btn btn-primary w-100 py-2"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </div>
      </div>
    </form>
  );
}
