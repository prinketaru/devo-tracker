import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default:
          "bg-[#f0a531] hover:bg-[#e09115] text-stone-900 font-semibold border-b-2 border-[#c0831a] active:border-b-0 shadow-sm",
        destructive:
          "bg-red-600 hover:bg-red-700 text-white border-b-2 border-red-800 active:border-b-0 shadow-sm",
        outline:
          "border border-stone-200 dark:border-[#2e2b23] bg-white dark:bg-transparent text-stone-700 dark:text-[#EDE9E0] hover:bg-stone-50 dark:hover:bg-[#252118] shadow-sm",
        secondary:
          "bg-stone-100 dark:bg-[#252118] text-stone-700 dark:text-[#EDE9E0] hover:bg-stone-200 dark:hover:bg-[#2e2b23] border border-stone-200 dark:border-[#38332a] shadow-sm",
        ghost:
          "text-stone-700 dark:text-[#EDE9E0] hover:bg-stone-100 dark:hover:bg-[#252118]",
        link:
          "text-amber-700 dark:text-amber-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
