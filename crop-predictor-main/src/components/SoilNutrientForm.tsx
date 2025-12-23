import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { TestTube, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

interface SoilData {
  soilColor: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
}

interface SoilNutrientFormProps {
  onNext: (data: SoilData) => void;
  onBack: () => void;
}

const SoilNutrientForm = ({ onNext, onBack }: SoilNutrientFormProps) => {
  const [soilColor, setSoilColor] = useState("Loam");
  const [nitrogen, setNitrogen] = useState<number>(130);
  const [phosphorus, setPhosphorus] = useState<number>(45);
  const [potassium, setPotassium] = useState<number>(180);
  const [pH, setPH] = useState<number>(6.8);

  const soilOptions = [
    {
      value: "Black",
      description: "Rich in organic matter",
      color: "#2d1b0e", // dark brown/black
      icon: null,
      texture: null
    },
    {
      value: "Brown",
      description: "Well-balanced nutrients",
      color: "#8B5C2A", // medium brown
      icon: null,
      texture: null
    },
    {
      value: "Red",
      description: "High iron content",
      color: "#B22222", // reddish-brown
      icon: null,
      texture: null
    },
    {
      value: "Sandy",
      description: "Well-drained",
      color: "#EED9B6", // light tan/beige
      icon: null,
      texture: "grainy"
    },
    {
      value: "Clay",
      description: "High water retention",
      color: "#D2B48C", // light orange/grey
      icon: null,
      texture: "cracked"
    },
    {
      value: "Loam",
      description: "Ideal soil type",
      color: "#4B2E09", // rich dark brown
      icon: "sprout",
      texture: null
    }
  ];

  const getNutrientLevel = (value: number, type: string): { level: string; variant: "destructive" | "secondary" | "default" } => {
    if (type === "nitrogen") {
      if (value < 100) return { level: "Low", variant: "destructive" };
      if (value > 200) return { level: "High", variant: "default" };
      return { level: "Medium", variant: "secondary" };
    }
    if (type === "phosphorus") {
      if (value < 30) return { level: "Low", variant: "destructive" };
      if (value > 60) return { level: "High", variant: "secondary" };
      return { level: "Optimal", variant: "default" };
    }
    if (type === "potassium") {
      if (value < 150) return { level: "Low", variant: "destructive" };
      if (value > 250) return { level: "High", variant: "secondary" };
      return { level: "Optimal", variant: "default" };
    }
    return { level: "Good", variant: "default" };
  };

  const getPHStatus = (value: number): { status: string; variant: "destructive" | "secondary" | "default" } => {
    if (value < 6.0) return { status: "Acidic", variant: "destructive" };
    if (value > 7.5) return { status: "Alkaline", variant: "secondary" };
    return { status: "Neutral", variant: "default" };
  };

  const handleNext = () => {
    if (soilColor && nitrogen > 0 && phosphorus > 0 && potassium > 0 && pH > 0) {
      onNext({ soilColor, nitrogen, phosphorus, potassium, pH });
    }
  };

  const isValid = soilColor.length > 0 && nitrogen > 0 && phosphorus > 0 && potassium > 0 && pH > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl border-0 bg-gradient-to-br from-card to-accent/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-primary font-semibold">Step 2 of 5</span>
            <span className="text-muted-foreground">40% Complete</span>
          </div>
          <div className="mb-4 h-2 bg-progress-bg rounded-full overflow-hidden">
            <div className="h-full w-[40%] progress-enhanced rounded-full animate-progress transition-all duration-1000"></div>
          </div>
          
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 animate-glow">
              <TestTube className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            Soil & Nutrient Composition
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the details about your soil composition and nutrient levels below (all values in ppm, except pH).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Soil Color Section */}
          <Card className="bg-gradient-to-br from-accent/5 to-background border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-foreground">Soil Color</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {soilOptions.map((option) => {
                  // Swatch style
                  const swatchGlow = soilColor === option.value ? "shadow-[0_0_0_4px_rgba(34,197,94,0.3)] ring-2 ring-primary/40 animate-glow" : "";
                  // Card background for all soil types
                  let cardBgStyle: React.CSSProperties = {};
                  if (option.value === "Sandy") {
                    cardBgStyle = {
                      backgroundColor: option.color,
                      backgroundImage: "repeating-linear-gradient(135deg, #eed9b6 0px, #eed9b6 2px, #e6cfa1 2px, #e6cfa1 4px)",
                      backgroundBlendMode: "multiply"
                    };
                  } else if (option.value === "Clay") {
                    cardBgStyle = {
                      backgroundColor: option.color,
                      backgroundImage: "repeating-linear-gradient(135deg, #d2b48c 0px, #d2b48c 3px, #bfa77a 3px, #bfa77a 6px)",
                      backgroundBlendMode: "multiply"
                    };
                  } else if (["Red", "Black", "Brown"].includes(option.value)) {
                    cardBgStyle = {
                      backgroundColor: option.color,
                      backgroundImage: "none"
                    };
                  } else if (option.value === "Loam") {
                    cardBgStyle = {
                      backgroundColor: option.color,
                      backgroundImage: "none"
                    };
                  }
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer border-2 flex flex-col items-center transition-all duration-300 hover:shadow-md hover:scale-105 ${
                        soilColor === option.value
                          ? "border-primary ring-2 ring-primary/20 shadow-lg selected-glow"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={cardBgStyle}
                      onClick={() => setSoilColor(option.value)}
                    >
                      <CardContent
                        className={`p-3 flex flex-col items-center gap-2 w-full
                          ${["Black","Red","Brown","Sandy","Clay"].includes(option.value) ? "text-white" : ""}
                          ${option.value === "Loam" ? "text-white" : ""}
                        `}
                      >
                        <div className="flex items-center gap-2 justify-center mb-1">
                          {/* Color swatch */}
                          <span
                            className={`inline-flex items-center justify-center rounded-full border border-border transition-all duration-300 ${swatchGlow}`}
                            style={{
                              backgroundColor: option.color,
                              width: soilColor === option.value ? 28 : 20,
                              height: soilColor === option.value ? 28 : 20,
                              boxShadow: soilColor === option.value ? "0 0 8px 2px rgba(34,197,94,0.25)" : undefined,
                              borderWidth: soilColor === option.value ? 2 : 1
                            }}
                          >
                            {/* Loam: sprout icon */}
                            {option.icon === "sprout" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="#22c55e"
                                className="w-4 h-4"
                              >
                                <path d="M10 18c.552 0 1-.448 1-1v-3.382c2.28-.463 4-2.484 4-4.868V4.5a.5.5 0 0 0-.5-.5c-2.485 0-4.5 2.015-4.5 4.5V17c0 .552.448 1 1 1zm-2-7.25c0 2.384 1.72 4.405 4 4.868V17a1 1 0 1 1-2 0v-8c0-2.485-2.015-4.5-4.5-4.5a.5.5 0 0 0-.5.5v4.25c0 2.384 1.72 4.405 4 4.868V17a1 1 0 1 1-2 0v-6.25z" />
                              </svg>
                            )}
                          </span>
                          {/* Clay: cracked earth icon */}
                          {option.value === "Clay" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="#a67c52"
                              className="w-4 h-4 opacity-80"
                            >
                              <path d="M2 18l4-6 2 3 3-5 4 6 3-5v7H2z" />
                            </svg>
                          )}
                          {/* Sandy: sand grains icon */}
                          {option.value === "Sandy" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="#e6cfa1"
                              className="w-4 h-4 opacity-80"
                            >
                              <circle cx="6" cy="14" r="2" />
                              <circle cx="14" cy="10" r="1.5" />
                              <circle cx="10" cy="6" r="1" />
                            </svg>
                          )}
                        </div>
                        <div className={`font-semibold text-sm
                          ${["Black","Red","Brown","Sandy","Clay"].includes(option.value) ? "text-white" : ""}
                          ${option.value === "Loam" ? "text-white" : ""}
                        `}>{option.value}</div>
                        <div className={`text-xs mt-1
                          ${["Black","Red","Brown","Sandy","Clay"].includes(option.value) ? "text-white/80" : ""}
                          ${option.value === "Loam" ? "text-white/80" : "text-muted-foreground"}
                        `}>
                          {option.description}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Nutrient Levels Section */}
          <Card className="bg-gradient-to-br from-secondary/5 to-background border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-foreground">Nutrient Levels</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="nitrogen" className="text-sm font-medium">Nitrogen Content (ppm)</Label>
                <Input
                  id="nitrogen"
                  type="number"
                  min="0"
                  max="300"
                  step="5"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(Number(e.target.value))}
                  className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                />
                <Slider
                  value={[nitrogen]}
                  onValueChange={(value) => setNitrogen(value[0])}
                  max={300}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Nitrogen Level:</span>
                  <Badge 
                    variant={getNutrientLevel(nitrogen, "nitrogen").variant} 
                    className="text-xs transition-all duration-300"
                  >
                    {getNutrientLevel(nitrogen, "nitrogen").level}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phosphorus" className="text-sm font-medium">Phosphorus Content (ppm)</Label>
                <Input
                  id="phosphorus"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(Number(e.target.value))}
                  className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                />
                <Slider
                  value={[phosphorus]}
                  onValueChange={(value) => setPhosphorus(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Phosphorus Level:</span>
                  <Badge 
                    variant={getNutrientLevel(phosphorus, "phosphorus").variant} 
                    className="text-xs transition-all duration-300"
                  >
                    {getNutrientLevel(phosphorus, "phosphorus").level}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="potassium" className="text-sm font-medium">Potassium Content (ppm)</Label>
                <Input
                  id="potassium"
                  type="number"
                  min="0"
                  max="400"
                  step="10"
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                />
                <Slider
                  value={[potassium]}
                  onValueChange={(value) => setPotassium(value[0])}
                  max={400}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Potassium Level:</span>
                  <Badge 
                    variant={getNutrientLevel(potassium, "potassium").variant} 
                    className="text-xs transition-all duration-300"
                  >
                    {getNutrientLevel(potassium, "potassium").level}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ph" className="text-sm font-medium">pH Content (0-14)</Label>
                <Input
                  id="ph"
                  type="number"
                  min="0"
                  max="14"
                  step="0.1"
                  value={pH}
                  onChange={(e) => setPH(Number(e.target.value))}
                  className="border-border focus-ring-primary focus:shadow-lg transition-all duration-300"
                />
                <Slider
                  value={[pH]}
                  onValueChange={(value) => setPH(value[0])}
                  max={14}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">pH Status:</span>
                  <Badge 
                    variant={getPHStatus(pH).variant} 
                    className="text-xs transition-all duration-300"
                  >
                    {getPHStatus(pH).status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0 animate-glow" />
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> Accurate nutrient levels are crucial. Values for Nitrogen, Phosphorus, and Potassium are typically measured in parts per million (ppm).
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

export default SoilNutrientForm;