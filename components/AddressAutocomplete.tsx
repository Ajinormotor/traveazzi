import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import className from 'twrnc';
import { useDriverRideStore } from '@/store/driverStore';

type Suggestion = { description: string; placeId: string };

// Autocomplete was switched off, which left both address fields as freehand
// text. The backend geocodes with `components: 'country:NG'` and Google's
// geocoder returns ZERO_RESULTS for a partial/hand-typed address, which comes
// back as a 400 — the same "Could not locate the ... address" toast you get
// for a genuinely bad address. Picking a suggestion guarantees a
// Google-formatted, resolvable string. Free typing still works if the field is
// left alone; it just has to be a complete address.
const AUTOCOMPLETE_ENABLED = true;

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  inputStyle?: any;
};

export default function AddressAutocomplete({ value, onChange, placeholder, inputStyle }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const query = value.trim();
  const canQuery = AUTOCOMPLETE_ENABLED && query.length >= 2;

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!canQuery) {
      // Invalidate any in-flight request instead of calling setState here: the
      // spinner and the list are already gated on `canQuery` at render time,
      // so nothing stale can be shown and no cascading render is triggered.
      reqId.current += 1;
      return;
    }
    const my = ++reqId.current;
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const list = await useDriverRideStore.getState().autocompleteAddress(query);
        if (reqId.current === my) setSuggestions(Array.isArray(list) ? list : []);
      } catch {
        if (reqId.current === my) setSuggestions([]);
      } finally {
        if (reqId.current === my) setLoading(false);
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [canQuery, query]);

  const select = (s: Suggestion) => {
    reqId.current += 1;
    if (timer.current) clearTimeout(timer.current);
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setSuggestions([]);
    setLoading(false);
    setFocused(false);
    onChange(s.description);
    Keyboard.dismiss();
  };

  return (
    <View style={className`relative w-full`}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          setFocused(true);
        }}
        onBlur={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(() => setFocused(false), 150);
        }}
        placeholder={placeholder}
        style={[className`max-w-[85%] w-full bg-transparent text-[16px]`, inputStyle]}
      />
      {canQuery && loading && <ActivityIndicator size="small" color="#245AB0" />}
      {canQuery && focused && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.placeId}
          keyboardShouldPersistTaps="handled"
          style={className`absolute top-full left-0 right-0 bg-white rounded-[8px] z-50 max-h-[180px]`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => select(item)}
              style={className`px-3 py-3 border-b border-[#F0F0F0]`}
            >
              <Text style={className`text-[14px] text-black`}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
