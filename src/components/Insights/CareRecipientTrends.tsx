import React, { useEffect, useState } from 'react';
import { HeartIcon, ActivityIcon, TrendingUpIcon, TrendingDownIcon, ClockIcon, CalendarIcon, AlertCircleIcon, ThermometerIcon, DropletIcon, PillIcon } from 'lucide-react';
import { dataService } from '../../services/DataService';
import { analytics, AnalyticsEvents } from '../../services/AnalyticsService';
interface CareRecipientTrendsProps {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
}
export const CareRecipientTrends: React.FC<CareRecipientTrendsProps> = ({
  startDate,
  endDate,
  previousStartDate,
  previousEndDate
}) => {
  const [trends, setTrends] = useState({
    vitalSigns: {
      bloodPressure: {
        current: {
          systolic: 0,
          diastolic: 0
        },
        previous: {
          systolic: 0,
          diastolic: 0
        },
        change: {
          systolic: 0,
          diastolic: 0
        },
        readings: []
      },
      bloodGlucose: {
        current: 0,
        previous: 0,
        change: 0,
        readings: []
      },
      weight: {
        current: 0,
        previous: 0,
        change: 0,
        readings: []
      }
    },
    medicationAdherence: {
      current: 0,
      previous: 0,
      change: 0,
      byMedication: {}
    },
    sleepPattern: {
      averageHours: {
        current: 0,
        previous: 0,
        change: 0
      },
      quality: {
        current: 0,
        previous: 0,
        change: 0
      },
      readings: []
    },
    moodTrend: {
      current: 0,
      previous: 0,
      change: 0,
      readings: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vitals');
  useEffect(() => {
    loadTrends();
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_recipient_trends_viewed',
      date_range: `${startDate} to ${endDate}`,
      tab: activeTab
    });
  }, [startDate, endDate, previousStartDate, previousEndDate, activeTab]);
  const loadTrends = async () => {
    setIsLoading(true);
    // In a real app, this would fetch actual health data from a database
    // For this demo, we'll generate synthetic data
    // Generate blood pressure readings
    const bpReadings = generateBloodPressureReadings(startDate, endDate);
    const previousBpReadings = previousStartDate && previousEndDate ? generateBloodPressureReadings(previousStartDate, previousEndDate) : [];
    // Calculate average blood pressure
    const currentBp = calculateAverageBloodPressure(bpReadings);
    const previousBp = calculateAverageBloodPressure(previousBpReadings);
    // Calculate blood pressure change
    const bpChange = {
      systolic: previousBp.systolic > 0 ? (currentBp.systolic - previousBp.systolic) / previousBp.systolic * 100 : 0,
      diastolic: previousBp.diastolic > 0 ? (currentBp.diastolic - previousBp.diastolic) / previousBp.diastolic * 100 : 0
    };
    // Generate blood glucose readings
    const glucoseReadings = generateGlucoseReadings(startDate, endDate);
    const previousGlucoseReadings = previousStartDate && previousEndDate ? generateGlucoseReadings(previousStartDate, previousEndDate) : [];
    // Calculate average blood glucose
    const currentGlucose = calculateAverage(glucoseReadings.map(r => r.value));
    const previousGlucose = calculateAverage(previousGlucoseReadings.map(r => r.value));
    // Calculate blood glucose change
    const glucoseChange = previousGlucose > 0 ? (currentGlucose - previousGlucose) / previousGlucose * 100 : 0;
    // Generate weight readings
    const weightReadings = generateWeightReadings(startDate, endDate);
    const previousWeightReadings = previousStartDate && previousEndDate ? generateWeightReadings(previousStartDate, previousEndDate) : [];
    // Calculate average weight
    const currentWeight = calculateAverage(weightReadings.map(r => r.value));
    const previousWeight = calculateAverage(previousWeightReadings.map(r => r.value));
    // Calculate weight change
    const weightChange = previousWeight > 0 ? (currentWeight - previousWeight) / previousWeight * 100 : 0;
    // Generate medication adherence data
    const medicationAdherence = generateMedicationAdherence(startDate, endDate);
    const previousMedicationAdherence = previousStartDate && previousEndDate ? generateMedicationAdherence(previousStartDate, previousEndDate) : {
      overall: 0,
      byMedication: {}
    };
    // Calculate medication adherence change
    const adherenceChange = previousMedicationAdherence.overall > 0 ? (medicationAdherence.overall - previousMedicationAdherence.overall) / previousMedicationAdherence.overall * 100 : 0;
    // Generate sleep data
    const sleepData = generateSleepData(startDate, endDate);
    const previousSleepData = previousStartDate && previousEndDate ? generateSleepData(previousStartDate, previousEndDate) : {
      averageHours: 0,
      quality: 0,
      readings: []
    };
    // Calculate sleep changes
    const sleepHoursChange = previousSleepData.averageHours > 0 ? (sleepData.averageHours - previousSleepData.averageHours) / previousSleepData.averageHours * 100 : 0;
    const sleepQualityChange = previousSleepData.quality > 0 ? (sleepData.quality - previousSleepData.quality) / previousSleepData.quality * 100 : 0;
    // Generate mood data
    const moodData = generateMoodData(startDate, endDate);
    const previousMoodData = previousStartDate && previousEndDate ? generateMoodData(previousStartDate, previousEndDate) : {
      average: 0,
      readings: []
    };
    // Calculate mood change
    const moodChange = previousMoodData.average > 0 ? (moodData.average - previousMoodData.average) / previousMoodData.average * 100 : 0;
    // Set all trend data
    setTrends({
      vitalSigns: {
        bloodPressure: {
          current: currentBp,
          previous: previousBp,
          change: bpChange,
          readings: bpReadings
        },
        bloodGlucose: {
          current: Math.round(currentGlucose),
          previous: Math.round(previousGlucose),
          change: Math.round(glucoseChange),
          readings: glucoseReadings
        },
        weight: {
          current: Math.round(currentWeight * 10) / 10,
          previous: Math.round(previousWeight * 10) / 10,
          change: Math.round(weightChange),
          readings: weightReadings
        }
      },
      medicationAdherence: {
        current: medicationAdherence.overall,
        previous: previousMedicationAdherence.overall,
        change: Math.round(adherenceChange),
        byMedication: medicationAdherence.byMedication
      },
      sleepPattern: {
        averageHours: {
          current: Math.round(sleepData.averageHours * 10) / 10,
          previous: Math.round(previousSleepData.averageHours * 10) / 10,
          change: Math.round(sleepHoursChange)
        },
        quality: {
          current: Math.round(sleepData.quality),
          previous: Math.round(previousSleepData.quality),
          change: Math.round(sleepQualityChange)
        },
        readings: sleepData.readings
      },
      moodTrend: {
        current: Math.round(moodData.average * 10) / 10,
        previous: Math.round(previousMoodData.average * 10) / 10,
        change: Math.round(moodChange),
        readings: moodData.readings
      }
    });
    setIsLoading(false);
  };
  // Generate synthetic blood pressure readings
  const generateBloodPressureReadings = (start: string, end: string) => {
    const readings = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    // Generate one reading per day
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // Generate random values with realistic ranges for an elderly person with hypertension
      const systolic = Math.round(135 + (Math.random() * 20 - 10)); // 125-145 range
      const diastolic = Math.round(85 + (Math.random() * 10 - 5)); // 80-90 range
      readings.push({
        date: date.toISOString().split('T')[0],
        time: '09:00',
        systolic,
        diastolic
      });
    }
    return readings;
  };
  // Calculate average blood pressure
  const calculateAverageBloodPressure = readings => {
    if (readings.length === 0) {
      return {
        systolic: 0,
        diastolic: 0
      };
    }
    const systolicSum = readings.reduce((sum, reading) => sum + reading.systolic, 0);
    const diastolicSum = readings.reduce((sum, reading) => sum + reading.diastolic, 0);
    return {
      systolic: Math.round(systolicSum / readings.length),
      diastolic: Math.round(diastolicSum / readings.length)
    };
  };
  // Generate synthetic blood glucose readings
  const generateGlucoseReadings = (start: string, end: string) => {
    const readings = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    // Generate two readings per day (morning and evening)
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      // Morning reading (fasting) - slightly lower
      const morningValue = Math.round(120 + (Math.random() * 30 - 15)); // 105-135 range
      readings.push({
        date: dateStr,
        time: '08:00',
        value: morningValue,
        label: 'Fasting'
      });
      // Evening reading (after dinner) - slightly higher
      const eveningValue = Math.round(140 + (Math.random() * 40 - 20)); // 120-160 range
      readings.push({
        date: dateStr,
        time: '19:00',
        value: eveningValue,
        label: 'After dinner'
      });
    }
    return readings;
  };
  // Generate synthetic weight readings
  const generateWeightReadings = (start: string, end: string) => {
    const readings = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    // Base weight - 68 kg for an elderly person
    let baseWeight = 68;
    // Generate one reading every 3 days
    for (let i = 0; i < dayCount; i += 3) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // Small random fluctuation
      const fluctuation = Math.random() * 0.6 - 0.3; // -0.3 to +0.3 kg
      const weight = baseWeight + fluctuation;
      readings.push({
        date: date.toISOString().split('T')[0],
        time: '08:30',
        value: Math.round(weight * 10) / 10 // Round to 1 decimal place
      });
      // Small trend over time (slight weight loss)
      baseWeight -= 0.05;
    }
    return readings;
  };
  // Generate synthetic medication adherence data
  const generateMedicationAdherence = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    // Get patient medications
    const patient = dataService.getPatient();
    const medications = patient.medications;
    // Generate adherence data for each medication
    const byMedication = {};
    medications.forEach(med => {
      // Generate random adherence rate between 75% and 95%
      const adherenceRate = Math.round(75 + Math.random() * 20);
      byMedication[med.name] = {
        rate: adherenceRate,
        missed: Math.round(dayCount * med.time.length * (100 - adherenceRate) / 100),
        total: dayCount * med.time.length
      };
    });
    // Calculate overall adherence rate
    let totalDoses = 0;
    let totalTaken = 0;
    Object.values(byMedication).forEach((med: any) => {
      totalDoses += med.total;
      totalTaken += med.total - med.missed;
    });
    const overallRate = totalDoses > 0 ? Math.round(totalTaken / totalDoses * 100) : 0;
    return {
      overall: overallRate,
      byMedication
    };
  };
  // Generate synthetic sleep data
  const generateSleepData = (start: string, end: string) => {
    const readings = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    let totalHours = 0;
    let totalQuality = 0;
    // Generate one reading per day
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // Generate random values
      const hours = 5.5 + Math.random() * 3; // 5.5-8.5 hours range
      const quality = Math.round(60 + Math.random() * 30); // 60-90 quality range (0-100 scale)
      totalHours += hours;
      totalQuality += quality;
      readings.push({
        date: date.toISOString().split('T')[0],
        hours: Math.round(hours * 10) / 10,
        quality
      });
    }
    return {
      averageHours: totalHours / dayCount,
      quality: totalQuality / dayCount,
      readings
    };
  };
  // Generate synthetic mood data
  const generateMoodData = (start: string, end: string) => {
    const readings = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    let totalMood = 0;
    // Generate one reading per day
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      // Generate random values on a 1-5 scale
      const mood = 2.5 + (Math.random() * 2 - 1); // 1.5-3.5 range
      totalMood += mood;
      readings.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(mood * 10) / 10
      });
    }
    return {
      average: totalMood / dayCount,
      readings
    };
  };
  // Helper function to calculate average
  const calculateAverage = (values: number[]) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    analytics.trackEvent(AnalyticsEvents.FEATURE_USED, {
      feature_name: 'care_recipient_trends_tab_changed',
      tab
    });
  };
  if (isLoading) {
    return <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>;
  }
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold flex items-center">
          <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
          Care Recipient Trends
        </h2>
        <p className="text-sm text-gray-500">
          {new Date(startDate).toLocaleDateString()} -{' '}
          {new Date(endDate).toLocaleDateString()}
        </p>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'vitals' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('vitals')}>
          <div className="flex items-center justify-center">
            <ActivityIcon className="w-4 h-4 mr-1" />
            Vital Signs
          </div>
        </button>
        <button className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'medications' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('medications')}>
          <div className="flex items-center justify-center">
            <PillIcon className="w-4 h-4 mr-1" />
            Medications
          </div>
        </button>
        <button className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'wellness' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => handleTabChange('wellness')}>
          <div className="flex items-center justify-center">
            <HeartIcon className="w-4 h-4 mr-1" />
            Wellness
          </div>
        </button>
      </div>
      {/* Tab Content */}
      <div className="p-4">
        {/* Vital Signs Tab */}
        {activeTab === 'vitals' && <div>
            {/* Blood Pressure */}
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-red-800 flex items-center">
                  <ActivityIcon className="w-4 h-4 mr-1" />
                  Blood Pressure
                </h3>
                <div className="text-xs text-gray-500">
                  {trends.vitalSigns.bloodPressure.readings.length} readings
                </div>
              </div>
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-red-700">
                    {trends.vitalSigns.bloodPressure.current.systolic}/
                    {trends.vitalSigns.bloodPressure.current.diastolic}
                  </div>
                  <div className="text-xs text-red-600">
                    vs. {trends.vitalSigns.bloodPressure.previous.systolic}/
                    {trends.vitalSigns.bloodPressure.previous.diastolic} in
                    previous period
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.vitalSigns.bloodPressure.change.systolic > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {trends.vitalSigns.bloodPressure.change.systolic > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                    {trends.vitalSigns.bloodPressure.change.systolic > 0 ? '+' : ''}
                    {Math.round(trends.vitalSigns.bloodPressure.change.systolic)}
                    %
                  </div>
                </div>
              </div>
              {/* Recent Readings */}
              <div>
                <h4 className="text-xs font-medium text-red-800 mb-1">
                  Recent Readings
                </h4>
                <div className="space-y-1">
                  {trends.vitalSigns.bloodPressure.readings.slice(-3).map((reading, index) => <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">
                          {formatDate(reading.date)}
                        </span>
                        <span className={`font-medium ${reading.systolic > 140 || reading.diastolic > 90 ? 'text-red-600' : reading.systolic < 120 && reading.diastolic < 80 ? 'text-green-600' : 'text-orange-600'}`}>
                          {reading.systolic}/{reading.diastolic}
                        </span>
                      </div>)}
                </div>
              </div>
            </div>
            {/* Blood Glucose */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-orange-800 flex items-center">
                  <DropletIcon className="w-4 h-4 mr-1" />
                  Blood Glucose
                </h3>
                <div className="text-xs text-gray-500">
                  {trends.vitalSigns.bloodGlucose.readings.length} readings
                </div>
              </div>
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {trends.vitalSigns.bloodGlucose.current} mg/dL
                  </div>
                  <div className="text-xs text-orange-600">
                    vs. {trends.vitalSigns.bloodGlucose.previous} mg/dL in
                    previous period
                  </div>
                </div>
                <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.vitalSigns.bloodGlucose.change > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {trends.vitalSigns.bloodGlucose.change > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                  {trends.vitalSigns.bloodGlucose.change > 0 ? '+' : ''}
                  {trends.vitalSigns.bloodGlucose.change}%
                </div>
              </div>
              {/* Recent Readings */}
              <div>
                <h4 className="text-xs font-medium text-orange-800 mb-1">
                  Recent Readings
                </h4>
                <div className="space-y-1">
                  {trends.vitalSigns.bloodGlucose.readings.slice(-3).map((reading, index) => <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">
                          {formatDate(reading.date)} ({reading.label})
                        </span>
                        <span className={`font-medium ${reading.value > 180 ? 'text-red-600' : reading.value < 100 ? 'text-green-600' : 'text-orange-600'}`}>
                          {reading.value} mg/dL
                        </span>
                      </div>)}
                </div>
              </div>
            </div>
            {/* Weight */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-blue-800 flex items-center">
                  <ActivityIcon className="w-4 h-4 mr-1" />
                  Weight
                </h3>
                <div className="text-xs text-gray-500">
                  {trends.vitalSigns.weight.readings.length} readings
                </div>
              </div>
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {trends.vitalSigns.weight.current} kg
                  </div>
                  <div className="text-xs text-blue-600">
                    vs. {trends.vitalSigns.weight.previous} kg in previous
                    period
                  </div>
                </div>
                <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.vitalSigns.weight.change > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {trends.vitalSigns.weight.change > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                  {trends.vitalSigns.weight.change > 0 ? '+' : ''}
                  {trends.vitalSigns.weight.change}%
                </div>
              </div>
              {/* Recent Readings */}
              <div>
                <h4 className="text-xs font-medium text-blue-800 mb-1">
                  Recent Readings
                </h4>
                <div className="space-y-1">
                  {trends.vitalSigns.weight.readings.slice(-3).map((reading, index) => <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">
                          {formatDate(reading.date)}
                        </span>
                        <span className="font-medium text-blue-600">
                          {reading.value} kg
                        </span>
                      </div>)}
                </div>
              </div>
            </div>
          </div>}
        {/* Medications Tab */}
        {activeTab === 'medications' && <div>
            {/* Overall Adherence */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-green-800 flex items-center">
                  <PillIcon className="w-4 h-4 mr-1" />
                  Medication Adherence
                </h3>
                <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.medicationAdherence.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {trends.medicationAdherence.change >= 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                  {trends.medicationAdherence.change > 0 ? '+' : ''}
                  {trends.medicationAdherence.change}%
                </div>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-green-700">
                  {trends.medicationAdherence.current}%
                </div>
                <div className="text-xs text-green-600">
                  vs. {trends.medicationAdherence.previous}% in previous period
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${trends.medicationAdherence.current < 70 ? 'bg-red-500' : trends.medicationAdherence.current < 85 ? 'bg-orange-500' : 'bg-green-500'}`} style={{
                width: `${trends.medicationAdherence.current}%`
              }}></div>
                </div>
              </div>
            </div>
            {/* By Medication */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Adherence by Medication
              </h3>
              <div className="space-y-3">
                {Object.entries(trends.medicationAdherence.byMedication).map(([medName, data]: [string, any]) => <div key={medName} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">{medName}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${data.rate < 70 ? 'bg-red-100 text-red-800' : data.rate < 85 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {data.rate}%
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {data.missed} doses missed out of {data.total}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${data.rate < 70 ? 'bg-red-500' : data.rate < 85 ? 'bg-orange-500' : 'bg-green-500'}`} style={{
                  width: `${data.rate}%`
                }}></div>
                      </div>
                    </div>)}
              </div>
            </div>
          </div>}
        {/* Wellness Tab */}
        {activeTab === 'wellness' && <div>
            {/* Sleep Pattern */}
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-indigo-800 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Sleep Pattern
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-indigo-700 mb-1">
                    Average Hours
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-indigo-800">
                      {trends.sleepPattern.averageHours.current}h
                    </div>
                    <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.sleepPattern.averageHours.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {trends.sleepPattern.averageHours.change > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                      {trends.sleepPattern.averageHours.change > 0 ? '+' : ''}
                      {trends.sleepPattern.averageHours.change}%
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-indigo-700 mb-1">
                    Sleep Quality
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-indigo-800">
                      {trends.sleepPattern.quality.current}/100
                    </div>
                    <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.sleepPattern.quality.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {trends.sleepPattern.quality.change > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                      {trends.sleepPattern.quality.change > 0 ? '+' : ''}
                      {trends.sleepPattern.quality.change}%
                    </div>
                  </div>
                </div>
              </div>
              {/* Recent Sleep Data */}
              <div>
                <h4 className="text-xs font-medium text-indigo-800 mb-1">
                  Recent Sleep Data
                </h4>
                <div className="space-y-1">
                  {trends.sleepPattern.readings.slice(-3).map((reading, index) => <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">
                          {formatDate(reading.date)}
                        </span>
                        <div className="flex space-x-3">
                          <span className="text-indigo-600">
                            {reading.hours}h
                          </span>
                          <span className={`${reading.quality < 60 ? 'text-red-600' : reading.quality < 75 ? 'text-orange-600' : 'text-green-600'}`}>
                            {reading.quality}/100
                          </span>
                        </div>
                      </div>)}
                </div>
              </div>
            </div>
            {/* Mood Trend */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-purple-800 flex items-center">
                  <HeartIcon className="w-4 h-4 mr-1" />
                  Mood Trend
                </h3>
                <div className={`text-xs flex items-center px-2 py-0.5 rounded-full ${trends.moodTrend.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {trends.moodTrend.change > 0 ? <TrendingUpIcon className="w-3 h-3 mr-0.5" /> : <TrendingDownIcon className="w-3 h-3 mr-0.5" />}
                  {trends.moodTrend.change > 0 ? '+' : ''}
                  {trends.moodTrend.change}%
                </div>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-purple-700">
                  {trends.moodTrend.current}/5
                </div>
                <div className="text-xs text-purple-600">
                  vs. {trends.moodTrend.previous}/5 in previous period
                </div>
              </div>
              {/* Recent Mood Data */}
              <div>
                <h4 className="text-xs font-medium text-purple-800 mb-1">
                  Recent Mood Ratings
                </h4>
                <div className="space-y-1">
                  {trends.moodTrend.readings.slice(-3).map((reading, index) => <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700">
                        {formatDate(reading.date)}
                      </span>
                      <span className={`font-medium ${reading.value < 2 ? 'text-red-600' : reading.value < 3 ? 'text-orange-600' : reading.value < 4 ? 'text-blue-600' : 'text-green-600'}`}>
                        {reading.value}/5
                      </span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
};