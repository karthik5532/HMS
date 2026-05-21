import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private url = 'http://127.0.0.1:5001';

  constructor() {
    this.socket = io(this.url);
  }

  // Live Patient Queue
  joinQueueRoom() {
    this.socket.emit('join_queue');
  }

  onQueueUpdate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receive_queue_update', (data) => observer.next(data));
    });
  }

  emitQueueUpdate(data: any) {
    this.socket.emit('queue_update', data);
  }

  // Messaging
  sendMessage(data: any) {
    this.socket.emit('send_message', data);
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receive_message', (data) => observer.next(data));
    });
  }

  onPatientAdded(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('patientAdded', (data) => observer.next(data));
    });
  }

  onQueueUpdated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('queueUpdated', (data) => observer.next(data));
    });
  }

  onPatientUpdated(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('patientUpdated', (data) => observer.next(data));
    });
  }

  onPatientDeleted(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('patientDeleted', (data) => observer.next(data));
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
