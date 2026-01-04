import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { User } from "@/domain/user/user.aggregate";
import type { UserId } from "@/domain/user/user-id";

export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<Result<Option<User>>>;
  findById(id: UserId): Promise<Result<Option<User>>>;
}
