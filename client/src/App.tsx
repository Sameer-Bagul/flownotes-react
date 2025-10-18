import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Redirect } from "wouter";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Roadmaps from "./pages/Roadmaps";
import Shortcuts from "./pages/Shortcuts";

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Index} />
            <Route path="/roadmaps" component={Roadmaps} />
            <Route path="/shortcuts" component={Shortcuts} />
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;