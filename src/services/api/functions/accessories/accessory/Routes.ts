export const accessoryRoute = {
  list: "/accessories",
  create: "/accessories",
  update: (id: number) => `/accessories/${encodeURIComponent(id)}`,
  detail: (id: number) => `/accessories/${encodeURIComponent(id)}`,
  delete: (id: number) => `/accessories/${encodeURIComponent(id)}`,
};
