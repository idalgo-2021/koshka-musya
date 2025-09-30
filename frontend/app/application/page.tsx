"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationForm from "@/components/ApplicationForm";

export default function ApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    city: "",
    propertyTypes: [] as string[]
  });

  useEffect(() => {
    // Получаем данные из URL параметров
    const city = searchParams.get('city') || "";
    const propertyTypesParam = searchParams.get('propertyTypes');
    const propertyTypes = propertyTypesParam ? propertyTypesParam.split(',') : [];
    
    setFormData({
      city,
      propertyTypes
    });
  }, [searchParams]);

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accentgreen/20 via-accenttext/10 to-accentgreen/30 py-8">
      <ApplicationForm
        onBack={handleBack}
        initialData={formData}
      />
    </div>
  );
}
