import { GameState } from "@/core/model/state/game-state";
import { ReadState } from "@/core/model/state/read-state";
import { ReviewState } from "@/core/model/state/review-state";

/**
 * Overall State Model
 * @since 17th July 2025
 */
export type State = {
    games: GameState[]
    reviews: ReviewState[]
    reads: ReadState[]
}