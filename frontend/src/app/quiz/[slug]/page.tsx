'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

type AnswerMap = Record<string, number>;

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const userId = 'demo-user';

  const quiz = useQuery(api.quiz.get, { nodeSlug: String(slug) });
  const submit = useMutation(api.quiz.submit);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<null | {
    correct: number; total: number; score: number; passed: boolean; passThreshold: number;
  }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (quiz === undefined) return <main className="p-6">Laddar…</main>;
  if (!quiz) return <main className="p-6">Inget quiz hittades.</main>;

  const data = quiz.data as any;
  const questions: Array<{ id: string; prompt: string; choices: string[] }> = data?.questions ?? [];

  const onChange = (qid: string, idx: number) => {
    setAnswers(a => ({ ...a, [qid]: idx }));
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setErr(null);
      const payload = Object.entries(answers).map(([id, choiceIndex]) => ({ id, choiceIndex }));
      const r = await submit({
        userId,
        nodeSlug: String(slug),
        answers: payload,
        starsOnPass: 2,
      });
      setResult(r as any);
    
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <button className="text-sm underline opacity-70" onClick={() => router.push('/nodes')}>
          Tillbaka
        </button>
      </div>

      {questions.length === 0 && <p>Det finns inga frågor definierade.</p>}

      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border rounded p-4 space-y-3">
            <div className="font-medium">{q.prompt}</div>
            <div className="space-y-2">
              {q.choices.map((c, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => onChange(q.id, i)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={submitting || questions.length === 0}
        onClick={onSubmit}
      >
        {submitting ? 'Skickar…' : 'Skicka svar'}
      </button>

      {result && (
        <div className={`p-4 rounded ${result.passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <div>
            Resultat: {result.correct}/{result.total} ({Math.round(result.score * 100)}%)
          </div>
          <div>Krav för godkänt: {Math.round(result.passThreshold * 100)}%</div>
          <div>{result.passed ? 'Godkänt! ⭐' : 'Inte godkänt — försök igen.'}</div>
        </div>
      )}
    </main>
  );
}
