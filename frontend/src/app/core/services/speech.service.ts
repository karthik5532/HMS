import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any;

  constructor() {
    const { webkitSpeechRecognition }: any = window;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.recognition.start();

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };
    });
  }

  getSpecialist(symptoms: string): string {
    const s = symptoms.toLowerCase();
    if (s.includes('heart') || s.includes('chest') || s.includes('palpitation')) return 'Cardiology';
    if (s.includes('skin') || s.includes('rash') || s.includes('itch')) return 'Dermatology';
    if (s.includes('child') || s.includes('baby') || s.includes('fever')) return 'Pediatrics';
    if (s.includes('brain') || s.includes('headache') || s.includes('nerve')) return 'Neurology';
    if (s.includes('bone') || s.includes('fracture') || s.includes('joint')) return 'Orthopedics';
    if (s.includes('eye') || s.includes('vision')) return 'Ophthalmology';
    return 'General Physician';
  }
}
