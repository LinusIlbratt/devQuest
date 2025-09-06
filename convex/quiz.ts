import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { nodeSlug: v.string() },
  handler: async (ctx, { nodeSlug }) => {
    const nodes = await ctx.db.query("nodes").collect();
    const node = nodes.find(n => n.slug === nodeSlug);
    if (!node) throw new Error(`Node ${nodeSlug} not found`);
    if (node.kind !== "quiz") throw new Error(`Node ${nodeSlug} is not a quiz`);
    return { slug: node.slug, title: node.title, data: node.data ?? null };
  },
});

export const ping = mutation({
  args: {},
  handler: async () => "pong",
});

export const submit = mutation({
  args: {
    userId: v.string(),
    nodeSlug: v.string(),
    answers: v.array(
      v.object({
        id: v.string(),
        choiceIndex: v.number(),
      })
    ),
    starsOnPass: v.optional(v.number()),
  },
  handler: async (ctx, { userId, nodeSlug, answers, starsOnPass }) => {
    const nodes = await ctx.db.query("nodes").collect();
    const node = nodes.find(n => n.slug === nodeSlug);
    if (!node) throw new Error(`Node ${nodeSlug} not found`);
    if (node.kind !== "quiz") throw new Error(`Node ${nodeSlug} is not a quiz`);
    const data = node.data as any;
    if (!data?.questions || !Array.isArray(data.questions)) {
      throw new Error(`Quiz data missing for ${nodeSlug}`);
    }
    const passThreshold = typeof data.passThreshold === "number" ? data.passThreshold : 0.7;

    const byId = new Map<string, any>(data.questions.map((q: any) => [q.id, q]));
    let correct = 0;
    for (const a of answers) {
      const q = byId.get(a.id);
      if (q && a.choiceIndex === q.correctIndex) correct++;
    }
    const total = data.questions.length;
    const score = total > 0 ? correct / total : 0;
    const passed = score >= passThreshold;

    if (passed) {
      const rows = await ctx.db
        .query("progress")
        .withIndex("by_userId", q => q.eq("userId", userId))
        .collect();

      const existing = rows.find(r => r.nodeSlug === nodeSlug);
      const stars = starsOnPass ?? 2;

      if (existing) {
        await ctx.db.patch(existing._id, {
          state: "cleared",
          stars: Math.max(existing.stars ?? 0, stars),
          score: Math.round(score * 100),
          attempts: (existing.attempts ?? 0) + 1,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("progress", {
          userId,
          nodeSlug,
          state: "cleared",
          stars,
          score: Math.round(score * 100),
          attempts: 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { correct, total, score, passed, passThreshold };
  },
});

