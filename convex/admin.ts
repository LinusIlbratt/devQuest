import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertNode = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    kind: v.union(
      v.literal("theory"),
      v.literal("quiz"),
      v.literal("sim"),
      v.literal("boss")
    ),
    area: v.string(),
    pos: v.object({ x: v.number(), y: v.number() }),
    requires: v.array(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = (await ctx.db.query("nodes").collect())
      .find(n => n.slug === args.slug);

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        kind: args.kind,
        area: args.area,
        pos: args.pos,
        requires: args.requires,
        data: args.data,
      });
      return { updated: true, _id: existing._id };
    }

    const _id = await ctx.db.insert("nodes", args);
    return { created: true, _id };
  },
});

export const deleteNode = mutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const node = await ctx.db
      .query("nodes")
      .withIndex("by_slug", q => q.eq("slug", slug))
      .unique(); 

    if (!node) {
      throw new Error(`Node with slug "${slug}" not found`);
    }
    const dependents = (await ctx.db.query("nodes").collect())
      .filter(n => n.requires.includes(slug))
      .map(n => n.slug);

    if (dependents.length > 0) {
      throw new Error(
        `Cannot delete "${slug}" because these nodes require it: ${dependents.join(", ")}`
      );
    }

    await ctx.db.delete(node._id);
    return { deleted: true, slug };
  },
});
