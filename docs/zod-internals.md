# Zod Internals

Goal: Finding out the shape of the Zod Object for use to describe the input and output of a procedure in tRPC.

Each schema is a class that extends `ZodType<T>` where `T` is the type of the schema. Each of schema has `_def` property which contains more information about the schema.

There are a lot of different types of schemas, here are the important ones of them (as of Zod v3.23) and their additional properties:

- `ZodString`
  - checks[]: an array of checks that are applied to the string
    - kind: min, max, length, email, url, emoji, uuid, nanoid, cuid, includes, cuid, startsWith, endsWith, regex, trim, toLowerCase, toUpperCase, datetime, date, time, duration, ip, base64
    - message?: string
    - value:
      - (min, max, length): number
      - (includes, startsWith, endsWith): string
    - position: (includes): number
    - regex: (regex): RegExp
    - offset: (datetime): boolean
    - local: (datetime): boolean
    - precision: (datetime,time): number
    - version: (ip): 'v4' | 'v6'
- `ZodNumber`
  - checks[]: an array of checks that are applied to the number
    - kind: min, max, int, multipleOf, finite
    - message?: string
    - value: (min, max, multipleOf): number
- `ZodBigInt`
  - checks[]: an array of checks that are applied to the bigint
    - kind: min, max, multipleOf
    - message?: string
    - value: (min, max, multipleOf): bigint
- `ZodBoolean`
- `ZodDate`
  - checks[]: an array of checks that are applied to the date
    - kind: min, max
    - message?: string
    - value: (min, max): number
- `ZodArray`
  - type: ZodTypeAny
  - (exactLength, minLength, maxLength): { value: number, message?: string }
- `ZodObject`
  - shape: get() => { [key: string]: ZodTypeAny }
- `ZodUnion`
  - options: ZodTypeAny[]
- `ZodIntersection`
  - left: ZodTypeAny
  - right: ZodTypeAny
- `ZodTuple`
  - items: ZodTypeAny[]
  - rest: ZodTypeAny
- `ZodRecord`
  - valueType: ZodTypeAny
  - keyType: string | number | symbol
- `ZodMap`
  - valueType: ZodTypeAny
  - keyType: ZodTypeAny
- `ZodSet`
  - valueType: ZodTypeAny
  - (minSize, maxSize): { value: number, message?: string }
- `ZodLiteral`
  - value: any

Exclude list:

- `ZodSymbol` (:shrug:)
- `ZodUndefined`
- `ZodNull`
- `ZodAny`
- `ZodUnknown`
- `ZodNever`
- `ZodVoid`
- `ZodDiscriminatedUnion`
- `ZodFunction` (function don't work for serialization)
- `ZodLazy`
- `ZodReadonly`
