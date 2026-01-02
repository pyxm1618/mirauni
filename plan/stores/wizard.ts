import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export type ProfileData = {
    background: string[]
    weeklyHours: number
    workDays: number[]  // 0=Sun, 1=Mon, ..., 6=Sat
    constraints: string[]
}

export type Path = {
    id: string
    name: string
    type: 'product' | 'content' | 'service' | 'other'
    description?: string
    weight: number // 0-100
    dailyHours?: number // Calculated from weight
    formula: {
        type: string
        config: Record<string, number>
        calculatedIncome: number
    }
    startDate?: string
    durationWeeks?: number
}

export type ConversationMessage = {
    role: 'user' | 'ai'
    content: string
}

export type WizardState = {
    currentStep: number
    incomeGoal: number | null
    deadline: string | null
    profile: ProfileData
    openQuestion: string
    conversationHistory: ConversationMessage[]
    paths: Path[]
    generatedPlan: any
}

/**
 * Wizard Store - using Composition API style for better TypeScript support
 */
export const useWizardStore = defineStore('wizard', () => {
    // State
    const currentStep = ref(1)
    const incomeGoal = ref<number | null>(null)
    const deadline = ref<string | null>(null)
    const profile = reactive<ProfileData>({
        background: [],
        weeklyHours: 20,
        workDays: [1, 2, 3, 4, 5],
        constraints: []
    })
    const openQuestion = ref('')
    const conversationHistory = ref<ConversationMessage[]>([])
    const paths = ref<Path[]>([])
    const generatedPlan = ref<any>(null)

    // Actions
    function setPaths(newPaths: Path[]) {
        paths.value = newPaths
    }

    function setDeadline(date: string) {
        deadline.value = date
    }

    function setGeneratedPlan(plan: any) {
        generatedPlan.value = plan
    }

    function addMessage(role: 'user' | 'ai', content: string) {
        conversationHistory.value.push({ role, content })
    }

    function setIncomeGoal(goal: number) {
        incomeGoal.value = goal
    }

    function updateProfile(data: Partial<ProfileData>) {
        Object.assign(profile, data)
    }

    function setOpenQuestion(answer: string) {
        openQuestion.value = answer
    }

    function nextStep() {
        currentStep.value++
    }

    function prevStep() {
        if (currentStep.value > 1) currentStep.value--
    }

    function $reset() {
        currentStep.value = 1
        incomeGoal.value = null
        deadline.value = null
        profile.background = []
        profile.weeklyHours = 20
        profile.workDays = [1, 2, 3, 4, 5]
        profile.constraints = []
        openQuestion.value = ''
        conversationHistory.value = []
        paths.value = []
        generatedPlan.value = null
    }

    return {
        // State
        currentStep,
        incomeGoal,
        deadline,
        profile,
        openQuestion,
        conversationHistory,
        paths,
        generatedPlan,
        // Actions
        setPaths,
        setDeadline,
        setGeneratedPlan,
        addMessage,
        setIncomeGoal,
        updateProfile,
        setOpenQuestion,
        nextStep,
        prevStep,
        $reset
    }
})
