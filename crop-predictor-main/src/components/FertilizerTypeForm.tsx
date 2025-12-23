import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Package, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

interface FertilizerTypeFormProps {
  onNext: (data: { fertilizerType: string }) => void;
  onBack: () => void;
}

const FertilizerTypeForm = ({ onNext, onBack }: FertilizerTypeFormProps) => {
  const [selectedFertilizer, setSelectedFertilizer] = useState("");

  const fertilizerOptions = [
    { value: "NPK (20-20-20)", description: "Balanced fertilizer for all-round growth" },
    { value: "Urea (46-0-0)", description: "High nitrogen for leaf development" },
    { value: "DAP (18-46-0)", description: "High phosphorus for root growth" },
    { value: "Potash (0-0-60)", description: "High potassium for fruit quality" },
    { value: "Complex (12-32-16)", description: "Balanced with emphasis on phosphorus" },
    { value: "Organic Compost", description: "Natural organic matter and nutrients" }
  ];

  const handleNext = () => {
    if (selectedFertilizer) {
      onNext({ fertilizerType: selectedFertilizer });
    }
  };

  const isValid = selectedFertilizer.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 bg-gradient-to-br from-card to-accent/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-primary font-semibold">Step 3 of 5</span>
            <span className="text-muted-foreground">60% Complete</span>
          </div>
          <div className="mb-4 h-2 bg-progress-bg rounded-full overflow-hidden">
            <div className="h-full w-[60%] progress-enhanced rounded-full animate-progress transition-all duration-1000"></div>
          </div>
          
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 animate-glow">
              <Package className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            Fertilizer Type
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select the type of fertilizer you are using or plan to use.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {fertilizerOptions.map((fertilizer) => (
              <Card
                key={fertilizer.value}
                className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-accent/5 ${
                  selectedFertilizer === fertilizer.value
                    ? "border-primary ring-2 ring-primary/20 shadow-lg selected-glow"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedFertilizer(fertilizer.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        {fertilizer.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fertilizer.description}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      selectedFertilizer === fertilizer.value
                        ? "border-primary bg-primary"
                        : "border-border group-hover:border-primary/50"
                    }`}>
                      {selectedFertilizer === fertilizer.value && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 mt-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0 animate-glow" />
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> Choose fertilizer based on your soil test results and crop requirements.
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

export default FertilizerTypeForm;