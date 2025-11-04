import React from "react";
import { SearchIcon, UserIcon } from "../icon";

type UserStatus = "Active" | "Pending" | "Suspended";
type UserRole = "Admin" | "Moderator" | "Member";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  listings: number;
}

const USERS: User[] = [
  {
    id: 1,
    name: "Nguyen Van An",
    email: "an.nguyen@example.com",
    phone: "+84 912 345 678",
    role: "Admin",
    status: "Active",
    joinedAt: "2024-10-02",
    lastActive: "2025-03-14",
    listings: 14,
  },
  {
    id: 2,
    name: "Nguyen Min Tan",
    email: "mtan@example.com",
    phone: "+84 936 987 222",
    role: "Moderator",
    status: "Active",
    joinedAt: "2024-09-21",
    lastActive: "2025-03-12",
    listings: 6,
  },
  {
    id: 3,
    name: "Nguyen The Phong",
    email: "phong.nt@example.com",
    phone: "+84 907 888 119",
    role: "Member",
    status: "Pending",
    joinedAt: "2025-01-04",
    lastActive: "2025-03-10",
    listings: 2,
  },
  {
    id: 4,
    name: "Vũ Quang Vinh",
    email: "vinh.vq@example.com",
    phone: "+84 915 112 545",
    role: "Member",
    status: "Suspended",
    joinedAt: "2024-05-16",
    lastActive: "2025-02-27",
    listings: 0,
  },
  {
    id: 5,
    name: "Nguyen Van Manh",
    email: "manh.vn@example.com",
    phone: "+84 911 888 333",
    role: "Moderator",
    status: "Active",
    joinedAt: "2024-11-10",
    lastActive: "2025-03-14",
    listings: 11,
  },
];

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-green-100 text-green-600",
  Pending: "bg-amber-100 text-amber-600",
  Suspended: "bg-red-100 text-red-600",
};

const roleStyles: Record<UserRole, string> = {
  Admin: "bg-purple-100 text-purple-600 border border-purple-200",
  Moderator: "bg-blue-100 text-blue-600 border border-blue-200",
  Member: "bg-slate-100 text-slate-600 border border-slate-200",
};

const SUMMARY_CARD_COLOR = [
  "bg-indigo-50 text-indigo-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
] as const;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const UsersTab: React.FC = () => {
  const totals = {
    all: USERS.length,
    active: USERS.filter((user) => user.status === "Active").length,
    pending: USERS.filter((user) => user.status === "Pending").length,
  };

  const summaryCards = [
    {
      label: "Total accounts",
      value: totals.all,
      trending: "+12.5% vs last month",
      helper: "Includes every access role",
    },
    {
      label: "Active this week",
      value: totals.active,
      trending: "92% logged in recently",
      helper: "Accounts with recent sessions",
    },
    {
      label: "Pending review",
      value: totals.pending,
      trending: "3 new requests today",
      helper: "Awaiting approval or activation",
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <header className="bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                User management
              </h2>
              <p className="text-sm text-slate-500">
                Monitor account health, permissions, and onboarding status.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition duration-200"
              type="button"
            >
              Export users
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              type="button"
            >
              + Invite user
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card, index) => (
            <article
              key={card.label}
              className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50/40"
            >
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {card.label}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-800">
                  {card.value}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    SUMMARY_CARD_COLOR[index]
                  }`}
                >
                  {card.trending}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{card.helper}</p>
            </article>
          ))}
        </div>
      </header>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-lg border border-slate-200 pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All roles</option>
              <option>Admin</option>
              <option>Moderator</option>
              <option>Member</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Joined date</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Custom...</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase text-slate-500">
                <th className="px-6 py-3">
                  <span className="sr-only">Select</span>
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Listings</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {USERS.map((user) => (
                <tr key={user.id} className="text-sm text-slate-600">
                  <td className="px-6 py-4 align-top">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 accent-blue-500"
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">
                          Last active: {formatDate(user.lastActive)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleStyles[user.role]}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[user.status]}`}
                    >
                      {user.status === "Active"
                        ? "Active"
                        : user.status === "Pending"
                        ? "Pending"
                        : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-700">
                        {user.email}
                      </span>
                      <span className="text-slate-500">{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-700">
                        {formatDate(user.joinedAt)}
                      </span>
                      <span className="text-slate-500">
                        {user.status === "Pending"
                          ? "Awaiting verification"
                          : "Verified"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className="text-sm font-medium text-slate-700">
                      {user.listings} cars
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition bg-white"
                        type="button"
                      >
                        View profile
                      </button>
                      <button
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition bg-blue-50/50"
                        type="button"
                      >
                        Manage access
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Selected <span className="font-semibold text-slate-700">0</span> of{" "}
            {USERS.length} users
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Suspend accounts
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Resend verification
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Remove from system
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
