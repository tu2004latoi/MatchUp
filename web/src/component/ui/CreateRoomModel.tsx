import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type CreateFormState = {
  name: string;
  description: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PROFESSIONAL";
  visibility: "VISIBLE" | "HIDDEN";
  maxMembers: string;
  startTime: string;
  endTime: string;
  open: boolean;
  address: string;
  district: string;
  region: string;
  categoryId: string;
  hasPassword: boolean;
  password: string;
  roomType: "EVENT";
};

type Category = {
  id: number;
  name: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  creating: boolean;
  createForm: CreateFormState;
  setCreateForm: (
    form: CreateFormState | ((prev: CreateFormState) => CreateFormState)
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  locationPreview: string;
  skillLevels: readonly string[];
  visibilityOptions: readonly string[];
  categories: Category[];
};

export default function CreateRoomModal({
  isOpen,
  onClose,
  creating,
  createForm,
  setCreateForm,
  onSubmit,
  locationPreview,
  skillLevels,
  visibilityOptions,
  categories,
}: Props) {
  const inputStyle =
    "w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <button
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100"
          >
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">Create Room</h3>
                  <p className="text-sm text-blue-100 mt-1">
                    Organize your next sports session
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <input
                    placeholder="Room name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className={inputStyle}
                  />
                </div>

                <div className="md:col-span-2">
                  <textarea
                    placeholder="Description (optional)"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className={`${inputStyle} min-h-[90px]`}
                  />
                </div>

                <select
                  value={createForm.categoryId}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      categoryId: e.target.value,
                    }))
                  }
                  className={inputStyle}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  placeholder="Max members"
                  value={createForm.maxMembers}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      maxMembers: e.target.value,
                    }))
                  }
                  className={inputStyle}
                />
              </div>

              {/* Skill Level Pills */}
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">
                  Skill Level
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillLevels.map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() =>
                        setCreateForm((p) => ({
                          ...p,
                          skillLevel: level as any,
                        }))
                      }
                      className={`px-4 py-2 rounded-full text-xs font-bold transition
                        ${
                          createForm.skillLevel === level
                            ? "bg-blue-600 text-white shadow"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Type */}
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2">
                  Room Type
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 rounded-full text-xs font-bold bg-purple-600 text-white shadow">
                    🎉 EVENT
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="grid md:grid-cols-2 gap-5">
                <input
                  type="datetime-local"
                  value={createForm.startTime}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      startTime: e.target.value,
                    }))
                  }
                  className={inputStyle}
                />
                <input
                  type="datetime-local"
                  value={createForm.endTime}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      endTime: e.target.value,
                    }))
                  }
                  className={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={createForm.hasPassword}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        hasPassword: e.target.checked,
                        password: e.target.checked ? p.password : "",
                      }))
                    }
                    className="w-5 h-5"
                  />
                  Require password
                </label>

                <AnimatePresence>
                  {createForm.hasPassword && (
                    <motion.input
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      type="password"
                      placeholder="Enter password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                      className={`${inputStyle} mt-3`}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400">
                  Location • {locationPreview}
                </p>
                <input
                  placeholder="Address"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      address: e.target.value,
                    }))
                  }
                  className={inputStyle}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    placeholder="District"
                    value={createForm.district}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        district: e.target.value,
                      }))
                    }
                    className={inputStyle}
                  />
                  <input
                    placeholder="Region"
                    value={createForm.region}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        region: e.target.value,
                      }))
                    }
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition disabled:opacity-60"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Room"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}