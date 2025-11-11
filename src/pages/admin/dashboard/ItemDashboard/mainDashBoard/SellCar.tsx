import React, { useMemo, useState } from "react";
import { SearchIcon } from "../icon";
import apiClient from "src/services/api/functions/api";

type ListingStatus = "Active" | "Pending" | "Hidden" | "Sold";
type VehicleCondition = "New" | "Used";

interface CarListing {
  id: string;
  carName: string;
  brand: string;
  status: ListingStatus;
  condition: VehicleCondition;
  price: number;
  modelYear: number;
  location: string;
  sellerName: string;
  sellerPhone: string;
  postedDate: string;
}

const LISTINGS: CarListing[] = [
  {
    id: "SC-101",
    carName: "Toyota Corolla LE",
    brand: "Toyota",
    status: "Active",
    condition: "Used",
    price: 17500,
    modelYear: 2021,
    location: "Dallas, TX",
    sellerName: "Tina Nguyen",
    sellerPhone: "+1 555 432 9900",
    postedDate: "2025-03-12",
  },
  {
    id: "SC-088",
    carName: "Tesla Model Y Long Range",
    brand: "Tesla",
    status: "Pending",
    condition: "New",
    price: 48900,
    modelYear: 2025,
    location: "San Jose, CA",
    sellerName: "Marcus Lee",
    sellerPhone: "+1 555 678 1122",
    postedDate: "2025-03-10",
  },
  {
    id: "SC-076",
    carName: "Honda CR-V EX-L",
    brand: "Honda",
    status: "Hidden",
    condition: "Used",
    price: 26800,
    modelYear: 2022,
    location: "Chicago, IL",
    sellerName: "Alicia Kim",
    sellerPhone: "+1 555 889 4455",
    postedDate: "2025-02-28",
  },
  {
    id: "SC-064",
    carName: "Ford F-150 XLT",
    brand: "Ford",
    status: "Sold",
    condition: "Used",
    price: 35900,
    modelYear: 2023,
    location: "Phoenix, AZ",
    sellerName: "Justin Park",
    sellerPhone: "+1 555 201 7744",
    postedDate: "2025-02-19",
  },
];

const statusStyles: Record<ListingStatus, string> = {
  Active: "bg-green-100 text-green-600",
  Pending: "bg-amber-100 text-amber-600",
  Hidden: "bg-slate-100 text-slate-500",
  Sold: "bg-blue-100 text-blue-600",
};

const conditionStyles: Record<VehicleCondition, string> = {
  New: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Used: "bg-sky-50 text-sky-600 border border-sky-100",
};

export const SellTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus | "All">(
    "All"
  );
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(
    null
  );
  async function getListings() {
    const response = await apiClient.get("/admin",{

    });
    const data = await response;
  }
  
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(
      new Set(LISTINGS.map((listing) => listing.brand))
    );
    return ["All", ...uniqueBrands];
  }, []);

  const summary = useMemo(() => {
    const total = LISTINGS.length;
    const active = LISTINGS.filter(
      (listing) => listing.status === "Active"
    ).length;
    const pending = LISTINGS.filter(
      (listing) => listing.status === "Pending"
      
    ).length;
    return { total, active, pending };
  }, []);

  const filteredListings = useMemo(() => {
    return LISTINGS.filter((listing) => {
      const matchesSearch =
        listing.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand =
        selectedBrand === "All" || listing.brand === selectedBrand;
      const matchesStatus =
        selectedStatus === "All" || listing.status === selectedStatus;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [searchTerm, selectedBrand, selectedStatus]);

  return (
    <section className="flex flex-col gap-6">
      <header className="bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              For Sale Management
            </h2>
            <p className="text-sm text-slate-500">
              Quickly review listings waiting to go live on SoldCars.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Export Data
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              type="button"
            >
              + Add Car
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Listings
            </p>
            <span className="mt-2 block text-3xl font-bold text-slate-800">
              {summary.total}
            </span>
          </article>
          <article className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active
            </p>
            <span className="mt-2 block text-3xl font-bold text-emerald-600">
              {summary.active}
            </span>
          </article>
          <article className="rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending review
            </p>
            <span className="mt-2 block text-3xl font-bold text-amber-600">
              {summary.pending}
            </span>
          </article>
        </div>
      </header>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by car, seller, or listing ID..."
              className="w-full rounded-lg border border-slate-200 pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedBrand}
              onChange={(event) => setSelectedBrand(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as ListingStatus | "All")
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["All", "Active", "Pending", "Hidden", "Sold"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedBrand("All");
                setSelectedStatus("All");
                setSearchTerm("");
              }}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Listing</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">Condition</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.map((listing) => (
                <tr key={listing.id} className="text-sm text-slate-600">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {listing.carName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {listing.modelYear} • ID {listing.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{listing.brand}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${conditionStyles[listing.condition]}`}
                    >
                      {listing.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    ${listing.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        {listing.sellerName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {listing.sellerPhone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        {listing.location}
                      </span>
                      <span className="text-xs text-slate-500">
                        Posted {new Date(listing.postedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        type="button"
                      >
                        View
                      </button>
                      {listing.status === "Pending" && (
                        <button
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                          type="button"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        type="button"
                      >
                        Hide
                      </button>
                      <button
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredListings.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No listings found. Try another search or reset the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredListings.length}
            </span>{" "}
            of {LISTINGS.length} listings
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedListing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedListing.carName}
                </h3>
                <p className="text-xs text-slate-500">
                  Listing {selectedListing.id} • {selectedListing.modelYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                type="button"
              >
                Close
              </button>
            </header>
            <div className="grid gap-4 px-6 py-6 text-sm text-slate-600">
              <section className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Seller
                </h4>
                <div className="mt-3 space-y-1">
                  <p className="font-medium text-slate-700">
                    {selectedListing.sellerName}
                  </p>
                  <p>{selectedListing.sellerPhone}</p>
                  <p>{selectedListing.location}</p>
                </div>
              </section>
              <section className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Listing info
                </h4>
                <div className="mt-3 space-y-1">
                  <p>Status: {selectedListing.status}</p>
                  <p>
                    Price:{" "}
                    <span className="font-semibold text-slate-900">
                      ${selectedListing.price.toLocaleString()}
                    </span>
                  </p>
                  <p>Posted: {new Date(selectedListing.postedDate).toLocaleDateString()}</p>
                  <p>Condition: {selectedListing.condition}</p>
                </div>
              </section>
            </div>
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                type="button"
              >
                Hide
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                type="button"
              >
                Delete
              </button>
              {selectedListing.status === "Pending" && (
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  type="button"
                >
                  Approve Listing
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}