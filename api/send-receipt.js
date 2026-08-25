// api/send-receipt.js
// ============================================================
//  Délivrance du REÇU DE PAIEMENT au client après un règlement
//  KkiaPay réussi (frais de diagnostic).
//
//  - Envoie un reçu HTML au client (si une adresse email a été
//    fournie dans le formulaire de diagnostic).
//  - Envoie systématiquement une copie du reçu à l'entreprise
//    (comptabilité / archives) même si le client n'a pas
//    d'adresse email.
//
//  Réutilise la même configuration d'envoi que /api/devis.js :
//  RESEND_API_KEY (recommandé sur Vercel) ou SMTP_PASS_DEVIS.
// ============================================================
import nodemailer from 'nodemailer';

const BUSINESS_EMAIL = process.env.RECEIPT_BCC_EMAIL || 'devis@bestservicesandhouse.site';
const COMPANY = {
  name: 'BSH — Best Services and House',
  rccm: 'N° RCCM RB/ABC/26 A 140817',
  ifu: 'N° IFU 0201710115389',
  address: 'Abomey-Calavi, Bénin',
  phone: '+229 01 48 52 45 90',
  email: 'contact@bestservicesandhouse.site',
};

function formatFCFA(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('fr-FR') + ' FCFA';
}

function buildReceiptNumber(transactionId) {
  const clean = String(transactionId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return 'BSH-REC-' + (clean ? clean.slice(-10) : Date.now().toString().slice(-10));
}

function buildReceiptHtml({ receiptNumber, dateStr, client, amount, transactionId, paymentMethod }) {
  const zoneLabel = client.zoneText || 'Frais de déplacement';
  const zoneAmount = client.total && client.withReport ? (client.total - 10000) : (client.total || amount);
  const rows = [
    ['Diagnostic de bâtiment — ' + (client.issue || 'Prestation'), formatFCFA(zoneAmount)],
  ];
  if (client.withReport) {
    rows.push(['Rapport de diagnostic approfondi rédigé', formatFCFA(10000)]);
  }

  const rowsHtml = rows.map(([label, val]) => `
    <tr>
      <td style="padding:10px 0; color:#334155;">${label}</td>
      <td style="padding:10px 0; text-align:right; font-weight:700; color:#0f172a;">${val}</td>
    </tr>`).join('');

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; border:1px solid #e2e8f0; border-radius:10px; overflow:hidden;">
    <div style="background:#0f172a; padding:24px 28px;">
      <h1 style="color:#fff; margin:0; font-size:1.3rem;">🧾 Reçu de Paiement</h1>
      <p style="color:#cbd5e1; margin:6px 0 0; font-size:0.9rem;">${COMPANY.name}</p>
    </div>
    <div style="padding:28px;">
      <table style="width:100%; font-size:0.9rem; margin-bottom:18px;">
        <tr>
          <td style="color:#64748b;">N° de reçu</td>
          <td style="text-align:right; font-weight:700; color:#0f172a;">${receiptNumber}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Date</td>
          <td style="text-align:right; font-weight:700; color:#0f172a;">${dateStr}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Référence transaction KkiaPay</td>
          <td style="text-align:right; font-weight:700; color:#0f172a; word-break:break-all;">${transactionId}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Moyen de paiement</td>
          <td style="text-align:right; font-weight:700; color:#0f172a;">${paymentMethod || 'KkiaPay'}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Statut</td>
          <td style="text-align:right; font-weight:700; color:#15803d;">✅ Payé</td>
        </tr>
      </table>

      <h3 style="font-size:0.95rem; color:#0f172a; border-bottom:2px solid #f59e0b; padding-bottom:8px;">Client</h3>
      <table style="width:100%; font-size:0.9rem; margin-bottom:18px;">
        <tr><td style="color:#64748b; padding:4px 0;">Nom</td><td style="text-align:right; font-weight:600;">${client.name || '—'}</td></tr>
        <tr><td style="color:#64748b; padding:4px 0;">Téléphone</td><td style="text-align:right; font-weight:600;">${client.phone || '—'}</td></tr>
        <tr><td style="color:#64748b; padding:4px 0;">Lieu du bâtiment</td><td style="text-align:right; font-weight:600;">${client.location || '—'}</td></tr>
      </table>

      <h3 style="font-size:0.95rem; color:#0f172a; border-bottom:2px solid #f59e0b; padding-bottom:8px;">Détail de la prestation réglée</h3>
      <table style="width:100%; font-size:0.9rem; border-collapse:collapse;">
        ${rowsHtml}
        <tr>
          <td style="padding:14px 0 0; border-top:2px solid #0f172a; font-weight:800; color:#0f172a;">TOTAL PAYÉ</td>
          <td style="padding:14px 0 0; border-top:2px solid #0f172a; text-align:right; font-weight:900; font-size:1.15rem; color:#E8820C;">${formatFCFA(amount || client.total)}</td>
        </tr>
      </table>

      <p style="margin-top:24px; font-size:0.85rem; color:#475569; line-height:1.6;">
        Merci pour votre confiance. Un technicien BSH vous contactera sous 24h pour planifier l'intervention.
        Conservez ce reçu comme preuve de paiement.
      </p>
    </div>
    <div style="background:#f8fafc; padding:16px 28px; font-size:0.75rem; color:#94a3b8; border-top:1px solid #e2e8f0;">
      ${COMPANY.name} | ${COMPANY.rccm} | ${COMPANY.ifu}<br>
      ${COMPANY.address} | ${COMPANY.phone} | ${COMPANY.email}
    </div>
  </div>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });

  const { client = {}, amount, transactionId, paymentMethod } = req.body || {};

  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId manquant.' });
  }

  const receiptNumber = buildReceiptNumber(transactionId);
  const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' });
  const html = buildReceiptHtml({ receiptNumber, dateStr, client, amount, transactionId, paymentMethod });

  const recipients = [];
  if (client.email && /.+@.+\..+/.test(client.email)) recipients.push(client.email);
  // Toujours conserver une copie du reçu côté entreprise (comptabilité / preuve).
  recipients.push(BUSINESS_EMAIL);

  const subject = `Reçu de paiement BSH — ${receiptNumber}`;

  try {
    // OPTION A : Resend (recommandé sur Vercel)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BSH — Reçus <devis@bestservicesandhouse.site>',
          to: recipients,
          subject,
          html,
        }),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Erreur API Resend');
      return res.status(200).json({ success: true, receiptNumber, sentTo: recipients });
    }

    // OPTION B : SMTP classique
    if (process.env.SMTP_PASS_DEVIS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.bestservicesandhouse.site',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER_DEVIS || 'devis@bestservicesandhouse.site',
          pass: process.env.SMTP_PASS_DEVIS,
        },
      });

      await transporter.sendMail({
        from: `"BSH — Reçus" <${process.env.SMTP_USER_DEVIS || 'devis@bestservicesandhouse.site'}>`,
        to: recipients.join(','),
        subject,
        html,
      });
      return res.status(200).json({ success: true, receiptNumber, sentTo: recipients });
    }

    // Aucune config d'envoi disponible : on ne bloque pas le client,
    // le reçu reste consultable/imprimable sur la page de confirmation.
    return res.status(200).json({
      success: false,
      receiptNumber,
      error: "Configuration de messagerie manquante (RESEND_API_KEY ou SMTP_PASS_DEVIS). Le reçu affiché à l'écran reste valable.",
    });
  } catch (err) {
    console.error('[send-receipt] Erreur:', err);
    // On ne bloque jamais l'expérience client : le reçu à l'écran / imprimable suffit.
    return res.status(200).json({ success: false, receiptNumber, error: err?.message || 'Erreur envoi reçu.' });
  }
}
