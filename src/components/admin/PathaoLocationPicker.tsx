"use client";

import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaSpinner,
  FaRedoAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import {
  adminApi,
  IPathaoCity,
  IPathaoZone,
  IPathaoArea,
} from "@/lib/admin-api";

export interface PathaoLocationValue {
  cityId?: number;
  zoneId?: number;
  areaId?: number;
  cityName?: string;
  zoneName?: string;
  areaName?: string;
  isValid: boolean;
}

interface PathaoLocationPickerProps {
  initialCityId?: number;
  initialZoneId?: number;
  initialAreaId?: number;
  onChange: (value: PathaoLocationValue) => void;
}

export default function PathaoLocationPicker({
  initialCityId,
  initialZoneId,
  initialAreaId,
  onChange,
}: PathaoLocationPickerProps) {
  const [cities, setCities] = useState<IPathaoCity[]>([]);
  const [zones, setZones] = useState<IPathaoZone[]>([]);
  const [areas, setAreas] = useState<IPathaoArea[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | undefined>(initialCityId);
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(initialZoneId);
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(initialAreaId);

  // Search filter inputs inside selects or above
  const [citySearch, setCitySearch] = useState("");
  const [zoneSearch, setZoneSearch] = useState("");
  const [areaSearch, setAreaSearch] = useState("");

  // Loading & error states
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);

  // 1. Load Cities on mount and check localStorage for convenience
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoadingCities(true);
    setCityError(null);
    try {
      const data = await adminApi.getPathaoCities();
      setCities(data);

      // If no initial city, check localStorage convenience
      if (!selectedCityId && typeof window !== "undefined") {
        const savedCityId = localStorage.getItem("hatkhola_last_pathao_city");
        if (savedCityId) {
          const cid = Number(savedCityId);
          if (data.some((c) => c.id === cid)) {
            handleCitySelect(cid, data);
          }
        }
      }
    } catch (err: any) {
      setCityError(err.message || "Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  // 2. Handle City Selection
  const handleCitySelect = async (cityId?: number, cityList: IPathaoCity[] = cities) => {
    setSelectedCityId(cityId);
    setSelectedZoneId(undefined);
    setSelectedAreaId(undefined);
    setZones([]);
    setAreas([]);
    setZoneError(null);
    setAreaError(null);

    const cityObj = cityList.find((c) => c.id === cityId);

    if (cityId) {
      if (typeof window !== "undefined") {
        localStorage.setItem("hatkhola_last_pathao_city", String(cityId));
      }
      setLoadingZones(true);
      try {
        const zoneData = await adminApi.getPathaoZones(cityId);
        setZones(zoneData);

        // Check localStorage for zone convenience
        if (typeof window !== "undefined") {
          const savedZoneId = localStorage.getItem("hatkhola_last_pathao_zone");
          if (savedZoneId) {
            const zid = Number(savedZoneId);
            if (zoneData.some((z) => z.id === zid)) {
              handleZoneSelect(zid, zoneData, cityObj);
            }
          }
        }
      } catch (err: any) {
        setZoneError(err.message || "Failed to load zones for this city");
      } finally {
        setLoadingZones(false);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hatkhola_last_pathao_city");
        localStorage.removeItem("hatkhola_last_pathao_zone");
      }
    }

    emitChange(cityId, undefined, undefined, cityObj?.name, undefined, undefined, false);
  };

  // 3. Handle Zone Selection
  const handleZoneSelect = async (
    zoneId?: number,
    zoneList: IPathaoZone[] = zones,
    cityObj = cities.find((c) => c.id === selectedCityId)
  ) => {
    setSelectedZoneId(zoneId);
    setSelectedAreaId(undefined);
    setAreas([]);
    setAreaError(null);

    const zoneObj = zoneList.find((z) => z.id === zoneId);

    if (zoneId) {
      if (typeof window !== "undefined") {
        localStorage.setItem("hatkhola_last_pathao_zone", String(zoneId));
      }
      setLoadingAreas(true);
      try {
        const areaData = await adminApi.getPathaoAreas(zoneId);
        setAreas(areaData);
      } catch (err: any) {
        setAreaError(err.message || "Failed to load areas for this zone");
      } finally {
        setLoadingAreas(false);
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hatkhola_last_pathao_zone");
      }
    }

    emitChange(
      selectedCityId,
      zoneId,
      undefined,
      cityObj?.name,
      zoneObj?.name,
      undefined,
      false
    );
  };

  // 4. Handle Area Selection
  const handleAreaSelect = (areaId?: number) => {
    setSelectedAreaId(areaId);
    const cityObj = cities.find((c) => c.id === selectedCityId);
    const zoneObj = zones.find((z) => z.id === selectedZoneId);
    const areaObj = areas.find((a) => a.id === areaId);

    const isValid = Boolean(
      selectedCityId &&
        selectedZoneId &&
        areaId &&
        areaObj?.homeDeliveryAvailable
    );

    emitChange(
      selectedCityId,
      selectedZoneId,
      areaId,
      cityObj?.name,
      zoneObj?.name,
      areaObj?.name,
      isValid
    );
  };

  const emitChange = (
    cId?: number,
    zId?: number,
    aId?: number,
    cName?: string,
    zName?: string,
    aName?: string,
    valid = false
  ) => {
    onChange({
      cityId: cId,
      zoneId: zId,
      areaId: aId,
      cityName: cName,
      zoneName: zName,
      areaName: aName,
      isValid: valid,
    });
  };

  // Filtered lists
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );
  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(zoneSearch.toLowerCase())
  );
  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(areaSearch.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-600" />
          <span>Pathao Delivery Coverage (Required)</span>
        </div>
        {selectedCityId && selectedZoneId && selectedAreaId && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold normal-case">
            <FaCheckCircle /> Destination Verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. City Select */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              City <span className="text-red-500">*</span>
            </label>
            {loadingCities && (
              <FaSpinner className="animate-spin text-slate-400 text-xs" />
            )}
          </div>

          {cityError ? (
            <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <span className="truncate flex-1">Failed to load</span>
              <button
                type="button"
                onClick={loadCities}
                className="p-1 hover:bg-red-100 rounded text-red-700"
                title="Retry loading cities"
              >
                <FaRedoAlt className="text-[10px]" />
              </button>
            </div>
          ) : (
            <select
              value={selectedCityId || ""}
              onChange={(e) => handleCitySelect(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            >
              <option value="">Select City</option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 2. Zone Select */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Zone <span className="text-red-500">*</span>
            </label>
            {loadingZones && (
              <FaSpinner className="animate-spin text-slate-400 text-xs" />
            )}
          </div>

          {zoneError ? (
            <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <span className="truncate flex-1">Failed to load</span>
              <button
                type="button"
                onClick={() => selectedCityId && handleCitySelect(selectedCityId)}
                className="p-1 hover:bg-red-100 rounded text-red-700"
                title="Retry loading zones"
              >
                <FaRedoAlt className="text-[10px]" />
              </button>
            </div>
          ) : (
            <select
              disabled={!selectedCityId || loadingZones || zones.length === 0}
              value={selectedZoneId || ""}
              onChange={(e) => handleZoneSelect(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {!selectedCityId
                  ? "Select City First"
                  : loadingZones
                  ? "Loading zones..."
                  : zones.length === 0
                  ? "No zones found"
                  : "Select Zone"}
              </option>
              {filteredZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 3. Area Select */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Area <span className="text-red-500">*</span>
            </label>
            {loadingAreas && (
              <FaSpinner className="animate-spin text-slate-400 text-xs" />
            )}
          </div>

          {areaError ? (
            <div className="flex items-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <span className="truncate flex-1">Failed to load</span>
              <button
                type="button"
                onClick={() => selectedZoneId && handleZoneSelect(selectedZoneId)}
                className="p-1 hover:bg-red-100 rounded text-red-700"
                title="Retry loading areas"
              >
                <FaRedoAlt className="text-[10px]" />
              </button>
            </div>
          ) : (
            <select
              disabled={!selectedZoneId || loadingAreas || areas.length === 0}
              value={selectedAreaId || ""}
              onChange={(e) => handleAreaSelect(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {!selectedZoneId
                  ? "Select Zone First"
                  : loadingAreas
                  ? "Loading areas..."
                  : areas.length === 0
                  ? "No areas found"
                  : "Select Area"}
              </option>
              {filteredAreas.map((a) => (
                <option
                  key={a.id}
                  value={a.id}
                  disabled={!a.homeDeliveryAvailable}
                  className={!a.homeDeliveryAvailable ? "text-slate-400 italic bg-slate-100" : ""}
                >
                  {a.name} {!a.homeDeliveryAvailable ? "(No home delivery)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

