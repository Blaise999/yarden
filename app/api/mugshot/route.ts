import { NextRequest, NextResponse } from 'next/server';
import { sameOriginRequest, clientRateKey } from '../../../libs/adminAuth';
import { rateLimited } from '../../../libs/persistence';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MODEL = 'gpt-image-1.5';

function acceptedImageType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v)) return 'image/png';
  if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...b.subarray(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

/** A self-contained temporary editing request. No fan photos or outputs are persisted. */
export async function POST(req: NextRequest) {
  if (!sameOriginRequest(req)) return NextResponse.json({ error: 'Request origin rejected.' }, { status: 403 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Mugshot generation is not configured yet. The site owner must add OPENAI_API_KEY on the server.' }, { status: 503 });
  if (Number(req.headers.get('content-length') || 0) > MAX_FILE_SIZE + 120_000) return NextResponse.json({ error: 'Upload too large.' }, { status: 413 });

  try {
    const form = await req.formData();
    const photo = form.get('photo');
    if (!(photo instanceof File) || form.get('consent') !== 'yes') {
      return NextResponse.json({ error: 'Choose a selfie and agree to AI photo processing.' }, { status: 400 });
    }
    if (!photo.size || photo.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Please upload a photo under 3 MB.' }, { status: 413 });
    const buffer = await photo.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const type = acceptedImageType(bytes);
    if (!type || type !== photo.type) return NextResponse.json({ error: 'Use a valid JPEG, PNG or WebP selfie.' }, { status: 400 });
    // Persistent limits before billable API requests: 3 per visitor/hour and a site-wide daily budget.
    if (await rateLimited(clientRateKey(req, 'mugshot-ai'), 3, 60 * 60)) {
      return NextResponse.json({ error: 'Three mugshots per hour is the limit. Please try again later.' }, { status: 429 });
    }
    const dailyCap = Math.max(1, Math.min(10000, Number(process.env.MUGSHOT_DAILY_LIMIT) || 100));
    if (await rateLimited(`yarden:mugshot:global:${new Date().toISOString().slice(0, 10)}`, dailyCap, 25 * 60 * 60)) {
      return NextResponse.json({ error: 'Today’s ANGEL photo allocation has been used. Please return tomorrow.' }, { status: 429 });
    }

    const image = new FormData();
    image.append('model', MODEL);
    image.append('image[]', new Blob([buffer], { type }), type === 'image/png' ? 'fan.png' : type === 'image/webp' ? 'fan.webp' : 'fan.jpg');
    image.append('quality', 'high');
    image.append('input_fidelity', 'high');
    image.append('size', '1024x1536');
    image.append('n', '1');
    image.append('output_format', 'jpeg');
    image.append('output_compression', '86');
    image.append('prompt', [
      'Transform the INPUT SELFIE into a single highly realistic premium editorial music-promo mugshot photograph.',
      'IDENTITY FIRST: the subject is the exact SAME real person as in the selfie. Preserve their facial features, skin tone, hairstyle, facial proportions, age, identity, and distinguishing details as faithfully as possible. One person only.',
      'Composition: portrait 2:3. Front-facing centered head and shoulders. The subject wears a simple black top, looking directly into the lens with a calm confident expression. Soft authentic police-station photographic lighting, realistic skin texture and grain, no heavy beautification, no fantasy art.',
      'Behind the subject: off-white vintage booking-height wall with evenly spaced dark gray horizontal lines. No numbers or text on the wall.',
      'The person physically HOLDS a large PERFECTLY LEVEL BLACK RECTANGULAR booking slate at chest height, with their real-looking hands grasping ONLY its outside left and right edges. Board spans x=16% to x=84% of the canvas, y=61% to y=83% of the canvas. The complete board surface is flat, pitch black and entirely BLANK: no text, numbers, markings, decoration or symbols on it. Maintain hands visible at its side edges. Keep upper half of face clearly unobstructed.',
      'This is a clearly fictional music-album promotion, not an actual arrest, not a police document.',
      'Keep the slate position and blank surface precisely as directed: our website will overlay the official typography afterward. Make it look like a tangible slate with natural fingers and realistic light reflections at the edges.',
      'Photographic realism is paramount; avoid cartoon, 3D rendering, collage, filters, made-up logos, watermark, fake lettering, distorted hands, or face swapping to a different identity.',
    ].join('\n'));

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: image,
      signal: AbortSignal.timeout(105_000),
      cache: 'no-store',
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      // Intentionally don't leak upstream API details or credentials to users.
      console.error('Yarden mugshot image API failed:', response.status);
      return NextResponse.json({ error: response.status === 429 ? 'The image studio is busy. Please try again.' : 'Could not create this photo. Please try a different front-facing selfie.' }, { status: response.status === 429 ? 429 : 502 });
    }
    const resultImage = (result as { data?: { b64_json?: string }[] } | null)?.data?.[0]?.b64_json;
    if (!resultImage || resultImage.length > 4_000_000) return NextResponse.json({ error: 'The generated image could not be delivered. Try again.' }, { status: 502 });
    return NextResponse.json({ image: `data:image/jpeg;base64,${resultImage}` }, { headers: { 'Cache-Control': 'no-store, private' } });
  } catch (error) {
    console.error('Yarden mugshot request failed:', error instanceof Error ? error.name : 'Unknown');
    return NextResponse.json({ error: 'Image processing is unavailable at the moment. Please try again.' }, { status: 503 });
  }
}
