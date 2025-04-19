// Copyright (c) Indrajit Banerjee
// Licensed under the MIT License.

import { TraceOpenFailure } from "./constants";

export type Expected<T, E = TraceOpenFailure> = { ok: true, val: T } | { ok: false, err: E };
export function Ok<T, E = TraceOpenFailure>(val: T): Expected<T, E> { return { ok: true, val }; }
export function Err<T, E = TraceOpenFailure>(err: E): Expected<T, E> { return { ok: false, err }; }
