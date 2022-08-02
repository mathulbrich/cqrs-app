import { Uuid } from '@app/lib/uuid';
import { faker } from '@faker-js/faker';

const UuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe(Uuid.name, () => {
  it('Should generate a valid uuid', () => {
    const uuid = Uuid.generate();
    expect(UuidRegex.test(uuid.toString())).toBeTruthy();
  });

  it('Should be equals', () => {
    const uuid = Uuid.generate();
    const secondUuid = new Uuid(uuid.toString());
    expect(uuid.equals(secondUuid)).toBeTruthy();
  });

  it('Should throw error when trying to create an invalid uuid', () => {
    expect(() => new Uuid(faker.random.word())).toThrowError();
  });
});