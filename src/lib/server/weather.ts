import type {ShopWeather,WeatherCondition} from '../weather-contracts';

type Options={key?:string;fetch?:typeof fetch;clock?:()=>number};
/** Public weather only. Membership is checked by the router before reaching this cache. */
export class WeatherService {
 private cache=new Map<string,{expires:number;value:ShopWeather}>();
 private pending=new Map<string,Promise<ShopWeather>>();
 private fetcher:typeof fetch;private clock:()=>number;private key:string;
 constructor(options:Options={}){this.key=options.key??process.env.OPENWEATHER_API_KEY??'';this.fetcher=options.fetch??fetch;this.clock=options.clock??Date.now;}
 async current(location:string):Promise<ShopWeather>{
  const place=location.trim().slice(0,160);if(!place)return{status:'unavailable',reason:'location'};if(!this.key)return{status:'unavailable',reason:'configuration'};
  const cached=this.cache.get(place);if(cached&&cached.expires>this.clock())return cached.value;
  const pending=this.pending.get(place);if(pending)return pending;
  const work=this.load(place).then(value=>{if(this.cache.size>=200)this.cache.delete(this.cache.keys().next().value!);this.cache.set(place,{value,expires:this.clock()+(value.status==='ready'?15*60_000:60_000)});return value;}).finally(()=>this.pending.delete(place));this.pending.set(place,work);return work;
 }
 private async load(place:string):Promise<ShopWeather>{
  try{
   const signal=AbortSignal.timeout(8000),geoUrl=new URL('https://api.openweathermap.org/geo/1.0/direct');geoUrl.search=new URLSearchParams({q:place,limit:'5',appid:this.key}).toString();
   const geoResponse=await this.fetcher(geoUrl,{signal,redirect:'error',cache:'no-store'});if(!geoResponse.ok)throw Error('Weather geocoding failed');
   const locations=await geoResponse.json() as {lat:number;lon:number;name:string}[];
   if(!Array.isArray(locations)||locations.length!==1)return{status:'unavailable',reason:'ambiguous'};
   const spot=locations[0];if(!Number.isFinite(spot.lat)||Math.abs(spot.lat)>90||!Number.isFinite(spot.lon)||Math.abs(spot.lon)>180||typeof spot.name!=='string')throw Error('Invalid location');
   const url=new URL('https://api.openweathermap.org/data/2.5/weather');url.search=new URLSearchParams({lat:String(spot.lat),lon:String(spot.lon),units:'metric',appid:this.key}).toString();
   const response=await this.fetcher(url,{signal,redirect:'error',cache:'no-store'});if(!response.ok)throw Error('Weather unavailable');
   const data=await response.json() as {main?:{temp?:number};weather?:{id?:number}[];dt?:number},temperature=data.main?.temp,code=data.weather?.[0]?.id,observed=(data.dt??0)*1000;
   if(typeof temperature!=='number'||!Number.isFinite(temperature)||temperature< -90||temperature>65||typeof code!=='number'||code<200||code>804||!Number.isFinite(observed)||observed<this.clock()-3*60*60_000||observed>this.clock()+10*60_000)throw Error('Invalid or stale weather');
   const condition:WeatherCondition=code<300?'storm':code<600?'rain':code<700?'snow':code<800?'mist':code===800?'clear':'clouds';
   return{status:'ready',temperatureC:Math.round(temperature),condition,city:spot.name.slice(0,100),observedAt:new Date(observed).toISOString(),source:'openweather'};
  }catch{return{status:'unavailable',reason:'provider'};}
 }
}
let service:WeatherService|undefined;
export const shopWeather=()=>service??=new WeatherService();
