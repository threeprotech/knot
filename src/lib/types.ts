export type SkillCategory = "Technical" | "Soft" | "Domain";

export type Industry = {
  id: string;
  name: string;
};

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
};

export type ProfileRole = "member" | "admin";

export type Visibility = "public" | "members";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  headline: string | null;
  bio: string | null;
  graduation_year: number | null;
  location: string | null;
  industry_id: string | null;
  avatar_url: string | null;
  role?: ProfileRole;
  created_at: string;
  updated_at: string;
  industries?: Industry | null;
  profile_skills?: { skill_id: string; skills: Skill }[];
};

export type AlumniEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  visibility: Visibility;
  drive_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Alert = {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  starts_at: string;
  ends_at: string | null;
  visibility: Visibility;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileFormData = {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  headline: string;
  bio: string;
  graduation_year: string;
  location: string;
  industry_id: string;
  skill_ids: string[];
  avatar_url: string;
};
