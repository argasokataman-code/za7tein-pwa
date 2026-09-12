import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AccountSetupState {
  currentScreen: number
  selectedLanguage: string
  profilePhoto: string | null
  isSetupCompleted: boolean
}

const initialState: AccountSetupState = {
  currentScreen: 1,
  selectedLanguage: 'en',
  profilePhoto: null,
  isSetupCompleted: false,
}

const accountSetupSlice = createSlice({
  name: 'accountSetup',
  initialState,
  reducers: {
    setCurrentScreen(state, action: PayloadAction<number>) {
      state.currentScreen = action.payload
    },
    setSelectedLanguage(state, action: PayloadAction<string>) {
      state.selectedLanguage = action.payload
    },
    setProfilePhoto(state, action: PayloadAction<string | null>) {
      state.profilePhoto = action.payload
    },
    completeSetup(state) {
      state.isSetupCompleted = true
    },
    resetSetup() {
      return initialState
    },
  },
})

export const {
  setCurrentScreen,
  setSelectedLanguage,
  setProfilePhoto,
  completeSetup,
  resetSetup,
} = accountSetupSlice.actions
export default accountSetupSlice.reducer
