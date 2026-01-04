import { Aggregate, type Option, type UUID } from "@packages/ddd-kit";
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
  private constructor(props: IUserProps, id?: UUID<string>) {
    super(props, id);
  }

  get id(): UserId {
    return UserId.create(this._id as UUID<string>);
  }

  static create(
    props: Omit<IUserProps, "emailVerified"> & { emailVerified?: boolean },
    id?: UUID<string>,
  ): User {
    const newId = id ?? new UserId();
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
          user.id.value,
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

  verify(): void {
    if (this.get("emailVerified")) {
      throw new Error("User is already verified");
    }

    (this._props as IUserProps).emailVerified = true;
    (this._props as IUserProps).updatedAt = new Date();
    this.addEvent(new UserVerifiedEvent(this.id.value));
  }

  updateName(name: Name): void {
    (this._props as IUserProps).name = name;
    (this._props as IUserProps).updatedAt = new Date();
  }

  updateImage(image: Option<string>): void {
    (this._props as IUserProps).image = image;
    (this._props as IUserProps).updatedAt = new Date();
  }
}
