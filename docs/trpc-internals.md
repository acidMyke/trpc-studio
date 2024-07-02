# tRPC internals

Goal: Finding out how retrieve infomation each and every procedure defined in appRouter.

- Each appRouter contains `_def` property which contains all the information.
- `appRouter._def.procedures` contains all the procedures defined in the appRouter, it has the shape of `Record<string, Procedure>`
- Nested procedures are also stored in the same way, prefixed with the parent procedure name ie `{parent}.{prodcedureName}`. No recursion needed to find all the procedures.
- Each `Procedure` is a function with and added `_def` property which contains the information about the procedure. The provided properties are:
  - `input` - Array of ZodObject. (!important)
  - `meta` - It will be the same infomation passed in `t.procedure.meta()`, if not it will be undefined.
  - `query` | `mutation` | `subscription` - will be defined as true if the procedure is a query/mutation/subscription respectively.
