"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calculationAPI, CalculationData } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth";

export default function CalculationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ri: "",
    ri_next: "",
    foot_j: "",
    r_j: "",
    h: "",
    file_name: "",
  });
  const [results, setResults] = useState<{
    hr: number | null;
    ptt: number | null;
    mbp: number | null;
  } | null>(null);
  const [calculations, setCalculations] = useState<CalculationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCalculations();
  }, []);

  const loadCalculations = async () => {
    try {
      setLoading(true);
      const data = await calculationAPI.list();
      console.log("Loaded calculations:", data); // Debug log
      setCalculations(data);
    } catch (err) {
      console.error("Failed to load calculations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    const ri = parseFloat(formData.ri);
    const ri_next = parseFloat(formData.ri_next);
    const foot_j = parseFloat(formData.foot_j);
    const r_j = parseFloat(formData.r_j);
    const h = parseFloat(formData.h);

    // Validate inputs
    if (isNaN(ri) || isNaN(ri_next) || isNaN(foot_j) || isNaN(r_j) || isNaN(h)) {
      alert("Please fill in all required fields with valid numbers");
      return;
    }

    if (ri_next <= ri) {
      alert("R_i+1 must be greater than R_i");
      return;
    }

    if (foot_j <= r_j) {
      alert("foot_j must be greater than R_j");
      return;
    }

    if (h <= 0) {
      alert("h must be greater than 0");
      return;
    }

    // Calculate locally first
    const rr_i = ri_next - ri;
    const hr = 60.0 / rr_i;
    const ptt = foot_j - r_j;
    const mbp = (1.947 * (h ** 2) / (ptt ** 2)) + 31.84 * h;

    setResults({
      hr: parseFloat(hr.toFixed(2)),
      ptt: parseFloat(ptt.toFixed(6)),
      mbp: parseFloat(mbp.toFixed(2)),
    });
  };

  const handleSave = async () => {
    if (!results) {
      alert("Please calculate first before saving");
      return;
    }

    try {
      setSubmitting(true);
      const ri = parseFloat(formData.ri);
      const ri_next = parseFloat(formData.ri_next);
      const foot_j = parseFloat(formData.foot_j);
      const r_j = parseFloat(formData.r_j);
      const h = parseFloat(formData.h);

      await calculationAPI.create({
        ri,
        ri_next,
        foot_j,
        r_j,
        h,
        file_name: formData.file_name || undefined,
      });

      // Reload calculations
      await loadCalculations();

      // Reset form
      setFormData({
        ri: "",
        ri_next: "",
        foot_j: "",
        r_j: "",
        h: "",
        file_name: "",
      });
      setResults(null);

      alert("Calculation saved successfully!");
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err?.response?.data?.error || err?.message || "Save failed";
      alert(`Save failed: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this calculation?")) {
      return;
    }

    try {
      setDeleting(id);
      await calculationAPI.delete(id);
      await loadCalculations();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete calculation");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    clearAuthTokens();
    router.push("/login");
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calculation (HR, PTT, MBP)</h1>
        <div className="flex gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Input</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                R_i (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                name="ri"
                value={formData.ri}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter R_i"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                R_i+1 (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                name="ri_next"
                value={formData.ri_next}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter R_i+1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                foot_j (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                name="foot_j"
                value={formData.foot_j}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter foot_j"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                R_j (seconds) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                name="r_j"
                value={formData.r_j}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter R_j"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                h (meters) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="h"
                value={formData.h}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                File Name (optional)
              </label>
              <input
                type="text"
                name="file_name"
                value={formData.file_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter file name"
              />
            </div>

            <div className="flex gap-3">
              <button
                className="btn btn-primary flex-1"
                onClick={handleCalculate}
              >
                Calculate
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleSave}
                disabled={!results || submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Output</h2>
          {results ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-1">Heart Rate (HR)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {results.hr} bpm
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-1">
                  Pulse Transit Time (PTT)
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {results.ptt} s
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-1">
                  Mean Blood Pressure (MBP)
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {results.mbp} mmHg
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Click "Calculate" to see results
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="card mt-6">
        <h2 className="text-2xl font-semibold mb-4">Calculation History</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : calculations.length === 0 ? (
          <p className="text-gray-600">No calculations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    File Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    HR (bpm)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    PTT (s)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    MBP (mmHg)
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {calc.created_at 
                        ? (() => {
                            try {
                              const date = new Date(calc.created_at);
                              return isNaN(date.getTime()) ? calc.created_at : date.toLocaleString();
                            } catch {
                              return calc.created_at;
                            }
                          })()
                        : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {calc.file_name || "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {calc.hr != null ? calc.hr.toFixed(2) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {calc.ptt != null ? calc.ptt.toFixed(6) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {calc.mbp != null ? calc.mbp.toFixed(2) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(calc.id)}
                        disabled={deleting === calc.id}
                      >
                        {deleting === calc.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

