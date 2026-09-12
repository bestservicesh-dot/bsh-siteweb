// api/devis.js
// Version Universelle : Supporte SMTP classique OU l'API Resend (recommandée sur Vercel)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { fullName, phoneNumber, emailAddress, cityLocation, serviceType, projectDescription } = req.body;

  if (!fullName || !phoneNumber || !cityLocation || !serviceType || !projectDescription) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-top: 0;">🏗️ Nouvelle Demande de Devis BSH</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 180px;">Nom complet :</td>
          <td style="padding: 8px 0;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Téléphone / WhatsApp :</td>
          <td style="padding: 8px 0;"><a href="tel:${phoneNumber}">${phoneNumber}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Adresse de messagerie :</td>
          <td style="padding: 8px 0;"><a href="mailto:${emailAddress}">${emailAddress || 'Non fourni'}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Localisation du projet :</td>
          <td style="padding: 8px 0;">${cityLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Type de prestation :</td>
          <td style="padding: 8px 0;"><span style="background: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 30px; font-size: 0.9rem; font-weight: bold;">${serviceType}</span></td>
        </tr>
      </table>
      
      <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
        <h4 style="margin-top: 0; color: #1e293b;">Description détaillée du projet :</h4>
        <p style="margin-bottom: 0; white-space: pre-line; color: #475569;">${projectDescription}</p>
      </div>
    </div>
  `;

  // OPTION A : Envoi via l'API RESEND (recommandée par Vercel, ultra-simple et gratuite)
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'BSH Devis <devis@bestservicesandhouse.site>',
          to: ['devis@bestservicesandhouse.site'],
          reply_to: emailAddress || 'contact@bestservicesandhouse.site',
          subject: `[Devis BSH] ${serviceType} - ${fullName}`,
          html: htmlContent
        })
      });

      const resData = await response.json();
      if (response.ok) {
        return res.status(200).json({ success: true, message: 'Devis envoyé avec succès via Resend !' });
      } else {
        throw new Error(resData.message || 'Erreur API Resend');
      }
    } catch (error) {
      console.error('Erreur API Resend :', error);
      return res.status(500).json({ error: 'Erreur d\'envoi via Resend : ' + error.message });
    }
  }

  // OPTION B : Envoi via SMTP classique (si pas de clé Resend définie)
  if (process.env.SMTP_PASS_DEVIS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.bestservicesandhouse.site',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER_DEVIS || 'devis@bestservicesandhouse.site',
        pass: process.env.SMTP_PASS_DEVIS
      }
    });

    const mailOptions = {
      from: `"Demande de Devis BSH" <${process.env.SMTP_USER_DEVIS || 'devis@bestservicesandhouse.site'}>`,
      to: 'devis@bestservicesandhouse.site',
      replyTo: emailAddress || 'contact@bestservicesandhouse.site',
      subject: `[Devis BSH] ${serviceType} - ${fullName}`,
      html: htmlContent
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: 'Devis envoyé avec succès via SMTP !' });
    } catch (error) {
      console.error('Erreur SMTP Devis :', error);
      return res.status(500).json({ error: 'Erreur d\'envoi SMTP : ' + error.message });
    }
  }

  return res.status(500).json({ error: 'Configuration de messagerie manquante sur Vercel (définissez RESEND_API_KEY ou SMTP_PASS_DEVIS).' });
}
