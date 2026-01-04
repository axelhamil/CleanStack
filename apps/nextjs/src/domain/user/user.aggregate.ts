import { Aggregate, type Option, Result, UUID } from "@packages/ddd-kit";
import { UserCreatedEvent } from "./events/user-created.event";
import { UserVerifiedEvent } from "./events/user-verified.event";
import { UserId } from "./user-id";
import type { Email } from "./value-objects/email.vo";
import type { Name } from "./value-objects/name.vo";

export interface IUserProps {
  email: Email;
  name: Name;
  emailVerified: boolean;
  image: Option<string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Aggregate<IUserProps> {
  private constructor(props: IUserProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): UserId {
    return UserId.create(this._id);
  }

  static create(
    props: Omit<IUserProps, "emailVerified"> & { emailVerified?: boolean },
    id?: UUID<string | number>,
  ): User {
    const newId = id ?? new UUID<string>();
    const user = new User(
      {
        ...props,
        emailVerified: props.emailVerified ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      newId,
    );

    if (!id) {
      user.addEvent(
        new UserCreatedEvent(
          user.id.value.toString(),
          props.email.value,
          props.name.value,
        ),
      );
    }

    return user;
  }

  static reconstitute(props: IUserProps, id: UserId): User {
    return new User(props, id);
  }

  verify(): Result<void> {
    if (this.get("emailVerified")) {
      return Result.fail("User is already verified");
    }

    this._props.emailVerified = true;
    this._props.updatedAt = new Date();
    this.addEvent(new UserVerifiedEvent(this.id.value.toString()));
    return Result.ok();
  }

  updateName(name: Name): void {
    this._props.name = name;
    this._props.updatedAt = new Date();
  }

  updateImage(image: Option<string>): void {
    this._props.image = image;
    this._props.updatedAt = new Date();
  }
}
