// api/recrutement.js
// Version Universelle : Supporte SMTP classique OU l'API Resend (avec pièce jointe en base64)
import nodemailer from 'nodemailer';
import multiparty from 'multiparty';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false
  }
};

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

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erreur multiparty :', err);
      return res.status(500).json({ error: 'Erreur lors de la lecture des fichiers.' });
    }

    const jobTitle = fields.jobTitle ? fields.jobTitle[0] : 'Poste non spécifié';
    const lastName = fields.lastName ? fields.lastName[0] : '';
    const firstName = fields.firstName ? fields.firstName[0] : '';
    const address = fields.address ? fields.address[0] : '';
    const nationality = fields.nationality ? fields.nationality[0] : '';
    const experience = fields.experience ? fields.experience[0] : '';
    const salary = fields.salary ? fields.salary[0] : '';
    const phone = fields.phone ? fields.phone[0] : '';
    const email = fields.email ? fields.email[0] : '';
    const motivation = fields.motivation ? fields.motivation[0] : '';

    if (!lastName || !firstName || !phone || !email || !motivation) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires (*).' });
    }

    const cvFile = files.cv ? files.cv[0] : null;
    if (!cvFile || cvFile.size === 0) {
      return res.status(400).json({ error: 'Le CV au format PDF est obligatoire.' });
    }

    if (!cvFile.originalFilename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Le fichier de CV doit être au format PDF.' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-top: 0;">💼 Nouvelle Candidature Reçue</h2>
        <p style="font-size: 1.1rem;">Poste ciblé : <strong style="color: #b45309;">${jobTitle}</strong></p>
        
        <h3 style="color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Profil du candidat</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 200px;">Nom complet :</td>
            <td style="padding: 6px 0;">${lastName.toUpperCase()} ${firstName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Nationalité :</td>
            <td style="padding: 6px 0;">${nationality || 'Non précisé'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Adresse :</td>
            <td style="padding: 6px 0;">${address}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Années d'expérience :</td>
            <td style="padding: 6px 0;"><strong>${experience} ans</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Prétention salariale :</td>
            <td style="padding: 6px 0; color: #10b981; font-weight: bold;">${salary}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Téléphone :</td>
            <td style="padding: 6px 0;"><a href="tel:${phone}">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email :</td>
            <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
        </table>
        
        <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <h4 style="margin-top: 0; color: #1e293b;">Message de motivation :</h4>
          <p style="margin-bottom: 0; white-space: pre-line; color: #475569;">${motivation}</p>
        </div>
      </div>
    `;

    // OPTION A : Envoi via l'API RESEND
    if (process.env.RESEND_API_KEY) {
      try {
        const cvBuffer = fs.readFileSync(cvFile.path);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'BSH Recrutement <recrutement@bestservicesandhouse.site>',
            to: ['recrutement@bestservicesandhouse.site'],
            reply_to: email,
            subject: `[Candidature BSH] ${jobTitle} - ${lastName.toUpperCase()} ${firstName}`,
            html: htmlContent,
            attachments: [
              {
                content: cvBuffer.toString('base64'),
                filename: `${lastName.toUpperCase()}_${firstName}_CV.pdf`
              }
            ]
          })
        });

        // Nettoyage du fichier temporaire
        fs.unlinkSync(cvFile.path);

        if (response.ok) {
          return res.status(200).json({ success: true, message: 'Candidature transmise avec succès via Resend !' });
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Erreur Resend');
        }
      } catch (error) {
        if (fs.existsSync(cvFile.path)) fs.unlinkSync(cvFile.path);
        console.error('Erreur Resend Recrutement :', error);
        return res.status(500).json({ error: 'Erreur d\'envoi Resend : ' + error.message });
      }
    }

    // OPTION B : Envoi via SMTP classique
    if (process.env.SMTP_PASS_RECRUTEMENT) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.bestservicesandhouse.site',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER_RECRUTEMENT || 'recrutement@bestservicesandhouse.site',
          pass: process.env.SMTP_PASS_RECRUTEMENT
        }
      });

      const mailOptions = {
        from: `"Candidatures BSH" <${process.env.SMTP_USER_RECRUTEMENT || 'recrutement@bestservicesandhouse.site'}>`,
        to: 'recrutement@bestservicesandhouse.site',
        replyTo: email,
        subject: `[Candidature BSH] ${jobTitle} - ${lastName.toUpperCase()} ${firstName}`,
        html: htmlContent,
        attachments: [
          {
            filename: `${lastName.toUpperCase()}_${firstName}_CV.pdf`,
            path: cvFile.path
          }
        ]
      };

      try {
        await transporter.sendMail(mailOptions);
        fs.unlinkSync(cvFile.path);
        return res.status(200).json({ success: true, message: 'Candidature transmise avec succès via SMTP !' });
      } catch (error) {
        if (fs.existsSync(cvFile.path)) fs.unlinkSync(cvFile.path);
        console.error('Erreur SMTP Recrutement :', error);
        return res.status(500).json({ error: 'Erreur d\'envoi SMTP : ' + error.message });
      }
    }

    // Nettoyage par défaut si aucune méthode configurée
    if (fs.existsSync(cvFile.path)) fs.unlinkSync(cvFile.path);
    return res.status(500).json({ error: 'Configuration de messagerie manquante sur Vercel (définissez RESEND_API_KEY ou SMTP_PASS_RECRUTEMENT).' });
  });
}
