import React, { useState, useEffect } from 'react';
import { X, Plane, AlertCircle, CheckCircle2 } from 'lucide-react';
import aircraftApi from '../../api/aircraft';

export const AIRCRAFT_STATUS_CHOICES = [
  { value: 'ACTIVE', label: 'Active in Service' },
  { value: 'MAINTENANCE', label: 'Under Maintenance' },
  { value: 'GROUNDED', label: 'Grounded / Offline' },
  { value: 'RETIRED', label: 'Retired from Fleet' },
];

export default function AircraftModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    registration_number: '',
    aircraft_type: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    status: 'ACTIVE',
    manufacture_date: '',
    service_entry_date: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        registration_number: initialData.registration_number || '',
        aircraft_type: initialData.aircraft_type || '',
        model: initialData.model || '',
        manufacturer: initialData.manufacturer || '',
        serial_number: initialData.serial_number || '',
        status: initialData.status || 'ACTIVE',
        manufacture_date: initialData.manufacture_date || '',
        service_entry_date: initialData.service_entry_date || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        registration_number: '',
        aircraft_type: '',
        model: '',
        manufacturer: '',
        serial_number: '',
        status: 'ACTIVE',
        manufacture_date: '',
        service_entry_date: '',
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
      [name]: name === 'registration_number' ? value.toUpperCase() : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.registration_number.trim()) errs.registration_number = 'Registration tail number is required.';
    if (!formData.aircraft_type.trim()) errs.aircraft_type = 'Aircraft type/category is required.';
    if (!formData.model.trim()) errs.model = 'Aircraft model designation is required.';
    if (!formData.manufacturer.trim()) errs.manufacturer = 'Manufacturer name is required.';
    if (!formData.serial_number.trim()) errs.serial_number = 'Manufacturer Serial Number (MSN) is required.';
    if (formData.manufacture_date && formData.service_entry_date) {
      if (formData.service_entry_date < formData.manufacture_date) {
        errs.service_entry_date = 'Service entry date cannot precede manufacture date.';
      }
    }
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
      registration_number: formData.registration_number.trim().toUpperCase(),
      serial_number: formData.serial_number.trim(),
      manufacture_date: formData.manufacture_date || null,
      service_entry_date: formData.service_entry_date || null,
    };

    try {
      if (isEdit) {
        await aircraftApi.updateAircraft(initialData.id, payload);
      } else {
        await aircraftApi.createAircraft(payload);
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
        setErrorMsg(err.message || 'Failed to save aircraft record.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? `Edit Aircraft — ${initialData.registration_number}` : 'Register New Fleet Aircraft'}
              </h2>
              <p className="text-xs text-slate-400">FAA & EASA Fleet Master Airworthiness Record</p>
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
          {/* Registration & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registration / Tail Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="e.g. VT-FFX or N1044"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.registration_number ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm font-mono uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.registration_number && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.registration_number}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manufacturer Serial Number (MSN) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="e.g. MSN-41235"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.serial_number ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.serial_number && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.serial_number}</p>
              )}
            </div>
          </div>

          {/* Model & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Model Designation <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Boeing 737-800 or A320neo"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.model ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.model && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.model}</p>
              )}
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
                placeholder="e.g. Boeing, Airbus, Bombardier"
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

          {/* Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aircraft Type / Category <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="aircraft_type"
                value={formData.aircraft_type}
                onChange={handleChange}
                placeholder="e.g. Commercial Narrowbody Jet"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.aircraft_type ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.aircraft_type && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.aircraft_type}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operational Airworthiness Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {AIRCRAFT_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manufacture Date & Service Entry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manufacture Date <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                name="manufacture_date"
                value={formData.manufacture_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
              {fieldErrors.manufacture_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.manufacture_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Entry Date <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                name="service_entry_date"
                value={formData.service_entry_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.service_entry_date ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.service_entry_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.service_entry_date}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Technical Remarks & Logbook Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Airframe hours, delivery customer details, or operator remarks..."
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
              <span>{isEdit ? 'Update Aircraft' : 'Register Aircraft'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
