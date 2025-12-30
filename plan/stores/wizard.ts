import { defineStore } from 'pinia'

export type ProfileData = {
    background: string
    weeklyHours: string
    constraints: string[]
}

export type WizardState = {
    currentStep: number
    incomeGoal: number | null
    profile: ProfileData
    openQuestion: string
    conversationHistory: { role: 'user' | 'ai', content: string }[]
    // Future:  conversationHistory: { role: 'user' | 'ai', content: string }[]
    paths: any[]
    generatedPlan: any
}

export const useWizardStore = defineStore('wizard', {
    state: (): WizardState => ({
        currentStep: 1,
        incomeGoal: null,
        profile: {
            background: '',
            weeklyHours: '',
            constraints: []
        },
        openQuestion: '',
        conversationHistory: [],
        paths: [],
        generatedPlan: null
    }),

    actions: {
        setPaths(paths: any[]) {
            this.paths = paths
        },

        setGeneratedPlan(plan: any) {
            this.generatedPlan = plan
        },

        addMessage(role: 'user' | 'ai', content: string) {
            this.conversationHistory.push({ role, content })
        },

        setIncomeGoal(goal: number) {
            this.incomeGoal = goal
        },

        updateProfile(data: Partial<ProfileData>) {
            this.profile = { ...this.profile, ...data }
        },

        setOpenQuestion(answer: string) {
            this.openQuestion = answer
        },

        nextStep() {
            // Basic client-side navigation logic to be handled by pages router usually, 
            // but store can track "furthest reached step"
            this.currentStep++
        },

        prevStep() {
            if (this.currentStep > 1) this.currentStep--
        }
    },

    persist: true // Requires @pinia-plugin-persistedstate if we want auto-persistence, otherwise we rely on in-memory for MVP or add logic later. 
    // Note: standard @pinia/nuxt doesn't include persistence by default without config. 
    // For now we will stick to basic in-memory or manual localStorage if needed.
})
