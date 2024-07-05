import type {
  UnknownKeysParam,
  ZodBigIntCheck,
  ZodDateCheck,
  ZodFirstPartyTypeKind,
  ZodNumberCheck,
  ZodStringCheck,
} from 'zod';

export const fetchThatThrowWhenNotOk = async (
  input: RequestInfo,
  init?: RequestInit
) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
};

type GetProceduresResponse = Record<
  string,
  'query' | 'mutation' | 'subscription'
>;

export const getProcedures = async () => {
  const response = await fetchThatThrowWhenNotOk('/api/procedures');
  return (await response.json()) as GetProceduresResponse;
};

// Copied from apps/cli/src/utils/zod.ts
type ValueAndMessage<V> = { value: V; message?: string };

interface SlimZodSchema {
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
// End of copied code

type GetProcedureDetailsResponse = {
  path: string;
  type: 'query' | 'mutation' | 'subscription';
  meta: Record<string, any> | undefined;
  inputInfo: SlimZodSchema;
  outputInfo: SlimZodSchema;
};

export const getProcedure = async (path: string) => {
  const response = await fetchThatThrowWhenNotOk(`/api/procedures/${path}`);
  return (await response.json()) as GetProcedureDetailsResponse;
};

type ExecuteProcedureResponse = {
  response:
    | {
        success: true;
        data: unknown;
      }
    | {
        success: false;
        error: unknown;
      };
  timeTaken: number;
};

export const executeProcedure = async (
  path: string,
  method: 'query' | 'mutation',
  data: unknown
) => {
  const response = await fetchThatThrowWhenNotOk(
    `/api/procedures/${path}/execute`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method, data }),
    }
  );
  return (await response.json()) as ExecuteProcedureResponse;
};
