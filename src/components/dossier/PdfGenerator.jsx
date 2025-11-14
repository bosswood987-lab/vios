import { base44 } from "@/api/base44Client";

// Fonction pour charger html2pdf.js dynamiquement
const loadHtml2Pdf = () => {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) {
      resolve(window.html2pdf);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => resolve(window.html2pdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Fonction pour générer un PDF et l'envoyer par email
export const genererEtEnvoyerPdfParEmail = async (htmlContent, emailDestinataire, sujet, nomFichier, messageEmail, nomExpediteur) => {
  try {
    // Charger html2pdf.js
    const html2pdf = await loadHtml2Pdf();

    // Créer un élément temporaire avec le contenu HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    document.body.appendChild(tempDiv);

    // Configurer html2pdf
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${nomFichier}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    // Générer le PDF en tant que blob
    const pdfBlob = await html2pdf()
      .set(opt)
      .from(tempDiv)
      .output('blob');

    // Nettoyer
    document.body.removeChild(tempDiv);

    // Convertir le blob en File
    const pdfFile = new File([pdfBlob], `${nomFichier}.pdf`, { type: 'application/pdf' });

    // Uploader le PDF
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: pdfFile
    });

    // Créer le corps de l'email avec le lien de téléchargement
    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="white-space: pre-wrap; margin-bottom: 30px;">${messageEmail || 'Bonjour,\n\nVous trouverez ci-joint votre document médical.\n\nCordialement,'}</div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${file_url}" 
               download="${nomFichier}.pdf"
               style="background-color: #2563eb; 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;
                      font-weight: bold;
                      font-size: 16px;">
              📄 Télécharger le document PDF
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Ce lien de téléchargement est sécurisé et valide.</p>
            <p style="margin-top: 10px;"><em>${nomExpediteur || "Cabinet d'Ophtalmologie"}</em></p>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email avec le lien
    await base44.integrations.Core.SendEmail({
      to: emailDestinataire,
      subject: sujet,
      body: emailBody,
      from_name: nomExpediteur || "Cabinet d'Ophtalmologie"
    });

    return { success: true, file_url };
  } catch (error) {
    console.error('Erreur lors de la génération et envoi du PDF:', error);
    throw error;
  }
};