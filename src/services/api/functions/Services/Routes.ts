export const serviceRoute = {
  list: "/categories",
  create: "/categories",
  update: (id: number) => `/categories/${encodeURIComponent(id)}`,
  detail: (id: number) => `/categories/${encodeURIComponent(id)}`,
};
