import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { SupabaseService } from "../../supabase/supabase.service";
import { Room } from "../../supabase/models";

@Component({
    selector: "pd-dashboard",
    standalone: true,
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.scss"],
    imports: [CommonModule]
})

export class DashboardComponent implements OnInit{
    private sbService = inject(SupabaseService);
    
    public rooms = signal<Room[] | undefined>(undefined);

    public async ngOnInit(){
        const roomsResponse = await this.sbService.getRooms();
        this.rooms.set(roomsResponse);
    }
}