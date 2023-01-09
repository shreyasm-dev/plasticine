import sourceMapSupport from 'source-map-support';

sourceMapSupport.install();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rule = (value: any) => boolean;

export class FieldValidator {
  private _rule: Rule = () => true;

  public custom(newRule: Rule, newValue = (prev: boolean, rule: boolean) => prev && rule): this {
    const prev = this._rule;
    this._rule = (value) => newValue(prev(value), newRule(value));
    return this;
  }

  public and(validator: FieldValidator): this {
    return this.custom((value) => validator.validate(value));
  }

  public or(validator: FieldValidator): this {
    return this.custom((value) => validator.validate(value), (prev: boolean, rule: boolean) => prev || rule);
  }

  public prop(prop: string, validator: FieldValidator): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.custom((value) => validator.validate((value as any)[prop]));
  }

  public hasProp(prop: string) {
    return this.custom((value) => Object.prototype.hasOwnProperty.call(value, prop));
  }

  public type(type: string) {
    return this.custom((value) => typeof value === type);
  }

  public min(min: number, inclusive = true) {
    return this.custom((value) => inclusive ? value >= min : value > min);
  }

  public max(max: number, inclusive = true) {
    return this.custom((value) => inclusive ? value <= max : value < max);
  }

  public matches(regex: RegExp) {
    return this.custom((value) => regex.test(value as string));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public validate(value: any): boolean {
    return this._rule(value);
  }
}

export class Schema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _fields: Record<string, FieldValidator> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public field(name: string, validator: FieldValidator): this {
    this._fields[name] = validator;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public validate(value: Record<string, any>): boolean {
    let valid = true;
    valid &&= Object.keys(this._fields).length === Object.keys(value).length;
    valid &&= Object.entries(this._fields).every((v) => Object.keys(value).includes(v[0]));
    valid &&= Object.entries(this._fields).every((v) => v[1].validate(value[v[0]]));
    return valid;
  }
}

/*

Example:

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

console.log(person.validate({
  name: 'John Doe',
  age: 42,
  email: 'johndoe@example.com',
}));

*/
