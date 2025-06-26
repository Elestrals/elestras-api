import { readdir, readFile } from "fs/promises";
import { join } from "path";

import { eq } from "drizzle-orm";

import { db } from "../db/connection";
import {
    canvas,
    cards,
    frames,
    series,
    sets,
    subclasses,
    variants,
    type CardRarity,
    type CardType,
} from "../db/schema";

import { CardSchema, SeriesSchema, SetSchema, type CardData } from "./dump-data";


class DataImporter {
    private canvasCache = new Map<string, number>();
    private framesCache = new Map<string, number>();
    private subclassesCache = new Map<string, number>();
    private setsCache = new Map<string, string>();
    private seriesCache = new Map<string, string>();

    async importData(dataPath: string = "data") {
        console.log("Starting data import...");

        try {
            await this.importCards(join(dataPath, "cards"));
            console.log("Data import completed successfully!");
        } catch (error) {
            console.error("Error during data import:", error);
            throw error;
        }
    }

    private async importCards(cardsPath: string) {
        console.log(`Importing cards from ${cardsPath}...`);

        const files = await readdir(cardsPath);
        const jsonFiles = files.filter((file) => file.endsWith(".json"));

        console.log(`Found ${jsonFiles.length} card files`);

        for (const file of jsonFiles) {
            try {
                const filePath = join(cardsPath, file);
                const content = await readFile(filePath, "utf-8");
                const rawData = JSON.parse(content);
                const cardData = CardSchema.parse(rawData);

                await this.processCard(cardData);

                if (jsonFiles.indexOf(file) % 100 === 0) {
                    console.log(`Processed ${jsonFiles.indexOf(file) + 1}/${jsonFiles.length} cards`);
                }
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
            }
        }
    }

    private async processCard(cardData: CardData) {
        const canvasId = await this.getOrCreateCanvas(cardData.canvas);
        const frameId = await this.getOrCreateFrame(cardData.frame_material);
        await this.getOrCreateSeries(cardData);
        const setId = await this.getOrCreateSet(cardData);

        const cardId = await this.insertCard(cardData, canvasId, frameId, setId);

        await this.processSubclasses(cardId, cardData.subclasses);
        await this.processvaraints(cardId, cardData.varaints, cardData.image);
    }

    private async getOrCreateCanvas(canvasName: string): Promise<number> {
        if (this.canvasCache.has(canvasName)) {
            return this.canvasCache.get(canvasName)!;
        }

        try {
            const existing = await db.select().from(canvas).where(eq(canvas.name, canvasName)).limit(1);

            if (existing.length > 0) {
                this.canvasCache.set(canvasName, existing[0].id);
                return existing[0].id;
            }

            const [inserted] = await db.insert(canvas).values({ name: canvasName }).returning({ id: canvas.id });
            this.canvasCache.set(canvasName, inserted.id);
            return inserted.id;
        } catch (error) {
            console.error(`Error handling canvas ${canvasName}:`, error);
            throw error;
        }
    }

    private async getOrCreateFrame(frameName: string): Promise<number> {
        if (this.framesCache.has(frameName)) {
            return this.framesCache.get(frameName)!;
        }

        try {
            const existing = await db.select().from(frames).where(eq(frames.name, frameName)).limit(1);

            if (existing.length > 0) {
                this.framesCache.set(frameName, existing[0].id);
                return existing[0].id;
            }

            const [inserted] = await db.insert(frames).values({ name: frameName }).returning({ id: frames.id });
            this.framesCache.set(frameName, inserted.id);
            return inserted.id;
        } catch (error) {
            console.error(`Error handling frame ${frameName}:`, error);
            throw error;
        }
    }

    private async getOrCreateSet(cardData: CardData): Promise<string> {
        if (this.setsCache.has(cardData.set_id)) {
            return this.setsCache.get(cardData.set_id)!;
        }

        try {
            const existing = await db.select().from(sets).where(eq(sets.id, cardData.set_id)).limit(1);

            if (existing.length > 0) {
                this.setsCache.set(cardData.set_id, existing[0].id);
                return existing[0].id;
            }

            const setFilePath = join("data", "sets", `${cardData.set_id}.json`);
            try {
                const setFileContent = await readFile(setFilePath, "utf-8");
                const rawSetData = JSON.parse(setFileContent);
                const setData = SetSchema.parse(rawSetData);
                await db.insert(sets).values({
                    id: setData.id,
                    name: setData.name,
                    set_code: setData.type,
                    series_id: setData.series_id,
                    series_code: setData.series_code,
                    release_date: setData.release_date,
                    image: setData.image,
                    icon: setData.icon,
                    stamp: setData.stamp,
                    logo: setData.logo,
                });
            } catch (setFileError) {
                console.warn(
                    `Error reading file for ${cardData.set_id} at ${setFilePath}, using card data as fallback`,
                );
                console.warn(`Error: ${setFileError}`);
                await db.insert(sets).values({
                    id: cardData.set_id,
                    name: cardData.set,
                    series_id: cardData.series_id,
                });
            }

            this.setsCache.set(cardData.set_id, cardData.set_id);
            return cardData.set_id;
        } catch (error) {
            console.error(`Error handling set ${cardData.set_id}:`, error);
            throw error;
        }
    }

    private async getOrCreateSeries(cardData: CardData): Promise<string> {
        if (this.seriesCache.has(cardData.series_id)) {
            return this.seriesCache.get(cardData.series_id)!;
        }

        try {
            const existing = await db.select().from(series).where(eq(series.id, cardData.series_id)).limit(1);

            if (existing.length > 0) {
                this.seriesCache.set(cardData.series_id, existing[0].id);
                return existing[0].id;
            }

            const seriesFilePath = join("data", "series", `${cardData.series_id}.json`);
            try {
                const seriesFileContent = await readFile(seriesFilePath, "utf-8");
                const rawSeriesData = JSON.parse(seriesFileContent);
                const seriesData = SeriesSchema.parse(rawSeriesData);

                await db.insert(series).values({
                    id: seriesData.id,
                    name: seriesData.name,
                    image: seriesData.image,
                    icon: seriesData.icon,
                });
            } catch (seriesFileError) {
                console.warn(
                    `Error reading file for ${cardData.series_id} at ${seriesFilePath}, using card data as fallback`,
                );
                console.warn(`Error: ${seriesFileError}`);
                await db.insert(series).values({
                    id: cardData.series_id,
                    name: cardData.series,
                });
            }

            this.seriesCache.set(cardData.series_id, cardData.series_id);
            return cardData.series_id;
        } catch (error) {
            console.error(`Error handling series ${cardData.series_id}:`, error);
            throw error;
        }
    }

    private async insertCard(cardData: CardData, canvasId: number, frameId: number, setId: string): Promise<string> {
        try {
            await db.insert(cards).values({
                id: cardData.id,
                name: cardData.name,
                base_name: cardData.base_name,
                title: cardData.title,
                alias: cardData.alias,
                set_number: cardData.set_number,
                set_order: cardData.sort_number,
                card_type: cardData.card_type as CardType,
                rarity: cardData.rarity as CardRarity,
                canvas: canvasId,
                frame_material: frameId,
                artist: cardData.artist,
                set_id: setId,
                render: cardData.render,
                attack: cardData.attack,
                defense: cardData.defense,
                serialized_stellar: cardData.serialized_stellar ? 1 : 0,
                serialized_population: cardData.serialized_population,
                is_prize_card: cardData.is_prize_card ? 1 : 0,
                prize_rank: cardData.prize_rank,
                printed_effect: cardData.printed_effect,
                total_cost: cardData.total_cost,
                fire_cost: this.getElementCost(cardData.cost, "fire"),
                earth_cost: this.getElementCost(cardData.cost, "earth"),
                thunder_cost: this.getElementCost(cardData.cost, "thunder"),
                water_cost: this.getElementCost(cardData.cost, "water"),
                wind_cost: this.getElementCost(cardData.cost, "wind"),
                frost_cost: this.getElementCost(cardData.cost, "frost"),
                lunar_cost: this.getElementCost(cardData.cost, "lunar"),
                solar_cost: this.getElementCost(cardData.cost, "solar"),
                omni_cost: this.getElementCost(cardData.cost, "omni"),
            });

            return cardData.id;
        } catch (error) {
            console.error(`Error inserting card ${cardData.id}:`, error);
            throw error;
        }
    }

    private getElementCost(costs: string[], element: string): number {
        return costs.filter((cost) => cost === element).length;
    }

    private async processSubclasses(cardId: string, subclassNames: string[]) {
        if (!subclassNames || subclassNames.length === 0) return;

        for (let i = 0; i < Math.min(subclassNames.length, 2); i++) {
            const subclassId = await this.getOrCreateSubclass(subclassNames[i]);

            if (i === 0) {
                await db.update(cards).set({ subclass_1: subclassId }).where(eq(cards.id, cardId));
            } else {
                await db.update(cards).set({ subclass_2: subclassId }).where(eq(cards.id, cardId));
            }
        }
    }

    private async getOrCreateSubclass(subclassName: string): Promise<number> {
        if (this.subclassesCache.has(subclassName)) {
            return this.subclassesCache.get(subclassName)!;
        }

        try {
            const existing = await db.select().from(subclasses).where(eq(subclasses.name, subclassName)).limit(1);

            if (existing.length > 0) {
                this.subclassesCache.set(subclassName, existing[0].id);
                return existing[0].id;
            }

            const [inserted] = await db
                .insert(subclasses)
                .values({ name: subclassName })
                .returning({ id: subclasses.id });
            this.subclassesCache.set(subclassName, inserted.id);
            return inserted.id;
        } catch (error) {
            console.error(`Error handling subclass ${subclassName}:`, error);
            throw error;
        }
    }

    private async processvaraints(cardId: string, variantNames: string[], primaryImage: string) {
        if (!variantNames || variantNames.length === 0) return;

        for (let i = 0; i < variantNames.length; i++) {
            await db.insert(variants).values({
                variant: variantNames[i],
                card_id: cardId,
                image: i === 0 ? primaryImage : null,
                is_primary: i === 0 ? 1 : 0,
            });
        }
    }
}

export async function importCardsFromJson(dataPath: string = "data") {
    const importer = new DataImporter();
    await importer.importData(dataPath);
}

if (import.meta.main) {
    const dataPath = process.argv[2] || "data";
    console.log(`Importing data from: ${dataPath}`);

    importCardsFromJson(dataPath)
        .then(() => {
            console.log("Import completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Import failed:", error);
            process.exit(1);
        });
}
