"use client"

import { StorageUtil } from "@/core/util/storage-util";

const UUID_KEY = "kingdom:player:uuid";

export class UuidUtil {

    static getOrCreate(): string {

        const existing = StorageUtil.retrieve(UUID_KEY)

        if (existing !== null) {

            return JSON.parse(existing)
        }

        const uuid = crypto.randomUUID()
        StorageUtil.save(UUID_KEY, uuid)
        return uuid
    }
}
