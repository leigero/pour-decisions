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
    // Call the RPC function 'get_room_by_code'
    const { data, error } = await this.supabase
      .rpc('get_room_by_code', {
        p_room_code: roomCode.toUpperCase(),
      })
      .single();

    if (error) {
      console.error(error);
      return null;
    }
    // The data is returned as an array, even from .single()
    // so we return the first element.
    return data as Room;
  }

  async createRoom(roomName: string, description: string): Promise<Room> {
    // Sign out any existing anonymous user to ensure a fresh session.
    await this.supabase.auth.signOut();

    // 1. Sign in anonymously to get a 'host' identity
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.signInAnonymously();

    if (authError) {
      console.error('Error signing in host anonymously:', authError);
      throw authError;
    }
    if (!user) {
      throw new Error('Could not create anonymous host user.');
    }

    const hostId = user.id;
    const roomCode = this.generateRoomcode();

    // 2. Use this ID as the 'host_id' when inserting the room
    const { data, error } = await this.supabase
      .from('rooms')
      .insert({
        name: roomName,
        description: description,
        is_active: true,
        code: roomCode,
        host_id: hostId, // <-- This now works
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw error;
    }

    return data as Room;
  }

  async joinRoom(roomCode: string, guestName: string): Promise<Guest> {
    const room = await this.getRoomByCode(roomCode);
    if (!room) throw new Error(`Room with code ${roomCode} not found.`);
    // Delegate guest creation to the GuestService
    return this.guestService.createGuest(guestName, room.id);
  }

  private generateRoomcode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
    const length = 5;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
