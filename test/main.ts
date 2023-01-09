/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { FieldValidator, Schema } from '../src/main';

describe('Schema', () => {
  const person = new Schema()
    .field('name', new FieldValidator()
      .prop('length', new FieldValidator()
        .min(1)
        .max(100),
      )
      .type('string'),
    )
    .field('age', new FieldValidator()
      .min(0)
      .max(100)
      .type('number'),
    )
    .field('email', new FieldValidator()
      .matches(/.+@.+\..+/)
      .type('string'),
    );

  it('should return true for a valid person', () => {
    const validPerson = {
      name: 'John Doe',
      age: 42,
      email: 'johndoe@example.com',
    };

    expect(person.validate(validPerson)).to.be.true;
  });

  describe('should return false for an invalid person', () => {
    it('with a missing field', () => {
      const invalidPerson = {
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      expect(person.validate(invalidPerson)).to.be.false;
    });

    it('with an extra field', () => {
      const invalidPerson = {
        name: 'John Doe',
        age: 42,
        email: 'johndoe@example.com',
        extra: 'extra',
      };

      expect(person.validate(invalidPerson)).to.be.false;
    });

    it('with an invalid field type', () => {
      const invalidPerson = {
        name: 'John Doe',
        age: '42',
        email: 'johndoe@example.com',
      };

      expect(person.validate(invalidPerson)).to.be.false;
    });
  });
});
