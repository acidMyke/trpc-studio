import {
  UnknownKeysParam,
  ZodBigIntCheck,
  ZodDateCheck,
  ZodFirstPartySchemaTypes,
  ZodFirstPartyTypeKind,
  ZodNumberCheck,
  ZodStringCheck,
} from 'zod';
import { mapValues } from 'remeda';
import consola from 'consola';

type ValueAndMessage<V> = { value: V; message?: string };
export interface SlimZodSchema {
  typeName:
    | Exclude<
        ZodFirstPartyTypeKind,
        'ZodFunction' | 'ZodLazy' | 'ZodPromise' | 'ZodBranded'
      >
    | 'StudioUnsupportedType';

  checks?: (ZodStringCheck | ZodNumberCheck | ZodBigIntCheck | ZodDateCheck)[]; // string, number, bigint, date
  coerce?: boolean; // string, number, bigint, boolean, date

  type?: SlimZodSchema; // arrays
  exactLength?: ValueAndMessage<number> | null; // array
  minLength?: ValueAndMessage<number> | null; // array, set
  maxLength?: ValueAndMessage<number> | null; // array, set

  shape?: Record<string, SlimZodSchema>; // object
  catchall?: SlimZodSchema; // object
  unknownKeys?: UnknownKeysParam; // object

  options?: SlimZodSchema[]; // union (discriminated union are not handled separately)

  left?: SlimZodSchema; // intersection
  right?: SlimZodSchema; // intersection

  items?: SlimZodSchema[]; // tuple
  rest?: SlimZodSchema; // tuple

  valueType?: SlimZodSchema; // record, map and set
  keyType?: SlimZodSchema; // record, map

  value?: any; // literal
  values?: any[]; // enum (native enum is not handled separately)

  schema?: SlimZodSchema; // effects (produced by .transform, .refine, .superRefine, .refinement)

  innerType?: SlimZodSchema; // optional, nullable, default, catch, readonly
  defaultValue?: any; // default

  in?: SlimZodSchema; // pipeline? <-- I think this is the input schema that is part of request body
  // out?: SlimedResult; // pipeline? (not useful for us)
}

export function slimZod(schema: ZodFirstPartySchemaTypes): SlimZodSchema {
  // Recursively get the metadata only
  const def = schema._def;

  if (
    def.typeName === 'ZodFunction' ||
    def.typeName === 'ZodLazy' ||
    def.typeName === 'ZodPromise' ||
    def.typeName === 'ZodBranded'
  ) {
    consola.warn(`Unsupported type: ${def.typeName}`);
    return { typeName: 'StudioUnsupportedType' };
  }

  const result: SlimZodSchema = { typeName: def.typeName };

  // Raw values
  if ('checks' in def) result.checks = def.checks;
  if ('coerce' in def) result.coerce = def.coerce;
  if ('exactLength' in def) result.exactLength = def.exactLength;
  if ('minLength' in def) result.minLength = def.minLength;
  if ('maxLength' in def) result.maxLength = def.maxLength;
  if ('unknownKeys' in def) result.unknownKeys = def.unknownKeys;
  if ('value' in def) result.value = def.value;
  if ('values' in def) result.values = def.values;
  if ('defaultValue' in def) result.defaultValue = def.defaultValue();

  // Schemas
  if ('type' in def) result.type = slimZod(def.type);
  if ('catchall' in def) result.catchall = slimZod(def.catchall);
  if ('left' in def) result.left = slimZod(def.left);
  if ('right' in def) result.right = slimZod(def.right);
  if ('rest' in def) result.rest = slimZod(def.rest);
  if ('valueType' in def) result.valueType = slimZod(def.valueType);
  if ('keyType' in def) result.keyType = slimZod(def.keyType);
  if ('schema' in def) result.schema = slimZod(def.schema);
  if ('innerType' in def) result.innerType = slimZod(def.innerType);
  if ('in' in def) result.in = slimZod(def.in);

  if ('shape' in def) {
    result.shape = mapValues(def.shape, slimZod);
  }
  if ('options' in def) {
    result.options = def.options.map(slimZod);
  }
  if ('items' in def) {
    result.items = def.items.map(slimZod);
  }

  return result;
}
