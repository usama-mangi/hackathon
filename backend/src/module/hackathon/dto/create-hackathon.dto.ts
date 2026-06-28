import { registerDecorator, ValidationOptions, ValidationArguments, IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

// Custom validator to ensure dates are in the future
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value instanceof Date && !isNaN(value.getTime()) && value > new Date();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date`;
        },
      },
    });
  };
}

export class CreateHackathonDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsDate()
  @IsFutureDate()
  @Type(() => Date)
  startsAt: Date;

  @IsDate()
  @IsFutureDate()
  @Type(() => Date)
  endsAt: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
