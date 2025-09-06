import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.string(),                 
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  }),

  nodes: defineTable({
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
  })
  .index("by_slug", ["slug"]),

  progress: defineTable({
    userId: v.string(),                 
    nodeSlug: v.string(),
    state: v.union(
      v.literal("locked"),
      v.literal("unlocked"),
      v.literal("cleared")
    ),
    stars: v.number(),                  
    score: v.optional(v.number()),
    attempts: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
