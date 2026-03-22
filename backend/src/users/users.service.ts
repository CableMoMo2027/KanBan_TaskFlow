import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async findById(id: string) {
    const { data } = await this.supabase
      .getClient()
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('id', id)
      .single();
    return data;
  }

  async findByEmail(email: string) {
    const { data } = await this.supabase
      .getClient()
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('email', email)
      .single();
    return data;
  }

  async searchByEmail(query: string) {
    const { data } = await this.supabase
      .getClient()
      .from('users')
      .select('id, name, email, avatar_url')
      .ilike('email', `%${query}%`)
      .limit(10);
    return data || [];
  }
}
