import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Thermometer, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

interface RainfallInputFormProps {
  onNext: (data: { rainfall: number; minTemp: number; maxTemp: number }) => void;
  onBack: () => void;
}

const RainfallInputForm = ({ onNext, onBack }: RainfallInputFormProps) => {
  const [rainfall, setRainfall] = useState(1150);
  const [minTemp, setMinTemp] = useState(15);
  const [maxTemp, setMaxTemp] = useState(30);

  const getRainfallFeedback = (value: number) => {
    if (value < 300) return { level: "Very Low", variant: "destructive" as const, message: "Insufficient for most crops" };
    if (value < 500) return { level: "Low", variant: "destructive" as const, message: "May require irrigation" };
    if (value <= 1500) return { level: "Good", variant: "default" as const, message: "Adequate rainfall for most crops" };
    if (value <= 2500) return { level: "High", variant: "secondary" as const, message: "Excellent for water-intensive crops" };
    return { level: "Very High", variant: "secondary" as const, message: "May cause waterlogging issues" };
  };

  const getTemperatureFeedback = (min: number, max: number) => {
    const avg = (min + max) / 2;
    if (avg < 15) return { level: "Cool", variant: "secondary" as const, message: "Suitable for cool-season crops" };
    if (avg <= 25) return { level: "Moderate", variant: "default" as const, message: "Ideal for most crops" };
    if (avg <= 35) return { level: "Warm", variant: "secondary" as const, message: "Good for heat-tolerant crops" };
    return { level: "Hot", variant: "destructive" as const, message: "May stress most crops" };
  };

  const handleNext = () => {
    if (rainfall > 0 && rainfall <= 5000 && minTemp >= 0 && maxTemp > minTemp) {
      onNext({ rainfall, minTemp, maxTemp });
    }
  };

  const isValid = rainfall > 0 && rainfall <= 5000 && minTemp >= 0 && maxTemp > minTemp;
  const rainfallFeedback = getRainfallFeedback(rainfall);
  const tempFeedback = getTemperatureFeedback(minTemp, maxTemp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 bg-gradient-to-br from-card to-accent/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-primary font-semibold">Step 4 of 5</span>
            <span className="text-muted-foreground">80% Complete</span>
          </div>
          <div className="mb-4 h-2 bg-progress-bg rounded-full overflow-hidden">
            <div className="h-full w-[80%] progress-enhanced rounded-full animate-progress transition-all duration-1000"></div>
          </div>
          
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 animate-glow">
              <CloudRain className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            Climate Conditions
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the rainfall and temperature range in your area for accurate predictions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Rainfall Section */}
          <Card className="bg-gradient-to-br from-accent/5 to-background border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-primary" />
                Rainfall Level
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="rainfall" className="text-sm font-medium">Annual Rainfall (mm)</Label>
              
              <div className="px-3">
                <Slider
                  value={[rainfall]}
                  onValueChange={(value) => setRainfall(value[0])}
                  max={4000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0mm</span>
                  <span>2000mm</span>
                  <span>4000mm</span>
                </div>
              </div>

              <Input
                id="rainfall"
                type="number"
                min="0"
                max="5000"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300 text-center text-lg font-semibold"
              />

              {rainfall > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rainfall Level:</span>
                    <Badge variant={rainfallFeedback.variant} className="text-sm">
                      {rainfallFeedback.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rainfallFeedback.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Temperature Section */}
          <Card className="bg-gradient-to-br from-secondary/5 to-background border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary" />
                Temperature Range
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="minTemp" className="text-sm font-medium">Avg. Minimum Temp (°C)</Label>
                  <Input
                    id="minTemp"
                    type="number"
                    min="0"
                    max="50"
                    value={minTemp}
                    onChange={(e) => setMinTemp(Number(e.target.value))}
                    className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                  />
                  <Slider
                    value={[minTemp]}
                    onValueChange={(value) => setMinTemp(value[0])}
                    max={40}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="maxTemp" className="text-sm font-medium">Avg. Maximum Temp (°C)</Label>
                  <Input
                    id="maxTemp"
                    type="number"
                    min="0"
                    max="50"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(Number(e.target.value))}
                    className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                  />
                  <Slider
                    value={[maxTemp]}
                    onValueChange={(value) => setMaxTemp(value[0])}
                    max={50}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-lg font-semibold text-primary">
                    {minTemp}°C - {maxTemp}°C
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-sm font-medium">Temperature Status:</span>
                  <Badge variant={tempFeedback.variant} className="text-sm">
                    {tempFeedback.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tempFeedback.message}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0 animate-glow" />
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> Accurate climate data is key. Use your area's annual rainfall (mm) and average growing season temperature range (°C) for best results.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-300 group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!isValid}
            className="flex items-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            Next
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RainfallInputForm;