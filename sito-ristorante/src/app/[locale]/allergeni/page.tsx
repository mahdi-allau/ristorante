import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDict } from '@/i18n/dictionaries';
import { pageMeta } from '@/lib/meta';
import LegalPage from '@/components/LegalPage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMeta(locale, '/allergeni', getDict(locale).legal.allergens.title);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} doc="allergens" />;
}
