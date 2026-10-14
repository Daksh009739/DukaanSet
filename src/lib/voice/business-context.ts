import type {V3State} from '../v3-contracts';
import type {VoiceCommand} from './os';
export function businessContextCommand(raw:string,state:V3State):VoiceCommand|null{
 // Only aggregate questions with supported dates reach aggregate counters.
 // Names, historical ranges and requests to change records stay in the existing interpreter.
 const question=raw.trim(),orders=/^(?:(?:aaj|आज|today)\s+)?(?:total\s+)?(?:kitn[aei]|कितने|कितनी|how many|count(?: of)?)\s+(?:total\s+)?(?:orders?|ऑर्डर)(?:\s+(?:aaj|today|आज|aaye|aayi|आए|आये|came|received|hai|hain|है|हैं|were|there|are|in|my|business|mere|dukaan|shop|the|दुकान))*[?.!।]*$/iu.test(question),bookings=/^(?:(?:aaj|आज|today|kal|कल|tomorrow)\s+)?(?:total\s+)?(?:kitn[aei]|कितने|कितनी|how many|count(?: of)?)\s+(?:total\s+)?(?:bookings?|appointments?|बुकिंग|अपॉइंटमेंट)(?:\s+(?:aaj|today|आज|kal|कल|tomorrow|hai|hain|है|हैं|there|are|in|my|business|mere|shop|the|दुकान))*[?.!।]*$/iu.test(question),summary=!/month|mahine|week|yesterday|pichl|महीने|हफ्ते|कल/iu.test(question)&&/ask my shop|aaj mere business.*kis cheez.*dhyan|business.*attention|attention.*business|बिजनेस.*ध्यान.*(?:दूं|देना)|(?:dukaan|business|shop|दुकान|बिजनेस).*(?:hisaab|hisab|summary|हिसाब|सारांश).*(?:bata|show|बता|दिखा)|(?:daily|today|aaj|आज).*(?:business summary|daily recap)/iu.test(question);
 if(!orders&&!bookings&&!summary)return null;
 return{intent:'report',transcript:raw,fields:{report:orders?'businessOrders':bookings?'businessBookings':'shopSummary',period:bookings&&/\bkal\b|tomorrow|कल/iu.test(raw)?'tomorrow':'today'},items:[],changed:[],changedItems:[],warnings:state.configuration.permissions.reports&&state.configuration.features.voiceStock?[]:['permission']};
}
