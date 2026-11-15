import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 backdrop-blur-md text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all duration-300 ease-out select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FFCE00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14214D] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#006A4E]/90 text-white border-[#66CBAA]/40 hover:bg-[#006A4E] hover:border-[#66CBAA] hover:shadow-[0_0_20px_rgba(102,203,170,0.45)]",
        primary:
          "bg-[#FFCE00] text-[#14214D] border-[#FFCE00] font-bold hover:bg-[#FFEC70] hover:shadow-[0_0_24px_rgba(255,206,0,0.55)]",
        secondary:
          "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]",
        outline:
          "bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-[#FFCE00] hover:shadow-[0_0_16px_rgba(255,206,0,0.35)]",
        ghost:
          "border-transparent bg-transparent text-[#94A3B8] hover:bg-white/10 hover:text-white hover:border-white/15",
        destructive:
          "bg-[#D21034]/80 text-white border-[#FF6B71]/40 hover:bg-[#D21034] hover:border-[#FF6B71] hover:shadow-[0_0_20px_rgba(255,107,113,0.45)]",
        link: "border-transparent bg-transparent text-[#FFCE00] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "min-h-[2.6rem] px-5 py-2",
        xs: "h-7 px-2.5 text-[0.7rem] rounded-md",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "min-h-[3.1rem] px-7 py-2.5 text-sm rounded-lg",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
