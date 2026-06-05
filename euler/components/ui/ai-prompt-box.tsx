"use client"

import * as React from "react"
import {
  ArrowUp,
  BrainCog,
  Mic,
  Square,
  StopCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

const inlineStyles = `
  *:focus-visible {
    outline-offset: 0 !important;
    --ring-offset: 0 !important;
  }
  textarea::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background-color: var(--border);
    opacity: 0.8;
  }
`

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={1}
      className={cn(
        "min-h-11 w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const ActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/80",
      outline: "border-border bg-transparent hover:bg-muted",
      ghost: "bg-transparent hover:bg-muted",
    }

    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 aspect-square rounded-full",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
ActionButton.displayName = "ActionButton"

interface VoiceRecorderProps {
  isRecording: boolean
  visualizerBars?: number
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = React.useState(0)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const timeRef = React.useRef(0)
  const bars = React.useMemo(
    () =>
      [...Array(visualizerBars)].map((_, index) => ({
        id: index,
        height: Math.max(15, Math.round(30 + ((index * 37) % 70))),
        duration: 0.55 + (index % 5) * 0.12,
      })),
    [visualizerBars]
  )

  React.useEffect(() => {
    if (!isRecording) return

    timeRef.current = 0
    setTime(0)
    timerRef.current = setInterval(() => {
      timeRef.current += 1
      setTime(timeRef.current)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center py-3 transition-all duration-300",
        isRecording ? "opacity-100" : "h-0 opacity-0"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="font-mono text-sm text-foreground/80">
          {formatTime(time)}
        </span>
      </div>
      <div className="flex h-10 w-full items-center justify-center gap-0.5 px-4">
        {bars.map((bar, index) => (
          <div
            key={bar.id}
            className="w-0.5 animate-pulse rounded-full bg-muted-foreground/20"
            style={{
              height: `${bar.height}%`,
              animationDelay: `${index * 0.05}s`,
              animationDuration: `${bar.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface PromptInputContextType {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  maxHeight: number | string
  onSubmit?: () => void
  disabled?: boolean
}

const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
})

function usePromptInput() {
  return React.useContext(PromptInputContext)
}

interface PromptInputProps {
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  maxHeight?: number | string
  onSubmit?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "")

    const handleChange = (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <PromptInputContext.Provider
        value={{
          isLoading,
          value: value ?? internalValue,
          setValue: onValueChange ?? handleChange,
          maxHeight,
          onSubmit,
          disabled,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "rounded-3xl border-border bg-card p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
            isLoading && "border-red-500/70",
            className
          )}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    )
  }
)
PromptInput.displayName = "PromptInput"

interface PromptInputTextareaProps {
  disableAutosize?: boolean
  placeholder?: string
}

const PromptInputTextarea: React.FC<
  PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholder,
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return

    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
  }, [value, maxHeight, disableAutosize])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  )
}

const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
)

interface PromptInputBoxProps {
  onSend?: (message: string) => void
  onStop?: () => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export const PromptInputBox = React.forwardRef<
  HTMLDivElement,
  PromptInputBoxProps
>(
  (
    {
      onSend = () => {},
      onStop = () => {},
      isLoading = false,
      placeholder = "Type your message here...",
      className,
    },
    ref
  ) => {
    const [input, setInput] = React.useState("")
    const [isRecording, setIsRecording] = React.useState(false)
    const [showThink, setShowThink] = React.useState(false)
    const recognitionRef = React.useRef<any>(null)
    const finalTranscriptRef = React.useRef("")

    const handleSubmit = () => {
      if (!input.trim()) return

      const formattedInput = showThink ? `[Think: ${input}]` : input
      onSend(formattedInput)
      setInput("")
    }

    const hasContent = input.trim() !== ""

    React.useEffect(() => {
      if (!isRecording) return

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      if (!SpeechRecognitionAPI) {
        setIsRecording(false)
        return
      }

      finalTranscriptRef.current = ""
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let interim = ""
        let final = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }
        if (final) finalTranscriptRef.current += " " + final
        setInput((finalTranscriptRef.current + interim).trimStart())
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error)
        setIsRecording(false)
      }

      recognition.start()
      recognitionRef.current = recognition

      return () => {
        try {
          recognition.abort()
        } catch {}
        recognitionRef.current = null
      }
    }, [isRecording])

    return (
      <>
        <style>{inlineStyles}</style>
        <PromptInput
          ref={ref}
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          className={cn(
            "w-full border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
            isRecording && "border-red-500/70",
            className
          )}
          disabled={isLoading || isRecording}
        >
          <div
            className={cn(
              "transition-all duration-300",
              isRecording
                ? "invisible h-0 overflow-hidden opacity-0"
                : "opacity-100"
            )}
          >
            <PromptInputTextarea
              placeholder={showThink ? "Think deeply..." : placeholder}
              className="text-base"
            />
          </div>

          {isRecording ? <VoiceRecorder isRecording={isRecording} /> : null}

          <PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
            <div
              className={cn(
                "flex items-center gap-1 transition-opacity duration-300",
                isRecording ? "invisible h-0 opacity-0" : "visible opacity-100"
              )}
            >
              <button
                type="button"
                onClick={() => setShowThink((prev) => !prev)}
                className={cn(
                  "flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all",
                  showThink
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: showThink ? 360 : 0,
                      scale: showThink ? 1.1 : 1,
                    }}
                    whileHover={{ rotate: showThink ? 360 : 15, scale: 1.1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <BrainCog
                      className={cn(
                        "h-4 w-4",
                        showThink ? "text-primary" : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showThink ? (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden text-xs whitespace-nowrap text-primary"
                    >
                      Think
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </button>
            </div>

            <ActionButton
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                isRecording
                  ? "bg-transparent text-red-500 hover:bg-destructive/10 hover:text-red-400"
                  : hasContent
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={() => {
                if (isLoading) {
                  onStop()
                  return
                }
                if (isRecording) {
                  recognitionRef.current?.stop()
                } else if (hasContent) {
                  handleSubmit()
                } else {
                  setIsRecording(true)
                }
              }}
              disabled={false}
            >
              {isLoading ? (
                <Square className="h-4 w-4 animate-pulse fill-foreground" />
              ) : isRecording ? (
                <StopCircle className="h-5 w-5 text-red-500" />
              ) : hasContent ? (
                <ArrowUp className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Mic className="h-5 w-5 text-foreground transition-colors" />
              )}
            </ActionButton>
          </PromptInputActions>
        </PromptInput>
      </>
    )
  }
)
PromptInputBox.displayName = "PromptInputBox"
