import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Target, BarChart3, Sprout, Globe } from "lucide-react";
import heroImage from "@/assets/agricultural-hero.jpg";
import AgriculturalChatBot from "@/components/AgriculturalChatBot";

interface LandingPageProps {
  onStartPrediction: () => void;
}

const LandingPage = ({ onStartPrediction }: LandingPageProps) => {
  const [language, setLanguage] = useState("EN");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      {/* Fixed Header with Language Selector */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">EN</SelectItem>
                <SelectItem value="HI">HI</SelectItem>
                <SelectItem value="MR">MR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section 
        className="relative px-4 py-20 pt-32 text-center bg-cover bg-center animate-slide-up"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background/90"></div>
        
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-primary/10 p-6 animate-float">
              <Leaf className="h-16 w-16 text-primary animate-pulse-slow" />
            </div>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold text-foreground md:text-6xl animate-slide-up">
            Agricultural Yield Predictor
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground md:text-2xl animate-slide-up">
            Get accurate yield predictions for your crops based on soil conditions, 
            nutrients, rainfall, and fertilizer data using advanced agricultural analytics.
          </p>
          
          <Button 
            onClick={onStartPrediction}
            size="lg" 
            className="mb-4 px-8 py-6 text-lg font-semibold btn-primary-enhanced animate-slide-up"
            data-start-prediction
          >
            Start Yield Prediction
          </Button>
          
          <p className="text-sm text-muted-foreground animate-slide-up">
            ✅ Free analysis • Instant results
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Our advanced algorithm analyzes multiple factors to predict your crop yield percentage
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-0 bg-gradient-to-br from-card to-accent/10 card-elevated hover-lift">
              <CardHeader className="pb-4">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4 group-hover:animate-bounce-subtle">
                    <Target className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-center text-xl font-bold">Input Your Data</h3>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Provide details about your location, soil, nutrients, rainfall, 
                  fertilizer, and crop type
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-gradient-to-br from-card to-accent/10 card-elevated hover-lift">
              <CardHeader className="pb-4">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4 group-hover:animate-bounce-subtle">
                    <BarChart3 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-center text-xl font-bold">AI Analysis</h3>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Our algorithm processes your data considering crop requirements 
                  and seasonal growing conditions
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-gradient-to-br from-card to-accent/10 card-elevated hover-lift md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-primary/10 p-4 group-hover:animate-bounce-subtle">
                    <Sprout className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-center text-xl font-bold">Get Predictions</h3>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Receive detailed yield predictions with factor breakdowns 
                  and actionable insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="mb-4 text-2xl font-bold text-foreground">
            Ready to Optimize Your Crop Yield?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Get started with your yield prediction in just a few minutes
          </p>
          <Button 
            onClick={onStartPrediction}
            size="lg" 
            className="px-8 py-6 text-lg font-semibold btn-primary-enhanced"
          >
            Start Your Analysis
          </Button>
        </div>
      </section>

      {/* Agri-Assistant Chatbot */}
      <AgriculturalChatBot onStartPrediction={onStartPrediction} />
    </div>
  );
};

export default LandingPage;