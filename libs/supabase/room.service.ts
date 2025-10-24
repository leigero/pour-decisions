import { inject, Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Room, Guest } from './models';
import { GuestService } from './guest.service';

@Injectable({ providedIn: 'root' })
export class RoomService extends SupabaseBaseService {  
  private guestService = inject(GuestService);

  async getRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase.from('rooms').select();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }

  async getRoomById(roomId: string): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select()
      .eq('id', roomId)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Room;
  }

  async getRoomByCode(roomCode: string): Promise<Room> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select()
      .eq('code', roomCode.toUpperCase())
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Room;
  }

  async createRoom(roomName: string, description: string): Promise<Room> {
    const roomCode = this.generateRoomcode();
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        name: roomName,
        description: description,
        is_active: true,
        code: roomCode,
      })
      .select()
      .single();

    if (error) throw error;

    return data as Room;
  }

  async joinRoom(roomCode: string, guestName: string): Promise<Guest> {
    const room = await this.getRoomByCode(roomCode);
    if (!room) throw new Error(`Room with code ${roomCode} not found.`);
    // Delegate guest creation to the GuestService
    return this.guestService.createGuest(guestName, room.id);
  }

  async getGuestById(guestId: string): Promise<Guest> {
    const { data, error } = await this.supabase
      .from('guests')
      .select()
      .eq('id', guestId)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Guest;
  }

  private generateRoomcode(){
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
        const length = 5;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
