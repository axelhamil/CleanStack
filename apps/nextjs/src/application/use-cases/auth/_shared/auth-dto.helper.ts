import { extractUserBaseFields } from "@/adapters/mappers/user.mapper";
import type { User } from "@/domain/user/user.aggregate";

export interface IUserDto {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
}

export interface ISessionDto {
  id: string;
  token: string;
  expiresAt: Date;
}

export function mapUserToDto(user: User): IUserDto {
  return extractUserBaseFields(user);
}

export function mapSessionToDto(session: {
  id: string;
  token: string;
  expiresAt: Date;
}): ISessionDto {
  return {
    id: session.id,
    token: session.token,
    expiresAt: session.expiresAt,
  };
}
