import React, { useState, useEffect } from 'react';
import { X, Plane, Calendar, ShieldCheck, Wrench, Layers, Tag, ExternalLink } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import aircraftApi from '../../api/aircraft';

export default function AircraftDetailDrawer({ aircraftId, onClose, onEdit }) {
  const [aircraft, setAircraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!aircraftId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    aircraftApi
      .getAircraftDetail(aircraftId)
      .then((data) => {
        if (isMounted) setAircraft(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load aircraft specifications.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [aircraftId]);

  if (!aircraftId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
                Fleet Airworthiness Dossier
              </span>
              <h2 className="text-xl font-bold text-white font-mono">{aircraft?.registration_number || 'Loading...'}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-6">
          {loading ? (
            <LoadingSpinner size="lg" text="Retrieving aircraft specifications and attached equipment..." />
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          ) : aircraft ? (
            <>
              {/* Status & Key Meta */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Airworthiness Status</span>
                  <div className="mt-1">
                    <StatusBadge status={aircraft.status} label={aircraft.status_display} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">MSN Serial</span>
                  <div className="text-sm font-bold text-white font-mono mt-1">{aircraft.serial_number}</div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Airframe Specifications</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Model Designation:</span>
                    <div className="text-sm font-semibold text-white mt-0.5">{aircraft.model}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Manufacturer:</span>
                    <div className="text-sm font-semibold text-white mt-0.5">{aircraft.manufacturer}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Aircraft Type:</span>
                    <div className="text-sm font-semibold text-white mt-0.5">{aircraft.aircraft_type}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Installed Equipment:</span>
                    <div className="text-sm font-semibold text-emerald-400 mt-0.5 font-mono">
                      {aircraft.equipment_count || aircraft.equipment?.length || 0} Subsystems
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Dates */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Service Timeline</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Manufacture Date:</span>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">
                      {aircraft.manufacture_date || 'Not recorded'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">Service Entry Date:</span>
                    <div className="text-sm font-semibold text-slate-200 mt-0.5">
                      {aircraft.service_entry_date || 'Not recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attached Equipment List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-teal-400" />
                    <span>Installed Major Components ({aircraft.equipment?.length || 0})</span>
                  </h3>
                </div>

                {aircraft.equipment && aircraft.equipment.length > 0 ? (
                  <div className="space-y-2.5">
                    {aircraft.equipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-blue-400">{eq.equipment_code}</span>
                            <span className="text-slate-500">&bull;</span>
                            <span className="text-slate-400">{eq.equipment_type_display || eq.equipment_type}</span>
                          </div>
                          <div className="text-sm font-semibold text-white mt-0.5">{eq.name}</div>
                          {eq.location && <div className="text-[11px] text-slate-400 mt-0.5">Loc: {eq.location}</div>}
                        </div>
                        <StatusBadge status={eq.status} label={eq.status_display} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    No major equipment or subsystems currently attached to this airframe.
                  </div>
                )}
              </div>

              {/* Remarks */}
              {aircraft.notes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Logbook Remarks:</span>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {aircraft.notes}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
          {onEdit && aircraft && (
            <button
              onClick={() => {
                onClose();
                onEdit(aircraft);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              Edit Airframe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
