'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';

export default function NodesPage() {
  const userId = 'demo-user';
  const nodes = useQuery(api.map.getForUser, { userId });
  const markCleared = useMutation(api.progress.markNodeCleared);

  if (nodes === undefined) return <p>Laddar...</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Alla Noder</h1>
      <ul className="space-y-2">
        {nodes.map((n) => (
          <li
            key={n._id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div>
              {n.kind === 'quiz' ? (
                <Link href={`/quiz/${n.slug}`} className="font-medium text-blue-600 underline">
                  {n.title}
                </Link>
              ) : (
                <span className="font-medium">{n.title}</span>
              )}
              <div className="text-xs opacity-60">
                {n.area} · {n.kind} · stars: {n.stars ?? 0}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  n.state === 'cleared'
                    ? 'bg-green-200'
                    : n.state === 'unlocked'
                    ? 'bg-yellow-200'
                    : 'bg-gray-200'
                }`}
              >
                {n.state}
              </span>

              {n.state !== 'locked' && n.state !== 'cleared' && n.kind !== 'quiz' && (
                <button
                  className="px-3 py-1 rounded bg-black text-white text-sm"
                  onClick={() => markCleared({ userId, nodeSlug: n.slug, stars: 2 })}
                >
                  Markera klar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
