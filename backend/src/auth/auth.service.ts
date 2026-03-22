import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const client = this.supabase.getClient();

    // Check if email already exists
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { data: user, error } = await client
      .from('users')
      .insert({ name: dto.name, email: dto.email, password_hash: passwordHash })
      .select('id, name, email, created_at')
      .single();

    if (error) throw new ConflictException(error.message);

    const token = this.signToken(user);
    return { user, access_token: token };
  }

  async login(dto: LoginDto) {
    const client = this.supabase.getClient();

    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, name: user.name, email: user.email };
    const token = this.signToken(payload);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      access_token: token,
    };
  }

  async getMe(userId: string) {
    const client = this.supabase.getClient();
    const { data: user } = await client
      .from('users')
      .select('id, name, email, avatar_url, created_at')
      .eq('id', userId)
      .single();

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar_url?: string }) {
    const client = this.supabase.getClient();
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

    const { data: user, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, avatar_url, created_at')
      .single();

    if (error) throw new Error(error.message);
    return user;
  }

  private signToken(user: any) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
  }
}
