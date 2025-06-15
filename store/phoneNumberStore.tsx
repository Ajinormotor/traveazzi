import {create} from 'zustand'

interface AuthStore {
    phoneNumber: string,
    setPhoneNumber: (phone: string) => void
}

export const usePhoneNumberStore = create<AuthStore>((set) => ({
    phoneNumber: '',
    setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
}))