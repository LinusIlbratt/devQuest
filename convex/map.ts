import { query } from "./_generated/server";
import { v } from "convex/values";

export const getNodes = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("nodes").collect();
    return nodes.sort((a, b) =>
      a.area === b.area ? a.slug.localeCompare(b.slug) : a.area.localeCompare(b.area)
    );
  },
});

export const getForUser = query({
  args: { userId: v.string() },            
  handler: async (ctx, { userId }) => {
    const nodes = await ctx.db.query("nodes").collect();
    const progress = await ctx.db.query("progress").collect();
    const my = progress.filter(p => p.userId === userId);

    const cleared = new Set(my.filter(p => p.state === "cleared").map(p => p.nodeSlug));

    const withState = nodes.map((n) => {
      const p = my.find(p => p.nodeSlug === n.slug);
      if (p?.state === "cleared") {
        return { ...n, state: "cleared" as const, stars: p.stars ?? 0 };
      }
      const hasNoReq = n.requires.length === 0;
      const reqMet = n.requires.every(req => cleared.has(req));
      const state = (hasNoReq || reqMet) ? "unlocked" as const : "locked" as const;
      return { ...n, state, stars: p?.stars ?? 0 };
    });

    return withState.sort((a, b) =>
      a.area === b.area ? a.slug.localeCompare(b.slug) : a.area.localeCompare(b.area)
    );
  },
});
