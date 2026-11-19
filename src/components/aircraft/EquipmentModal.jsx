import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';
import aircraftApi from '../../api/aircraft';

export const EQUIPMENT_TYPE_CHOICES = [
  { value: 'ENGINE', label: 'Engine' },
  { value: 'AVIONICS', label: 'Avionics System' },
  { value: 'LANDING_GEAR', label: 'Landing Gear' },
  { value: 'HYDRAULICS', label: 'Hydraulics' },
  { value: 'SAFETY', label: 'Safety Equipment' },
  { value: 'APU', label: 'Auxiliary Power Unit (APU)' },
  { value: 'OTHER', label: 'Other Subsystem' },
];

export const EQUIPMENT_STATUS_CHOICES = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'IN_STORAGE', label: 'In Storage' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
];

export default function EquipmentModal({ isOpen, onClose, onSuccess, initialData = null, aircraftList = [] }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    equipment_code: '',
    name: '',
    equipment_type: 'OTHER',
    manufacturer: '',
    serial_number: '',
    status: 'OPERATIONAL',
    aircraft: '',
    location: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipment_code: initialData.equipment_code || '',
        name: initialData.name || '',
        equipment_type: initialData.equipment_type || 'OTHER',
        manufacturer: initialData.manufacturer || '',
        serial_number: initialData.serial_number || '',
        status: initialData.status || 'OPERATIONAL',
        aircraft: initialData.aircraft || '',
        location: initialData.location || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        equipment_code: '',
        name: '',
        equipment_type: 'OTHER',
        manufacturer: '',
        serial_number: '',
        status: 'OPERATIONAL',
        aircraft: '',
        location: '',
        notes: '',
      });
    }
    setErrorMsg('');
    setFieldErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'equipment_code' ? value.toUpperCase() : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.equipment_code.trim()) errs.equipment_code = 'Equipment code is required.';
    if (!formData.name.trim()) errs.name = 'Descriptive component name is required.';
    if (!formData.manufacturer.trim()) errs.manufacturer = 'Manufacturer name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    const clientErrs = validate();
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      equipment_code: formData.equipment_code.trim().toUpperCase(),
      serial_number: formData.serial_number.trim(),
      aircraft: formData.aircraft ? parseInt(formData.aircraft, 10) : null,
      location: formData.location.trim(),
    };

    try {
      if (isEdit) {
        await aircraftApi.updateEquipment(initialData.id, payload);
      } else {
        await aircraftApi.createEquipment(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setErrorMsg(data);
        } else if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          const parsed = {};
          Object.keys(data).forEach((key) => {
            parsed[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
          });
          setFieldErrors(parsed);
          setErrorMsg('Please review and correct the errors below.');
        }
      } else {
        setErrorMsg(err.message || 'Failed to save equipment record.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? `Edit Equipment — ${initialData.equipment_code}` : 'Register Equipment & Subsystem'}
              </h2>
              <p className="text-xs text-slate-400">Major Component Airframe Link or Warehouse Bins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Equipment Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Equipment Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="equipment_code"
                value={formData.equipment_code}
                onChange={handleChange}
                placeholder="e.g. EQ-ENG-001"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.equipment_code ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm font-mono uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.equipment_code && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.equipment_code}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descriptive Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. CFM56-7B Turbofan Engine"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.name}</p>
              )}
            </div>
          </div>

          {/* Type & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Equipment Classification <span className="text-rose-400">*</span>
              </label>
              <select
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {EQUIPMENT_TYPE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manufacturer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. CFM International, Honeywell"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.manufacturer ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.manufacturer && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.manufacturer}</p>
              )}
            </div>
          </div>

          {/* Serial Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Serial Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="e.g. SN-88219"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operational Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {EQUIPMENT_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Aircraft & Physical Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Installed Aircraft Airframe <span className="text-slate-500 font-normal">(Leave blank if in storage)</span>
              </label>
              <select
                name="aircraft"
                value={formData.aircraft}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">-- In Storage / Uninstalled --</option>
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.registration_number} ({ac.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Warehouse Bin / Physical Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Hangar 1 - Bay B or Shelf E3"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Technical Log & Maintenance Remarks
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Overhaul history, operating hours, cycles, or inspection notes..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50"
            >
              {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              <span>{isEdit ? 'Update Equipment' : 'Register Equipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
