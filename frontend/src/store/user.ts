import { create } from 'zustand'
import { storage } from '../utils/storage'

interface UserInfo {
  id: number
  username: string
  phone: string
  avatar?: string
}

interface UserState {
  userInfo: UserInfo | null
  token: string | null
  setUserInfo: (userInfo: UserInfo) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userInfo: storage.get<UserInfo>('userInfo'),
  token: storage.get<string>('token'),
  setUserInfo: (userInfo) => {
    storage.set('userInfo', userInfo)
    set({ userInfo })
  },
  setToken: (token) => {
    storage.set('token', token)
    set({ token })
  },
  logout: () => {
    storage.remove('userInfo')
    storage.remove('token')
    set({ userInfo: null, token: null })
  },
}))
