import { relations } from "drizzle-orm";
import { customType, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamp = customType<{
    data: Date;
    driverData: string;
}>({
    dataType() {
        return "datetime";
    },
    fromDriver(value: string): Date {
        return new Date(value);
    },
});

export const sets = sqliteTable("sets", {
    id: text("id").primaryKey().notNull(),
    name: text("name"),
    set_code: text("set_code"),
    series_id: text("series_id").references(() => series.id),
    series_code: text("series_code"),
    release_date: timestamp("release_date"),
    image: text("image"),
    icon: text("icon"),
    stamp: text("stamp"),
    logo: text("logo"),
});

export const setsRelations = relations(sets, ({ one }) => ({
    series: one(series, {
        fields: [sets.series_id],
        references: [series.id],
    }),
}));

export const series = sqliteTable("series", {
    id: text("id").primaryKey().notNull(),
    name: text("name"),
    image: text("image"),
    icon: text("icon"),
});

export const CardTypes = [
    "elestral",
    "spirit",
    "rune_divine",
    "rune_staduim",
    "rune_artifact",
    "rune_counter",
    "rune_invoke",
] as const;
Object.freeze(CardTypes);

export type CardType = (typeof CardTypes)[number];

export const CardRarities = ["rare", "stellar_rare", "common", "uncommon"] as const;
Object.freeze(CardTypes);

export type CardRarity = (typeof CardRarities)[number];

export const cards = sqliteTable("cards", {
    id: text("id").primaryKey().notNull(),
    name: text("name"),
    base_name: text("base_name"),
    title: text("title"),
    alias: text("alias"),
    set_number: text("set_number"),
    card_type: text("card_type", {
        enum: CardTypes,
    }),
    rarity: text("rarity", {
        enum: CardRarities,
    }),
    canvas: integer("canvas").references(() => canvas.id),
    frame_material: integer("frame_material").references(() => frames.id),
    artist: text("artist"),
    set_id: text("set_id").references(() => sets.id),
    render: text("render"),
    attack: integer("attack"),
    defense: integer("defense"),
    serialized_stellar: integer("serialized_stellar"),
    serialized_population: integer("serialized_population"),
    is_prize_card: integer("is_prize_card"),
    prize_rank: integer("prize_rank"),
    printed_effect: text("printed_effect"),
    effect_id: text("effect_id"),
    is_prize_card: integer("is_origin"),
    subclass_1: integer("subclass_1").references(() => subclasses.id),
    subclass_2: integer("subclass_2").references(() => subclasses.id),
    cost_display: text("cost_display"),
    total_cost: integer("total_cost"),
    fire_cost: integer("fire_cost"),
    earth_cost: integer("earth_cost"),
    thunder_cost: integer("thunder_cost"),
    water_cost: integer("water_cost"),
    wind_cost: integer("wind_cost"),
    frost_cost: integer("frost_cost"),
    lunar_cost: integer("lunar_cost"),
    solar_cost: integer("solar_cost"),
    omni_cost: integer("omni_cost"),
});

export const cardsRelations = relations(cards, ({ one }) => ({
    canvas: one(canvas, {
        fields: [cards.canvas],
        references: [canvas.id],
    }),
    frameMaterial: one(frames, {
        fields: [cards.frame_material],
        references: [frames.id],
    }),
    set: one(sets, {
        fields: [cards.set_id],
        references: [sets.id],
    }),
    subclass1: one(subclasses, {
        fields: [cards.subclass_1],
        references: [subclasses.id],
    }),
    subclass2: one(subclasses, {
        fields: [cards.subclass_2],
        references: [subclasses.id],
    }),
}));

export const variants = sqliteTable("variants", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    variant: text("variant"),
    card_id: text("card_id").references(() => cards.id),
    image: text("image"),
    is_primary: integer("is_primary"),
});

export const variantsRelations = relations(variants, ({ one }) => ({
    card: one(cards, {
        fields: [variants.card_id],
        references: [cards.id],
    }),
}));

export const canvas = sqliteTable("canvas", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name"),
});

export const frames = sqliteTable("frames", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name"),
});

export const subclasses = sqliteTable("subclasses", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name"),
});

export const effects = sqliteTable("effects", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    effect: text("effect"),
});
