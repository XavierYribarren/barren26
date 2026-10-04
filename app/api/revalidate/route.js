import { revalidateTag } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

// Webhook Sanity : invalide le cache des requêtes taguées 'project' (liste, détail, sitemap)
export async function POST(request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    console.error('Revalidate : SANITY_REVALIDATE_SECRET manquant')
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }

  try {
    // La signature porte sur le texte exact reçu : on lit le corps brut avant tout parsing
    const body = await request.text()
    const signature = request.headers.get(SIGNATURE_HEADER_NAME)

    if (!signature || !(await isValidSignature(body, signature, secret))) {
      return Response.json({ error: 'Signature invalide.' }, { status: 401 })
    }

    try {
      JSON.parse(body)
    } catch {
      return Response.json({ error: 'Corps JSON illisible.' }, { status: 400 })
    }

    revalidateTag('project')
    return Response.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error('Revalidate :', error)
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
