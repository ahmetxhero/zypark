export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          vehicle_info: any;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          vehicle_info?: any;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          vehicle_info?: any;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      parking_spots: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description?: string;
          address: string;
          latitude: number;
          longitude: number;
          price_per_hour: number;
          currency: string;
          amenities: any;
          images: string[];
          category_id?: string;
          is_available: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string;
          address: string;
          latitude: number;
          longitude: number;
          price_per_hour: number;
          currency?: string;
          amenities?: any;
          images?: string[];
          category_id?: string;
          is_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          price_per_hour?: number;
          currency?: string;
          amenities?: any;
          images?: string[];
          category_id?: string;
          is_available?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          parking_spot_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          total_price: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parking_spot_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parking_spot_id?: string;
          user_id?: string;
          start_time?: string;
          end_time?: string;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          reservation_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_method?: string;
          transaction_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          parking_spot_id: string;
          user_id: string;
          rating: number;
          comment?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parking_spot_id: string;
          user_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parking_spot_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          icon?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}