import { GenerationQueue } from "@/widgets/generation-queue";

export default function QueuePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto px-4 py-10 max-md:py-6">
        <GenerationQueue />
      </div>
    </main>
  );
}