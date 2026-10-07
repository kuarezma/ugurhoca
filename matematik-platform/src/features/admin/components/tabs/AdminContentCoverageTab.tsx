import { CurriculumCoverageReport } from '@/features/content/components/CurriculumCoverageReport';

export default function AdminContentCoverageTab() {
  return (
    <section className="rounded-3xl border border-default bg-surface-1 p-4 sm:p-6 space-y-4">
      <h2 className="font-display text-xl font-bold text-primary">
        İçerik Kapsamı
      </h2>
      <CurriculumCoverageReport />
    </section>
  );
}
