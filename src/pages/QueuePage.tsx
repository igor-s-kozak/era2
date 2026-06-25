import { useState } from "react";
import { QueueProvider, StatusBar, useQueue } from "@/features/generation-queue";
// import { QueuePage } from "@/pages/QueuePage";
import { Header } from "@/shared/ui/Header";
import { GenerationQueue } from "@/widgets/generation-queue";

function QueuePage() {
  return (
    <main className="min-h-screen bg-[var(--era-bg)]">
      <div className="max-w-[1115px] mx-auto px-10 py-10 lg:px-6 md:px-4 sm:px-4 sm:py-6">
        <GenerationQueue />
      </div>
    </main>
  );
}

// export default QueuePage;





// Simple in-app router: '/' shows a placeholder chat page, '/queue' shows QueuePage
type Route = "/" | "/queue";

function AppContent({ navigate }: { navigate: (r: Route) => void }) {
  const { activeTasks, avgProgress } = useQueue();

  return (
    <>
      {/* <Header
        onLogoClick={() => navigate("/")}
        onQueueClick={() => navigate("/queue")}
      /> */}

      {/* Status bar — global, above all content */}
      <StatusBar
        activeTasks={activeTasks}
        avgProgress={avgProgress}
        onNavigateToQueue={() => navigate("/queue")}
      />
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>("/queue");

  const navigate = (r: Route) => setRoute(r);

  return (
    <QueueProvider>
      <div className="min-h-screen bg-[var(--era-bg)] flex flex-col">
        <AppContent navigate={navigate} />
          <QueuePage />   
      </div>
    </QueueProvider>
  );
}

