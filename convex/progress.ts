import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const completeNode = mutation({
  args: { userId: v.string(), nodeSlug: v.string(), stars: v.number() },
  handler: async (ctx, { userId, nodeSlug, stars }) => {
    const existing = await ctx.db.query("progress").collect();
    const record = existing.find(p => p.nodeSlug === nodeSlug && p.userId === userId);

    if (record) {
      await ctx.db.patch(record._id, {
        state: "cleared",
        stars,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("progress", {
        userId,
        nodeSlug,
        state: "cleared",
        stars,
        updatedAt: Date.now(),
      });
    }
  },
});

export const markNodeCleared = mutation({
  args: { userId: v.string(), nodeSlug: v.string(), stars: v.number() },
  handler: async (ctx, { userId, nodeSlug, stars }) => {
    const rows = await ctx.db
      .query("progress")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    const existing = rows.find(p => p.nodeSlug === nodeSlug);


    if (existing) {
      await ctx.db.patch(existing._id, {
        state: "cleared",
        stars,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("progress", {
        userId,
        nodeSlug,
        state: "cleared",
        stars,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("progress")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .collect();
    return rows.sort((a, b) => a.nodeSlug.localeCompare(b.nodeSlug));
  },
});