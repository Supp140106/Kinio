import { create } from "zustand"

export type UserMessage = {
  id: string
  role: "user"
  text: string
}

export type AssistantMessage = {
  id: string
  role: "assistant"
  plan: string | null
  code: string | null
  videoUrl: string | null
  status: "done" | "error"
  iteration: number
  error: string | null
}

export type ChatMessage = UserMessage | AssistantMessage

type GenerationRecord = {
  id: string
  prompt: string
  plan: string | null
  code: string | null
  videoUrl: string | null
  status: string
  error: string | null
  iteration: number
  createdAt: string
}

interface WorkspaceState {
  messages: ChatMessage[]
  lastCode: string | null
  lastPlan: string | null
  lastVideoUrl: string | null
  isHistoryLoading: boolean
}

interface WorkspaceActions {
  fetchHistory: (projectId: string) => Promise<void>
  addUserMessage: (text: string) => string
  addAssistantMessage: (result: {
    plan: string | null
    code: string | null
    videoUrl: string | null
    status: "done" | "error"
    iteration: number
    error: string | null
  }) => string
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  messages: [],
  lastCode: null,
  lastPlan: null,
  lastVideoUrl: null,
  isHistoryLoading: false,

  fetchHistory: async (projectId: string) => {
    set({ isHistoryLoading: true })
    try {
      const res = await fetch(`/api/projects/${projectId}/generations`)
      const data = (await res.json()) as { generations: GenerationRecord[] }
      const records = data.generations ?? []

      const messages: ChatMessage[] = []
      let lastCode: string | null = null
      let lastPlan: string | null = null
      let lastVideoUrl: string | null = null

      for (const gen of records.slice().reverse()) {
        messages.push({
          id: `${gen.id}-user`,
          role: "user",
          text: gen.prompt,
        })
        const status = gen.status === "done" ? "done" : "error"
        messages.push({
          id: `${gen.id}-assistant`,
          role: "assistant",
          plan: gen.plan,
          code: gen.code,
          videoUrl: gen.videoUrl,
          status,
          iteration: gen.iteration,
          error: gen.error,
        })
        if (status === "done") {
          if (gen.code) lastCode = gen.code
          if (gen.plan) lastPlan = gen.plan
          if (gen.videoUrl) lastVideoUrl = gen.videoUrl
        }
      }

      set({ messages, lastCode, lastPlan, lastVideoUrl, isHistoryLoading: false })
    } catch {
      set({ isHistoryLoading: false })
    }
  },

  addUserMessage: (text: string) => {
    const id = crypto.randomUUID()
    set((state) => ({
      messages: [...state.messages, { id, role: "user", text } as UserMessage],
    }))
    return id
  },

  addAssistantMessage: (result) => {
    const id = crypto.randomUUID()
    const msg: AssistantMessage = { id, role: "assistant", ...result }
    set((state) => ({
      messages: [...state.messages, msg],
      lastCode:
        result.status === "done"
          ? (result.code ?? state.lastCode)
          : state.lastCode,
      lastPlan:
        result.status === "done"
          ? (result.plan ?? state.lastPlan)
          : state.lastPlan,
      lastVideoUrl:
        result.status === "done"
          ? (result.videoUrl ?? state.lastVideoUrl)
          : state.lastVideoUrl,
    }))
    return id
  },
}))
