import { z } from "zod";

export const CardSchema = z.object({
    id: z.string(),
    base_name: z.string(),
    title: z.string().nullable(),
    set_number: z.string(),
    sort_number: z.string(),
    name: z.string(),
    alias: z.string().nullable(),
    card_type: z.string(),
    rarity: z.string(),
    canvas: z.string(),
    frame_material: z.string(),
    artist: z.string(),
    set: z.string(),
    set_id: z.string(),
    subset: z.string(),
    series: z.string(),
    series_id: z.string(),
    image: z.string(),
    render: z.string().nullable(),
    creature_id: z.string().nullable(),
    total_cost: z.number().nullable(),
    attack: z.number().nullable(),
    defense: z.number().nullable(),
    serialized_stellar: z.boolean(),
    serialized_population: z.number().nullable(),
    is_prize_card: z.boolean(),
    prize_rank: z.string().nullable(),
    printed_effect: z.string().nullable(),
    effect: z.string().nullable(),
    elements: z.array(z.string()),
    cost: z.array(z.string()),
    subclasses: z.array(z.string()),
    varaints: z.array(z.string()),
});

export const SeriesSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    icon: z.string(),
    sort_order: z.number().optional(),
});

export const SetSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    abbr: z.string(),
    series: z.string(),
    series_id: z.string(),
    release_date: z.string(),
    image: z.string(),
    icon: z.string(),
    stamp: z.string().nullable(),
    logo: z.string().nullable(),
    series_code: z.string(),
});

export type CardData = z.infer<typeof CardSchema>;
export type SeriesData = z.infer<typeof SeriesSchema>;
export type SetData = z.infer<typeof SetSchema>;