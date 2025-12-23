import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import LocationForm from "@/components/LocationForm";
import SoilNutrientForm from "@/components/SoilNutrientForm";
import FertilizerTypeForm from "@/components/FertilizerTypeForm";
import RainfallInputForm from "@/components/RainfallInputForm";
import CropSelectionForm from "@/components/CropSelectionForm";
import PredictionResults from "@/components/PredictionResults";

type Step = 'landing' | 'location' | 'soil' | 'fertilizer' | 'rainfall' | 'crop' | 'results';

interface FormData {
  location?: { district: string; taluka: string };
  soilData?: {
    soilColor: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
  };
  fertilizer?: { fertilizerType: string };
  rainfall?: { rainfall: number };
  crop?: { crop: string };
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>('landing');
  const [formData, setFormData] = useState<FormData>({});

  // Mock prediction calculation
  const calculatePrediction = (data: FormData) => {
    // Simple mock calculation based on the inputs
    const baseScore = 55;
    let score = baseScore;

    // Soil factors (simplified)
    if (data.soilData) {
      if (['Loam', 'Black'].includes(data.soilData.soilColor)) score += 10;
      if (data.soilData.nitrogen >= 100 && data.soilData.nitrogen <= 300) score += 5;
      if (data.soilData.phosphorus >= 50 && data.soilData.phosphorus <= 150) score += 5;
      if (data.soilData.potassium >= 150 && data.soilData.potassium <= 400) score += 5;
      if (data.soilData.pH >= 6.0 && data.soilData.pH <= 8.0) score += 5;
    }

    // Rainfall factors
    if (data.rainfall) {
      if (data.rainfall.rainfall >= 500 && data.rainfall.rainfall <= 1500) score += 8;
      else if (data.rainfall.rainfall > 1500) score += 3;
    }

    // Fertilizer match (simplified)
    if (data.fertilizer?.fertilizerType === 'Organic Compost') score += 5;

    // Cap at 100
    score = Math.min(100, score);

    return {
      mainScore: score,
      confidence: 90,
      location: `${data.location?.district}, ${data.location?.taluka}`,
      factorScores: {
        soilQuality: Math.min(100, 70 + (data.soilData ? 15 : 0)),
        nutrientBalance: Math.min(100, 40 + (data.soilData?.nitrogen || 0) * 0.1),
        weatherConditions: Math.min(100, 30 + (data.rainfall ? 25 : 0)),
        fertilizerEfficiency: 65,
      },
      inputSummary: {
        location: `${data.location?.district}, ${data.location?.taluka}` || 'Not provided',
        soilColor: data.soilData?.soilColor || 'Not provided',
        crop: data.crop?.crop || 'Not provided',
        nitrogen: data.soilData?.nitrogen || 0,
        phosphorus: data.soilData?.phosphorus || 0,
        potassium: data.soilData?.potassium || 0,
        pH: data.soilData?.pH || 0,
        rainfall: data.rainfall?.rainfall || 0,
        fertilizer: data.fertilizer?.fertilizerType || 'Not provided',
      },
      alternatives: [
        {
          name: 'Sorghum (Jowar)',
          suitability: 92,
          benefit: 'Tolerant to low rainfall and high soil iron content',
        },
        {
          name: 'Pearl Millet (Bajra)',
          suitability: 88,
          benefit: 'Excellent drought tolerance and adapts to various soils',
        },
        {
          name: 'Finger Millet (Ragi)',
          suitability: 85,
          benefit: 'Thrives in marginal lands with minimal water requirements',
        },
      ],
    };
  };

  const handleStartPrediction = () => {
    setCurrentStep('location');
  };

  const handleLocationData = (locationData: { district: string; taluka: string }) => {
    setFormData(prev => ({ ...prev, location: locationData }));
    setCurrentStep('soil');
  };

  const handleSoilData = (soilData: {
    soilColor: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    pH: number;
  }) => {
    setFormData(prev => ({ ...prev, soilData }));
    setCurrentStep('fertilizer');
  };

  const handleFertilizerData = (fertilizerData: { fertilizerType: string }) => {
    setFormData(prev => ({ ...prev, fertilizer: fertilizerData }));
    setCurrentStep('rainfall');
  };

  const handleRainfallData = (rainfallData: { rainfall: number }) => {
    setFormData(prev => ({ ...prev, rainfall: rainfallData }));
    setCurrentStep('crop');
  };

  const handleCropData = (cropData: { crop: string }) => {
    const finalData = { ...formData, crop: cropData };
    setFormData(finalData);
    setCurrentStep('results');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'location':
        setCurrentStep('landing');
        break;
      case 'soil':
        setCurrentStep('location');
        break;
      case 'fertilizer':
        setCurrentStep('soil');
        break;
      case 'rainfall':
        setCurrentStep('fertilizer');
        break;
      case 'crop':
        setCurrentStep('rainfall');
        break;
      case 'results':
        setCurrentStep('crop');
        break;
    }
  };

  const handleCalculateAnother = () => {
    setFormData({});
    setCurrentStep('landing');
  };

  // Render current step
  switch (currentStep) {
    case 'landing':
      return <LandingPage onStartPrediction={handleStartPrediction} />;
    
    case 'location':
      return <LocationForm onNext={handleLocationData} onBack={handleBack} />;
    
    case 'soil':
      return <SoilNutrientForm onNext={handleSoilData} onBack={handleBack} />;
    
    case 'fertilizer':
      return <FertilizerTypeForm onNext={handleFertilizerData} onBack={handleBack} />;
    
    case 'rainfall':
      return <RainfallInputForm onNext={handleRainfallData} onBack={handleBack} />;
    
    case 'crop':
      return <CropSelectionForm onSubmit={handleCropData} onBack={handleBack} />;
    
    case 'results':
      return (
        <PredictionResults 
          results={calculatePrediction(formData)} 
          onCalculateAnother={handleCalculateAnother} 
        />
      );
    
    default:
      return <LandingPage onStartPrediction={handleStartPrediction} />;
  }
};

export default Index;