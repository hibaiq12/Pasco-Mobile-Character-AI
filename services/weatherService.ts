
export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Overcast' | 'Rainy' | 'Stormy' | 'Windy' | 'Foggy' | 'Snowy' | 'Clear Night' | 'Cloudy Night' | 'Drizzle';

export interface WeatherData {
    condition: WeatherCondition;
    temperature: number;
    description: string;
    iconName: string;
    humidity: number;
    season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
    isRaining: boolean; // Helper for gameplay logic
}

// --- WEATHER STATE ENGINE ---

// Weather Tiers for logical sequencing
// 0: Clear/Sunny
// 1: Cloudy
// 2: Overcast
// 3: Drizzle
// 4: Rain
// 5: Storm
const WEATHER_TIERS: WeatherCondition[] = [
    'Sunny',      // 0
    'Cloudy',     // 1
    'Overcast',   // 2
    'Drizzle',    // 3
    'Rainy',      // 4
    'Stormy'      // 5
];

interface WeatherState {
    currentTier: number;
    targetTier: number;
    lastMajorUpdate: number; // Real-world timestamp
    lastMicroUpdate: number; // Real-world timestamp
    currentTempOffset: number;
    season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}

// Singleton State (In-Memory persistence)
let weatherState: WeatherState = {
    currentTier: 0,
    targetTier: 0,
    lastMajorUpdate: 0,
    lastMicroUpdate: 0,
    currentTempOffset: 0,
    season: 'Summer'
};

const MIN_MAJOR_INTERVAL = 20 * 60 * 1000; // 20 Minutes
const MAX_MAJOR_INTERVAL = 45 * 60 * 1000; // 45 Minutes
const MICRO_TRANSITION_INTERVAL = 2 * 60 * 1000; // 2 Minutes (Time to step between tiers)

// Helper: Random Range
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Helper: Determine Season based on Real Month (or simulated logic)
const getSeason = (monthIndex: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' => {
    if (monthIndex === 11 || monthIndex <= 1) return 'Winter';
    if (monthIndex >= 2 && monthIndex <= 4) return 'Spring';
    if (monthIndex >= 5 && monthIndex <= 7) return 'Summer';
    return 'Autumn';
};

// --- CORE LOGIC ---

export const updateWeatherEngine = (virtualTime: number): WeatherData => {
    const now = Date.now(); // Real-world time for duration checks
    const date = new Date(virtualTime); // Virtual time for Day/Night cycle
    const hour = date.getHours();
    const month = date.getMonth();
    const isNight = hour < 6 || hour >= 18;

    // 1. Determine Season (Updates rarely)
    weatherState.season = getSeason(month);

    // 2. Major Update (Change Target Tier)
    if (now - weatherState.lastMajorUpdate > randomInt(MIN_MAJOR_INTERVAL, MAX_MAJOR_INTERVAL)) {
        weatherState.lastMajorUpdate = now;
        
        // Logic to determine next target weather based on season
        let maxTier = 2; // Default sunny/cloudy
        if (weatherState.season === 'Spring') maxTier = 3;
        if (weatherState.season === 'Autumn') maxTier = 4;
        if (weatherState.season === 'Winter') maxTier = 5; // Snow/Storms
        if (weatherState.season === 'Summer') maxTier = 2; // Mostly sunny

        // Small chance for extreme weather
        if (Math.random() > 0.85) maxTier = 5;

        weatherState.targetTier = randomInt(0, maxTier);
        
        // Temp Offset change
        weatherState.currentTempOffset = randomInt(-3, 3);
    }

    // 3. Micro Update (Transition towards Target)
    // This creates the "Sequence" (Sunny -> Cloudy -> Overcast -> Rain)
    if (now - weatherState.lastMicroUpdate > MICRO_TRANSITION_INTERVAL) {
        weatherState.lastMicroUpdate = now;
        if (weatherState.currentTier < weatherState.targetTier) {
            weatherState.currentTier++;
        } else if (weatherState.currentTier > weatherState.targetTier) {
            weatherState.currentTier--;
        }
    }

    // Clamp Tier
    weatherState.currentTier = Math.max(0, Math.min(5, weatherState.currentTier));

    // 4. Determine Condition
    let condition: WeatherCondition = WEATHER_TIERS[weatherState.currentTier] || 'Sunny';
    
    // Override for Night
    if (isNight && condition === 'Sunny') condition = 'Clear Night';
    if (isNight && condition === 'Cloudy') condition = 'Cloudy Night';
    
    // Override for Winter (Rain -> Snow)
    if (weatherState.season === 'Winter' && (condition === 'Rainy' || condition === 'Drizzle' || condition === 'Stormy')) {
        condition = 'Snowy';
    }

    // 5. Calculate Temperature
    let baseTemp = 25;
    if (weatherState.season === 'Winter') baseTemp = 5;
    if (weatherState.season === 'Spring') baseTemp = 18;
    if (weatherState.season === 'Autumn') baseTemp = 15;
    if (weatherState.season === 'Summer') baseTemp = 30;

    // Day/Night Fluctuation
    if (isNight) baseTemp -= 5;
    else if (hour >= 10 && hour <= 15) baseTemp += 3;

    // Weather impact
    if (condition === 'Rainy' || condition === 'Stormy' || condition === 'Snowy') baseTemp -= 4;
    
    const finalTemp = Math.round(baseTemp + weatherState.currentTempOffset);

    // 6. Icon Mapping
    let iconName = 'Sun';
    if (condition.includes('Night')) iconName = 'Moon';
    else if (condition === 'Cloudy' || condition === 'Overcast') iconName = 'Cloud';
    else if (condition === 'Rainy') iconName = 'CloudRain';
    else if (condition === 'Drizzle') iconName = 'CloudDrizzle';
    else if (condition === 'Stormy') iconName = 'CloudLightning';
    else if (condition === 'Snowy') iconName = 'Snowflake';
    else if (condition === 'Foggy') iconName = 'CloudFog';
    else if (condition === 'Windy') iconName = 'Wind';

    return {
        condition,
        temperature: finalTemp,
        description: condition,
        iconName,
        humidity: 60 + (weatherState.currentTier * 10),
        season: weatherState.season,
        isRaining: ['Rainy', 'Stormy', 'Drizzle'].includes(condition)
    };
};

export const getWeather = (virtualTime: number): WeatherData => {
    return updateWeatherEngine(virtualTime);
};

// --- PERSISTENCE HELPERS (New for .psc Save) ---
export const getWeatherStateSnapshot = () => {
    return { ...weatherState };
};

export const restoreWeatherState = (data: any) => {
    if (data && typeof data === 'object') {
        weatherState = { ...weatherState, ...data };
    }
};
