import {GameStates, GameStatesService} from "@/core/service/game-states-service";

/**
 * Completion-related Logic
 * @since 9th May 2025
 */
export class CompletionService {

    static calcStars() {
        let stars = 0;

        for (const state of GameStatesService.getGameStates().values()) {
            stars += (state as GameStates).stars!;
        }

        return stars;
    }

    static calcGames() {
        let games = 0;

        for (const state of GameStatesService.getGameStates().values()) {
            games++;
        }

        return games;
    }

    static calcStreak() {
        let streak = 0;

        // TODO
        // for (const state of GameStatesService.getGameStates().keys()) {
        //     if () {
        //
        //     } else {
        //         break;
        //     }
        // }

        return streak;
    }

    static calcCompletion(){
        let completed = 0;

        for (const book of GameStatesService.getCompletion()) {
            for (const chapter of book.chapter) {
                if (chapter != 0) completed++
            }
        }

        return (100 * completed / 1_091).toFixed(2);
    }


}