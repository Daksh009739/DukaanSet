export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'mist';
export type ShopWeather = {status:'ready';temperatureC:number;condition:WeatherCondition;city:string;observedAt:string;source:'openweather'} | {status:'unavailable';reason:'location'|'configuration'|'ambiguous'|'provider'};
