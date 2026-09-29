import { PortfolioData, PersonalInfo, Project, Experience, Education, WhatIBuilt, Testimonial, NavLink, SocialLink } from "@/types/portfolio";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function requestApi<T>(
  url: string,
  options: RequestInit = {},
  authToken?: string | null,
  onUnauthorized?: () => void,
  isGuest = false
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  if (isGuest && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    if (!url.endsWith("/admin/login") && !url.endsWith("/admin/verify")) {
      throw new ApiError("Modifications are locked in Guest View (Read-Only).", 403);
    }
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    // If 6 digits, it's a raw TOTP code; otherwise it's a Bearer session token
    if (/^\d{6}$/.test(authToken.trim())) {
      headers.set("Authorization", `TOTP ${authToken.trim()}`);
    } else {
      headers.set("Authorization", `Bearer ${authToken.trim()}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    const errBody = await response.json().catch(() => ({}));
    throw new ApiError(
      errBody.error || "Session expired or invalid authorization. Please log in again.",
      401,
      errBody
    );
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      errBody.error ||
      errBody.message ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status, errBody);
  }

  return response.json() as Promise<T>;
}

export function createApiClient(
  apiUrl: string,
  authToken?: string | null,
  onUnauthorized?: () => void,
  isGuest = false
) {
  const req = <T>(url: string, options: RequestInit = {}) =>
    requestApi<T>(url, options, authToken, onUnauthorized, isGuest);

  return {
    // Auth & Session
    login: (code: string) =>
      req<{ token: string; remainingSeconds?: number }>(
        `${apiUrl}/admin/login`,
        {
          method: "POST",
          body: JSON.stringify({ code: code.trim() }),
        }
      ),

    verifySession: () =>
      req<{ remainingSeconds: number; valid?: boolean }>(
        `${apiUrl}/admin/verify`,
        { method: "GET" }
      ),

    destroySession: () =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/destroy-session`,
        { method: "POST" }
      ),

    // Portfolio All-in-one
    getPortfolio: () =>
      req<PortfolioData>(`${apiUrl}/portfolio`, { method: "GET" }),

    // Personal Info
    getPersonal: () =>
      req<PersonalInfo>(`${apiUrl}/personal`, { method: "GET" }),
    updatePersonal: (data: Partial<PersonalInfo>) =>
      req<{ message: string; data: PersonalInfo }>(
        `${apiUrl}/admin/personal`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    uploadImage: (image: string, filename: string) =>
      req<{ url: string; success?: boolean; message?: string }>(
        `${apiUrl}/admin/upload`,
        {
          method: "POST",
          body: JSON.stringify({ image, filename }),
        }
      ),
    uploadFile: (fileData: string, filename: string) =>
      req<{ url: string; success?: boolean; message?: string }>(
        `${apiUrl}/admin/upload`,
        {
          method: "POST",
          body: JSON.stringify({ image: fileData, file: fileData, filename }),
        }
      ),

    // Projects
    getProjects: () =>
      req<Project[]>(`${apiUrl}/projects`, { method: "GET" }),
    createProject: (data: Omit<Project, "id">) =>
      req<Project>(
        `${apiUrl}/admin/projects`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateProject: (id: number | string, data: Partial<Project>) =>
      req<Project>(
        `${apiUrl}/admin/projects/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteProject: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/projects/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Experiences
    getExperiences: () =>
      req<Experience[]>(`${apiUrl}/experiences`, { method: "GET" }),
    createExperience: (data: Omit<Experience, "id">) =>
      req<Experience>(
        `${apiUrl}/admin/experiences`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateExperience: (id: number | string, data: Partial<Experience>) =>
      req<Experience>(
        `${apiUrl}/admin/experiences/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteExperience: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/experiences/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Education
    getEducation: () =>
      req<Education[]>(`${apiUrl}/education`, { method: "GET" }),
    createEducation: (data: Omit<Education, "id">) =>
      req<Education>(
        `${apiUrl}/admin/education`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateEducation: (id: number | string, data: Partial<Education>) =>
      req<Education>(
        `${apiUrl}/admin/education/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteEducation: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/education/${id}`,
        {
          method: "DELETE",
        }
      ),

    // What I Built
    getWhatIBuilt: () =>
      req<WhatIBuilt[]>(`${apiUrl}/what-i-built`, { method: "GET" }),
    createWhatIBuilt: (data: Omit<WhatIBuilt, "id">) =>
      req<WhatIBuilt>(
        `${apiUrl}/admin/what-i-built`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateWhatIBuilt: (id: number | string, data: Partial<WhatIBuilt>) =>
      req<WhatIBuilt>(
        `${apiUrl}/admin/what-i-built/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteWhatIBuilt: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/what-i-built/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Testimonials
    getTestimonials: () =>
      req<Testimonial[]>(`${apiUrl}/testimonials`, { method: "GET" }),
    createTestimonial: (data: Omit<Testimonial, "id">) =>
      req<Testimonial>(
        `${apiUrl}/admin/testimonials`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateTestimonial: (id: number | string, data: Partial<Testimonial>) =>
      req<Testimonial>(
        `${apiUrl}/admin/testimonials/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteTestimonial: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/testimonials/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Nav Links
    getNavLinks: () =>
      req<NavLink[]>(`${apiUrl}/nav-links`, { method: "GET" }),
    createNavLink: (data: Omit<NavLink, "id">) =>
      req<NavLink>(
        `${apiUrl}/admin/nav-links`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateNavLink: (id: number | string, data: Partial<NavLink>) =>
      req<NavLink>(
        `${apiUrl}/admin/nav-links/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteNavLink: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/nav-links/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Social Links
    getSocialLinks: () =>
      req<SocialLink[]>(`${apiUrl}/admin/social-links`, { method: "GET" }),
    createSocialLink: (data: Omit<SocialLink, "id">) =>
      req<SocialLink>(
        `${apiUrl}/admin/social-links`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    updateSocialLink: (id: number | string, data: Partial<SocialLink>) =>
      req<SocialLink>(
        `${apiUrl}/admin/social-links/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    deleteSocialLink: (id: number | string) =>
      req<{ success: boolean; message?: string }>(
        `${apiUrl}/admin/social-links/${id}`,
        {
          method: "DELETE",
        }
      ),

    // Generic Toggle Homepage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleHomepage: (endpoint: string, id: number | string, newStatus: boolean, fullItem?: any) =>
      req<unknown>(
        `${apiUrl}/admin/${endpoint}/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...(typeof fullItem === "object" && fullItem !== null ? fullItem : {}),
            showOnHomepage: newStatus,
          }),
        }
      ),

    // Reorder Items (Batch)
    reorder: (endpoint: string, orders: Array<{ id: number | string; sortOrder: number }>) => {
      // Map kebab-case slugs to backend snake_case table identifiers
      const tableMap: Record<string, string> = {
        "nav-links": "nav_links",
        "social-links": "social_links",
        "what-i-built": "what_i_built",
      };
      const table = tableMap[endpoint] || endpoint;
      const ids = orders
        .map((o) => (typeof o.id === "string" ? parseInt(o.id, 10) : Number(o.id)))
        .filter((id) => !Number.isNaN(id));

      return req<{ message?: string; success?: boolean }>(
        `${apiUrl}/admin/reorder/${table}`,
        {
          method: "PUT",
          body: JSON.stringify({ ids, orders, items: orders }),
        }
      );
    },
  };
}
