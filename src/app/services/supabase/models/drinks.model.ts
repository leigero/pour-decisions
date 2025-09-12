export interface Drink {
  id: string;
  name: string;
  description?: string;
  ingredients?: string[];
  image_path?: string;
  image_url?: string;
  room_id: string;
  type: string;
}