import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

const SLUG_TO_GAME_ID: Record<string, number> = {
  'carpim-yarisi': 1,
  'carpim-tablosu': 1,
  'kesir-pizzacisi': 13,
  'pizza-ustasi': 13,
  'kesir-duellosu': 7,
  'sayi-duellosu': 19,
  'matematik-duellosu': 19,
  'balon-patlatma': 11,
  'zihin-jimnastigi': 2,
  'renkli-matematik': 3,
  'adam-asmaca': 4,
  'sayi-bulmaca': 5,
  'matematik-memory': 6,
  'denklem-avcisi': 8,
  'yuzde-firtinasi': 9,
  matmatik: 10,
  'uzay-roket': 12,
  'uzay-roketi': 12,
  'matematik-ninja': 14,
  'kostebek-avi': 15,
  'hizli-sofor': 16,
  'koordinat-korsani': 17,
  'sayi-kulesi': 18,
  'penalti-sampiyonu': 20,
  'iksir-laboratuvari': 21,
  'dinozor-macerasi': 22,
  'meteor-savunmasi': 23,
  'gizli-ajan': 24,
  'kasa-sifresi': 24,
  'okcu-sampiyonu': 25,
  'garaj-yarisi': 26,
  'togg-yarisi': 26,
  'pac-matik': 27,
};

export default async function OyunSlugRedirectPage({ params }: Props) {
  const { slug } = await params;
  const normalized = (slug || '').toLowerCase().trim();
  const gameId = SLUG_TO_GAME_ID[normalized];

  if (gameId) {
    redirect(`/oyunlar?id=${gameId}`);
  }

  redirect('/oyunlar');
}
