import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Topics from "./pages/Topics";
import Pricing from "./pages/Pricing";
import News from "./pages/News";
import Success from "./pages/Success";
import Hardware from "./pages/Hardware";
import HardwareDetail from "./pages/HardwareDetail";
import PromptEngineering from "./pages/PromptEngineering";
import PromptModule from "./pages/PromptModule";
import TopicDetail from "./pages/TopicDetail";
import Login from "./pages/Login";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/topics" component={Topics} />
      <Route path="/topics/:id" component={TopicDetail} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/news" component={News} />
      <Route path="/success" component={Success} />
      <Route path="/hardware" component={Hardware} />
      <Route path="/hardware/:id" component={HardwareDetail} />
      <Route path="/prompt-engineering" component={PromptEngineering} />
      <Route path="/prompt-engineering/:id" component={PromptModule} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
