export const categoryRoute = {
  list: "/categories",
  detail: (id: number) => `/categories/${encodeURIComponent(id)}`,
  create: "/categories",
  update: (id: number) => `/categories/${encodeURIComponent(id)}`,
};
