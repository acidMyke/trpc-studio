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

type ValueAndMessage<V> = { value: V; message?: string };
interface SlimedResult {
  typeName: Exclude<
    ZodFirstPartyTypeKind,
    'ZodFunction' | 'ZodLazy' | 'ZodPromise' | 'ZodBranded'
  >;

  checks?: (ZodStringCheck | ZodNumberCheck | ZodBigIntCheck | ZodDateCheck)[]; // string, number, bigint, date
  coerce?: boolean; // string, number, bigint, boolean, date

  type?: SlimedResult; // arrays
  exactLength?: ValueAndMessage<number> | null; // array
  minLength?: ValueAndMessage<number> | null; // array, set
  maxLength?: ValueAndMessage<number> | null; // array, set

  shape?: Record<string, SlimedResult>; // object
  catchall?: SlimedResult; // object
  unknownKeys?: UnknownKeysParam; // object

  options?: SlimedResult[]; // union (discriminated union are not handled separately)

  left?: SlimedResult; // intersection
  right?: SlimedResult; // intersection

  items?: SlimedResult[]; // tuple
  rest?: SlimedResult; // tuple

  valueType?: SlimedResult; // record, map and set
  keyType?: SlimedResult; // record, map

  value?: any; // literal
  values?: any[]; // enum (native enum is not handled separately)

  schema?: SlimedResult; // effects (produced by .transform, .refine, .superRefine, .refinement)

  innerType?: SlimedResult; // optional, nullable, default, catch, readonly
  defaultValue?: any; // default

  in?: SlimedResult; // pipeline? <-- I think this is the input schema that is part of request body
  // out?: SlimedResult; // pipeline? (not useful for us)
}

export function slimZod(
  schema: ZodFirstPartySchemaTypes
): SlimedResult | undefined {
  // Recursively get the metadata only
  const def = schema._def;

  if (
    def.typeName === 'ZodFunction' ||
    def.typeName === 'ZodLazy' ||
    def.typeName === 'ZodPromise' ||
    def.typeName === 'ZodBranded'
  ) {
    throw new Error('Unsupported type: These types cannot be serialized');
  }

  const result: SlimedResult = { typeName: def.typeName };

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
