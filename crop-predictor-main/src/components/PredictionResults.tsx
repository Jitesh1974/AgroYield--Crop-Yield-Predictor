import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Leaf, Zap, CloudRain, Package, ArrowLeft } from "lucide-react";

interface ResultsProps {
  mainScore: number;
  confidence: number;
  location: string;
  factorScores: {
    soilQuality: number;
    nutrientBalance: number;
    weatherConditions: number;
    fertilizerEfficiency: number;
  };
  inputSummary: {
    location: string;
    soilColor: string;
    crop: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
    rainfall: number;
    fertilizer: string;
  };
  alternatives: Array<{
    name: string;
    suitability: number;
    benefit: string;
  }>;
}

interface PredictionResultsProps {
  results: ResultsProps;
  onCalculateAnother: () => void;
}

const PredictionResults = ({ results, onCalculateAnother }: PredictionResultsProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4">
      {/* Header Banner */}
      <div className="mb-8 rounded-lg bg-gradient-to-r from-primary to-primary-glow p-6 text-center text-primary-foreground shadow-lg">
        <div className="flex justify-center mb-4">
          <TrendingUp className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Yield Prediction Results</h1>
        <p className="text-primary-foreground/90">
          Based on your agricultural data for {results.location}
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Main Result Card */}
        <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-xl text-center">
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground mb-2">Average Yield Potential</p>
            <div className="text-6xl font-bold text-primary mb-4">
              {results.mainScore.toFixed(1)}%
            </div>
            <p className="text-lg text-foreground mb-4">Predicted Yield Efficiency</p>
            <p className="text-sm text-muted-foreground mb-6">
              Confidence Level: {results.confidence}%
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={results.mainScore} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Factor Scorecard */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Factor Analysis
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Soil Quality</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {results.factorScores.soilQuality}/100
                </div>
                <Progress value={results.factorScores.soilQuality} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Based on soil color and nutrient content
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Nutrient Balance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {results.factorScores.nutrientBalance}/100
                </div>
                <Progress value={results.factorScores.nutrientBalance} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nitrogen and phosphorous levels
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CloudRain className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Weather Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {results.factorScores.weatherConditions}/100
                </div>
                <Progress value={results.factorScores.weatherConditions} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Rainfall adequacy for selected crop
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Fertilizer Efficiency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">
                  {results.factorScores.fertilizerEfficiency}/100
                </div>
                <Progress value={results.factorScores.fertilizerEfficiency} className="mb-3" />
                <p className="text-sm text-muted-foreground">
                  Fertilizer type match for crop needs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Input Summary */}
        <Card className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Input Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-foreground">{results.inputSummary.location}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Soil Color</p>
                <p className="text-foreground">{results.inputSummary.soilColor}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Crop Type</p>
                <p className="text-foreground">{results.inputSummary.crop}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Nitrogen (ppm)</p>
                <p className="text-foreground">{results.inputSummary.nitrogen}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Phosphorus (ppm)</p>
                <p className="text-foreground">{results.inputSummary.phosphorus}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Potassium (ppm)</p>
                <p className="text-foreground">{results.inputSummary.potassium}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">pH Level</p>
                <p className="text-foreground">{results.inputSummary.pH}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Annual Rainfall (mm)</p>
                <p className="text-foreground">{results.inputSummary.rainfall}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Fertilizer Type</p>
                <p className="text-foreground">{results.inputSummary.fertilizer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Crops */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Alternative Crop Recommendations
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Based on your soil, nutrient, and rainfall data, these crops offer higher potential yield.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "WHEAT", yield: 92, fertilizer: "DAP (18-46-0)", month: "October - November" },
              { name: "SORGHUM (JOWAR)", yield: 88, fertilizer: "NPK (12-32-16)", month: "June - July" },
              { name: "PEARL MILLET (BAJRA)", yield: 85, fertilizer: "Urea (46-0-0)", month: "July - August" }
            ].map((crop, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-card to-accent/5 shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-fit">
                    <Badge className="bg-primary/10 text-primary border-primary text-lg px-4 py-2 rounded-full">
                      {crop.yield}% Yield
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-foreground">
                    {crop.name}
                  </CardTitle>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">Fertilizer:</span> {crop.fertilizer}</p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">Planting Month:</span> {crop.month}</p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Action */}
        <div className="text-center pb-8">
          <Button 
            onClick={onCalculateAnother}
            size="lg" 
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Calculate Another Prediction
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PredictionResults;