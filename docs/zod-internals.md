# Zod Internals

Goal: Finding out the shape of the Zod Object for use to describe the input and output of a procedure in tRPC.

Each schema is a class that extends `ZodType<T>` where `T` is the type of the schema. Each of schema has `_def` property which contains more information about the schema.

There are a lot of different types of schemas, here are all of them (as of Zod v3.23) and their additional properties:

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
  -
