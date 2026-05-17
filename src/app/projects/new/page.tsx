"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, X, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Required").max(100),
  brandName: z.string().min(1, "Required").max(100),
  websiteUrl: z.string().optional(),
  description: z.string().min(1, "Required").max(2000),
  audience: z.string().min(1, "Required").max(500),
  product: z.string().min(1, "Required").max(500),
  keywords: z.array(z.string()).min(1, "At least 1 keyword").max(10),
  competitors: z.array(z.string()).max(5).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { keywords: [], competitors: [] },
  });

  const keywords = watch("keywords");
  const competitors = watch("competitors");

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && keywords && !keywords.includes(kw) && keywords.length < 10) {
      setValue("keywords", [...keywords, kw]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    setValue(
      "keywords",
      (keywords || []).filter((k) => k !== kw)
    );
  };

  const addCompetitor = () => {
    const c = competitorInput.trim();
    if (c && competitors && !competitors.includes(c) && competitors.length < 5) {
      setValue("competitors", [...competitors, c]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (c: string) => {
    setValue(
      "competitors",
      (competitors || []).filter((x) => x !== c)
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create project");
      }

      const { project } = await res.json();
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New GEO Analysis Project</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Project Name
          </label>
          <input
            {...register("name")}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="e.g., My SaaS GEO Audit 2026"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Brand / Website Name
            </label>
            <input
              {...register("brandName")}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="e.g., CloudDeploy"
            />
            {errors.brandName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.brandName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Website URL{" "}
              <span className="text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              {...register("websiteUrl")}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Brand Description{" "}
            <span className="text-[var(--muted-foreground)]">(max 2000 chars)</span>
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
            placeholder="Describe what your brand does, its unique value proposition, and key differentiators..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Target Audience
            </label>
            <input
              {...register("audience")}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="e.g., DevOps engineers at mid-size SaaS"
            />
            {errors.audience && (
              <p className="text-red-500 text-xs mt-1">
                {errors.audience.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Core Product / Service
            </label>
            <input
              {...register("product")}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="e.g., CloudDeploy CI/CD Platform"
            />
            {errors.product && (
              <p className="text-red-500 text-xs mt-1">
                {errors.product.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Target Keywords{" "}
            <span className="text-[var(--muted-foreground)]">
              (1-10, press Enter to add)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Type keyword and press Enter"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {keywords?.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs"
              >
                {kw}
                <button type="button" onClick={() => removeKeyword(kw)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.keywords && (
            <p className="text-red-500 text-xs mt-1">
              {errors.keywords.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Competitors{" "}
            <span className="text-[var(--muted-foreground)]">
              (optional, max 5)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCompetitor();
                }
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Competitor name and press Enter"
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {competitors?.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs"
              >
                {c}
                <button type="button" onClick={() => removeCompetitor(c)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}
