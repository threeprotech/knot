"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/avatar";
import type { Industry, Profile, Skill, SkillCategory } from "@/lib/types";

type DirectoryProfile = Profile & {
  industries: Industry | null;
  profile_skills: { skill_id: string; skills: Skill }[];
};

type Props = {
  profiles: DirectoryProfile[];
  industries: Industry[];
  skills: Skill[];
};

const CATEGORIES: SkillCategory[] = ["Technical", "Soft", "Domain"];

export function DirectoryClient({ profiles, industries, skills }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") || "";
  const industry = searchParams.get("industry") || "";
  const category = searchParams.get("category") || "";
  const skill = searchParams.get("skill") || "";

  const [query, setQuery] = useState(q);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => {
      router.replace(`/directory?${params.toString()}`);
    });
  }

  const filteredSkills = useMemo(() => {
    if (!category) return skills;
    return skills.filter((s) => s.category === category);
  }, [skills, category]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (q) {
        const hay = `${p.full_name} ${p.headline || ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (industry && p.industry_id !== industry) return false;
      if (skill) {
        const has = p.profile_skills?.some((ps) => ps.skill_id === skill);
        if (!has) return false;
      }
      if (category) {
        const hasCat = p.profile_skills?.some((ps) => ps.skills?.category === category);
        if (!hasCat) return false;
      }
      return true;
    });
  }, [profiles, q, industry, skill, category]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Alumni directory</h1>
        <p className="mt-2 max-w-xl text-muted">
          Search by name, industry, or skill to find members across the Knot network.
        </p>
      </div>

      <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-line/70 bg-mist/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: query.trim() });
          }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none ring-coral/30 focus:border-coral focus:ring-2"
            aria-label="Search alumni by name"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <select
            value={industry}
            onChange={(e) => updateParams({ industry: e.target.value })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-soft"
            aria-label="Filter by industry"
          >
            <option value="">All industries</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) =>
              updateParams({
                category: e.target.value,
                skill: "",
              })
            }
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-soft"
            aria-label="Filter by skill category"
          >
            <option value="">All skill categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={skill}
            onChange={(e) => updateParams({ skill: e.target.value })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-soft"
            aria-label="Filter by skill"
          >
            <option value="">All skills</option>
            {filteredSkills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {(q || industry || category || skill) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                startTransition(() => router.replace("/directory"));
              }}
              className="text-sm font-medium text-coral hover:text-coral-deep sm:ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        {isPending ? "Updating…" : `${filtered.length} member${filtered.length === 1 ? "" : "s"}`}
      </p>

      <ul className="mt-2 divide-y divide-line/80">
        {filtered.length === 0 && (
          <li className="py-12 text-center text-muted">
            No alumni match these filters yet. Try broadening your search.
          </li>
        )}
        {filtered.map((profile, index) => {
          const topSkills = (profile.profile_skills || [])
            .map((ps) => ps.skills)
            .filter(Boolean)
            .slice(0, 4);

          return (
            <li
              key={profile.id}
              className="animate-stagger py-4"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <Link
                href={`/directory/${profile.id}`}
                className="group block rounded-lg outline-none ring-coral/30 focus-visible:ring-2"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <Avatar name={profile.full_name} src={profile.avatar_url} size="md" />
                    <div>
                      <h2 className="text-lg font-semibold text-ink group-hover:text-coral">
                        {profile.full_name}
                      </h2>
                      {profile.headline && (
                        <p className="mt-0.5 text-sm text-ink-soft">{profile.headline}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        {profile.industries?.name && <span>{profile.industries.name}</span>}
                        {profile.location && <span>{profile.location}</span>}
                        {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
                      </div>
                      {topSkills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {topSkills.map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md bg-mist-deep/70 px-2 py-0.5 text-xs font-medium text-ink-soft"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm sm:flex-col sm:items-end sm:gap-1.5">
                    {profile.email && (
                      <span className="text-muted group-hover:text-ink-soft">{profile.email}</span>
                    )}
                    {profile.phone && <span className="text-muted">{profile.phone}</span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
