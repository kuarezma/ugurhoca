import { Skeleton } from '@/components/ui/Skeleton';

export default function GizlilikLoading() {
  return (
    <main className="min-h-screen px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-5/6' : 'w-full'}`} />
          ))}
        </div>
      </article>
    </main>
  );
}
