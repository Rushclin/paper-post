import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await transporter.sendMail({
        ...options,
        from: process.env.EMAIL_FROM 
      });
      console.log("Email envoyé:", info.messageId);
      return  true 
    } catch (error) {
      console.error("Erreur envoi email:", error);
      return false
    }
  }

  static async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_APP_URL}/verify-email?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Vérification de votre compte - Paper-post",
      html: `
        <h2>Vérification de votre compte</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${verificationUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Vérifier mon compte
        </a>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });
  }

  static async sendPasswordResetEmail(
    email: string,
    token: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Réinitialisation de mot de passe - Revue Scientifique",
      html: `
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
        <p>Ce lien expire dans 1 heure.</p>
      `,
    });
  }
}
