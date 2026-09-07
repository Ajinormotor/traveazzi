import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'
import { usePassengerStore } from '@/store/passengerStore'
import userOne from "../../assets/images/user_logo img (1).png"

// Same driver-id derivation as rides.tsx heart toggle:
// populated object -> ._id, raw id string -> itself,
// flat id fields -> themselves, otherwise undefined.
const getDriverId = (entry: any): string | undefined => {
  const d = entry?.driver;
  if (typeof d === 'object' && d !== null) return d?._id;
  return d ?? entry?.driverId ?? entry?.driver_id ?? undefined;
};

const getDriverName = (entry: any): string => {
  const d = typeof entry?.driver === 'object' && entry?.driver !== null ? entry.driver : entry;
  const full = `${d?.firstName ?? ''} ${d?.lastName ?? ''}`.trim();
  return full || d?.name || entry?.rider_name || 'Driver';
};

const FavoritesDriver = () => {
  const { favorites, getFavoriteDrivers, removeFavoriteDriver } = usePassengerStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getFavoriteDrivers();
      // Store resolves [] on failure (toast shown there); a nullish
      // result means the call itself broke — surface error + Retry.
      if (list == null) {
        setError('Failed to load favorites. Please try again.');
      }
    } catch {
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getFavoriteDrivers]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (driverId: string) => {
    if (pendingId) return;
    setPendingId(driverId);
    try {
      const ok = await removeFavoriteDriver(driverId);
      if (ok) await getFavoriteDrivers();
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return (
      <View style={className`flex-1 bg-white items-center justify-center p-4`}>
        <ActivityIndicator size="large" color="#245AB0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={className`flex-1 bg-white items-center justify-center p-4 gap-2`}>
        <Text style={className`text-[18px] font-bold`}>Favorite drivers</Text>
        <Text style={className`text-[14px] text-[#AAAAAA]`}>{error}</Text>
        <TouchableOpacity
          onPress={load}
          style={className`bg-[#245AB0] px-6 h-[44px] flex items-center justify-center rounded-lg`}>
          <Text style={className`text-white`}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const list = Array.isArray(favorites) ? favorites : [];

  if (list.length === 0) {
    return (
      <View style={className`flex-1 bg-white items-center justify-center p-4 gap-2`}>
        <Text style={className`text-[18px] font-bold`}>Favorite drivers</Text>
        <Text style={className`text-[14px] text-[#AAAAAA]`}>No favorite drivers yet</Text>
      </View>
    );
  }

  return (
    <View style={className`flex-1 bg-white p-4 gap-3`}>
      <Text style={className`text-[18px] font-bold`}>Favorite drivers</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={className`flex flex-col gap-3`}>
          {list.map((entry: any, index: number) => {
            const driverId = getDriverId(entry);
            const key = entry?._id ?? driverId ?? `fav-${index}`;
            const driver = typeof entry?.driver === 'object' && entry?.driver !== null ? entry.driver : entry;
            const vehicle = driver?.vehicle;
            const vehicleText = vehicle
              ? `${vehicle?.make ?? ''}${vehicle?.color ? `, ${vehicle.color}` : ''}${vehicle?.plateNumber ? ` · ${vehicle.plateNumber}` : ''}`.trim()
              : null;
            const avatar = driver?.avatar ? { uri: driver.avatar } : userOne;
            const removing = pendingId === driverId;
            return (
              <View key={key} style={className`flex flex-row items-center justify-between bg-white`}>
                <View style={className`flex flex-row gap-1`}>
                  <View>
                    <Image source={avatar} alt=''
                      className='w-[50px] h-[50px] rounded-full' />
                  </View>
                  <View style={className`flex flex-col gap-[1px]`}>
                    <Text style={className`text-sm font-bold text-black`}>{getDriverName(entry)}</Text>
                    {vehicleText ? (
                      <Text style={className`font-bold text-[12px] text-[#A1A1A1]`}>{vehicleText}</Text>
                    ) : null}
                  </View>
                </View>
                {driverId ? (
                  <TouchableOpacity onPress={() => handleRemove(driverId)} disabled={removing}
                    style={className`${removing ? 'opacity-60' : ''}`}>
                    {removing ? (
                      <ActivityIndicator size="small" color="#245AB0" />
                    ) : (
                      <Ionicons name="heart" size={20} color="#E0245E" />
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default FavoritesDriver
