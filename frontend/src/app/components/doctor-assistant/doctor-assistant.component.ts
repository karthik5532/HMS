import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../core/services/speech.service';

@Component({
  selector: 'app-doctor-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="assistant-bubble shadow-lg" [class.expanded]="isExpanded">
      <div class="header" (click)="toggle()">
        <div class="bot-icon">🤖</div>
        <div class="status-info">
          <span class="name">Clinical Assistant</span>
          <span class="status">{{ isListening ? 'Listening...' : 'Online' }}</span>
        </div>
        <button class="close-btn" *ngIf="isExpanded">×</button>
      </div>

      <div class="chat-area" *ngIf="isExpanded">
        <div class="msg bot">Hello! I am your AI Clinical Assistant. How are you feeling today?</div>
        <div class="msg user" *ngIf="userText">{{ userText }}</div>
        <div class="msg bot" *ngIf="botResponse">{{ botResponse }}</div>
      </div>

      <div class="actions" *ngIf="isExpanded">
        <button class="mic-trigger" [class.active]="isListening" (click)="talkToDoctor()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .assistant-bubble {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      background: var(--primary);
      border-radius: 30px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 1000;
      color: white;
      overflow: hidden;
      cursor: pointer;
    }
    .assistant-bubble.expanded {
      width: 350px;
      height: 500px;
      border-radius: 20px;
      cursor: default;
    }
    .header {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .bot-icon { font-size: 1.5rem; }
    .status-info { display: flex; flex-direction: column; }
    .name { font-weight: 700; font-size: 0.9rem; }
    .status { font-size: 0.7rem; opacity: 0.8; }
    .chat-area {
      height: 350px;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .msg {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      max-width: 80%;
    }
    .bot { background: rgba(255,255,255,0.1); align-self: flex-start; }
    .user { background: white; color: var(--primary); align-self: flex-end; }
    .actions {
      padding: 1rem;
      display: flex;
      justify-content: center;
    }
    .mic-trigger {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: white;
      color: var(--primary);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .mic-trigger.active {
      background: #ef4444;
      color: white;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class DoctorAssistantComponent {
  isExpanded = false;
  isListening = false;
  userText = '';
  botResponse = '';

  constructor(private speechService: SpeechService) {}

  toggle() { this.isExpanded = !this.isExpanded; }

  async talkToDoctor() {
    this.isListening = true;
    try {
      const text = await this.speechService.startListening();
      this.userText = text;
      
      // Simple Mock NLP
      setTimeout(() => {
        this.botResponse = this.generateResponse(text);
        this.speakBack(this.botResponse);
      }, 1000);

    } catch (err) {
      console.error(err);
    } finally {
      this.isListening = false;
    }
  }

  generateResponse(input: string): string {
    const s = input.toLowerCase();
    if (s.includes('pain') || s.includes('hurt')) return "I'm sorry to hear that. On a scale of 1 to 10, how severe is the pain?";
    if (s.includes('fever') || s.includes('hot')) return "A fever can be serious. Have you noticed any other symptoms like a cough or chills?";
    if (s.includes('thank')) return "You're very welcome. Please book an appointment if you need further help.";
    return "I see. I recommend scheduling a consultation with a specialist for a detailed examination.";
  }

  speakBack(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}
