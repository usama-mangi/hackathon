import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';

import { validate } from 'class-validator';
import { CreateHackathonDto } from './create-hackathon.dto';

describe('CreateHackathonDto', () => {
  it('should pass with valid data', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const data = {
      name: 'Test Hackathon',
      description: 'This is a valid description that has more than 10 chars',
      startsAt: tomorrow.toISOString(),
      endsAt: dayAfterTomorrow.toISOString(),
      isActive: true,
    };

    const dto = plainToInstance(CreateHackathonDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.startsAt).toBeInstanceOf(Date);
    expect(dto.endsAt).toBeInstanceOf(Date);
    // Use ISO string comparisons or check dynamic properties
    expect(dto.startsAt.toISOString()).toBe(tomorrow.toISOString());
  });

  it('should fail with invalid dates, short name, and invalid description length', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const data = {
      name: 'ab', // too short (min 3)
      description: 'short', // too short (min 10)
      startsAt: yesterday.toISOString(), // not in future
      endsAt: yesterday.toISOString(), // not in future
    };

    const dto = plainToInstance(CreateHackathonDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(4);

    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError?.constraints).toHaveProperty('minLength');

    const descError = errors.find((e) => e.property === 'description');
    expect(descError?.constraints).toHaveProperty('minLength');

    const startsAtError = errors.find((e) => e.property === 'startsAt');
    expect(startsAtError?.constraints).toHaveProperty('isFutureDate');

    const endsAtError = errors.find((e) => e.property === 'endsAt');
    expect(endsAtError?.constraints).toHaveProperty('isFutureDate');
  });
});
