import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { activity, needs, name, email, phone } = body;

    if (!email || !activity) {
      return Response.json(
        { error: "Champs manquants." },
        { status: 400 }
      );
    }

    const needsList =
      needs && needs.length > 0
        ? needs.map((n) => `• ${n}`).join("\n")
        : "Aucun besoin sélectionné";

    await resend.emails.send({
      from: "Barren Contact <contact@barren.fr>",
      to: "xavier.yribarren@gmail.com",
      subject: `Nouveau lead — ${activity}`,
      text: `
Nouveau message depuis le formulaire de contact.

Nom / Entreprise : ${name || "—"}
Activité : ${activity}

Besoins :
${needsList}

Email : ${email}
Téléphone : ${phone || "—"}
      `.trim(),
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur Resend :", error);
    return Response.json(
      { error: "Erreur lors de l'envoi." },
      { status: 500 }
    );
  }
}