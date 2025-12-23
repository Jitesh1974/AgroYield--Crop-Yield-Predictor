import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

interface LocationFormProps {
  onNext: (data: { district: string; taluka: string }) => void;
  onBack: () => void;
}

const LocationForm = ({ onNext, onBack }: LocationFormProps) => {
  const [district, setDistrict] = useState("");

  const handleNext = () => {
    if (district.trim()) {
      onNext({ district: district.trim(), taluka: "" });
    }
  };

  const isValid = district.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 bg-gradient-to-br from-card to-accent/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-primary font-semibold">Step 1 of 5</span>
            <span className="text-muted-foreground">20% Complete</span>
          </div>
          <div className="mb-4 h-2 bg-progress-bg rounded-full overflow-hidden">
            <div className="h-full w-[20%] progress-enhanced rounded-full animate-progress transition-all duration-1000"></div>
          </div>
          
          <div className="mb-4 flex justify-center animate-bounce-subtle">
            <div className="rounded-full bg-primary/10 p-4 animate-glow">
              <MapPin className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            District Location
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the name of your district to help us provide location-specific recommendations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium">
              District Name
            </Label>
            <Input
              id="district"
              type="text"
              placeholder="e.g., Pune, Nagpur, Mumbai"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border-border focus-ring-primary focus:border-primary/50 focus:shadow-lg transition-all duration-300"
            />
          </div>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0 animate-glow" />
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> District information helps us consider local climate patterns and soil characteristics.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled className="flex items-center gap-2 hover:bg-muted/50 transition-all duration-300 group">
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

export default LocationForm;