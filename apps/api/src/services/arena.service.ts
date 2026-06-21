import { HttpError } from '../utils/http.js';

const ARENA_UNAVAILABLE_MESSAGE =
  'A Arena esta temporariamente indisponivel enquanto o modo competitivo e validado.';

export async function startArena(_userId: string): Promise<never> {
  throw new HttpError(503, ARENA_UNAVAILABLE_MESSAGE);
}

export async function submitArena(
  _userId: string,
  _matchId: string,
  _correctCount: number,
): Promise<never> {
  throw new HttpError(503, ARENA_UNAVAILABLE_MESSAGE);
}
