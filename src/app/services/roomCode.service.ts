import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoomCodeService {

    public generateRoomcode(){
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0
        const length = 5;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}