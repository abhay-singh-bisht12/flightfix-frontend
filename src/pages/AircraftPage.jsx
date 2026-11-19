import React, { useState, useEffect, useCallback } from 'react';
import {
  Plane,
  Wrench,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import AircraftModal, { AIRCRAFT_STATUS_CHOICES } from '../components/aircraft/AircraftModal';
import EquipmentModal, { EQUIPMENT_STATUS_CHOICES, EQUIPMENT_TYPE_CHOICES } from '../components/aircraft/EquipmentModal';
import AircraftDetailDrawer from '../components/aircraft/AircraftDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import aircraftApi from '../api/aircraft';

export default function AircraftPage() {
  const { role, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const canDelete = hasRole(ROLES.ADMIN);

  // Active tab: 'aircraft' | 'equipment'
  const [activeTab, setActiveTab] = useState('aircraft');

  // --- Aircraft State ---
  const [aircraftList, setAircraftList] = useState([]);
  const [aircraftCount, setAircraftCount] = useState(0);
  const [aircraftPage, setAircraftPage] = useState(1);
  const [aircraftLoading, setAircraftLoading] = useState(true);
  const [aircraftError, setAircraftError] = useState(null);

  // Filters for Aircraft
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [aircraftStatusFilter, setAircraftStatusFilter] = useState('');

  // Modals for Aircraft
  const [isAircraftModalOpen, setIsAircraftModalOpen] = useState(false);
  const [selectedAircraftForEdit, setSelectedAircraftForEdit] = useState(null);
  const [selectedAircraftDetailId, setSelectedAircraftDetailId] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'aircraft'|'equipment', item: obj }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- Equipment State ---
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  const [equipmentError, setEquipmentError] = useState(null);

  // Filters for Equipment
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState('');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState('');

  // Modals for Equipment
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState(null);

  // Success Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // --- Fetch Aircraft List ---
  const fetchAircraft = useCallback(async (page = 1) => {
    setAircraftLoading(true);
    setAircraftError(null);
    try {
      const params = { page };
      if (aircraftSearch.trim()) params.search = aircraftSearch.trim();
      if (aircraftStatusFilter) params.status = aircraftStatusFilter;

      const data = await aircraftApi.getAircraftList(params);
      setAircraftList(data.results || []);
      setAircraftCount(data.count || 0);
      setAircraftPage(page);
    } catch (err) {
      console.error('Fetch Aircraft Error:', err);
      setAircraftError(err.message || 'Unable to load aircraft fleet data.');
    } finally {
      setAircraftLoading(false);
    }
  }, [aircraftSearch, aircraftStatusFilter]);

  // --- Fetch Equipment List ---
  const fetchEquipment = useCallback(async (page = 1) => {
    setEquipmentLoading(true);
    setEquipmentError(null);
    try {
      const params = { page };
      if (equipmentSearch.trim()) params.search = equipmentSearch.trim();
      if (equipmentStatusFilter) params.status = equipmentStatusFilter;
      if (equipmentTypeFilter) params.equipment_type = equipmentTypeFilter;

      const data = await aircraftApi.getEquipmentList(params);
      setEquipmentList(data.results || []);
      setEquipmentCount(data.count || 0);
      setEquipmentPage(page);
    } catch (err) {
      console.error('Fetch Equipment Error:', err);
      setEquipmentError(err.message || 'Unable to load equipment records.');
    } finally {
      setEquipmentLoading(false);
    }
  }, [equipmentSearch, equipmentStatusFilter, equipmentTypeFilter]);

  useEffect(() => {
    if (activeTab === 'aircraft') {
      fetchAircraft(1);
    } else {
      fetchEquipment(1);
    }
  }, [activeTab, fetchAircraft, fetchEquipment]);

  // Pre-fetch aircraft options for equipment modal dropdown
  useEffect(() => {
    if (activeTab === 'equipment' && aircraftList.length === 0) {
      aircraftApi.getAircraftList({ page_size: 100 }).then((res) => {
        if (res.results) setAircraftList(res.results);
      }).catch(() => {});
    }
  }, [activeTab, aircraftList.length]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'aircraft') {
        await aircraftApi.deleteAircraft(deleteTarget.item.id);
        showToast(`Aircraft ${deleteTarget.item.registration_number} deleted successfully.`);
        fetchAircraft(aircraftPage);
      } else {
        await aircraftApi.deleteEquipment(deleteTarget.item.id);
        showToast(`Equipment ${deleteTarget.item.equipment_code} deleted successfully.`);
        fetchEquipment(equipmentPage);
      }
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Aircraft & Equipment Management</h1>
              <p className="text-xs text-slate-400">
                Airframe specifications, tail numbers, serial tracking, and major subsystems
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & New Record Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('aircraft')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'aircraft'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Fleet Aircraft ({aircraftCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'equipment'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Equipment Systems ({equipmentCount})</span>
            </button>
          </div>

          {canModify && (
            <button
              onClick={() => {
                if (activeTab === 'aircraft') {
                  setSelectedAircraftForEdit(null);
                  setIsAircraftModalOpen(true);
                } else {
                  setSelectedEquipmentForEdit(null);
                  setIsEquipmentModalOpen(true);
                }
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'aircraft' ? 'New Aircraft' : 'New Equipment'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: AIRCRAFT FLEET */}
      {activeTab === 'aircraft' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={aircraftSearch}
                onChange={(e) => setAircraftSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAircraft(1)}
                placeholder="Search by tail #, model, manufacturer, serial..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <select
                value={aircraftStatusFilter}
                onChange={(e) => setAircraftStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Airworthiness Statuses</option>
                {AIRCRAFT_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchAircraft(1)}
                disabled={aircraftLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Aircraft List"
              >
                <RefreshCw className={`w-4 h-4 ${aircraftLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Aircraft Table / List */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            {aircraftLoading ? (
              <LoadingSpinner size="lg" text="Loading fleet aircraft records..." />
            ) : aircraftError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
                <span>{aircraftError}</span>
              </div>
            ) : aircraftList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Tail / Registration</th>
                      <th className="px-6 py-4 font-semibold">Model & Type</th>
                      <th className="px-6 py-4 font-semibold">Manufacturer</th>
                      <th className="px-6 py-4 font-semibold">Serial Number</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Equip Count</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {aircraftList.map((ac) => (
                      <tr key={ac.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white flex items-center space-x-2">
                          <Plane className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{ac.registration_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{ac.model}</div>
                          <span className="text-[11px] text-slate-400">{ac.aircraft_type}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{ac.manufacturer}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">{ac.serial_number}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={ac.status} label={ac.status_display} />
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400 font-semibold">
                          {ac.equipment_count || 0} Subsystems
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedAircraftDetailId(ac.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="View Airframe Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canModify && (
                              <button
                                onClick={() => {
                                  setSelectedAircraftForEdit(ac);
                                  setIsAircraftModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                                title="Edit Aircraft Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget({ type: 'aircraft', item: ac })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition-colors"
                                title="Delete Aircraft Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Plane className="w-12 h-12 mx-auto text-slate-600 mb-2 -rotate-45" />
                <h3 className="text-sm font-semibold text-slate-300">No Fleet Aircraft Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {aircraftSearch || aircraftStatusFilter
                    ? 'No aircraft match the selected search criteria.'
                    : 'No aircraft have been registered in the fleet yet.'}
                </p>
                {canModify && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedAircraftForEdit(null);
                        setIsAircraftModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register First Aircraft</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <Pagination
              count={aircraftCount}
              page={aircraftPage}
              pageSize={10}
              onPageChange={(p) => fetchAircraft(p)}
              loading={aircraftLoading}
            />
          </div>
        </div>
      )}

      {/* TAB 2: EQUIPMENT & SYSTEMS */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* Equipment Filters */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchEquipment(1)}
                placeholder="Search equipment code, name, manufacturer, location..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <select
                value={equipmentTypeFilter}
                onChange={(e) => setEquipmentTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Classifications</option>
                {EQUIPMENT_TYPE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={equipmentStatusFilter}
                onChange={(e) => setEquipmentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {EQUIPMENT_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchEquipment(1)}
                disabled={equipmentLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Equipment List"
              >
                <RefreshCw className={`w-4 h-4 ${equipmentLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            {equipmentLoading ? (
              <LoadingSpinner size="lg" text="Loading major equipment and subsystem records..." />
            ) : equipmentError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
                <span>{equipmentError}</span>
              </div>
            ) : equipmentList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Equipment Code</th>
                      <th className="px-6 py-4 font-semibold">Name & Manufacturer</th>
                      <th className="px-6 py-4 font-semibold">Classification</th>
                      <th className="px-6 py-4 font-semibold">Installed Airframe</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {equipmentList.map((eq) => (
                      <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-teal-400">
                          {eq.equipment_code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{eq.name}</div>
                          <span className="text-[11px] text-slate-400">Mfr: {eq.manufacturer}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {eq.equipment_type_display || eq.equipment_type}
                        </td>
                        <td className="px-6 py-4">
                          {eq.aircraft_registration ? (
                            <span className="inline-flex items-center space-x-1 font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20">
                              <Plane className="w-3 h-3" />
                              <span>{eq.aircraft_registration}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Uninstalled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{eq.location || '--'}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={eq.status} label={eq.status_display} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {canModify && (
                              <button
                                onClick={() => {
                                  setSelectedEquipmentForEdit(eq);
                                  setIsEquipmentModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                                title="Edit Equipment Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget({ type: 'equipment', item: eq })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition-colors"
                                title="Delete Equipment Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Wrench className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <h3 className="text-sm font-semibold text-slate-300">No Equipment Records Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {equipmentSearch || equipmentStatusFilter || equipmentTypeFilter
                    ? 'No equipment matches the selected search filters.'
                    : 'No major equipment or subsystems catalogued yet.'}
                </p>
                {canModify && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedEquipmentForEdit(null);
                        setIsEquipmentModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register First Component</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <Pagination
              count={equipmentCount}
              page={equipmentPage}
              pageSize={10}
              onPageChange={(p) => fetchEquipment(p)}
              loading={equipmentLoading}
            />
          </div>
        </div>
      )}

      {/* Aircraft Create / Edit Modal */}
      <AircraftModal
        isOpen={isAircraftModalOpen}
        initialData={selectedAircraftForEdit}
        onClose={() => {
          setIsAircraftModalOpen(false);
          setSelectedAircraftForEdit(null);
        }}
        onSuccess={() => {
          showToast(selectedAircraftForEdit ? 'Aircraft updated successfully.' : 'New aircraft registered.');
          fetchAircraft(aircraftPage);
        }}
      />

      {/* Equipment Create / Edit Modal */}
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        initialData={selectedEquipmentForEdit}
        aircraftList={aircraftList}
        onClose={() => {
          setIsEquipmentModalOpen(false);
          setSelectedEquipmentForEdit(null);
        }}
        onSuccess={() => {
          showToast(selectedEquipmentForEdit ? 'Equipment updated successfully.' : 'New equipment registered.');
          fetchEquipment(equipmentPage);
        }}
      />

      {/* Aircraft Detail Dossier Drawer */}
      <AircraftDetailDrawer
        aircraftId={selectedAircraftDetailId}
        onClose={() => setSelectedAircraftDetailId(null)}
        onEdit={(ac) => {
          setSelectedAircraftForEdit(ac);
          setIsAircraftModalOpen(true);
        }}
      />

      {/* Confirmation Modal for Deletions */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'aircraft' ? 'Delete Aircraft Record' : 'Delete Equipment Record'}
        message={
          deleteTarget?.type === 'aircraft'
            ? `Are you sure you want to permanently delete aircraft ${deleteTarget?.item.registration_number} (${deleteTarget?.item.model})? All attached equipment links may be affected.`
            : `Are you sure you want to permanently delete equipment ${deleteTarget?.item.equipment_code} (${deleteTarget?.item.name})?`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
